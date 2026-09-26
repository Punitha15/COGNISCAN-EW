"""
Bayesian Activity Belief Engine for COGNISCAN-EW.
Maintains recursive Bayesian posterior probability P(Activity | observations),
uncertainty (Shannon entropy), and information gain for all RF bands.
Includes dynamic aging drift for unobserved bands.
"""

import math
from typing import Dict, List, Optional, Any
from .models import BandState


class BayesianActivityEngine:
    def __init__(self, bands: List[str], center_freqs: Dict[str, float]):
        self.bands = bands
        self.center_freqs = center_freqs
        
        # Prior parameters: Beta(alpha_0, beta_0) with mean ~ 0.15 (typical sparse spectrum)
        self.alpha_0 = 1.5
        self.beta_0 = 8.5
        
        # Band states dictionary: band_id -> state dict
        self.states: Dict[str, Dict[str, Any]] = {}
        for b in self.bands:
            p_prior = self.alpha_0 / (self.alpha_0 + self.beta_0)
            self.states[b] = {
                "alpha": self.alpha_0,
                "beta": self.beta_0,
                "activity_prob": p_prior,
                "confidence": 0.50,
                "uncertainty": self._calc_entropy(p_prior),
                "last_observed_state": "NEVER",
                "hit_count": 0,
                "miss_count": 0,
                "last_detection_slot": -1,
                "last_observed_slot": -1,
                "dwell_recommendation": 2,
                "priority_score": 0.5,
                "information_gain": 0.5,
            }

    @staticmethod
    def _calc_entropy(p: float) -> float:
        """Calculates binary Shannon entropy H(p) in bits."""
        p_clamped = max(1e-5, min(1.0 - 1e-5, p))
        return - (p_clamped * math.log2(p_clamped) + (1.0 - p_clamped) * math.log2(1.0 - p_clamped))

    def update_observation(
        self,
        band_id: str,
        slot: int,
        is_hit: bool,
        pd_estimate: float = 0.90,
        pfa_estimate: float = 0.03
    ) -> float:
        """
        Recursive Bayesian update given observation:
        P(Active | Hit) = [P(Hit | Active) * P(Active)] / P(Hit)
        where P(Hit) = P(Hit|Active)*P(Active) + P(Hit|Silent)*(1-P(Active))
        
        Returns belief change delta.
        """
        if band_id not in self.states:
            return 0.0

        st = self.states[band_id]
        prior_p = st["activity_prob"]

        if is_hit:
            # Bayes theorem for HIT
            p_hit = (pd_estimate * prior_p) + (pfa_estimate * (1.0 - prior_p))
            posterior_p = (pd_estimate * prior_p) / max(1e-6, p_hit)
            st["alpha"] += 1.2
            st["hit_count"] += 1
            st["last_detection_slot"] = slot
            st["last_observed_state"] = "HIT"
        else:
            # Bayes theorem for MISS
            # P(Miss | Active) = 1 - Pd; P(Miss | Silent) = 1 - Pfa
            p_miss = ((1.0 - pd_estimate) * prior_p) + ((1.0 - pfa_estimate) * (1.0 - prior_p))
            posterior_p = ((1.0 - pd_estimate) * prior_p) / max(1e-6, p_miss)
            st["beta"] += 1.0
            st["miss_count"] += 1
            st["last_observed_state"] = "MISS"

        # Bound probability cleanly between [0.01, 0.99]
        posterior_p = max(0.01, min(0.99, posterior_p))
        delta = posterior_p - prior_p
        
        st["activity_prob"] = posterior_p
        st["last_observed_slot"] = slot
        
        # Confidence increases with sample evidence count
        total_obs = st["hit_count"] + st["miss_count"]
        st["confidence"] = min(0.98, 0.45 + (1.0 - math.exp(-0.35 * total_obs)) * 0.53)
        st["uncertainty"] = self._calc_entropy(posterior_p)
        
        return delta

    def time_decay_unobserved(self, current_slot: int, drift_rate: float = 0.03):
        """
        Unobserved bands gradually drift toward prior and gain uncertainty.
        Models non-stationary RF channels.
        """
        prior_mean = self.alpha_0 / (self.alpha_0 + self.beta_0)
        
        for b, st in self.states.items():
            if st["last_observed_slot"] != current_slot:
                age = current_slot - st["last_observed_slot"] if st["last_observed_slot"] > 0 else 5
                # Exponential drift towards prior
                alpha_factor = 1.0 - math.exp(-drift_rate * min(age, 20))
                st["activity_prob"] = (1.0 - alpha_factor) * st["activity_prob"] + alpha_factor * prior_mean
                # Confidence decays slowly when unobserved
                st["confidence"] = max(0.20, st["confidence"] * 0.995)
                # Uncertainty increases
                st["uncertainty"] = min(1.0, self._calc_entropy(st["activity_prob"]) + 0.1 * alpha_factor)

    def calculate_information_gain(self, band_id: str) -> float:
        """
        Calculates expected information gain (mutual information) of scanning band_id:
        IG = H(Current) - E[H(Posterior)]
        """
        st = self.states.get(band_id)
        if not st:
            return 0.5
            
        p = st["activity_prob"]
        h_current = st["uncertainty"]
        
        # Expected posterior entropies
        # Outcome 1: HIT (prob ~ p)
        p_hit_posterior = min(0.98, p + 0.25 * (1.0 - p))
        h_hit = self._calc_entropy(p_hit_posterior)
        
        # Outcome 2: MISS (prob ~ 1-p)
        p_miss_posterior = max(0.02, p * 0.4)
        h_miss = self._calc_entropy(p_miss_posterior)
        
        expected_h_post = (p * h_hit) + ((1.0 - p) * h_miss)
        info_gain = max(0.05, h_current - expected_h_post)
        
        # Also reward high uncertainty (exploration value)
        uncertainty_bonus = st["uncertainty"] * 0.35
        total_ig = min(1.0, info_gain + uncertainty_bonus)
        st["information_gain"] = round(total_ig, 4)
        return total_ig

    def get_band_state(self, band_id: str) -> Optional[BandState]:
        st = self.states.get(band_id)
        if not st:
            return None
        return BandState(
            band_id=band_id,
            center_freq_mhz=self.center_freqs[band_id],
            activity_prob=round(st["activity_prob"], 4),
            confidence=round(st["confidence"], 4),
            uncertainty=round(st["uncertainty"], 4),
            last_observed_state=st["last_observed_state"],
            hit_count=st["hit_count"],
            miss_count=st["miss_count"],
            last_detection_slot=st["last_detection_slot"],
            predicted_next_activity=round(st.get("predicted_next_activity", st["activity_prob"]), 4),
            expected_time_to_tx=st.get("expected_time_to_tx"),
            priority_score=round(st["priority_score"], 4),
            information_gain=round(st["information_gain"], 4),
            dwell_recommendation=st["dwell_recommendation"]
        )

    def get_all_band_states(self) -> List[BandState]:
        return [self.get_band_state(b) for b in self.bands if self.get_band_state(b) is not None]
