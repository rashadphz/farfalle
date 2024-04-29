import os
from dotenv import load_dotenv
from tavily import TavilyClient

from schemas import SearchResult


load_dotenv()
tavily = TavilyClient(api_key=os.getenv("TAV_API_KEY"))


async def search_tavily(query: str) -> list[SearchResult]:
    response = tavily.search(
        query=query,
        search_depth="basic",
        max_results=5,
    )
    return [
        SearchResult(
            title=result["title"],
            url=result["url"],
            content=result["content"],
        )
        for result in response["results"]
    ]
