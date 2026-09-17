import json
import logging
from typing import Any, Optional
import redis.asyncio as aioredis
from app.config import settings

logger = logging.getLogger(__name__)

redis_client: Optional[aioredis.Redis] = None

async def get_redis() -> Optional[aioredis.Redis]:
    global redis_client
    if redis_client is None:
        try:
            redis_client = aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True
            )
            await redis_client.ping()
        except Exception as e:
            logger.warning(f"Redis connection failed ({e}). Caching fallback will be in-memory/disabled.")
            redis_client = None
    return redis_client

class CacheService:
    @staticmethod
    async def get(key: str) -> Optional[Any]:
        client = await get_redis()
        if not client:
            return None
        try:
            data = await client.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            logger.error(f"Redis GET error for key '{key}': {e}")
            return None

    @staticmethod
    async def set(key: str, value: Any, ttl_seconds: int = 300) -> bool:
        client = await get_redis()
        if not client:
            return False
        try:
            await client.setex(key, ttl_seconds, json.dumps(value))
            return True
        except Exception as e:
            logger.error(f"Redis SET error for key '{key}': {e}")
            return False

    @staticmethod
    async def delete_pattern(pattern: str) -> int:
        client = await get_redis()
        if not client:
            return 0
        try:
            keys = await client.keys(pattern)
            if keys:
                return await client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Redis DELETE pattern error for '{pattern}': {e}")
            return 0
