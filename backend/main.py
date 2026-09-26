"""
FastAPI Server and Live Simulation Coordinator for COGNISCAN-EW.
Provides RESTful APIs and real-time WebSocket telemetry for the frontend,
unifying the RF Digital Twin, Bayesian Belief Engine, Cognitive Scheduler,
Emitter DNA Profiler, Multi-Receiver mesh, and Benchmark Arena.
"""

import asyncio
import math
import random
import time
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .models import (
    SimulationStateSnapshot,
    SystemMetrics,
    ScanDecision,
    ScanResult,
    BandState,
    EmitterDNA,
    ReceiverState,
    EnvironmentConfig,
)
from .rf_digital_twin import RFDigitalTwin
from .bayesian_engine import BayesianActivityEngine
from .periodicity_detector import PeriodicityDetector
from .hop_predictor import FrequencyHopPredictor
from .emitter_dna import EmitterDNAEngine
from .cognitive_scheduler import CognitiveScheduler
from .multi_receiver import MultiReceiverNetwork
from .anomaly_detector import SpectrumAnomalyDetector
from .benchmark_arena import BenchmarkArena
from .demo_orchestrator import JudgeDemoOrchestrator

app = FastAPI(
    title="COGNISCAN-EW Core Telemetry Server",
    description="Cognitive Adaptive Spectrum Scanning & Intelligent Interception Scheduler for Electronic Warfare",
    version="2.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SimulationEngine:
    def __init__(self):
        self.is_running = False
        self.preset_name = "Dense Spectrum"
        self.digital_twin = RFDigitalTwin()
        self.init_subsystems()
        self.benchmark_arena = BenchmarkArena()
        self.demo_orchestrator = JudgeDemoOrchestrator()
        
        # Telemetry metrics
        self.total_scans = 0
        self.total_hits = 0
        self.total_misses = 0
        self.total_ground_truth_tx = 0
        self.interceptions = 0
        self.false_alarms = 0
        self.missed_detections = 0
        self.cumulative_reward = 0.0
        self.current_reward = 0.0
        self.intercept_latencies: List[int] = []
        self.recent_logs: List[str] = [
            "COGNISCAN-EW Engine Initialized.",
            "RF Digital Twin calibrated to 64 Wideband Channels (2000-6000 MHz).",
            "Cognitive Scheduler online: Restless Multi-Armed Bandit policy active.",
        ]
        self.recent_events: List[Dict[str, Any]] = []
        self.last_decision: Optional[ScanDecision] = None
        self.last_result: Optional[ScanResult] = None
        self.active_dwell_remaining = 0
        self.current_scanned_band = "B01"

    def init_subsystems(self):
        bands = self.digital_twin.bands
        center_freqs = self.digital_twin.center_freqs
        self.bayesian_engine = BayesianActivityEngine(bands, center_freqs)
        self.periodicity_det = PeriodicityDetector()
        self.hop_predictor = FrequencyHopPredictor(bands)
        self.emitter_dna_engine = EmitterDNAEngine(self.periodicity_det, self.hop_predictor)
        self.scheduler = CognitiveScheduler(
            bands,
            self.bayesian_engine,
            self.periodicity_det,
            self.hop_predictor,
            mission_mode=self.digital_twin.config.mission_mode
        )
        self.multi_receiver = MultiReceiverNetwork(self.digital_twin, self.bayesian_engine)
        self.anomaly_detector = SpectrumAnomalyDetector()
        self.current_scanned_band = bands[0] if bands else "B01"
        self.active_dwell_remaining = 0

    def reset(self):
        self.is_running = False
        self.digital_twin = RFDigitalTwin()
        self.digital_twin.set_environment(self.preset_name)
        self.init_subsystems()
        self.demo_orchestrator.stop_demo()
        self.total_scans = 0
        self.total_hits = 0
        self.total_misses = 0
        self.total_ground_truth_tx = 0
        self.interceptions = 0
        self.false_alarms = 0
        self.missed_detections = 0
        self.cumulative_reward = 0.0
        self.current_reward = 0.0
        self.intercept_latencies.clear()
        self.recent_logs = ["Simulation state reset to default parameters."]
        self.recent_events.clear()
        self.last_decision = None
        self.last_result = None

    def change_preset(self, preset_name: str):
        self.preset_name = preset_name
        self.digital_twin.set_environment(preset_name)
        self.init_subsystems()
        self.log(f"Environment switched to preset: '{preset_name}'. Online adaptation initiated.")

    def log(self, message: str):
        timestamp = time.strftime("%H:%M:%S")
        entry = f"{timestamp} — {message}"
        self.recent_logs.append(entry)
        if len(self.recent_logs) > 60:
            self.recent_logs.pop(0)

    def step(self) -> SimulationStateSnapshot:
        """
        Executes one full iteration of the cognitive loop:
        OBSERVE -> HIT/MISS -> BAYESIAN UPDATE -> PREDICT -> RE-SCHEDULE
        """
        # 1. Advance RF Digital Twin
        sim_step = self.digital_twin.step_simulation()
        slot = sim_step["slot"]
        gt_active_bands = [b for b, emitters in sim_step["ground_truth"].items() if emitters]
        self.total_ground_truth_tx += len(gt_active_bands)

        # 2. Scheduling decision if dwell expired
        if self.active_dwell_remaining <= 0:
            # Check anomaly status and inform scheduler
            self.scheduler.set_anomaly_override(self.anomaly_detector.anomaly_active)
            decision = self.scheduler.make_decision(slot)
            self.last_decision = decision
            self.current_scanned_band = decision.selected_band
            self.active_dwell_remaining = decision.dwell_slots
        else:
            self.active_dwell_remaining -= 1
            decision = self.last_decision

        scanned_band = self.current_scanned_band
        self.total_scans += 1

        # 3. Receiver observation with physical noise, fading, SNR
        is_hit, power_dbm, snr_db, detected_emitter_id, is_fa, is_missed = self.digital_twin.observe_band(scanned_band)

        # 4. Bayesian Belief Update & Learning
        prior_p = self.bayesian_engine.states[scanned_band]["activity_prob"]
        belief_delta = self.bayesian_engine.update_observation(scanned_band, slot, is_hit)
        self.bayesian_engine.time_decay_unobserved(slot)

        # 5. Evaluate Anomaly / Bayesian Surprise
        surprise, is_anomaly, anomaly_reason = self.anomaly_detector.evaluate_observation(scanned_band, prior_p, is_hit)
        if is_anomaly and self.anomaly_detector.anomaly_counter == 12:
            self.log(f"SPECTRUM ANOMALY DETECTED! {anomaly_reason}")
            self.log("NORMAL MODE -> ADAPTIVE EXPLORATION (Exploration increased to 85%)")

        # 6. Periodic & Hop Pattern Learning on Hit
        if is_hit and not is_fa:
            self.total_hits += 1
            self.interceptions += 1
            step_reward = 1.0
            
            # Periodicity update
            self.periodicity_det.record_hit(scanned_band, detected_emitter_id, slot)
            
            # Hop and DNA updates
            if detected_emitter_id:
                self.hop_predictor.record_transition(detected_emitter_id, scanned_band, slot)
                em_obj = next((e for e in self.digital_twin.emitters if e["id"] == detected_emitter_id), None)
                em_name = em_obj["name"] if em_obj else f"Threat {detected_emitter_id}"
                em_sector = em_obj["sector_deg"] if em_obj else 0.0
                self.emitter_dna_engine.register_or_update(detected_emitter_id, em_name, scanned_band, slot, em_sector)
                
                # Intercept latency check
                ep_start = self.digital_twin.active_episode_start.get(detected_emitter_id)
                if ep_start is not None:
                    latency = slot - ep_start
                    self.intercept_latencies.append(latency)
                    del self.digital_twin.active_episode_start[detected_emitter_id]

            self.log(f"{scanned_band} — HIT | SNR: {snr_db:.1f}dB | Emitter: {detected_emitter_id or 'Unknown'} | Belief +{belief_delta:.2f}")

        elif is_fa:
            self.false_alarms += 1
            self.total_misses += 1
            step_reward = -0.2
            self.log(f"{scanned_band} — FALSE ALARM (Interference spike) | Belief +{belief_delta:.2f}")

        else:
            self.total_misses += 1
            step_reward = 0.0
            if is_missed:
                self.missed_detections += 1
            self.log(f"{scanned_band} — MISS | Activity belief decreased ({belief_delta:.2f})")

        self.current_reward = step_reward
        self.cumulative_reward += step_reward

        # 7. Step distributed Multi-Receiver network
        rx_events = self.multi_receiver.step_receivers(slot, scanned_band)

        # 8. Record Scan Result
        scan_res = ScanResult(
            slot=slot,
            band_id=scanned_band,
            dwell_slots=decision.dwell_slots if decision else 1,
            is_hit=is_hit,
            detected_power_dbm=round(power_dbm, 1),
            estimated_snr_db=round(snr_db, 1),
            detected_emitter_id=detected_emitter_id,
            false_alarm=is_fa,
            missed_detection=is_missed,
            belief_delta=round(belief_delta, 3),
            decision_summary=decision or ScanDecision(
                slot=slot,
                selected_band=scanned_band,
                dwell_slots=1,
                priority_score=0.5,
                confidence=0.5,
                expected_reward=0.5,
                information_gain=0.5,
                scan_cost=0.1,
                net_utility=0.5,
                explore_exploit_mode="EXPLOIT",
                explore_pct=30.0,
                exploit_pct=70.0,
                reason="Nominal scan",
                supporting_evidence=[],
                candidate_actions=[],
                counterfactual_analyses=[]
            )
        )
        self.last_result = scan_res

        # Append to live event stream
        self.recent_events.append({
            "slot": slot,
            "band": scanned_band,
            "status": "HIT" if is_hit and not is_fa else ("FALSE_ALARM" if is_fa else "MISS"),
            "power_dbm": round(power_dbm, 1),
            "snr_db": round(snr_db, 1),
            "emitter": detected_emitter_id,
            "delta": round(belief_delta, 3),
            "mode": decision.explore_exploit_mode if decision else "EXPLOIT"
        })
        if len(self.recent_events) > 30:
            self.recent_events.pop(0)

        # 9. Step Judge Demo if active
        if self.demo_orchestrator.is_active:
            demo_status = self.demo_orchestrator.step()
            if demo_status.get("trigger_action") == "TRIGGER_ANOMALY":
                self.digital_twin.inject_anomaly()
                self.anomaly_detector.trigger_manual_anomaly("Automated Demo Phase 5: Agile Breakout Injected")
                self.log("JUDGE DEMO: Triggered Hostile Frequency Breakout Event!")
            elif demo_status.get("trigger_action") == "RUN_BENCHMARK":
                self.log("JUDGE DEMO: Executing Multi-Strategy Benchmark Verification...")

        return self.get_snapshot()

    def get_snapshot(self) -> SimulationStateSnapshot:
        slot = self.digital_twin.slot
        bands_data = self.bayesian_engine.get_all_band_states()
        
        # Attach ground truth data to bands
        for b_st in bands_data:
            b_id = b_st.band_id
            gt_ems = self.digital_twin.ground_truth_current.get(b_id, [])
            b_st.ground_truth_active = (len(gt_ems) > 0)
            b_st.active_emitter_ids = gt_ems
            b_st.ground_truth_power_dbm = round(self.digital_twin.ground_truth_powers.get(b_id, -95.0), 1)
            b_st.ground_truth_snr_db = round(self.digital_twin.ground_truth_snrs.get(b_id, 0.0), 1)

        # System KPIs
        pd = round(self.total_hits / max(1, self.total_hits + self.missed_detections), 3) if self.total_hits > 0 else 0.0
        pfa = round(self.false_alarms / max(1, self.total_scans), 4)
        int_ratio = round(self.interceptions / max(1, self.total_ground_truth_tx), 3) if self.total_ground_truth_tx > 0 else 0.0
        avg_latency = round(sum(self.intercept_latencies) / max(1, len(self.intercept_latencies)), 2) if self.intercept_latencies else 0.0
        
        scanned_unique = sum(1 for b in bands_data if b.hit_count > 0 or b.miss_count > 0)
        coverage_pct = round((scanned_unique / max(1, len(bands_data))) * 100.0, 1)
        
        avg_entropy = round(sum(b.uncertainty for b in bands_data) / max(1, len(bands_data)), 3)
        mean_conf = round(sum(b.confidence for b in bands_data) / max(1, len(bands_data)), 3)
        
        anomaly_st = self.anomaly_detector.get_status()

        metrics = SystemMetrics(
            slot=slot,
            total_scans=self.total_scans,
            total_hits=self.total_hits,
            total_misses=self.total_misses,
            total_ground_truth_transmissions=self.total_ground_truth_tx,
            interceptions=self.interceptions,
            false_alarms=self.false_alarms,
            missed_detections=self.missed_detections,
            probability_of_detection_pd=pd,
            probability_of_false_alarm_pfa=pfa,
            interception_ratio=int_ratio,
            avg_intercept_time_slots=avg_latency,
            cumulative_reward=round(self.cumulative_reward, 1),
            current_reward=round(self.current_reward, 2),
            spectrum_coverage_pct=coverage_pct,
            entropy_spectrum_bits=avg_entropy,
            mean_confidence=mean_conf,
            anomaly_score=anomaly_st["score"],
            anomaly_status=anomaly_st["status"],
            explore_ratio=self.scheduler.current_explore_ratio,
            exploit_ratio=round(1.0 - self.scheduler.current_explore_ratio, 2),
        )

        return SimulationStateSnapshot(
            slot=slot,
            is_running=self.is_running,
            mission_mode=self.scheduler.mission_mode,
            environment_name=self.preset_name,
            metrics=metrics,
            current_decision=self.last_decision,
            last_scan_result=self.last_result,
            bands=bands_data,
            emitters=self.emitter_dna_engine.get_all_dnas(),
            receivers=self.multi_receiver.get_receiver_states(),
            recent_logs=self.recent_logs[-25:],
            recent_events=self.recent_events[-15:],
        )


# Global Singleton Instance
sim_engine = SimulationEngine()
active_connections: List[WebSocket] = []


# Background simulation loop
async def simulation_worker():
    while True:
        try:
            if sim_engine.is_running or sim_engine.demo_orchestrator.is_active:
                snapshot = sim_engine.step()
                # Broadcast to connected WebSockets
                payload = snapshot.model_dump()
                if sim_engine.demo_orchestrator.is_active:
                    payload["demo_status"] = sim_engine.demo_orchestrator.step()
                    
                dead_sockets = []
                for ws in active_connections:
                    try:
                        await ws.send_json(payload)
                    except Exception:
                        dead_sockets.append(ws)
                for ws in dead_sockets:
                    if ws in active_connections:
                        active_connections.remove(ws)
            
            sleep_time = sim_engine.digital_twin.config.simulation_speed_ms / 1000.0
            await asyncio.sleep(max(0.08, sleep_time))
        except Exception as e:
            print("Error in simulation worker:", e)
            await asyncio.sleep(0.5)


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulation_worker())


