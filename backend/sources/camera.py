"""Camera abstraction for microscope and overview feeds.

Each `Camera` owns one OpenCV `VideoCapture` and serves frames as JPEGs.
`CameraManager` builds them from the env-configured spec list, so adding
or swapping cameras is a config change, not a code change. If a camera
device is missing (or OpenCV isn't built with the right backend), the
camera reports `available=False` and the stream returns a placeholder
frame so the UI tile gracefully degrades.
"""

from __future__ import annotations

import threading
import time
from dataclasses import dataclass
from typing import Dict, Iterable, Iterator, List, Optional

import numpy as np

try:
    import cv2  # type: ignore
except Exception:  # pragma: no cover - cv2 is in requirements but be defensive
    cv2 = None  # type: ignore


@dataclass
class CameraInfo:
    id: str
    label: str
    device: str
    available: bool


class Camera:
    def __init__(self, cam_id: str, label: str, device: str) -> None:
        self.id = cam_id
        self.label = label
        self.device = device
        self._cap = None
        self._lock = threading.Lock()
        self._open()

    def _open(self) -> None:
        if cv2 is None:
            return
        try:
            target: object = int(self.device) if self.device.isdigit() else self.device
            cap = cv2.VideoCapture(target)
            if cap.isOpened():
                self._cap = cap
            else:
                cap.release()
        except Exception:
            self._cap = None

    @property
    def available(self) -> bool:
        return self._cap is not None and self._cap.isOpened()

    def info(self) -> CameraInfo:
        return CameraInfo(id=self.id, label=self.label, device=self.device, available=self.available)

    def read_jpeg(self, quality: int = 70) -> bytes:
        with self._lock:
            frame = None
            if self.available:
                ok, frame = self._cap.read()  # type: ignore[union-attr]
                if not ok:
                    frame = None
            if frame is None:
                frame = _placeholder_frame(self.label)
            ok, buf = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), quality])  # type: ignore[union-attr]
            if not ok:
                return b""
            return buf.tobytes()

    def stream(self, fps: int, quality: int) -> Iterator[bytes]:
        period = 1.0 / max(fps, 1)
        boundary = b"--frame"
        while True:
            jpeg = self.read_jpeg(quality)
            if jpeg:
                yield (
                    boundary
                    + b"\r\nContent-Type: image/jpeg\r\nContent-Length: "
                    + str(len(jpeg)).encode()
                    + b"\r\n\r\n"
                    + jpeg
                    + b"\r\n"
                )
            time.sleep(period)

    def release(self) -> None:
        with self._lock:
            if self._cap is not None:
                try:
                    self._cap.release()
                except Exception:
                    pass
                self._cap = None


def _placeholder_frame(label: str) -> np.ndarray:
    """Dark frame with a 'no signal' label; used when a camera is missing."""
    h, w = 360, 640
    img = np.zeros((h, w, 3), dtype=np.uint8)
    img[:] = (24, 24, 32)
    if cv2 is not None:
        text = f"{label}: no signal"
        size, _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.8, 2)
        x = (w - size[0]) // 2
        y = (h + size[1]) // 2
        cv2.putText(img, text, (x, y), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (200, 200, 200), 2)
    return img


class CameraManager:
    def __init__(self, specs: Iterable[str]) -> None:
        self._cameras: Dict[str, Camera] = {}
        for i, raw in enumerate(specs):
            if ":" in raw:
                label, device = raw.split(":", 1)
            else:
                label, device = f"cam{i}", raw
            cam_id = label.strip().lower().replace(" ", "_") or f"cam{i}"
            self._cameras[cam_id] = Camera(cam_id, label.strip() or cam_id, device.strip())

    def list(self) -> List[CameraInfo]:
        return [c.info() for c in self._cameras.values()]

    def get(self, cam_id: str) -> Optional[Camera]:
        return self._cameras.get(cam_id)

    def release_all(self) -> None:
        for cam in self._cameras.values():
            cam.release()
