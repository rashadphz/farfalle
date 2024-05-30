from abc import ABC, abstractmethod

from backend.schemas import SearchResponse


class SearchProvider(ABC):
    @abstractmethod
    async def search(self, query: str) -> SearchResponse:
        pass
