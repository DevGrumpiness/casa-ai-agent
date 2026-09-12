from typing import Literal
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.auth import (
    SESSION_COOKIE_NAME,
    SESSION_TTL_SECONDS,
    clear_failed_logins,
    create_session_token,
    is_login_rate_limited,
    is_request_authenticated,
    is_trusted_bff_request,
    register_failed_login,
    verify_password,
)
from app.database import settings
from app.privacy import mask_reservation
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
    allow_origins=settings.allowed_origins.split(","),
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


class LoginRequest(BaseModel):
    password: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/reservations", response_model=list[Reservation])
def get_reservations_endpoint(request: Request) -> list[dict]:
    reservations = get_reservations()

    if is_request_authenticated(request):
        return reservations

    return [mask_reservation(reservation) for reservation in reservations]


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


@app.post("/auth/login")
def login(payload: LoginRequest, request: Request, response: Response) -> dict[str, bool]:
    client_ip = request.client.host if request.client else "unknown"
    trusted_bff = is_trusted_bff_request(request)

    if not trusted_bff and is_login_rate_limited(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Zu viele Versuche. Bitte später erneut versuchen.",
        )

    if not settings.admin_password_hash or not verify_password(
        payload.password, settings.admin_password_hash
    ):
        if not trusted_bff:
            register_failed_login(client_ip)
        raise HTTPException(status_code=401, detail="Ungültige Anmeldedaten")

    if not trusted_bff:
        clear_failed_logins(client_ip)

    token = create_session_token(secret=settings.session_secret)
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        max_age=SESSION_TTL_SECONDS,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/",
    )

    return {"authenticated": True}


@app.post("/auth/logout")
def logout(response: Response) -> dict[str, bool]:
    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        path="/",
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )

    return {"authenticated": False}


@app.get("/auth/session")
def session_status(request: Request) -> dict[str, bool]:
    return {"authenticated": is_request_authenticated(request)}