"""
Data models and schemas for COGNISCAN-EW backend.
Defines types for RF digital twin, Bayesian beliefs, Emitter DNA,
Cognitive Scheduler actions, Multi-Receiver telemetry, and Benchmarks.
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class EmitterConfig(BaseModel):
    id: str
    name: str
    behavior_type: str  # 'fixed', 'periodic', 'agile', 'burst', 'random', 'spatial_scanning'
    bands: List[str]  # e.g. ["B12", "B24", "B37"]
    primary_band: str
    period_slots: Optional[int] = 8
    duty_cycle: float = 0.3
    hop_rate: float = 0.5  # prob of hopping per slot
    burst_prob: float = 0.2
    burst_length: int = 3
    power_dbm: float = -40.0
    sector_deg: float = 45.0  # spatial direction in degrees
    scan_velocity_deg: float = 0.0  # degrees per slot if moving
    current_band: Optional[str] = None
    is_active: bool = False
    active_streak: int = 0
    silent_streak: int = 0


class EnvironmentConfig(BaseModel):
    num_bands: int = 64
    band_prefix: str = "B"
    noise_floor_dbm: float = -95.0
    interference_level: float = 0.15  # 0.0 to 1.0
    mission_mode: str = "ADAPTIVE"  # 'DISCOVERY', 'TRACKING', 'RAPID_INTERCEPT', 'INTELLIGENCE', 'ADAPTIVE'
    simulation_speed_ms: int = 400
    p_false_alarm_base: float = 0.02
    p_miss_base: float = 0.05
    emitters: List[EmitterConfig] = []


class BandState(BaseModel):
    band_id: str
    center_freq_mhz: float
    activity_prob: float
    confidence: float
    uncertainty: float
    last_observed_state: Optional[str] = "NEVER"  # "HIT", "MISS", "NEVER"
    hit_count: int = 0
    miss_count: int = 0
    last_detection_slot: int = -1
    predicted_next_activity: float = 0.0
    expected_time_to_tx: Optional[int] = None
    priority_score: float = 0.5
    information_gain: float = 0.5
    dwell_recommendation: int = 2
    active_emitter_ids: List[str] = []
    ground_truth_active: bool = False
    ground_truth_power_dbm: float = -120.0
    ground_truth_snr_db: float = -20.0


class ScanDecision(BaseModel):
    slot: int
    selected_band: str
    dwell_slots: int
    priority_score: float
    confidence: float
    expected_reward: float
    information_gain: float
    scan_cost: float
    net_utility: float
    explore_exploit_mode: str  # "EXPLORE" or "EXPLOIT"
    explore_pct: float
    exploit_pct: float
    reason: str
    supporting_evidence: List[str]
    candidate_actions: List[Dict[str, Any]]
    counterfactual_analyses: List[Dict[str, Any]]


class ScanResult(BaseModel):
    slot: int
    band_id: str
    dwell_slots: int
    is_hit: bool
    detected_power_dbm: float
    estimated_snr_db: float
    detected_emitter_id: Optional[str] = None
    false_alarm: bool = False
    missed_detection: bool = False
    belief_delta: float
    decision_summary: ScanDecision


class EmitterDNA(BaseModel):
    emitter_id: str
    name: str
    observed_bands: List[str]
    frequency_stability: float  # 0.0 (high agile) to 1.0 (rock solid)
    detected_periodicity: Optional[int] = None
    periodicity_confidence: float = 0.0
    next_expected_tx_slot: Optional[int] = None
    hopping_tendency: float = 0.0
    burst_behavior: float = 0.0
    avg_active_duration: float = 1.0
    avg_silent_duration: float = 4.0
    transition_matrix: Dict[str, Dict[str, float]] = {}  # band -> {band: prob}
    top_next_hops: List[Dict[str, Any]] = []
    behavior_classification: str = "Unknown"  # "Fixed", "Periodic", "Frequency Agile", "Burst", "Intermittent", "Unknown"
    confidence: float = 0.0
    first_detected_slot: int = -1
    last_detected_slot: int = -1
    detection_count: int = 0
    spatial_sector_deg: float = 0.0


class ReceiverState(BaseModel):
    receiver_id: str
    name: str
    sector_deg: float
    beam_width_deg: float
    current_band: str
    dwell_remaining: int
    last_hit_band: Optional[str] = None
    last_hit_slot: int = -1
    shared_clues_sent: int = 0
    shared_clues_received: int = 0
    status: str = "ACTIVE"


class SystemMetrics(BaseModel):
    slot: int
    total_scans: int
    total_hits: int
    total_misses: int
    total_ground_truth_transmissions: int
    interceptions: int
    false_alarms: int
    missed_detections: int
    probability_of_detection_pd: float
    probability_of_false_alarm_pfa: float
    interception_ratio: float
    avg_intercept_time_slots: float
    cumulative_reward: float
    current_reward: float
    spectrum_coverage_pct: float
    entropy_spectrum_bits: float
    mean_confidence: float
    anomaly_score: float
    anomaly_status: str  # "NORMAL", "ALERT", "ADAPTIVE_EXPLORATION"
    explore_ratio: float
    exploit_ratio: float


class SimulationStateSnapshot(BaseModel):
    slot: int
    is_running: bool
    mission_mode: str
    environment_name: str
    metrics: SystemMetrics
    current_decision: Optional[ScanDecision] = None
    last_scan_result: Optional[ScanResult] = None
    bands: List[BandState]
    emitters: List[EmitterDNA]
    receivers: List[ReceiverState]
    recent_logs: List[str]
    recent_events: List[Dict[str, Any]]
