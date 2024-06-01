import asyncio

import httpx

from backend.schemas import SearchResponse, SearchResult
from backend.search.providers.base import SearchProvider


class SearxngSearchProvider(SearchProvider):
    def __init__(self, host: str):
        self.host = host

    async def search(self, query: str) -> SearchResponse:
        async with httpx.AsyncClient() as client:
            link_results, image_results = await asyncio.gather(
                self.get_link_results(client, query),
                self.get_image_results(client, query),
            )

        return SearchResponse(results=link_results, images=image_results)

    async def get_link_results(
        self, client: httpx.AsyncClient, query: str, num_results: int = 6
    ) -> list[SearchResult]:
        response = await client.get(
            f"{self.host}/search",
            params={"q": query, "format": "json"},
        )
        results = response.json()

        return [
            SearchResult(
                title=result["title"],
                url=result["url"],
                content=result["content"],
            )
            for result in results["results"][:num_results]
        ]

    async def get_image_results(
        self, client: httpx.AsyncClient, query: str, num_results: int = 4
    ) -> list[str]:
        response = await client.get(
            f"{self.host}/search",
            params={"q": query, "format": "json", "categories": "images"},
        )
        results = response.json()
        return [result["img_src"] for result in results["results"][:num_results]]
