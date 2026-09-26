"""
Periodicity Detector for COGNISCAN-EW.
Uses temporal autocorrelation and inter-arrival interval statistics
to detect periodic emitter transmissions, predict the next transmission slot,
and calculate confidence scores.
"""

import math
from typing import List, Dict, Optional, Tuple, Any
from collections import defaultdict


class PeriodicityDetector:
    def __init__(self, max_history_slots: int = 120):
        self.max_history = max_history_slots
        # band_id -> list of detection slot numbers
        self.band_hit_slots: Dict[str, List[int]] = defaultdict(list)
        # emitter_id -> list of detection slot numbers
        self.emitter_hit_slots: Dict[str, List[int]] = defaultdict(list)
        # Cached periodicity results: id -> result dict
        self.periodicity_cache: Dict[str, Dict[str, Any]] = {}

    def record_hit(self, band_id: str, emitter_id: Optional[str], slot: int):
        self.band_hit_slots[band_id].append(slot)
        if len(self.band_hit_slots[band_id]) > self.max_history:
            self.band_hit_slots[band_id].pop(0)

        if emitter_id:
            self.emitter_hit_slots[emitter_id].append(slot)
            if len(self.emitter_hit_slots[emitter_id]) > self.max_history:
                self.emitter_hit_slots[emitter_id].pop(0)

        # Trigger analysis
        self._analyze_target(band_id, self.band_hit_slots[band_id])
        if emitter_id:
            self._analyze_target(emitter_id, self.emitter_hit_slots[emitter_id])

    def _analyze_target(self, target_id: str, hit_slots: List[int]):
        """
        Analyzes arrival intervals and computes autocorrelation / peak lag.
        """
        if len(hit_slots) < 3:
            self.periodicity_cache[target_id] = {
                "detected_period": None,
                "confidence": 0.0,
                "next_expected_slot": None,
                "intervals": [],
                "is_periodic": False
            }
            return

        intervals = [hit_slots[i] - hit_slots[i-1] for i in range(1, len(hit_slots))]
        
        # Test candidate periods from 2 to 24 slots
        candidate_scores: Dict[int, float] = {}
        for candidate_p in range(2, 25):
            # Check how many intervals match candidate_p or integer multiples
            matches = 0
            total_weight = 0.0
            for dt in intervals[-15:]:
                if dt <= 0:
                    continue
                # Remainder modulo candidate_p
                rem = dt % candidate_p
                # Can be 0 or candidate_p - 1
                dist = min(rem, candidate_p - rem)
                if dist == 0:
                    matches += 1.0
                elif dist == 1:
                    matches += 0.5
                total_weight += 1.0

            if total_weight > 0:
                candidate_scores[candidate_p] = matches / total_weight

        # Find best candidate period
        best_p = max(candidate_scores, key=candidate_scores.get)
        best_score = candidate_scores[best_p]
        
        # Additional standard deviation check
        matching_intervals = [dt for dt in intervals if abs(dt - best_p) <= 1 or abs(dt % best_p) <= 1]
        std_dev = 0.0
        if len(matching_intervals) >= 2:
            mean_int = sum(matching_intervals) / len(matching_intervals)
            variance = sum((x - mean_int)**2 for x in matching_intervals) / len(matching_intervals)
            std_dev = math.sqrt(variance)

        # Confidence metric
        confidence = 0.0
        is_periodic = False
        if best_score >= 0.55 and len(hit_slots) >= 4:
            is_periodic = True
            confidence = min(0.96, best_score * 0.85 + (0.15 if std_dev < 1.0 else 0.0))
            
            # Predict next slot: last_hit + best_p
            last_hit = hit_slots[-1]
            next_slot = last_hit + best_p
        else:
            best_p = None
            next_slot = None

        self.periodicity_cache[target_id] = {
            "detected_period": best_p,
            "confidence": round(confidence, 3),
            "next_expected_slot": next_slot,
            "intervals": intervals[-8:],
            "is_periodic": is_periodic,
            "score": round(best_score, 3)
        }

    def get_periodicity(self, target_id: str) -> Dict[str, Any]:
        return self.periodicity_cache.get(target_id, {
            "detected_period": None,
            "confidence": 0.0,
            "next_expected_slot": None,
            "intervals": [],
            "is_periodic": False,
            "score": 0.0
        })

    def predict_band_timing(self, band_id: str, current_slot: int) -> Tuple[float, Optional[int], float]:
        """
        Calculates timing-based activity probability boost for this slot.
        Returns: (timing_prob_factor, slots_until_tx, timing_confidence)
        """
        info = self.get_periodicity(band_id)
        if not info["is_periodic"] or not info["detected_period"]:
            return 1.0, None, 0.0

        p = info["detected_period"]
        hits = self.band_hit_slots.get(band_id, [])
        if not hits:
            return 1.0, None, 0.0

        last_hit = hits[-1]
        slots_since = current_slot - last_hit
        cycle_pos = slots_since % p
        
        # Slots until next expected transmission window
        time_to_tx = (p - cycle_pos) % p
        if time_to_tx == 0:
            # We are exactly at the expected transmission window!
            timing_boost = 1.6
        elif time_to_tx == 1:
            # 1 slot before window
            timing_boost = 1.3
        else:
            # Far from window
            timing_boost = 0.5

        return timing_boost, time_to_tx, info["confidence"]
