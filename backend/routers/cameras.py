"""Camera listing, MJPEG stream, and snapshot endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import Response, StreamingResponse

from ..auth import require_token_for_cameras

router = APIRouter(
    prefix="/api/cameras",
    tags=["cameras"],
    dependencies=[Depends(require_token_for_cameras)],
)


@router.get("")
async def list_cameras(request: Request):
    manager = request.app.state.camera_manager
    return {"cameras": [c.__dict__ for c in manager.list()]}


@router.get("/{cam_id}/snapshot")
async def snapshot(cam_id: str, request: Request):
    manager = request.app.state.camera_manager
    cam = manager.get(cam_id)
    if cam is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="unknown camera")
    settings = request.app.state.settings
    jpeg = cam.read_jpeg(quality=settings.camera_jpeg_quality)
    return Response(content=jpeg, media_type="image/jpeg")


@router.get("/{cam_id}/stream")
async def stream(cam_id: str, request: Request):
    manager = request.app.state.camera_manager
    cam = manager.get(cam_id)
    if cam is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="unknown camera")
    settings = request.app.state.settings
    media_type, body = cam.mjpeg_stream(settings.camera_fps, settings.camera_jpeg_quality)
    return StreamingResponse(body, media_type=media_type)
