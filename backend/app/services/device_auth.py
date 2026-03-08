from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
from datetime import datetime, timedelta, timezone

TOKEN_VERSION = 1
DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 90


class DeviceAuthError(Exception):
    """Raised when a device session token is invalid or cannot be verified."""


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _base64url_encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("utf-8").rstrip("=")


def _base64url_decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(f"{value}{padding}")


def _get_signing_secret() -> bytes:
    candidates = [
        os.environ.get("APPIFEX_DEVICE_AUTH_SECRET", "").strip(),
        os.environ.get("APPIFEX_PROJECT_ID", "").strip(),
        os.environ.get("APPIFEX_RUNTIME_UPLOAD_PREFIX", "").strip(),
        os.environ.get("DATABASE_URL", "").strip(),
    ]
    secret = next((candidate for candidate in candidates if candidate), "")
    if not secret:
        raise DeviceAuthError(
            "Device auth secret is not configured. Set APPIFEX_DEVICE_AUTH_SECRET or APPIFEX_PROJECT_ID."
        )
    return secret.encode("utf-8")


def _sign(payload_segment: str) -> str:
    signature = hmac.new(
        _get_signing_secret(),
        payload_segment.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    return _base64url_encode(signature)


def create_device_session_token(
    device_id: str,
    *,
    expires_in_seconds: int = DEFAULT_SESSION_TTL_SECONDS,
) -> tuple[str, datetime]:
    if not device_id or not device_id.strip():
        raise DeviceAuthError("Device ID is required to create a session token.")

    issued_at = utc_now()
    expires_at = issued_at + timedelta(seconds=expires_in_seconds)
    payload = {
        "sub": device_id,
        "iat": int(issued_at.timestamp()),
        "exp": int(expires_at.timestamp()),
        "v": TOKEN_VERSION,
    }
    payload_segment = _base64url_encode(
        json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    )
    signature_segment = _sign(payload_segment)
    return f"{payload_segment}.{signature_segment}", expires_at


def verify_device_session_token(token: str) -> str:
    if not token:
        raise DeviceAuthError("Missing device session token.")

    try:
        payload_segment, signature_segment = token.split(".", 1)
    except ValueError as exc:
        raise DeviceAuthError("Malformed device session token.") from exc

    expected_signature = _sign(payload_segment)
    if not hmac.compare_digest(signature_segment, expected_signature):
        raise DeviceAuthError("Invalid device session token signature.")

    try:
        payload = json.loads(_base64url_decode(payload_segment).decode("utf-8"))
    except (ValueError, json.JSONDecodeError) as exc:
        raise DeviceAuthError("Malformed device session token payload.") from exc

    if payload.get("v") != TOKEN_VERSION:
        raise DeviceAuthError("Unsupported device session token version.")

    subject = payload.get("sub")
    if not isinstance(subject, str) or not subject.strip():
        raise DeviceAuthError("Device session token is missing a subject.")

    expires_at = payload.get("exp")
    if not isinstance(expires_at, int):
        raise DeviceAuthError("Device session token is missing an expiry.")

    if expires_at < int(utc_now().timestamp()):
        raise DeviceAuthError("Device session token has expired.")

    return subject
