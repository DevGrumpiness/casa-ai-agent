from typing import Literal
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.reservations_db import (
    get_reservations,
    insert_reservation,
    update_reservation_status,
)


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


class ReservationCreate(BaseModel):
    date: str
    time: str
    name: str
    party_size: int
    phone_number: str
    chef_override: bool = False
    comment: str | None = None


class Reservation(BaseModel):
    id: str
    date: str
    time: str
    name: str
    party_size: int
    phone_number: str
    comment: str | None = None
    status: str


class ReservationStatusUpdate(BaseModel):
    status: Literal["pending", "confirmed"]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


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
        status="confirmed",
    )

    status = insert_reservation(
        id=new_reservation.id,
        date=new_reservation.date,
        time=new_reservation.time,
        name=new_reservation.name,
        party_size=new_reservation.party_size,
        phone_number=new_reservation.phone_number,
        chef_override=reservation.chef_override,
        comment=new_reservation.comment,
    )

    new_reservation.status = status

    return new_reservation


@app.patch("/reservations/{reservation_id}/status")
def change_reservation_status(
    reservation_id: str,
    update: ReservationStatusUpdate,
) -> dict[str, str]:
    updated = update_reservation_status(
        reservation_id,
        update.status,
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Reservierung nicht gefunden",
        )

    return {
        "id": reservation_id,
        "status": update.status,
    }