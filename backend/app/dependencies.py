from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.device_auth import DeviceAuthError, verify_device_session_token


def get_authenticated_device_id(
    authorization: str | None = Header(default=None),
) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing device authorization token.",
        )

    scheme, _, credentials = authorization.partition(" ")
    if scheme.lower() != "bearer" or not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid device authorization header. Use Bearer <token>.",
        )

    try:
        return verify_device_session_token(credentials)
    except DeviceAuthError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc


# Re-export get_db for existing router imports.
__all__ = ["Session", "get_db", "get_authenticated_device_id"]
