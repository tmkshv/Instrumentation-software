"""Control + status endpoints.

The frontend's ControlBar talks to this router.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from ..auth import require_token

router = APIRouter(prefix="/api", tags=["control"], dependencies=[Depends(require_token)])


def _runner(request: Request):
    return request.app.state.runner


def _state(request: Request):
    return request.app.state.system_state


@router.get("/status")
async def get_status(request: Request):
    return _state(request).snapshot()


@router.post("/start")
async def start(request: Request):
    try:
        session_id = _runner(request).start()
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))
    return {"ok": True, "session_id": session_id}


@router.post("/stop")
async def stop(request: Request):
    _runner(request).stop()
    return {"ok": True}


@router.post("/sample")
async def take_sample(request: Request):
    try:
        sample_id = _runner(request).take_one()
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))
    return {"ok": True, "sample_id": sample_id}
