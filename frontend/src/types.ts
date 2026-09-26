export interface BandState {
  band_id: string;
  center_freq_mhz: number;
  activity_prob: number;
  confidence: number;
  uncertainty: number;
  last_observed_state: 'HIT' | 'MISS' | 'NEVER';
  hit_count: number;
  miss_count: number;
  last_detection_slot: number;
  predicted_next_activity: number;
  expected_time_to_tx: number | null;
  priority_score: number;
  information_gain: number;
  dwell_recommendation: number;
  active_emitter_ids: string[];
  ground_truth_active: boolean;
  ground_truth_power_dbm: number;
  ground_truth_snr_db: number;
}

export interface CandidateAction {
  band: string;
  freq_mhz: number;
  detection: number;
  information_gain: number;
  cost: number;
  utility: number;
  dwell: number;
  selected: boolean;
}

export interface CounterfactualItem {
  alternative_band: string;
  expected_detection_prob: number;
  expected_info_gain: number;
  utility_delta: number;
  rationale: string;
}

export interface ScanDecision {
  slot: number;
  selected_band: string;
  dwell_slots: number;
  priority_score: number;
  confidence: number;
  expected_reward: number;
  information_gain: number;
  scan_cost: number;
  net_utility: number;
  explore_exploit_mode: 'EXPLORE' | 'EXPLOIT';
  explore_pct: number;
  exploit_pct: number;
  reason: string;
  supporting_evidence: string[];
  candidate_actions: CandidateAction[];
  counterfactual_analyses: CounterfactualItem[];
}

export interface ScanResult {
  slot: number;
  band_id: string;
  dwell_slots: number;
  is_hit: boolean;
  detected_power_dbm: number;
  estimated_snr_db: number;
  detected_emitter_id: string | null;
  false_alarm: boolean;
  missed_detection: boolean;
  belief_delta: number;
  decision_summary: ScanDecision;
}

export interface NextHopCandidate {
  band: string;
  probability: number;
  count: number;
  confidence: number;
}

export interface EmitterDNA {
  emitter_id: string;
  name: string;
  observed_bands: string[];
  frequency_stability: number;
  detected_periodicity: number | null;
  periodicity_confidence: number;
  next_expected_tx_slot: number | null;
  hopping_tendency: number;
  burst_behavior: number;
  avg_active_duration: number;
  avg_silent_duration: number;
  transition_matrix: Record<string, Record<string, number>>;
  top_next_hops: NextHopCandidate[];
  behavior_classification: 'Fixed' | 'Periodic' | 'Frequency Agile' | 'Burst' | 'Intermittent' | 'Unknown';
  confidence: number;
  first_detected_slot: number;
  last_detected_slot: number;
  detection_count: number;
  spatial_sector_deg: number;
}

export interface ReceiverState {
  receiver_id: string;
  name: string;
  sector_deg: number;
  beam_width_deg: number;
  current_band: string;
  dwell_remaining: number;
  last_hit_band: string | null;
  last_hit_slot: number;
  shared_clues_sent: number;
  shared_clues_received: number;
  status: string;
}

export interface SystemMetrics {
  slot: number;
  total_scans: number;
  total_hits: number;
  total_misses: number;
  total_ground_truth_transmissions: number;
  interceptions: number;
  false_alarms: number;
  missed_detections: number;
  probability_of_detection_pd: number;
  probability_of_false_alarm_pfa: number;
  interception_ratio: number;
  avg_intercept_time_slots: number;
  cumulative_reward: number;
  current_reward: number;
  spectrum_coverage_pct: number;
  entropy_spectrum_bits: number;
  mean_confidence: number;
  anomaly_score: number;
  anomaly_status: 'NORMAL' | 'ALERT' | 'ADAPTIVE_EXPLORATION';
  explore_ratio: number;
  exploit_ratio: number;
}

export interface RecentEvent {
  slot: number;
  band: string;
  status: 'HIT' | 'MISS' | 'FALSE_ALARM';
  power_dbm: number;
  snr_db: number;
  emitter: string | null;
  delta: number;
  mode: string;
}

export interface DemoStatus {
  is_active: boolean;
  step: number;
  total_steps: number;
  progress_pct: number;
  phase: string;
  title: string;
  narration: string;
  trigger_action?: string;
}

export interface SimulationStateSnapshot {
  slot: number;
  is_running: boolean;
  mission_mode: 'DISCOVERY' | 'TRACKING' | 'RAPID_INTERCEPT' | 'INTELLIGENCE' | 'ADAPTIVE';
  environment_name: string;
  metrics: SystemMetrics;
  current_decision: ScanDecision | null;
  last_scan_result: ScanResult | null;
  bands: BandState[];
  emitters: EmitterDNA[];
  receivers: ReceiverState[];
  recent_logs: string[];
  recent_events: RecentEvent[];
  demo_status?: DemoStatus;
}

export interface StrategyBenchmarkResult {
  name: string;
  total_scans: number;
  hits: number;
  misses: number;
  false_alarms: number;
  pd: number;
  pfa: number;
  interception_ratio: number;
  avg_intercept_time_slots: number;
  cumulative_reward: number;
  spectrum_coverage_pct: number;
  information_gain_score: number;
  adaptation_speed_score: number;
  reward_curve: number[];
}

export interface BenchmarkPayload {
  num_slots: number;
  scenario: string;
  num_bands: number;
  strategies: Record<string, StrategyBenchmarkResult>;
}
