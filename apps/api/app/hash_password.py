from getpass import getpass

from app.auth import hash_password

if __name__ == "__main__":
    password = getpass("Admin password: ")
    confirmation = getpass("Confirm password: ")

    if password != confirmation:
        print("Passwords did not match.")
        raise SystemExit(1)

    print(hash_password(password))
