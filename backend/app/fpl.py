"""
FPL API client with caching.
All public FPL API calls go through here.
"""
import httpx
from app.cache import cache_get, cache_set

FPL_BASE = "https://fantasy.premierleague.com/api"

TTL = {
    "bootstrap": 1800,   # 30 min — player/team master data
    "fixtures":  3600,   # 1 hr
    "entry":     300,    # 5 min — team summary
    "picks":     300,    # 5 min
    "live":      60,     # 1 min — live scores
}


async def _fetch(path: str) -> dict:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{FPL_BASE}{path}",
            headers={"User-Agent": "fpl-plus/1.0"},
        )
        resp.raise_for_status()
        return resp.json()


async def get_bootstrap() -> dict:
    key = "bootstrap"
    cached = await cache_get(key)
    if cached:
        return cached
    data = await _fetch("/bootstrap-static/")
    await cache_set(key, data, TTL["bootstrap"])
    return data


async def get_fixtures() -> list:
    key = "fixtures"
    cached = await cache_get(key)
    if cached:
        return cached
    data = await _fetch("/fixtures/")
    await cache_set(key, data, TTL["fixtures"])
    return data


async def get_entry(team_id: int) -> dict:
    key = f"entry:{team_id}"
    cached = await cache_get(key)
    if cached:
        return cached
    data = await _fetch(f"/entry/{team_id}/")
    await cache_set(key, data, TTL["entry"])
    return data


async def get_picks(team_id: int, gameweek: int) -> dict:
    key = f"picks:{team_id}:{gameweek}"
    cached = await cache_get(key)
    if cached:
        return cached
    data = await _fetch(f"/entry/{team_id}/event/{gameweek}/picks/")
    await cache_set(key, data, TTL["picks"])
    return data


async def get_live(gameweek: int) -> dict:
    key = f"live:{gameweek}"
    cached = await cache_get(key)
    if cached:
        return cached
    data = await _fetch(f"/event/{gameweek}/live/")
    await cache_set(key, data, TTL["live"])
    return data
