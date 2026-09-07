from app.database import get_connection

def init_db():
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS reservations (
                    id VARCHAR(36) PRIMARY KEY,
                    date VARCHAR(10) NOT NULL,
                    time VARCHAR(5) NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    party_size INTEGER NOT NULL,
                    phone_number VARCHAR(30) NOT NULL,
                    comment VARCHAR(255)
                )
                """
            )
if __name__ == "__main__":
    init_db()