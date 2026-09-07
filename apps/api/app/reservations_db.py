from app.database import get_connection

def insert_reservation(
        id: str,
        date: str,
        time: str,
        name: str,
        party_size: int,
        phone_number: str,
        chef_override: bool = False,
        comment: str | None = None,
) -> str:
    status = "confirmed"
    if not chef_override and (party_size > 6 or get_reservation_sum_by_date(date) + party_size > 30):
        status = "pending"
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO reservations (id, date, time, name, party_size, phone_number, comment, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (id, date, time, name, party_size, phone_number, comment, status),
            )
    return status

def get_reservations() -> list[dict]:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT id, date, time, name, party_size, phone_number, comment, status FROM reservations"
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
            "status": row[7],
        }
        for row in rows
    ]

def get_reservation_sum_by_date(date: str) -> int:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT SUM(party_size) FROM reservations WHERE date = %s", (date,)
            )
            result = cursor.fetchone()
            if result is None or result[0] is None:
                return 0
            return result[0]