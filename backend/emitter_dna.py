"""
Emitter Behaviour DNA Extraction and Classification Engine.
Builds behavioral profiles for discovered emitters including frequency stability,
hopping tendency, periodicity, burst statistics, and AI classification.
"""

from typing import Dict, List, Optional, Any
from .models import EmitterDNA
from .periodicity_detector import PeriodicityDetector
from .hop_predictor import FrequencyHopPredictor


class EmitterDNAEngine:
    def __init__(self, periodicity_det: PeriodicityDetector, hop_pred: FrequencyHopPredictor):
        self.periodicity_det = periodicity_det
        self.hop_pred = hop_pred
        # emitter_id -> state dict
        self.emitters: Dict[str, Dict[str, Any]] = {}

    def register_or_update(
        self,
        emitter_id: str,
        name: str,
        band_id: str,
        slot: int,
        spatial_sector_deg: float = 0.0
    ):
        if emitter_id not in self.emitters:
            self.emitters[emitter_id] = {
                "id": emitter_id,
                "name": name,
                "observed_bands": [band_id],
                "detection_slots": [slot],
                "detection_bands": [band_id],
                "first_detected_slot": slot,
                "last_detected_slot": slot,
                "spatial_sector_deg": spatial_sector_deg,
                "active_burst_lengths": [1],
                "silent_intervals": [],
                "transitions_count": 0,
            }
        else:
            em = self.emitters[emitter_id]
            if band_id not in em["observed_bands"]:
                em["observed_bands"].append(band_id)
                
            last_slot = em["last_detected_slot"]
            gap = slot - last_slot
            if gap > 1:
                em["silent_intervals"].append(gap - 1)
                em["active_burst_lengths"].append(1)
            else:
                if em["active_burst_lengths"]:
                    em["active_burst_lengths"][-1] += 1
                else:
                    em["active_burst_lengths"] = [1]
                    
            if em["detection_bands"] and em["detection_bands"][-1] != band_id:
                em["transitions_count"] += 1
                
            em["detection_slots"].append(slot)
            em["detection_bands"].append(band_id)
            em["last_detected_slot"] = slot
            em["spatial_sector_deg"] = spatial_sector_deg

    def build_dna(self, emitter_id: str) -> Optional[EmitterDNA]:
        em = self.emitters.get(emitter_id)
        if not em:
            return None

        total_detections = len(em["detection_slots"])
        observed_bands = em["observed_bands"]
        num_unique_bands = len(observed_bands)
        
        # Frequency stability: 1.0 if single band, drops as bands increase
        freq_stability = round(1.0 / max(1, num_unique_bands), 2)
        
        # Hopping tendency
        hopping_tendency = round(em["transitions_count"] / max(1, total_detections - 1), 2)
        
        # Burst statistics
        active_lengths = em["active_burst_lengths"]
        avg_active = round(sum(active_lengths) / max(1, len(active_lengths)), 1)
        silent_intervals = em["silent_intervals"]
        avg_silent = round(sum(silent_intervals) / max(1, len(silent_intervals)), 1) if silent_intervals else 3.0
        burst_ratio = round(avg_active / max(0.1, avg_active + avg_silent), 2)

        # Periodicity analysis
        p_info = self.periodicity_det.get_periodicity(emitter_id)
        detected_period = p_info["detected_period"]
        p_conf = p_info["confidence"]
        next_tx = p_info["next_expected_slot"]

        # Hop prediction for agile emitters
        top_hops = []
        if em["detection_bands"]:
            current_b = em["detection_bands"][-1]
            top_hops = self.hop_pred.predict_next_hops(current_b, emitter_id, top_k=4)

        # Classification Logic
        classification, confidence = self._classify_behavior(
            num_unique_bands,
            freq_stability,
            hopping_tendency,
            p_info["is_periodic"],
            p_conf,
            avg_active,
            avg_silent,
            total_detections
        )

        return EmitterDNA(
            emitter_id=emitter_id,
            name=em["name"],
            observed_bands=observed_bands,
            frequency_stability=freq_stability,
            detected_periodicity=detected_period,
            periodicity_confidence=p_conf,
            next_expected_tx_slot=next_tx,
            hopping_tendency=hopping_tendency,
            burst_behavior=burst_ratio,
            avg_active_duration=avg_active,
            avg_silent_duration=avg_silent,
            transition_matrix=self.hop_pred.get_transition_matrix(emitter_id),
            top_next_hops=top_hops,
            behavior_classification=classification,
            confidence=confidence,
            first_detected_slot=em["first_detected_slot"],
            last_detected_slot=em["last_detected_slot"],
            detection_count=total_detections,
            spatial_sector_deg=em["spatial_sector_deg"]
        )

    def _classify_behavior(
        self,
        num_unique_bands: int,
        freq_stability: float,
        hopping_tendency: float,
        is_periodic: bool,
        periodicity_confidence: float,
        avg_active: float,
        avg_silent: float,
        total_detections: int
    ) -> (str, float):
        """Rule-based Bayesian classification."""
        if total_detections < 2:
            return "Unknown", 0.40

        # Frequency agile
        if num_unique_bands >= 3 or hopping_tendency > 0.45:
            conf = min(0.96, 0.65 + 0.08 * num_unique_bands + 0.2 * hopping_tendency)
            return "Frequency Agile", round(conf, 2)

        # Periodic
        if is_periodic and periodicity_confidence > 0.50:
            return "Periodic", round(periodicity_confidence, 2)

        # Burst / Intermittent
        if avg_silent > 3.0 and avg_active <= 3.0:
            conf = min(0.92, 0.55 + 0.1 * min(5, len(self.emitters)))
            return "Burst", round(conf, 2)

        # Fixed
        if num_unique_bands == 1 and total_detections >= 3:
            conf = min(0.98, 0.70 + 0.05 * total_detections)
            return "Fixed", round(conf, 2)

        return "Intermittent", 0.62

    def get_all_dnas(self) -> List[EmitterDNA]:
        dnas = []
        for eid in self.emitters:
            dna = self.build_dna(eid)
            if dna:
                dnas.append(dna)
        return dnas