# REST Endpoints
@app.get("/api/status", response_model=SimulationStateSnapshot)
def get_status():
    return sim_engine.get_snapshot()


@app.post("/api/simulation/start")
def start_simulation():
    sim_engine.is_running = True
    sim_engine.log("Simulation started.")
    return {"status": "started", "is_running": True}


@app.post("/api/simulation/pause")
def pause_simulation():
    sim_engine.is_running = False
    sim_engine.log("Simulation paused.")
    return {"status": "paused", "is_running": False}


@app.post("/api/simulation/reset")
def reset_simulation():
    sim_engine.reset()
    return {"status": "reset", "snapshot": sim_engine.get_snapshot()}


@app.post("/api/simulation/step")
def step_simulation():
    snapshot = sim_engine.step()
    return snapshot


@app.post("/api/mission-mode")
def set_mission_mode(payload: Dict[str, str]):
    mode = payload.get("mode", "ADAPTIVE")
    sim_engine.scheduler.set_mission_mode(mode)
    sim_engine.log(f"Mission mode changed to {mode}.")
    return {"status": "updated", "mission_mode": mode}


@app.post("/api/environment/preset")
def set_preset(payload: Dict[str, str]):
    preset = payload.get("preset", "Dense Spectrum")
    sim_engine.change_preset(preset)
    return {"status": "preset_applied", "preset": preset}


