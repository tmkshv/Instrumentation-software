"""Shared-token bearer auth.

Auth is intentionally minimal: a single token is shared with the operator
team and entered once on the React login screen. URC runs on a closed
network, so this is enough; we are not building a public service.
"""

from __future__ import annotations

from fastapi import Header, HTTPException, status

from .config import get_settings


async def require_token(authorization: str | None = Header(default=None)) -> None:
    settings = get_settings()
    if not settings.auth_enabled:
        return

    expected = f"Bearer {settings.token}"
    if authorization != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing token",
            headers={"WWW-Authenticate": "Bearer"},
        )
