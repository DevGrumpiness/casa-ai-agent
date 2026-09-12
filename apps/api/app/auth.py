import hashlib
import hmac
import os
import time
from collections import defaultdict

from fastapi import Request

from app.database import settings

SESSION_COOKIE_NAME = "casa_admin_session"
SESSION_TTL_SECONDS = 45 * 60

LOGIN_RATE_LIMIT_WINDOW_SECONDS = 60
LOGIN_RATE_LIMIT_ATTEMPTS = 5

_failed_login_attempts: dict[str, list[float]] = defaultdict(list)


def _recent_failed_attempts(client_ip: str) -> list[float]:
    now = time.time()
    recent = [
        attempt
        for attempt in _failed_login_attempts.get(client_ip, [])
        if now - attempt < LOGIN_RATE_LIMIT_WINDOW_SECONDS
    ]
    _failed_login_attempts[client_ip] = recent
    return recent


def is_login_rate_limited(client_ip: str) -> bool:
    return len(_recent_failed_attempts(client_ip)) >= LOGIN_RATE_LIMIT_ATTEMPTS


def register_failed_login(client_ip: str) -> None:
    _recent_failed_attempts(client_ip).append(time.time())


def clear_failed_logins(client_ip: str) -> None:
    _failed_login_attempts.pop(client_ip, None)


def reset_login_rate_limiter() -> None:
    _failed_login_attempts.clear()


def is_trusted_bff_request(request: Request) -> bool:
    if not settings.bff_proxy_secret:
        return False

    provided = request.headers.get("x-bff-secret")
    if not provided:
        return False

    return hmac.compare_digest(provided, settings.bff_proxy_secret)


def hash_password(password: str, *, iterations: int = 260_000) -> str:
    salt = os.urandom(16)
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return f"pbkdf2_sha256${iterations}${salt.hex()}${derived.hex()}"


def verify_password(password: str, encoded_hash: str) -> bool:
    try:
        algorithm, iterations_str, salt_hex, hash_hex = encoded_hash.split("$")
        if algorithm != "pbkdf2_sha256":
            return False
        iterations = int(iterations_str)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(hash_hex)
    except (ValueError, AttributeError):
        return False

    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return hmac.compare_digest(derived, expected)


def _sign(payload: str, secret: str) -> str:
    return hmac.new(secret.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()


def create_session_token(*, secret: str, ttl_seconds: int = SESSION_TTL_SECONDS) -> str:
    expires_at = int(time.time()) + ttl_seconds
    payload = str(expires_at)
    return f"{payload}.{_sign(payload, secret)}"


def is_session_token_valid(token: str | None, *, secret: str) -> bool:
    if not token or "." not in token:
        return False

    payload, _, signature = token.partition(".")
    if not hmac.compare_digest(signature, _sign(payload, secret)):
        return False

    try:
        expires_at = int(payload)
    except ValueError:
        return False

    return time.time() < expires_at


def is_request_authenticated(request: Request) -> bool:
    token = request.cookies.get(SESSION_COOKIE_NAME)
    return is_session_token_valid(token, secret=settings.session_secret)