@app.post("/api/environment/anomaly")
def trigger_anomaly():
    info = sim_engine.digital_twin.inject_anomaly()
    sim_engine.anomaly_detector.trigger_manual_anomaly()
    sim_engine.log(f"MANUAL INJECTION: {info['description']}")
    return {"status": "anomaly_injected", "info": info}


@app.post("/api/benchmark/run")
def run_benchmark(payload: Dict[str, Any] = None):
    slots = payload.get("slots", 100) if payload else 100
    preset = payload.get("preset", sim_engine.preset_name) if payload else sim_engine.preset_name
    sim_engine.log(f"Initiated head-to-head benchmark across 6 scanning algorithms ({slots} slots, {preset})...")
    results = sim_engine.benchmark_arena.run_benchmark(num_slots=slots, scenario_preset=preset)
    sim_engine.log("Benchmark execution complete. Performance scorecards generated.")
    return results


@app.post("/api/demo/start")
def start_demo():
    sim_engine.demo_orchestrator.start_demo()
    sim_engine.is_running = True
    sim_engine.log("JUDGE DEMO MODE ACTIVATED: Automated showcase sequence initiated.")
    return {"status": "demo_started"}


@app.post("/api/demo/stop")
def stop_demo():
    sim_engine.demo_orchestrator.stop_demo()
    sim_engine.log("Judge demo mode deactivated.")
    return {"status": "demo_stopped"}


