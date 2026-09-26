"""
Spectrum Anomaly Detector for COGNISCAN-EW.
Monitors statistical unexpectedness (Bayesian surprise) and sudden activity shifts.
Triggers autonomous transition from NORMAL mode to ADAPTIVE EXPLORATION.
"""

from typing import List, Dict, Any, Tuple


class SpectrumAnomalyDetector:
    def __init__(self, window_size: int = 15, threshold: float = 0.65):
        self.window_size = window_size
        self.threshold = threshold
        self.recent_surprises: List[float] = []
        self.anomaly_active: bool = False
        self.anomaly_counter: int = 0
        self.anomaly_reasons: List[str] = []

    def evaluate_observation(self, band_id: str, prior_prob: float, is_hit: bool) -> Tuple[float, bool, str]:
        """
        Computes Bayesian surprise: S = -log2 P(outcome | model).
        If hit on a band with prior_prob < 0.05 -> High surprise!
        If miss on a band with prior_prob > 0.90 -> Moderate surprise.
        """
        if is_hit:
            p_outcome = max(0.01, prior_prob)
        else:
            p_outcome = max(0.01, 1.0 - prior_prob)

        # Surprise in bits normalized to [0, 1]
        raw_surprise = -1.0 * (p_outcome * 0.5 - 0.5)  # 0 to ~ 0.5
        surprise = 1.0 - p_outcome

        self.recent_surprises.append(surprise)
        if len(self.recent_surprises) > self.window_size:
            self.recent_surprises.pop(0)

        # Moving average anomaly score
        avg_surprise = sum(self.recent_surprises) / max(1, len(self.recent_surprises))
        
        # Check if threshold crossed
        if avg_surprise > self.threshold or (is_hit and prior_prob < 0.08):
            self.anomaly_active = True
            self.anomaly_counter = 12  # remain in adaptive exploration for 12 slots
            reason = f"High surprise ({surprise:.2f}) on {band_id}: Unexpected transmission detected on dormant frequency band."
            self.anomaly_reasons.append(reason)
            if len(self.anomaly_reasons) > 10:
                self.anomaly_reasons.pop(0)
            return round(avg_surprise, 3), True, reason
        else:
            if self.anomaly_counter > 0:
                self.anomaly_counter -= 1
                if self.anomaly_counter == 0:
                    self.anomaly_active = False
            return round(avg_surprise, 3), self.anomaly_active, "Spectrum dynamics within nominal statistical bounds."

    def trigger_manual_anomaly(self, description: str = "Hostile EW Frequency Breakout Injected"):
        self.anomaly_active = True
        self.anomaly_counter = 20
        self.recent_surprises = [0.85] * 5
        self.anomaly_reasons.append(description)

    def get_status(self) -> Dict[str, Any]:
        score = sum(self.recent_surprises) / max(1, len(self.recent_surprises)) if self.recent_surprises else 0.15
        return {
            "score": round(score, 3),
            "is_anomaly": self.anomaly_active,
            "status": "ADAPTIVE_EXPLORATION" if self.anomaly_active else "NORMAL",
            "cooldown_remaining": self.anomaly_counter,
            "recent_reasons": self.anomaly_reasons[-3:] if self.anomaly_reasons else ["Nominal operation"]
        }
