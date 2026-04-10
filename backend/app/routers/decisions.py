"""
Decision engine routes — captain picks, fixture ticker, transfer suggestions.
"""
from fastapi import APIRouter, HTTPException
from app import fpl
import asyncio

router = APIRouter(prefix="/decisions", tags=["decisions"])

# Fixture difficulty: 1 (easy) → 5 (hard). We invert so higher = better.
FDR_SCORE = {1: 5, 2: 4, 3: 3, 4: 2, 5: 1}


@router.get("/captain/{team_id}/{gameweek}")
async def captain_picks(team_id: int, gameweek: int):
    """
    Rank the user's outfield players by captain score:
      score = form * 3 + next_fixture_score + (selected_by_percent / 10)
    Returns top 5 suggestions.
    """
    try:
        picks_data, bootstrap, fixtures = await asyncio.gather(
            fpl.get_picks(team_id, gameweek),
            fpl.get_bootstrap(),
            fpl.get_fixtures(),
        )
    except Exception as e:
        raise HTTPException(400, str(e))

    players_by_id = {p["id"]: p for p in bootstrap["elements"]}
    teams_by_id = {t["id"]: t for t in bootstrap["teams"]}

    # Build a map: team_id -> list of difficulty ratings for upcoming gws
    upcoming = [f for f in fixtures if not f.get("finished") and f.get("event") == gameweek]
    next_fdr: dict[int, int] = {}
    for f in upcoming:
        home_fdr = FDR_SCORE.get(f["team_h_difficulty"], 3)
        away_fdr = FDR_SCORE.get(f["team_a_difficulty"], 3)
        next_fdr.setdefault(f["team_h"], home_fdr)
        next_fdr.setdefault(f["team_a"], away_fdr)

    suggestions = []
    for pick in picks_data["picks"]:
        if pick["position"] > 11:
            continue  # skip bench
        p = players_by_id.get(pick["element"])
        if not p:
            continue
        team = teams_by_id.get(p["team"], {})
        form = float(p.get("form", 0))
        fdr = next_fdr.get(p["team"], 3)
        ownership = float(p.get("selected_by_percent", 0))
        score = round(form * 3 + fdr + ownership / 10, 2)
        suggestions.append({
            "id": p["id"],
            "web_name": p["web_name"],
            "team_short": team.get("short_name", "?"),
            "form": form,
            "fixture_score": fdr,
            "ownership_pct": ownership,
            "captain_score": score,
        })

    suggestions.sort(key=lambda x: x["captain_score"], reverse=True)
    return {"gameweek": gameweek, "suggestions": suggestions[:5]}


@router.get("/fixtures/{team_id}")
async def fixture_ticker(team_id: int, gameweeks: int = 6):
    """
    Fixture difficulty ticker for each player in the user's current squad
    over the next N gameweeks.
    """
    try:
        entry, bootstrap, fixtures = await asyncio.gather(
            fpl.get_entry(team_id),
            fpl.get_bootstrap(),
            fpl.get_fixtures(),
        )
    except Exception as e:
        raise HTTPException(400, str(e))

    current_gw = entry.get("current_event") or 1
    gw_range = list(range(current_gw, current_gw + gameweeks))

    players_by_id = {p["id"]: p for p in bootstrap["elements"]}
    teams_by_id = {t["id"]: t for t in bootstrap["teams"]}

    # team_id -> {gw -> [fixture_difficulty]}
    team_fixtures: dict[int, dict[int, list]] = {}
    for f in fixtures:
        gw = f.get("event")
        if gw not in gw_range:
            continue
        for side, opp_side, diff_key in [
            ("team_h", "team_a", "team_h_difficulty"),
            ("team_a", "team_h", "team_a_difficulty"),
        ]:
            tid = f[side]
            team_fixtures.setdefault(tid, {}).setdefault(gw, []).append({
                "opponent": teams_by_id.get(f[opp_side], {}).get("short_name", "?"),
                "difficulty": f[diff_key],
                "home": side == "team_h",
            })

    try:
        picks_data = await fpl.get_picks(team_id, current_gw)
    except Exception:
        raise HTTPException(404, f"No picks for team {team_id} GW{current_gw}")

    ticker = []
    for pick in picks_data["picks"]:
        p = players_by_id.get(pick["element"], {})
        fixtures_by_gw = team_fixtures.get(p.get("team", -1), {})
        ticker.append({
            "id": p["id"],
            "web_name": p["web_name"],
            "is_sub": pick["position"] > 11,
            "fixtures": {
                gw: fixtures_by_gw.get(gw, []) for gw in gw_range
            },
        })

    return {"gameweeks": gw_range, "ticker": ticker}


