from app.database import get_connection

def insert_reservation(
        id: str,
        date: str,
        time: str,
        name: str,
        party_size: int,
        phone_number: str,
        comment: str | None = None,
) -> None:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO reservations (id, date, time, name, party_size, phone_number, comment)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (id, date, time, name, party_size, phone_number, comment),
            )

def get_reservations() -> list[dict]:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT id, date, time, name, party_size, phone_number, comment FROM reservations"
            )
            rows = cursor.fetchall()
    return [
        {
            "id": row[0],
            "date": row[1],
            "time": row[2],
            "name": row[3],
            "party_size": row[4],
            "phone_number": row[5],
            "comment": row[6],
        }
        for row in rows
    ]