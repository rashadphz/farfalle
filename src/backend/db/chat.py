import json
import re

from sqlalchemy import select
from sqlalchemy.orm import Session, contains_eager

from backend.db.models import ChatMessage as DBChatMessage
from backend.db.models import ChatThread as DBChatThread
from backend.db.models import SearchResult as DBSearchResult
from backend.schemas import (
    AgentSearchFullResponse,
    ChatMessage,
    ChatSnapshot,
    MessageRole,
    SearchResult,
    ThreadResponse,
)
from backend.utils import DB_ENABLED


def create_chat_thread(*, session: Session, model_name: str):
    chat_thread = DBChatThread(model_name=model_name)
    session.add(chat_thread)
    session.commit()
    return chat_thread


def create_search_results(
    *, session: Session, search_results: list[SearchResult], chat_message_id: int
) -> list[DBSearchResult]:
    db_search_results = [
        DBSearchResult(
            url=result.url,
            title=result.title,
            content=result.content,
            chat_message_id=chat_message_id,
        )
        for result in search_results
    ]
    session.add_all(db_search_results)
    session.commit()
    return db_search_results


def append_message(
    *,
    session: Session,
    thread_id: int,
    role: MessageRole,
    content: str,
    search_results: list[SearchResult] | None = None,
    image_results: list[str] | None = None,
    related_queries: list[str] | None = None,
):
    last_message = (
        session.query(DBChatMessage)
        .filter(DBChatMessage.chat_thread_id == thread_id)
        .order_by(DBChatMessage.id.desc())
        .first()
    )

    return create_message(
        session=session,
        thread_id=thread_id,
        role=role,
        content=content,
        parent_message_id=last_message.id if last_message else None,
        search_results=search_results,
        image_results=image_results,
        related_queries=related_queries,
    )


def create_message(
    *,
    session: Session,
    thread_id: int,
    role: MessageRole,
    content: str,
    parent_message_id: int | None = None,
    agent_search_full_response: AgentSearchFullResponse | None = None,
    search_results: list[SearchResult] | None = None,
    image_results: list[str] | None = None,
    related_queries: list[str] | None = None,
):
    message = DBChatMessage(
        chat_thread_id=thread_id,
        role=role,
        content=content,
        parent_message_id=parent_message_id,
        agent_search_full_response=(
            agent_search_full_response.model_dump_json()
            if agent_search_full_response
            else None
        ),
        image_results=image_results or [],
        related_queries=related_queries or [],
    )

    session.add(message)
    session.flush()

    db_search_results = None
    if search_results is not None:
        db_search_results = create_search_results(
            session=session, search_results=search_results, chat_message_id=message.id
        )
    message.search_results = db_search_results or []

    session.add(message)
    session.commit()
    return message


def save_turn_to_db(
    *,
    session: Session,
    thread_id: int | None,
    user_message: str,
    assistant_message: str,
    model: str,
    agent_search_full_response: AgentSearchFullResponse | None = None,
    search_results: list[SearchResult] | None = None,
    image_results: list[str] | None = None,
    related_queries: list[str] | None = None,
) -> int | None:
    if DB_ENABLED:
        if thread_id is None:
            thread = create_chat_thread(session=session, model_name=model)
            thread_id = thread.id
        else:
            thread_id = thread_id

        user_message = append_message(
            session=session,
            thread_id=thread_id,
            role=MessageRole.USER,
            content=user_message,
        )

        _assistant_message = create_message(
            session=session,
            thread_id=thread_id,
            role=MessageRole.ASSISTANT,
            content=assistant_message,
            parent_message_id=user_message.id,
            agent_search_full_response=agent_search_full_response,
            search_results=search_results,
            image_results=image_results,
            related_queries=related_queries,
        )
        return thread_id
    return None


def get_chat_history(*, session: Session) -> list[ChatSnapshot]:
    threads = (
        session.query(DBChatThread)
        .join(DBChatThread.messages)
        .options(contains_eager(DBChatThread.messages))
        .order_by(DBChatThread.time_created.desc(), DBChatMessage.id.asc())
        .all()
    )
    threads = [thread for thread in threads if len(thread.messages) > 1]

    snapshots = []
    for thread in threads:
        title = thread.messages[0].content
        preview = thread.messages[1].content

        # Remove citations from the preview
        citation_regex = re.compile(r"\[[0-9]+\]")
        preview = citation_regex.sub("", preview)

        snapshots.append(
            ChatSnapshot(
                id=thread.id,
                title=title,
                date=thread.time_created,
                preview=preview,
                model_name=thread.model_name,
            )
        )
    return snapshots


def map_search_result(search_result: DBSearchResult) -> SearchResult:
    return SearchResult(
        url=search_result.url,
        title=search_result.title,
        content=search_result.content,
    )


def get_thread(*, session: Session, thread_id: int) -> ThreadResponse:
    stmt = (
        select(DBChatMessage)
        .where(DBChatMessage.chat_thread_id == thread_id)
        .order_by(DBChatMessage.id.asc())
    )
    db_messages = session.execute(stmt).scalars().all()
    if len(db_messages) == 0:
        raise ValueError(f"Thread with id {thread_id} not found")

    messages = [
        ChatMessage(
            content=message.content,
            role=message.role,
            related_queries=message.related_queries or [],
            sources=[
                map_search_result(result) for result in message.search_results or []
            ],
            images=message.image_results or [],
            agent_response=(
                AgentSearchFullResponse(
                    **json.loads(message.agent_search_full_response)
                )
                if message.agent_search_full_response
                else None
            ),
        )
        for message in db_messages
    ]
    return ThreadResponse(thread_id=thread_id, messages=messages)
