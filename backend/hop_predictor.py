"""
Frequency-Hop Predictor for COGNISCAN-EW.
Learns empirical Markov transition matrices between RF bands,
predicts candidate next hop destinations, and computes transition probabilities.
"""

from typing import Dict, List, Optional, Tuple, Any
from collections import defaultdict


class FrequencyHopPredictor:
    def __init__(self, bands: List[str]):
        self.bands = bands
        # (emitter_id, from_band) -> {to_band: count}
        self.emitter_transitions: Dict[str, Dict[str, Dict[str, int]]] = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
        # Global transition counts across all observed agile activity
        self.global_transitions: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
        # emitter_id -> last observed band
        self.last_observed_band: Dict[str, str] = {}
        # Recent hop sequence history for n-gram pattern matching
        self.recent_hops: Dict[str, List[str]] = defaultdict(list)

    def record_transition(self, emitter_id: str, new_band: str, slot: int):
        """Records an observed frequency transition for an emitter."""
        last_band = self.last_observed_band.get(emitter_id)
        if last_band and last_band != new_band:
            self.emitter_transitions[emitter_id][last_band][new_band] += 1
            self.global_transitions[last_band][new_band] += 1
            
        self.last_observed_band[emitter_id] = new_band
        self.recent_hops[emitter_id].append(new_band)
        if len(self.recent_hops[emitter_id]) > 30:
            self.recent_hops[emitter_id].pop(0)

    def predict_next_hops(self, current_band: str, emitter_id: Optional[str] = None, top_k: int = 4) -> List[Dict[str, Any]]:
        """
        Predicts next candidate hop bands given the current band.
        Uses emitter-specific Markov matrix if available, falling back to global transitions.
        Returns list of {band: str, probability: float, confidence: float}
        """
        counts = {}
        if emitter_id and emitter_id in self.emitter_transitions and current_band in self.emitter_transitions[emitter_id]:
            counts = self.emitter_transitions[emitter_id][current_band]
        elif current_band in self.global_transitions:
            counts = self.global_transitions[current_band]

        total_transitions = sum(counts.values())
        if total_transitions == 0:
            # No prior transition data: provide default neighboring or agile dispersion
            # e.g. nearby bands or uniform
            return []

        # Calculate Laplace-smoothed transition probabilities
        sorted_candidates = sorted(counts.items(), key=lambda x: x[1], reverse=True)
        top_candidates = sorted_candidates[:top_k]
        
        results = []
        cum_prob = 0.0
        for b, cnt in top_candidates:
            prob = cnt / total_transitions
            cum_prob += prob
            results.append({
                "band": b,
                "probability": round(prob, 3),
                "count": cnt,
                "confidence": round(min(0.95, 0.40 + 0.12 * cnt), 2)
            })

        # Add "Others" remainder if not 100%
        remainder = round(max(0.0, 1.0 - cum_prob), 3)
        if remainder > 0.02 and len(results) > 0:
            results.append({
                "band": "Others",
                "probability": remainder,
                "count": 0,
                "confidence": 0.50
            })

        return results

    def get_transition_matrix(self, emitter_id: str) -> Dict[str, Dict[str, float]]:
        """Returns normalized transition probability matrix for the emitter."""
        raw_mat = self.emitter_transitions.get(emitter_id, {})
        norm_mat = {}
        for from_b, to_dict in raw_mat.items():
            tot = sum(to_dict.values())
            if tot > 0:
                norm_mat[from_b] = {to_b: round(c / tot, 3) for to_b, c in to_dict.items()}
        return norm_mat
