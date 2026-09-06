from pydantic import BaseModel

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Casa Vazquez AI Agent api",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

class Reservation(BaseModel):
    id: str
    date: str
    time: str
    name: str
    party_size: int
    phone_number: str

@app.get("/reservations", response_model=list[Reservation])
def get_reservations() -> list[dict[str, str | int]]:
    return [
        {
            "id": "1",
            "date": "25.07.2026",
            "time": "18:00",
            "name": "SAbine",
            "party_size": 4,
            "phone_number": "123-456-7890",
        },
                {
            "id": "2",
            "date": "25.07.2025",
            "time": "18:10",
            "name": "Max Mustermännchen",
            "party_size": 1,
            "phone_number": "123-456-7890",
        }
    ]