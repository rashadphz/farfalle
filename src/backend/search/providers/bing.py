import asyncio

import httpx

from backend.schemas import SearchResponse, SearchResult
from backend.search.providers.base import SearchProvider


class BingSearchProvider(SearchProvider):
    def __init__(self, api_key: str):
        self.host = "https://api.bing.microsoft.com/v7.0"
        self.headers = {
            "Ocp-Apim-Subscription-Key": api_key,
            "Content-Type": "application/json",
        }

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
            headers=self.headers,
            params={"q": query, "count": num_results},
        )
        results = response.json()

        return [
            SearchResult(
                title=result["name"],
                url=result["url"],
                content=result["snippet"],
            )
            for result in results["webPages"]["value"][:num_results]
        ]

    async def get_image_results(
        self, client: httpx.AsyncClient, query: str, num_results: int = 4
    ) -> list[str]:
        response = await client.get(
            f"{self.host}/images/search",
            headers=self.headers,
            params={"q": query, "count": num_results},
        )
        results = response.json()
        return [result["contentUrl"] for result in results["value"][:num_results]]
