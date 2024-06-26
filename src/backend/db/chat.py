import re

from sqlalchemy.orm import Session, contains_eager

from backend.db.models import ChatMessage, ChatThread
from backend.db.models import SearchResult as DBSearchResult
from backend.schemas import ChatSnapshot, MessageRole, SearchResult


def create_chat_thread(*, session: Session, model_name: str):
    chat_thread = ChatThread(model_name=model_name)
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
        session.query(ChatMessage)
        .filter(ChatMessage.chat_thread_id == thread_id)
        .order_by(ChatMessage.id.desc())
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
    search_results: list[SearchResult] | None = None,
    image_results: list[str] | None = None,
    related_queries: list[str] | None = None,
):
    message = ChatMessage(
        chat_thread_id=thread_id,
        role=role,
        content=content,
        parent_message_id=parent_message_id,
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


def get_chat_history(*, session: Session) -> list[ChatSnapshot]:
    threads = (
        session.query(ChatThread)
        .join(ChatThread.messages)
        .options(contains_eager(ChatThread.messages))
        .order_by(ChatThread.time_created.desc(), ChatMessage.id.asc())
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
                title=title,
                date=thread.time_created,
                preview=preview,
                model_name=thread.model_name,
            )
        )
    return snapshots
