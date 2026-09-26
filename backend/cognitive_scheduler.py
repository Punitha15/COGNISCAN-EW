"""
Cognitive Scheduler for COGNISCAN-EW.
The core AI engine implementing a Restless Multi-Armed Bandit (RMAB) formulation,
utility optimization with Information Gain and Scan Cost, dynamic Exploration/Exploitation,
Adaptive Dwell Time selection, counterfactual action analysis, and Explainable AI reasoning.
"""

import math
import random
from typing import List, Dict, Tuple, Optional, Any
from .models import ScanDecision, BandState
from .bayesian_engine import BayesianActivityEngine
from .periodicity_detector import PeriodicityDetector
from .hop_predictor import FrequencyHopPredictor


class CognitiveScheduler:
    def __init__(
        self,
        bands: List[str],
        bayesian_engine: BayesianActivityEngine,
        periodicity_det: PeriodicityDetector,
        hop_pred: FrequencyHopPredictor,
        mission_mode: str = "ADAPTIVE"
    ):
        self.bands = bands
        self.bayesian_engine = bayesian_engine
        self.periodicity_det = periodicity_det
        self.hop_pred = hop_pred
        self.mission_mode = mission_mode
        
        # Mode-specific weighting factors
        # utility = w_detect * P_detect + w_info * InfoGain - w_cost * ScanCost
        self.mode_weights = {
            "DISCOVERY": {"w_detect": 0.35, "w_info": 0.85, "w_cost": 0.08, "explore_bias": 0.70},
            "TRACKING": {"w_detect": 0.90, "w_info": 0.20, "w_cost": 0.12, "explore_bias": 0.18},
            "RAPID_INTERCEPT": {"w_detect": 0.85, "w_info": 0.30, "w_cost": 0.25, "explore_bias": 0.25},
            "INTELLIGENCE": {"w_detect": 0.40, "w_info": 0.95, "w_cost": 0.05, "explore_bias": 0.55},
            "ADAPTIVE": {"w_detect": 0.65, "w_info": 0.55, "w_cost": 0.10, "explore_bias": 0.35},
        }
        
        # Dynamic exploration state
        self.current_explore_ratio = 0.35
        self.forced_exploration = False
        self.last_scanned_band: Optional[str] = None
        self.consecutive_scans_on_band = 0

    def set_mission_mode(self, mode: str):
        if mode in self.mode_weights:
            self.mission_mode = mode

    def set_anomaly_override(self, active: bool):
        """Forces high exploration mode during a detected spectrum anomaly."""
        self.forced_exploration = active

    def calculate_band_utilities(self, current_slot: int) -> List[Dict[str, Any]]:
        """
        Evaluates all candidate bands across detection probability, information gain,
        timing prediction, hop model support, and scan cost.
        """
        weights = self.mode_weights.get(self.mission_mode, self.mode_weights["ADAPTIVE"])
        w_detect = weights["w_detect"]
        w_info = weights["w_info"]
        w_cost = weights["w_cost"]

        # Anomaly boost
        if self.forced_exploration:
            w_info = 0.90
            w_detect = 0.30

        candidates = []
        for b in self.bands:
            st = self.bayesian_engine.states[b]
            base_prob = st["activity_prob"]
            info_gain = self.bayesian_engine.calculate_information_gain(b)
            confidence = st["confidence"]
            uncertainty = st["uncertainty"]

            # Periodicity timing boost
            timing_boost, time_to_tx, p_conf = self.periodicity_det.predict_band_timing(b, current_slot)
            
            # Hop model prediction bonus
            hop_bonus = 0.0
            if self.last_scanned_band:
                top_hops = self.hop_pred.predict_next_hops(self.last_scanned_band, top_k=3)
                for h in top_hops:
                    if h["band"] == b:
                        hop_bonus = h["probability"] * 0.45
                        break

            # Effective expected detection probability
            eff_prob = min(0.98, (base_prob * timing_boost) + hop_bonus)
            st["predicted_next_activity"] = round(eff_prob, 4)
            st["expected_time_to_tx"] = time_to_tx

            # Recommended dwell time (1 to 5 slots)
            # High activity + agile -> shorter dwell (1-2 slots)
            # High confidence periodic -> dwell tailored to pulse width (2-3 slots)
            # High uncertainty search -> 1 slot quick check
            if eff_prob > 0.75:
                recommended_dwell = 3 if (p_conf > 0.6) else 2
            elif eff_prob < 0.25:
                recommended_dwell = 1
            else:
                recommended_dwell = 2

            # Scan cost: slight penalty for repetitive scanning or large frequency jumping
            scan_cost = 0.08
            if b == self.last_scanned_band and self.consecutive_scans_on_band >= 3:
                scan_cost += 0.25  # diminishing returns / anti-starvation

            # Net utility calculation
            utility = (w_detect * eff_prob) + (w_info * info_gain) - (w_cost * scan_cost)
            
            # Store priority score on band
            st["priority_score"] = round(max(0.01, min(0.99, utility)), 4)
            st["dwell_recommendation"] = recommended_dwell

            candidates.append({
                "band_id": b,
                "center_freq_mhz": self.bayesian_engine.center_freqs[b],
                "eff_prob": round(eff_prob, 3),
                "base_prob": round(base_prob, 3),
                "info_gain": round(info_gain, 3),
                "uncertainty": round(uncertainty, 3),
                "confidence": round(confidence, 3),
                "time_to_tx": time_to_tx,
                "p_conf": round(p_conf, 3),
                "hop_bonus": round(hop_bonus, 3),
                "scan_cost": round(scan_cost, 2),
                "dwell": recommended_dwell,
                "utility": round(utility, 3),
            })

        # Sort descending by net utility
        candidates.sort(key=lambda x: x["utility"], reverse=True)
        return candidates

    def make_decision(self, current_slot: int) -> ScanDecision:
        """
        Selects next band and dwell time based on cognitive utility,
        decides Explore vs Exploit, and generates counterfactual analysis and explainability.
        """
        candidates = self.calculate_band_utilities(current_slot)
        base_explore_target = self.mode_weights[self.mission_mode]["explore_bias"]
        
        # Calculate dynamic exploration ratio based on overall spectrum entropy
        avg_entropy = sum(c["uncertainty"] for c in candidates) / max(1, len(candidates))
        dynamic_explore_pct = min(0.85, max(0.15, (base_explore_target * 0.6) + (avg_entropy * 0.4)))
        
        if self.forced_exploration:
            dynamic_explore_pct = 0.85

        self.current_explore_ratio = round(dynamic_explore_pct, 2)
        exploit_pct = round(1.0 - self.current_explore_ratio, 2)

        # Decide whether this scan is EXPLORE or EXPLOIT
        is_explore = (random.random() < self.current_explore_ratio)
        mode_label = "EXPLORE" if is_explore else "EXPLOIT"

        if is_explore:
            # Explore: select from top high-uncertainty / high information-gain bands
            explore_candidates = sorted(candidates, key=lambda x: x["info_gain"] + x["uncertainty"], reverse=True)
            chosen = explore_candidates[0] if explore_candidates else candidates[0]
        else:
            # Exploit: select top utility / high probability band
            chosen = candidates[0]

        # Update streak
        if chosen["band_id"] == self.last_scanned_band:
            self.consecutive_scans_on_band += 1
        else:
            self.consecutive_scans_on_band = 1
        self.last_scanned_band = chosen["band_id"]

        # Build Explainability & Evidence
        evidence = []
        if chosen["eff_prob"] >= 0.70:
            evidence.append(f"High activity probability ({int(chosen['eff_prob']*100)}%) based on recursive Bayesian belief.")
        if chosen["time_to_tx"] is not None and chosen["time_to_tx"] <= 1:
            evidence.append(f"Approaching periodic transmission window (predicted in T+{chosen['time_to_tx']} slots, {int(chosen['p_conf']*100)}% conf).")
        if chosen["hop_bonus"] > 0.05:
            evidence.append(f"Frequency-hop Markov predictor assigned {int(chosen['hop_bonus']*200)}% probability of transition from previous band.")
        if chosen["info_gain"] > 0.50:
            evidence.append(f"High information gain ({chosen['info_gain']:.2f}) provides maximal Shannon entropy reduction.")
        if chosen["uncertainty"] > 0.65:
            evidence.append(f"Band has elevated uncertainty ({chosen['uncertainty']:.2f}); scanning prevents stale intelligence.")
        if not evidence:
            evidence.append("Selected to maintain optimal balance between discovery and continuous spectrum coverage.")

        # Summary reason
        if is_explore:
            reason = f"High information gain ({chosen['info_gain']:.2f}) and spectrum uncertainty ({chosen['uncertainty']:.2f}) warrant exploratory verification."
        else:
            reason = f"Optimal utility ({chosen['utility']:.2f}): {int(chosen['eff_prob']*100)}% predicted activity with {chosen['dwell']} slot dwell time."

        # Top 5 candidate actions for table UI
        top_5_actions = []
        for c in candidates[:5]:
            top_5_actions.append({
                "band": c["band_id"],
                "freq_mhz": c["center_freq_mhz"],
                "detection": c["eff_prob"],
                "information_gain": c["info_gain"],
                "cost": c["scan_cost"],
                "utility": c["utility"],
                "dwell": c["dwell"],
                "selected": (c["band_id"] == chosen["band_id"]),
            })

        # Counterfactual Analysis (Section 14: What if we scan B12, B37, etc.)
        counterfactuals = []
        sample_alternatives = [c for c in candidates if c["band_id"] != chosen["band_id"]][:3]
        for alt in sample_alternatives:
            # Expected outcome simulation
            exp_hit_rate = alt["eff_prob"]
            exp_ig = alt["info_gain"]
            utility_diff = chosen["utility"] - alt["utility"]
            
            counterfactuals.append({
                "alternative_band": alt["band_id"],
                "expected_detection_prob": alt["eff_prob"],
                "expected_info_gain": alt["info_gain"],
                "utility_delta": round(-utility_diff, 3),  # negative means inferior to chosen
                "rationale": (
                    f"Scanning {alt['band_id']} would yield {int(exp_hit_rate*100)}% hit chance with "
                    f"{exp_ig:.2f} info gain, but provides {utility_diff:.2f} lower net utility than {chosen['band_id']}."
                )
            })

        return ScanDecision(
            slot=current_slot,
            selected_band=chosen["band_id"],
            dwell_slots=chosen["dwell"],
            priority_score=chosen["utility"],
            confidence=chosen["confidence"],
            expected_reward=chosen["eff_prob"],
            information_gain=chosen["info_gain"],
            scan_cost=chosen["scan_cost"],
            net_utility=chosen["utility"],
            explore_exploit_mode=mode_label,
            explore_pct=round(self.current_explore_ratio * 100, 1),
            exploit_pct=round(exploit_pct * 100, 1),
            reason=reason,
            supporting_evidence=evidence,
            candidate_actions=top_5_actions,
            counterfactual_analyses=counterfactuals
        )