class RobustnessConfig(BaseModel):
    noise_floor_dbm: Optional[float] = None
    interference_level: Optional[float] = None
    p_false_alarm_base: Optional[float] = None
    p_miss_base: Optional[float] = None
    simulation_speed_ms: Optional[int] = None


@app.post("/api/environment/robustness")
def update_robustness(config: RobustnessConfig):
    cfg = sim_engine.digital_twin.config
    if config.noise_floor_dbm is not None:
        cfg.noise_floor_dbm = config.noise_floor_dbm
    if config.interference_level is not None:
        cfg.interference_level = config.interference_level
    if config.p_false_alarm_base is not None:
        cfg.p_false_alarm_base = config.p_false_alarm_base
    if config.p_miss_base is not None:
        cfg.p_miss_base = config.p_miss_base
    if config.simulation_speed_ms is not None:
        cfg.simulation_speed_ms = config.simulation_speed_ms
        
    sim_engine.log(f"Robustness parameters updated: Noise {cfg.noise_floor_dbm}dBm, Interference {cfg.interference_level*100:.0f}%")
    return {"status": "robustness_updated", "config": cfg}


class WhatIfRequest(BaseModel):
    candidate_band: str
    dwell_slots: int = 2


@app.post("/api/counterfactual/evaluate")
def evaluate_what_if(req: WhatIfRequest):
    """
    Evaluates counterfactual scan action for Section 14 & Page 7: What-If Lab.
    """
    band = req.candidate_band
    st = sim_engine.bayesian_engine.states.get(band)
    if not st:
        raise HTTPException(status_code=404, detail="Band not found")

    p = st["activity_prob"]
    ig = sim_engine.bayesian_engine.calculate_information_gain(band)
    cost = 0.08 + (req.dwell_slots - 1) * 0.03
    utility = round(0.65 * p + 0.55 * ig - 0.10 * cost, 3)

    return {
        "band": band,
        "dwell_slots": req.dwell_slots,
        "activity_prob": round(p, 3),
        "information_gain": round(ig, 3),
        "scan_cost": round(cost, 3),
        "net_utility": utility,
        "predicted_outcome": "High interception probability" if p > 0.6 else ("High information gain exploration" if ig > 0.5 else "Low expected return")
    }


