"""Spectrum endpoints. Frontend SpectrumChart polls /api/spectrum/latest."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from ..auth import require_token

router = APIRouter(prefix="/api/spectrum", tags=["spectrum"], dependencies=[Depends(require_token)])


@router.get("/latest")
async def latest(request: Request):
    state = request.app.state.system_state
    payload = state.get_latest_spectrum()
    if payload is None:
        return {"status": "no_data"}
    return {"status": "ok", "data": payload}
