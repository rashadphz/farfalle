import os
from dotenv import load_dotenv
from tavily import TavilyClient

from backend.schemas import SearchResponse, SearchResult


load_dotenv()

tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


async def search_tavily(query: str) -> SearchResponse:
    response: dict = tavily.search(
        query=query,
        search_depth="basic",
        max_results=6,
        include_images=True,
    )  # type: ignore
    results = [
        SearchResult(
            title=result["title"],
            url=result["url"],
            content=result["content"],
        )
        for result in response["results"]
    ]
    return SearchResponse(results=results, images=response["images"])