@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        # Send initial snapshot immediately
        snapshot = sim_engine.get_snapshot()
        await websocket.send_json(snapshot.model_dump())
        
        while True:
            data = await websocket.receive_json()
            action = data.get("action")
            if action == "start":
                sim_engine.is_running = True
            elif action == "pause":
                sim_engine.is_running = False
            elif action == "reset":
                sim_engine.reset()
            elif action == "step":
                sim_engine.step()
            elif action == "preset":
                sim_engine.change_preset(data.get("preset", "Dense Spectrum"))
            elif action == "mode":
                sim_engine.scheduler.set_mission_mode(data.get("mode", "ADAPTIVE"))
            elif action == "anomaly":
                sim_engine.digital_twin.inject_anomaly()
                sim_engine.anomaly_detector.trigger_manual_anomaly()
            elif action == "demo_start":
                sim_engine.demo_orchestrator.start_demo()
                sim_engine.is_running = True
            elif action == "demo_stop":
                sim_engine.demo_orchestrator.stop_demo()
                
            # Send updated state immediately upon action
            await websocket.send_json(sim_engine.get_snapshot().model_dump())
    except WebSocketDisconnect:
        if websocket in active_connections:
            active_connections.remove(websocket)
    except Exception as e:
        print("WebSocket client error:", e)
        if websocket in active_connections:
            active_connections.remove(websocket)


# Mount Static Frontend build at root for seamless single-port deployment
import os
from starlette.staticfiles import StaticFiles

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static-frontend")

