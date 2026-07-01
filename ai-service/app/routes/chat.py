from __future__ import annotations

from typing import AsyncGenerator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.agents.soc_analyst import SocAnalystAgent
from app.models import ChatMessage, ChatRequest, ChatResponse
from app.utils.formatters import chunk_text, format_soc_analysis, sse_event

router = APIRouter()
agent = SocAnalystAgent()


def _extract_question(payload: ChatRequest) -> str:
    for message in reversed(payload.messages):
        if message.role == "user":
            return message.content
    return payload.messages[-1].content if payload.messages else "Provide a security assessment."


async def _build_chat_response(payload: ChatRequest) -> dict:
    question = _extract_question(payload)
    context = payload.context or {"conversation": [message.model_dump() for message in payload.messages]}
    return await agent.run(question=question, context=context)


async def _stream_chat(payload: ChatRequest) -> AsyncGenerator[str, None]:
    analysis = await _build_chat_response(payload)
    text = format_soc_analysis(analysis)
    for chunk in chunk_text(text):
        yield sse_event({"delta": chunk})
    yield sse_event({"message": text, "analysis": analysis}, event="complete")


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    if payload.stream:
        return StreamingResponse(_stream_chat(payload), media_type="text/event-stream")
    analysis = await _build_chat_response(payload)
    content = format_soc_analysis(analysis)
    return ChatResponse(
        message=ChatMessage(role="assistant", content=content),
        usage={"mode": analysis.get("mode", "mock"), "confidence": analysis.get("confidence", 0.0)},
    )


@router.post("/chat/stream")
async def stream_chat(payload: ChatRequest):
    return StreamingResponse(_stream_chat(payload), media_type="text/event-stream")
