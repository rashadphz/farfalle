import os
from dotenv import load_dotenv
from fastapi import HTTPException
from tavily import TavilyClient

from backend.schemas import SearchResponse, SearchResult


load_dotenv()

tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


async def search_tavily(query: str) -> SearchResponse:
    try:
        response: dict = tavily.search(
            query=query,
            search_depth="basic",
            max_results=6,
            include_images=True,
        )  # type: ignore
    except Exception:
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
