import json
import os
from dotenv import load_dotenv
from fastapi import HTTPException
from tavily import TavilyClient
import redis

from backend.schemas import SearchResponse, SearchResult

load_dotenv()

redis_url = os.getenv("REDIS_URL")
redis_client = redis.Redis.from_url(redis_url) if redis_url else None
tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


async def search_tavily(query: str) -> SearchResponse:
    try:
        cache_key = f"search:{query}"
        cached_results = None

        if redis_client:
            cached_results = redis_client.get(cache_key)

        if not cached_results:
            response = tavily.search(
                query=query,
                search_depth="basic",
                max_results=6,
                include_images=True,
            )  # type: ignore
            if redis_client:
                redis_client.set(cache_key, json.dumps(response), ex=3600)
        else:
            response = json.loads(cached_results)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500,
            detail="There was an error while searching. Please try again.",
        )
    results = [
        SearchResult(
            title=result["title"],
            url=result["url"],
            content=result["content"],
        )
        for result in response["results"]
    ]
    return SearchResponse(results=results, images=response["images"])
