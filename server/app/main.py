import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import admin, qr, results, vote

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Eresmas Vota API")

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
admin_frontend_url = os.getenv("ADMIN_FRONTEND_URL", "http://localhost:5173")
allowed_origins = list({frontend_url, admin_frontend_url})
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vote.router)
app.include_router(results.router)
app.include_router(qr.router)
app.include_router(admin.router)


@app.get("/health")
def health():
    return {"status": "ok"}
