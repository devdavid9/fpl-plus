"""
Cache layer — uses Upstash Redis if configured, falls back to in-memory dict.
"""
import json
import os
import time
from typing import Any

_memory_cache: dict[str, tuple[Any, float]] = {}  # key -> (value, expires_at)


def _memory_get(key: str) -> Any | None:
    entry = _memory_cache.get(key)
    if entry is None:
        return None
    value, expires_at = entry
    if time.time() > expires_at:
        del _memory_cache[key]
        return None
    return value


def _memory_set(key: str, value: Any, ttl: int) -> None:
    _memory_cache[key] = (value, time.time() + ttl)


async def cache_get(key: str) -> Any | None:
    url = os.getenv("UPSTASH_REDIS_REST_URL")
    token = os.getenv("UPSTASH_REDIS_REST_TOKEN")
    if url and token:
        import httpx
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{url}/get/{key}",
                headers={"Authorization": f"Bearer {token}"},
            )
            data = resp.json()
            raw = data.get("result")
            if raw is None:
                return None
            return json.loads(raw)
    return _memory_get(key)


async def cache_set(key: str, value: Any, ttl: int) -> None:
    url = os.getenv("UPSTASH_REDIS_REST_URL")
    token = os.getenv("UPSTASH_REDIS_REST_TOKEN")
    if url and token:
        import httpx
        async with httpx.AsyncClient() as client:
            await client.get(
                f"{url}/set/{key}/{json.dumps(value).replace('/', '%2F')}?ex={ttl}",
                headers={"Authorization": f"Bearer {token}"},
            )
        return
    _memory_set(key, value, ttl)
