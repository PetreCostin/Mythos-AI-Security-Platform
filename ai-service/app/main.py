from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routes import analysis, chat, incident, malware, threat_hunting

app = FastAPI(title="Mythos AI Security Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/ai", tags=["chat"])
app.include_router(analysis.router, prefix="/ai", tags=["analysis"])
app.include_router(threat_hunting.router, prefix="/ai", tags=["threat-hunting"])
app.include_router(incident.router, prefix="/ai", tags=["incident"])
app.include_router(malware.router, prefix="/ai", tags=["malware"])


@app.exception_handler(ValueError)
async def value_error_handler(_: Request, exc: ValueError):
    return JSONResponse(status_code=400, content={"detail": str(exc)})


@app.exception_handler(Exception)
async def generic_exception_handler(_: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Internal AI service error", "error": str(exc)})


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "mythos-ai"}
