"""Spectrometer wrapper.

Owns a `SpectrometerProcessor` from the existing `processor.py` and adds
biosignature classification (extracted from the retired
`spectrometer_app.py`) so the rest of the backend has one place to call.
"""

from __future__ import annotations

from typing import Any, Dict, List, Tuple

import numpy as np

from processor import SpectrometerProcessor


class SpectrometerService:
    def __init__(self, wavelength_range: Tuple[int, int] = (400, 700)) -> None:
        self.processor = SpectrometerProcessor(wavelength_range=wavelength_range)

    def set_calibration(self, points: List[Tuple[int, float]]) -> None:
        self.processor.wavelength_calibration(points)

    def analyze(self, image_2d: np.ndarray) -> Dict[str, Any]:
        spectrum_raw = self.processor.extract_spectrum(image_2d)
        wavelengths, spectrum = self.processor.apply_calibration(spectrum_raw)
        spectrum_corrected = self.processor.baseline_correction(spectrum)
        spectrum_smooth = self.processor.smooth_spectrum(spectrum_corrected)
        peak_wl, peak_int, _ = self.processor.find_peaks(wavelengths, spectrum_smooth)

        biosignatures = detect_biosignatures(peak_wl)

        return {
            "wavelengths": wavelengths.tolist(),
            "intensities": spectrum_smooth.tolist(),
            "peak_wavelengths": peak_wl.tolist(),
            "peak_intensities": peak_int.tolist(),
            "biosignatures": biosignatures,
        }


def detect_biosignatures(peak_wavelengths) -> Dict[str, Any]:
    """Heuristic biosignature scoring lifted from spectrometer_app.py."""
    has_chlorophyll = any(425 < p < 435 for p in peak_wavelengths) or any(
        655 < p < 665 for p in peak_wavelengths
    )
    has_carotenoids = any(450 < p < 550 for p in peak_wavelengths)
    has_organics = any(400 < p < 450 for p in peak_wavelengths)

    indicators = sum([has_chlorophyll, has_carotenoids, has_organics])
    if indicators == 0:
        confidence, interpretation = "none", "No biosignatures detected"
    elif indicators == 1:
        confidence, interpretation = "low", "Weak biosignature detected"
    elif indicators == 2:
        confidence, interpretation = "medium", "Multiple biosignatures detected"
    else:
        confidence, interpretation = "high", "Strong biosignature pattern detected"

    return {
        "chlorophyll": has_chlorophyll,
        "carotenoids": has_carotenoids,
        "organics": has_organics,
        "confidence": confidence,
        "interpretation": interpretation,
    }
