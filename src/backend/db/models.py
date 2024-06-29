import datetime

from sqlalchemy import ARRAY, DateTime, Enum, ForeignKey, String, func
from sqlalchemy.dialects import postgresql
from sqlalchemy.orm import Mapped, declarative_base, mapped_column, relationship

from backend.schemas import MessageRole

Base = declarative_base()


class ChatThread(Base):
    __tablename__ = "chat_thread"
    id: Mapped[int] = mapped_column(primary_key=True)

    messages: Mapped[list["ChatMessage"]] = relationship(
        "ChatMessage", back_populates="chat_thread"
    )
    model_name: Mapped[str] = mapped_column(String)

    time_updated: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
    time_created: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class SearchResult(Base):
    __tablename__ = "search_result"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String)
    url: Mapped[str] = mapped_column(String)
    content: Mapped[str] = mapped_column(String)

    chat_message_id: Mapped[int] = mapped_column(ForeignKey("chat_message.id"))
    chat_message: Mapped["ChatMessage"] = relationship(
        "ChatMessage", back_populates="search_results"
    )


class ChatMessage(Base):
    __tablename__ = "chat_message"
    id: Mapped[int] = mapped_column(primary_key=True)
    role: Mapped[MessageRole] = mapped_column(Enum(MessageRole))
    content: Mapped[str] = mapped_column(String)
    parent_message_id: Mapped[int | None] = mapped_column(
        ForeignKey("chat_message.id"), nullable=True
    )

    chat_thread_id: Mapped[int] = mapped_column(ForeignKey("chat_thread.id"))
    chat_thread: Mapped[ChatThread] = relationship(
        ChatThread, back_populates="messages"
    )

    # AI Only
    agent_search_full_response: Mapped[str | None] = mapped_column(
        postgresql.JSONB, nullable=True
    )

    related_queries: Mapped[list[str] | None] = mapped_column(
        ARRAY(String), nullable=True
    )
    image_results: Mapped[list[str] | None] = mapped_column(
        ARRAY(String), nullable=True
    )

    search_results: Mapped[list[SearchResult] | None] = relationship(
        SearchResult, back_populates="chat_message"
    )
