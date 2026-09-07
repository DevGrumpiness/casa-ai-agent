from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_reservation() -> None:
    responseOne = client.post(
        "/reservations",
        json={
            "date": "25.07.2026",
            "time": "18:00",
            "name": "Sabine",
            "party_size": 4,
            "phone_number": "123-456-7890"
        }
    )
    responseTwo = client.post(
        "/reservations",
        json={
            "date": "25.07.2026",
            "time": "18:00",
            "name": "Jack",
            "party_size": 4,
            "phone_number": "123-456-7890"
        }
    )
    assert responseOne.status_code == 201
    assert responseOne.json()["name"] == "Sabine"
    assert responseTwo.status_code == 201
    assert responseTwo.json()["name"] == "Jack"

    assert responseOne.json()["id"] != responseTwo.json()["id"]