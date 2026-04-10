"""
Team routes — squad view, picks, history.
"""
from fastapi import APIRouter, HTTPException
from app import fpl

router = APIRouter(prefix="/team", tags=["team"])


@router.get("/{team_id}")
async def get_team(team_id: int):
    """Team summary with enriched squad (player name, position, club)."""
    try:
        entry, bootstrap = await _gather(
            fpl.get_entry(team_id),
            fpl.get_bootstrap(),
        )
    except Exception:
        raise HTTPException(404, f"Team {team_id} not found")

    players_by_id = {p["id"]: p for p in bootstrap["elements"]}
    teams_by_id = {t["id"]: t for t in bootstrap["teams"]}
    position_map = {e["id"]: e["singular_name_short"] for e in bootstrap["element_types"]}

    current_gw = entry.get("current_event") or _latest_finished_gw(bootstrap)

    picks_data = None
    if current_gw:
        try:
            picks_data = await fpl.get_picks(team_id, current_gw)
        except Exception:
            pass

    squad = []
    if picks_data:
        for pick in picks_data["picks"]:
            p = players_by_id.get(pick["element"], {})
            team = teams_by_id.get(p.get("team"), {})
            squad.append({
                "id": p["id"],
                "web_name": p["web_name"],
                "position": position_map.get(p.get("element_type"), "?"),
                "team_short": team.get("short_name", "?"),
                "now_cost": p["now_cost"] / 10,
                "form": float(p.get("form", 0)),
                "total_points": p.get("total_points", 0),
                "selected_by_percent": float(p.get("selected_by_percent", 0)),
                "multiplier": pick["multiplier"],   # 2 = captain, 3 = triple captain
                "is_sub": pick["position"] > 11,
            })

    return {
        "team_id": team_id,
        "name": entry.get("name"),
        "manager": f"{entry.get('player_first_name', '')} {entry.get('player_last_name', '')}".strip(),
        "overall_rank": entry.get("summary_overall_rank"),
        "overall_points": entry.get("summary_overall_points"),
        "gameweek": current_gw,
        "squad": squad,
    }


@router.get("/{team_id}/picks/{gameweek}")
async def get_picks(team_id: int, gameweek: int):
    """Raw picks for a specific gameweek."""
    try:
        return await fpl.get_picks(team_id, gameweek)
    except Exception:
        raise HTTPException(404, f"No picks found for team {team_id} GW{gameweek}")


# ── helpers ──────────────────────────────────────────────────────────────────

async def _gather(*coros):
    import asyncio
    return await asyncio.gather(*coros)


def _latest_finished_gw(bootstrap: dict) -> int | None:
    finished = [e for e in bootstrap["events"] if e.get("finished")]
    return finished[-1]["id"] if finished else None
