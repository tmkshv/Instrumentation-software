# Husky Robotics - Science Console

**URC 2025 - Prometheus Rover - Science Subsystem**

A remote-controlled science console for the Mars-analog spectroscopy and chem
payload. Operators run the rover from the base station through a single
browser page that shows live microscope feeds, the latest spectrum, biosignature
verdict, and chem readings, and can start/stop the run from the same screen.

## Architecture

```
Base-station browser  <-- HTTPS -->  FastAPI on the Pi  -->  spectrometer + chem + cameras
       (React)                          (port 8000)
```

- **Backend** (`backend/`) - FastAPI service, MJPEG camera streaming, REST control,
  pluggable chem source, single-token auth.
- **Frontend** (`frontend/`) - Vite + React + TypeScript + Tailwind, polls the API
  for status/spectrum/chem and renders MJPEG `<img>` for cameras.
- **Existing pipeline** - `processor.py` and `datalogger.py` are reused as-is.

## Quick start (dev)

Backend on a laptop:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 testdata.py                       # generate a fake sensor frame
cp .env.example .env                      # leave HUSKY_TOKEN blank for dev
uvicorn backend.main:app --reload --port 8000
```

Frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
# open http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:8000`.

## Production on the Pi

```bash
git clone https://github.com/dharshinimaru/husky-robotics.git
cd husky-robotics
sudo ./scripts/install.sh /opt/husky-science
sudo nano /opt/husky-science/.env         # set HUSKY_TOKEN, HUSKY_CAMERAS
sudo systemctl start husky-science
```

Then open `http://<pi-hostname>:8000` from any base-station browser.

## Configuration

All knobs live in `.env` (see `.env.example`):

| Variable | What it does |
|---|---|
| `HUSKY_TOKEN` | Bearer token operators paste into the login page. Empty disables auth. |
| `HUSKY_CAMERAS` | Comma list, e.g. `microscope:0,overview:1`. |
| `HUSKY_CHEM_SOURCE` | `mock` (default) or `csv:/path/to/instrument.csv`. |
| `HUSKY_CAMERA_FPS` | Frames per second per camera. Drop to 2 on a weak link. |
| `HUSKY_CAMERA_JPEG_QUALITY` | 1-95. Lower = less bandwidth. |

## REST API summary

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness check. |
| GET | `/api/info` | Auth + config snapshot for the frontend. |
| GET | `/api/status` | Current run status, session, sample count. |
| POST | `/api/start` | Begin a session, run sample loop. |
| POST | `/api/stop` | End the session. |
| POST | `/api/sample` | Take one sample now. |
| GET | `/api/spectrum/latest` | Last processed spectrum + biosignatures. |
| GET | `/api/chem/latest` | Latest chem reading. |
| GET | `/api/chem/history?minutes=N` | Recent chem readings. |
| GET | `/api/cameras` | Camera list with availability. |
| GET | `/api/cameras/{id}/stream` | MJPEG stream. |
| GET | `/api/cameras/{id}/snapshot` | Single JPEG. |
| GET | `/api/sessions` | List logged sessions. |
| GET | `/api/sessions/{id}` | Full session log. |
| GET | `/api/sessions/{id}/export` | Zip of the session directory. |
| GET/POST | `/api/calibration` | Read/update wavelength calibration. |

## Hardware

- **Sensor:** ON Semiconductor NOIP2SE1300A-QTI (Python 1300), 1280x1024, 400-700 nm.
- **Cameras:** any V4L2 device that OpenCV can open (`/dev/video*` or numeric index).
- **Chem:** any instrument that writes a CSV (header `timestamp,ph,conductivity_us_cm,temperature_c,moisture_pct,organic_index`); the UI works against the mock source until the real one is plugged in.

## Repo layout

```
backend/                FastAPI service
  main.py               app + lifespan + static mount
  config.py             env-driven settings
  state.py              shared in-memory state
  auth.py               bearer token dependency
  routers/              control, spectrum, chem, cameras, sessions, calibration
  sources/              spectrometer wrapper, chem sources, camera manager
  workers/              SampleRunner (background acquisition loop)
frontend/               Vite + React + TS + Tailwind
  src/pages/            Dashboard, Sessions, Calibration, Login
  src/components/       ControlBar, CameraFeed, SpectrumChart, ChemPanel, ConfidenceBadge
  src/api/client.ts     fetch wrapper with bearer token
processor.py            existing spectroscopy pipeline (kept)
datalogger.py           existing session logger (kept)
realtime_plotter.py     dev-only matplotlib viewer (not used remotely)
testdata.py             generates a synthetic 2D sensor frame
scripts/                install.sh + systemd unit
```

## Team

**Husky Robotics** - University of Washington
**Competition:** University Rover Challenge 2025
