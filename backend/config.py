"""Runtime configuration loaded from environment variables.

Defaults are picked so the backend boots usefully on a laptop with no
hardware attached (mock chem source, no cameras). At competition the
environment file overrides these to point at real devices.
"""

from __future__ import annotations

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="HUSKY_", env_file=".env", extra="ignore")

    # Single shared bearer token. Empty string disables auth (dev only).
    token: str = ""

    # Comma-separated camera device specs. Each entry can be a numeric
    # index ("0"), a /dev path ("/dev/video2"), or "name:index" / "name:/dev/...".
    # Examples:
    #   HUSKY_CAMERAS="microscope:0,overview:1"
    #   HUSKY_CAMERAS="0"
    cameras: str = ""

    # Selects the chem data source.
    #   "mock"            - synthetic plausible readings (default)
    #   "csv:/path/file"  - tail a CSV that an instrument writes
    chem_source: str = "mock"

    # Where SpectroscopyLogger writes sessions.
    log_dir: str = "spectroscopy_logs"

    # Path the SampleRunner reads raw 2D frames from in mock/dev mode.
    # In production this is replaced by a real sensor driver.
    test_image_path: str = "test_spectrum.npy"

    # Streaming knobs - tune for the rover radio.
    camera_fps: int = 5
    camera_jpeg_quality: int = 70

    # Where the built React app lives. Served at "/".
    frontend_dist: str = "frontend/dist"

    @property
    def camera_specs(self) -> List[str]:
        return [s.strip() for s in self.cameras.split(",") if s.strip()]

    @property
    def auth_enabled(self) -> bool:
        return bool(self.token)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
