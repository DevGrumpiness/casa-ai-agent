import pytest
from fastapi.testclient import TestClient

from app.auth import hash_password, reset_login_rate_limiter
from app.database import settings
from app.main import app

client = TestClient(app)

TEST_PASSWORD = "s3cret-test-password"


@pytest.fixture(autouse=True)
def configure_test_admin_credentials():
    original_hash = settings.admin_password_hash
    original_secret = settings.session_secret
    settings.admin_password_hash = hash_password(TEST_PASSWORD)
    settings.session_secret = "test-session-secret"
    reset_login_rate_limiter()
    yield
    settings.admin_password_hash = original_hash
    settings.session_secret = original_secret
    client.cookies.clear()
    reset_login_rate_limiter()


def _create_reservation(name: str, phone_number: str) -> dict:
    response = client.post(
        "/reservations",
        json={
            "date": "25.07.2026",
            "time": "19:00",
            "name": name,
            "party_size": 2,
            "phone_number": phone_number,
        },
    )
    assert response.status_code == 201
    return response.json()


def test_unauthenticated_reservations_mask_personal_fields() -> None:
    created = _create_reservation("Johanna Keller", "+49 170 1234567")

    response = client.get("/reservations")
    assert response.status_code == 200

    matching = next(item for item in response.json() if item["id"] == created["id"])
    assert matching["name"] != "Johanna Keller"
    assert matching["phone_number"] != "+49 170 1234567"
    assert matching["name"].startswith("Jo")
    assert matching["phone_number"].endswith("567")
    assert "\u2022" in matching["name"]
    assert "\u2022" in matching["phone_number"]


def test_login_with_correct_password_reveals_real_data() -> None:
    created = _create_reservation("Marta Vogel", "+49 171 7654321")

    login_response = client.post("/auth/login", json={"password": TEST_PASSWORD})
    assert login_response.status_code == 200

    session_response = client.get("/auth/session")
    assert session_response.json() == {"authenticated": True}

    reservations_response = client.get("/reservations")
    matching = next(
        item for item in reservations_response.json() if item["id"] == created["id"]
    )
    assert matching["name"] == "Marta Vogel"
    assert matching["phone_number"] == "+49 171 7654321"


def test_incorrect_password_does_not_unlock() -> None:
    response = client.post("/auth/login", json={"password": "wrong-password"})
    assert response.status_code == 401

    session_response = client.get("/auth/session")
    assert session_response.json() == {"authenticated": False}


def test_logout_returns_to_masked_data() -> None:
    created = _create_reservation("Peter Lang", "+49 172 1112223")

    client.post("/auth/login", json={"password": TEST_PASSWORD})
    client.post("/auth/logout")

    session_response = client.get("/auth/session")
    assert session_response.json() == {"authenticated": False}

    response = client.get("/reservations")
    matching = next(item for item in response.json() if item["id"] == created["id"])
    assert matching["name"] != "Peter Lang"


def test_repeated_failed_logins_are_rate_limited() -> None:
    for _ in range(5):
        response = client.post("/auth/login", json={"password": "wrong-password"})
        assert response.status_code == 401

    limited_response = client.post("/auth/login", json={"password": "wrong-password"})
    assert limited_response.status_code == 429

    still_limited_with_correct_password = client.post(
        "/auth/login", json={"password": TEST_PASSWORD}
    )
    assert still_limited_with_correct_password.status_code == 429
