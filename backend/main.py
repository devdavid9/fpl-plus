from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routers import team, decisions

app = FastAPI(title="FPL+", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(team.router,      prefix="/api")
app.include_router(decisions.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