@router.get("/transfers/{team_id}")
async def transfer_suggestions(team_id: int, gameweeks: int = 5):
    """
    For each player in the squad, compute an average fixture difficulty
    over the next N gameweeks. Flag players with avg difficulty > 3.5
    and suggest in-budget replacements with better fixtures.
    """
    try:
        entry, bootstrap, fixtures = await asyncio.gather(
            fpl.get_entry(team_id),
            fpl.get_bootstrap(),
            fpl.get_fixtures(),
        )
    except Exception as e:
        raise HTTPException(400, str(e))

    current_gw = entry.get("current_event") or 1
    gw_range = list(range(current_gw, current_gw + gameweeks))

    players_by_id = {p["id"]: p for p in bootstrap["elements"]}
    teams_by_id = {t["id"]: t for t in bootstrap["teams"]}

    # avg difficulty per team over gw_range
    team_avg_diff: dict[int, float] = {}
    for tid in {t["id"] for t in bootstrap["teams"]}:
        diffs = []
        for f in fixtures:
            if f.get("event") not in gw_range:
                continue
            if f["team_h"] == tid:
                diffs.append(f["team_h_difficulty"])
            elif f["team_a"] == tid:
                diffs.append(f["team_a_difficulty"])
        team_avg_diff[tid] = round(sum(diffs) / len(diffs), 2) if diffs else 3.0

    try:
        picks_data = await fpl.get_picks(team_id, current_gw)
    except Exception:
        raise HTTPException(404, f"No picks for team {team_id} GW{current_gw}")

    squad_ids = {pick["element"] for pick in picks_data["picks"]}
    suggestions = []

    for pick in picks_data["picks"]:
        if pick["position"] > 11:
            continue
        p = players_by_id.get(pick["element"], {})
        avg_diff = team_avg_diff.get(p.get("team", -1), 3.0)
        if avg_diff < 3.5:
            continue  # fixtures are fine

        # Find replacements: same position, better fixtures, within budget ±0.5
        budget = p["now_cost"] / 10 + 0.5
        position = p.get("element_type")
        candidates = [
            q for q in bootstrap["elements"]
            if q["element_type"] == position
            and q["id"] not in squad_ids
            and q["now_cost"] / 10 <= budget
            and team_avg_diff.get(q["team"], 5) < avg_diff
            and float(q.get("form", 0)) >= float(p.get("form", 0)) * 0.7
        ]
        candidates.sort(key=lambda q: (team_avg_diff.get(q["team"], 5), -float(q.get("form", 0))))

        suggestions.append({
            "out": {
                "id": p["id"],
                "web_name": p["web_name"],
                "team_short": teams_by_id.get(p["team"], {}).get("short_name", "?"),
                "avg_difficulty": avg_diff,
                "price": p["now_cost"] / 10,
            },
            "in": [
                {
                    "id": q["id"],
                    "web_name": q["web_name"],
                    "team_short": teams_by_id.get(q["team"], {}).get("short_name", "?"),
                    "avg_difficulty": team_avg_diff.get(q["team"], 5),
                    "price": q["now_cost"] / 10,
                    "form": float(q.get("form", 0)),
                }
                for q in candidates[:3]
            ],
        })

    return {"gameweeks_ahead": gameweeks, "suggestions": suggestions}
