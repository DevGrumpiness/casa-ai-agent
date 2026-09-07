from pydantic import BaseModel
from uuid import uuid4
from app.reservations_db import insert_reservation, get_reservations

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

class ReservationCreate(BaseModel):
    date: str
    time: str
    name: str
    party_size: int
    phone_number: str
    comment: str | None = None

class Reservation(BaseModel):
    id: str
    date: str
    time: str
    name: str
    party_size: int
    phone_number: str
    comment: str | None = None

@app.get("/reservations", response_model=list[Reservation])
def get_reservations_endpoint() -> list[dict]:
    reservations = get_reservations()
    return reservations

@app.post("/reservations", response_model=Reservation, status_code=201)
def create_reservation(reservation: ReservationCreate) -> Reservation:

    new_reservation = Reservation(
        id=str(uuid4()),
        date=reservation.date,
        time=reservation.time,
        name=reservation.name,
        party_size=reservation.party_size,
        phone_number=reservation.phone_number,
        comment=reservation.comment,
    )
    insert_reservation(
        id=new_reservation.id,
        date=new_reservation.date,
        time=new_reservation.time,
        name=new_reservation.name,
        party_size=new_reservation.party_size,
        phone_number=new_reservation.phone_number,
        comment=new_reservation.comment,
    )
    return new_reservation