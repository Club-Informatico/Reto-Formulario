from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1.routes import router as api_v1
from app.db import init_db

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"], allow_credentials=True,
  allow_methods=["*"], allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
  init_db()

app.include_router(api_v1, prefix="/api/v1")

app.mount("/", StaticFiles(directory="app/static", html=True), name="static")
