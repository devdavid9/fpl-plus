from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routers import team, decisions

app = FastAPI(title="FPL Unlocked", version="0.1.0")

ALLOWED_ORIGINS = os.getenv("FRONTEND_URL", "*")
if ALLOWED_ORIGINS != "*":
    origins = [o.strip() for o in ALLOWED_ORIGINS.split(",")]
else:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(team.router,      prefix="/api")
app.include_router(decisions.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
