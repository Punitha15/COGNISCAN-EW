"""
RF Digital Twin Simulation Module for COGNISCAN-EW.
Simulates realistic RF spectrum bands, multiple emitter behaviors,
spatial scanning emitters, noise, interference, fading, and multi-receiver geometries.
Generates ground truth and simulated receiver observations.
"""

import math
import random
import numpy as np
from typing import List, Dict, Tuple, Optional, Any
from .models import EmitterConfig, EnvironmentConfig


class RFDigitalTwin:
    def __init__(self, config: Optional[EnvironmentConfig] = None):
        self.slot = 0
        self.num_bands = config.num_bands if config else 64
        prefix = config.band_prefix if config else "B"
        self.bands = [f"{prefix}{i+1:02d}" for i in range(self.num_bands)]
        self.band_to_idx = {b: i for i, b in enumerate(self.bands)}
        self.center_freqs = {
            b: 2000.0 + (i * 4000.0 / max(1, self.num_bands - 1))
            for i, b in enumerate(self.bands)
        }
        self.config = config or self.get_preset_config("Dense Spectrum")
        # Ensure bands match final config
        self.num_bands = self.config.num_bands
        self.bands = [f"{self.config.band_prefix}{i+1:02d}" for i in range(self.num_bands)]
        self.band_to_idx = {b: i for i, b in enumerate(self.bands)}
        self.center_freqs = {
            b: 2000.0 + (i * 4000.0 / max(1, self.num_bands - 1))
            for i, b in enumerate(self.bands)
        }
        
        # Emitters state
        self.emitters: List[Dict[str, Any]] = []
        self._initialize_emitters(self.config.emitters)
        
        # Historical ground truth logs for intercept time calculations
        # emitter_id -> slot when current transmission episode began
        self.active_episode_start: Dict[str, int] = {}
        # (band, slot) -> ground truth list of emitting emitter ids
        self.ground_truth_current: Dict[str, List[str]] = {}
        self.ground_truth_powers: Dict[str, float] = {}
        self.ground_truth_snrs: Dict[str, float] = {}

    def _initialize_emitters(self, emitter_configs: List[EmitterConfig]):
        self.emitters = []
        if not emitter_configs:
            # Default rich scenario
            emitter_configs = self._create_default_emitters()

        for ec in emitter_configs:
            em = {
                "id": ec.id,
                "name": ec.name,
                "behavior_type": ec.behavior_type,
                "bands": list(ec.bands),
                "primary_band": ec.primary_band,
                "period_slots": ec.period_slots or 8,
                "duty_cycle": ec.duty_cycle,
                "hop_rate": ec.hop_rate,
                "burst_prob": ec.burst_prob,
                "burst_length": ec.burst_length,
                "power_dbm": ec.power_dbm,
                "sector_deg": ec.sector_deg,
                "scan_velocity_deg": ec.scan_velocity_deg,
                "current_band": ec.current_band or ec.primary_band,
                "is_active": False,
                "active_streak": 0,
                "silent_streak": 0,
                "hop_index": 0,
                "phase_offset": random.randint(0, ec.period_slots or 8),
                # Hidden Markov transition sequence for frequency agile emitters
                "hop_sequence": self._generate_hop_sequence(ec.bands),
            }
            self.emitters.append(em)

    def _generate_hop_sequence(self, bands: List[str]) -> List[str]:
        if not bands:
            return [self.bands[0]]
        # Create a structured pseudo-random cycle with some Markov drift
        seq = list(bands)
        random.shuffle(seq)
        if len(seq) < 6:
            seq = (seq * (6 // len(seq) + 1))[:8]
        return seq

    def _create_default_emitters(self) -> List[EmitterConfig]:
        """Creates a realistic, high-fidelity tactical emitter library."""
        b = self.bands
        nb = len(b)
        idx = lambda p: b[min(nb - 1, max(0, int(p * nb)))]

        return [
            # 1. Fixed Radar
            EmitterConfig(
                id="EMT-FIX-01",
                name="Continuous Surveillance Radar",
                behavior_type="fixed",
                bands=[idx(0.12)],
                primary_band=idx(0.12),
                power_dbm=-38.0,
                sector_deg=45.0,
                duty_cycle=0.85
            ),
            # 2. Periodic Pulsed Radar
            EmitterConfig(
                id="EMT-PER-02",
                name="Pulsed Target Tracker",
                behavior_type="periodic",
                bands=[idx(0.35)],
                primary_band=idx(0.35),
                period_slots=6,
                duty_cycle=0.33,  # 2 active, 4 silent
                power_dbm=-42.0,
                sector_deg=110.0
            ),
            # 3. Fast Frequency-Agile / Hopping Tactical Comms
            EmitterConfig(
                id="EMT-AGL-03",
                name="Agile Frequency Hopper",
                behavior_type="agile",
                bands=[idx(0.20), idx(0.24), idx(0.48), idx(0.62), idx(0.75)],
                primary_band=idx(0.24),
                hop_rate=0.75,
                power_dbm=-45.0,
                sector_deg=190.0
            ),
            # 4. Burst / Intermittent Data Link
            EmitterConfig(
                id="EMT-BST-04",
                name="Intermittent Tactical Datalink",
                behavior_type="burst",
                bands=[idx(0.55), idx(0.58)],
                primary_band=idx(0.55),
                burst_prob=0.18,
                burst_length=3,
                power_dbm=-48.0,
                sector_deg=275.0
            ),
            # 5. Spatially Scanning Radar
            EmitterConfig(
                id="EMT-SCP-05",
                name="Rotating Beam Search Radar",
                behavior_type="spatial_scanning",
                bands=[idx(0.82), idx(0.85)],
                primary_band=idx(0.82),
                power_dbm=-35.0,
                sector_deg=0.0,
                scan_velocity_deg=15.0  # rotates 15 deg per slot
            ),
            # 6. Random / Novel Electronic Attack Jammer
            EmitterConfig(
                id="EMT-RND-06",
                name="Unpredictable Agile Strobe",
                behavior_type="random",
                bands=[idx(0.05), idx(0.30), idx(0.68), idx(0.92)],
                primary_band=idx(0.30),
                power_dbm=-40.0,
                sector_deg=150.0
            )
        ]

    def get_preset_config(self, preset_name: str) -> EnvironmentConfig:
        """Returns standard presets requested in prompt."""
        b_count = 64
        prefix = "B"
        bands = [f"{prefix}{i+1:02d}" for i in range(b_count)]
        idx = lambda p: bands[min(b_count - 1, max(0, int(p * b_count)))]

        if preset_name == "Simple":
            emitters = [
                EmitterConfig(id="EMT-01", name="Fixed Beacon", behavior_type="fixed", bands=[idx(0.2)], primary_band=idx(0.2), power_dbm=-35.0, sector_deg=45.0),
                EmitterConfig(id="EMT-02", name="Periodic Beacon", behavior_type="periodic", bands=[idx(0.6)], primary_band=idx(0.6), period_slots=5, duty_cycle=0.4, power_dbm=-38.0, sector_deg=160.0),
            ]
            return EnvironmentConfig(num_bands=32, noise_floor_dbm=-95.0, interference_level=0.05, mission_mode="ADAPTIVE", emitters=emitters)

        elif preset_name == "Frequency Agile":
            emitters = [
                EmitterConfig(id="EMT-AGL-1", name="Fast Hopper Alpha", behavior_type="agile", bands=[idx(0.15), idx(0.32), idx(0.44), idx(0.70)], primary_band=idx(0.32), hop_rate=0.85, power_dbm=-40.0, sector_deg=60.0),
                EmitterConfig(id="EMT-AGL-2", name="Fast Hopper Bravo", behavior_type="agile", bands=[idx(0.25), idx(0.50), idx(0.65), idx(0.85)], primary_band=idx(0.50), hop_rate=0.90, power_dbm=-44.0, sector_deg=220.0),
                EmitterConfig(id="EMT-FIX-1", name="Fixed Guard", behavior_type="fixed", bands=[idx(0.08)], primary_band=idx(0.08), power_dbm=-36.0, sector_deg=310.0),
            ]
            return EnvironmentConfig(num_bands=64, noise_floor_dbm=-92.0, interference_level=0.15, mission_mode="TRACKING", emitters=emitters)

        elif preset_name == "Periodic":
            emitters = [
                EmitterConfig(id="EMT-PER-1", name="Long Pulse Radar", behavior_type="periodic", bands=[idx(0.18)], primary_band=idx(0.18), period_slots=8, duty_cycle=0.25, power_dbm=-38.0, sector_deg=80.0),
                EmitterConfig(id="EMT-PER-2", name="Short Pulse Radar", behavior_type="periodic", bands=[idx(0.42)], primary_band=idx(0.42), period_slots=4, duty_cycle=0.5, power_dbm=-42.0, sector_deg=170.0),
                EmitterConfig(id="EMT-PER-3", name="Multi-period Beacon", behavior_type="periodic", bands=[idx(0.77)], primary_band=idx(0.77), period_slots=10, duty_cycle=0.2, power_dbm=-45.0, sector_deg=290.0),
            ]
            return EnvironmentConfig(num_bands=64, noise_floor_dbm=-94.0, interference_level=0.10, mission_mode="RAPID_INTERCEPT", emitters=emitters)

        elif preset_name == "High Noise":
            default_em = self._create_default_emitters()
            return EnvironmentConfig(num_bands=64, noise_floor_dbm=-82.0, interference_level=0.45, p_false_alarm_base=0.06, p_miss_base=0.15, mission_mode="INTELLIGENCE", emitters=default_em)

        elif preset_name == "Unknown Environment":
            # Completely unmapped emitter behavior and novel channels
            emitters = [
                EmitterConfig(id="EMT-UNK-01", name="Exotic Agile Transmitter", behavior_type="agile", bands=[idx(0.06), idx(0.28), idx(0.53), idx(0.88)], primary_band=idx(0.06), hop_rate=0.8, power_dbm=-46.0, sector_deg=135.0),
                EmitterConfig(id="EMT-UNK-02", name="Stealth Intermittent", behavior_type="burst", bands=[idx(0.38), idx(0.72)], primary_band=idx(0.38), burst_prob=0.12, burst_length=2, power_dbm=-52.0, sector_deg=210.0),
                EmitterConfig(id="EMT-UNK-03", name="Chaotic Chirp", behavior_type="random", bands=[idx(0.19), idx(0.47), idx(0.81)], primary_band=idx(0.47), power_dbm=-48.0, sector_deg=340.0),
            ]
            return EnvironmentConfig(num_bands=64, noise_floor_dbm=-90.0, interference_level=0.25, mission_mode="DISCOVERY", emitters=emitters)

        elif preset_name == "Stress Test":
            # 8 dense emitters, high noise, high interference
            emitters = []
            types = ["fixed", "periodic", "agile", "burst", "random", "spatial_scanning"]
            for i in range(8):
                t = types[i % len(types)]
                b_subset = [idx(float(j)/10.0) for j in range(i, min(10, i + 3))]
                emitters.append(
                    EmitterConfig(
                        id=f"EMT-STR-{i+1:02d}",
                        name=f"Stress Hostile {i+1}",
                        behavior_type=t,
                        bands=b_subset,
                        primary_band=b_subset[0],
                        period_slots=random.choice([4, 6, 8, 10]),
                        duty_cycle=0.35,
                        hop_rate=0.8,
                        power_dbm=-42.0 - i * 2,
                        sector_deg=(i * 45.0) % 360.0,
                        scan_velocity_deg=20.0 if t == "spatial_scanning" else 0.0
                    )
                )
            return EnvironmentConfig(num_bands=64, noise_floor_dbm=-86.0, interference_level=0.35, mission_mode="ADAPTIVE", emitters=emitters)

        # Default "Dense Spectrum"
        return EnvironmentConfig(
            num_bands=64,
            noise_floor_dbm=-95.0,
            interference_level=0.15,
            mission_mode="ADAPTIVE",
            emitters=self._create_default_emitters()
        )

    def set_environment(self, preset_name_or_config):
        if isinstance(preset_name_or_config, str):
            self.config = self.get_preset_config(preset_name_or_config)
        else:
            self.config = preset_name_or_config
            
        self.num_bands = self.config.num_bands
        self.bands = [f"{self.config.band_prefix}{i+1:02d}" for i in range(self.num_bands)]
        self.band_to_idx = {b: i for i, b in enumerate(self.bands)}
        self.center_freqs = {
            b: 2000.0 + (i * 4000.0 / max(1, self.num_bands - 1))
            for i, b in enumerate(self.bands)
        }
        self.active_episode_start.clear()
        self._initialize_emitters(self.config.emitters)

    def inject_anomaly(self) -> Dict[str, Any]:
        """Introduces sudden unexpected spectrum anomaly as required by Prompt #19."""
        # Mutate 2 emitters to burst or hop violently into previously quiet bands
        quiet_bands = [b for b in self.bands if not any(b in e["bands"] for e in self.emitters)]
        if not quiet_bands:
            quiet_bands = self.bands[-10:]
            
        anomaly_bands = quiet_bands[:4]
        for em in self.emitters[:2]:
            em["behavior_type"] = "agile"
            em["bands"] = anomaly_bands
            em["current_band"] = random.choice(anomaly_bands)
            em["hop_rate"] = 0.95
            em["power_dbm"] += 6.0  # sudden higher power
            em["hop_sequence"] = anomaly_bands * 2
            
        return {
            "anomaly_type": "FREQUENCY_HOPPING_BREAKOUT",
            "impacted_bands": anomaly_bands,
            "description": "Sudden hostile spectrum breakout detected in previously quiescent bands."
        }

    def step_simulation(self) -> Dict[str, Any]:
        """
        Advances the RF environment by 1 discrete time slot.
        Updates physical emitter states, angles, and computes ground truth across all bands.
        """
        self.slot += 1
        ground_truth: Dict[str, List[str]] = {b: [] for b in self.bands}
        powers: Dict[str, float] = {b: self.config.noise_floor_dbm for b in self.bands}
        snrs: Dict[str, float] = {b: -30.0 for b in self.bands}
        
        for em in self.emitters:
            b_type = em["behavior_type"]
            was_active = em["is_active"]
            is_active = False
            target_band = em["current_band"]
            
            # Update spatial scanning position if applicable
            if em.get("scan_velocity_deg", 0.0) != 0.0:
                em["sector_deg"] = (em["sector_deg"] + em["scan_velocity_deg"]) % 360.0
            
            # Behavioral generation
            if b_type == "fixed":
                # Fixed continuous or high duty cycle
                is_active = random.random() < em["duty_cycle"]
                target_band = em["primary_band"]
                
            elif b_type == "periodic":
                p = em["period_slots"]
                phase = (self.slot + em["phase_offset"]) % p
                # active during first fraction of period
                active_slots = max(1, int(p * em["duty_cycle"]))
                is_active = (phase < active_slots)
                target_band = em["primary_band"]
                
            elif b_type == "agile":
                # Frequency hopping
                if random.random() < em["hop_rate"]:
                    # Hop to next in sequence or Markov jump
                    em["hop_index"] = (em["hop_index"] + 1) % len(em["hop_sequence"])
                    target_band = em["hop_sequence"][em["hop_index"]]
                is_active = random.random() < 0.85
                
            elif b_type == "burst":
                if was_active:
                    # In active burst
                    if em["active_streak"] < em["burst_length"]:
                        is_active = True
                    else:
                        is_active = False
                else:
                    is_active = (random.random() < em["burst_prob"])
                target_band = random.choice(em["bands"])
                
            elif b_type == "spatial_scanning":
                # Emits in beam sector. When pointing towards general observation zone (0-180), active
                # Also hops between 2 bands
                is_active = 0.0 <= em["sector_deg"] <= 180.0
                if self.slot % 3 == 0 and em["bands"]:
                    target_band = random.choice(em["bands"])
                    
            elif b_type == "random":
                is_active = random.random() < 0.40
                if em["bands"]:
                    target_band = random.choice(em["bands"])
            
            # Apply state update
            em["is_active"] = is_active
            em["current_band"] = target_band
            if is_active:
                em["active_streak"] = (em["active_streak"] + 1) if was_active else 1
                em["silent_streak"] = 0
                if not was_active:
                    self.active_episode_start[em["id"]] = self.slot
                # Add to ground truth
                if target_band in ground_truth:
                    ground_truth[target_band].append(em["id"])
                    # Combine signal power (sum of powers in linear domain)
                    p_lin = 10.0 ** (em["power_dbm"] / 10.0)
                    cur_lin = 10.0 ** (powers[target_band] / 10.0)
                    powers[target_band] = 10.0 * math.log10(cur_lin + p_lin)
            else:
                em["silent_streak"] = (em["silent_streak"] + 1) if not was_active else 1
                em["active_streak"] = 0

        # Calculate SNR for each band
        # Add random interference bursts according to interference_level
        for b in self.bands:
            # Interference spike
            if random.random() < (self.config.interference_level * 0.08):
                spike_dbm = self.config.noise_floor_dbm + random.uniform(15.0, 30.0)
                powers[b] = max(powers[b], spike_dbm)
                
            snrs[b] = powers[b] - self.config.noise_floor_dbm

        self.ground_truth_current = ground_truth
        self.ground_truth_powers = powers
        self.ground_truth_snrs = snrs

        return {
            "slot": self.slot,
            "ground_truth": ground_truth,
            "powers_dbm": powers,
            "snrs_db": snrs,
        }

    def observe_band(self, band_id: str, receiver_sector_deg: float = 90.0) -> Tuple[bool, float, float, Optional[str], bool, bool]:
        """
        Simulates physical observation of band_id by a receiver.
        Incorporates SNR, antenna gain toward emitter, channel fading (Rayleigh),
        $P_d(SNR)$, and $P_{fa}$ (false alarms).
        
        Returns:
            (is_hit, measured_power_dbm, estimated_snr_db, detected_emitter_id, is_false_alarm, is_missed_detection)
        """
        active_emitters = self.ground_truth_current.get(band_id, [])
        noise_floor = self.config.noise_floor_dbm
        
        # Base thermal noise with small Gaussian perturbation
        measured_noise = noise_floor + random.gauss(0, 1.2)
        
        if not active_emitters:
            # No real transmitter. Check for false alarm.
            p_fa = self.config.p_false_alarm_base + (self.config.interference_level * 0.03)
            if random.random() < p_fa:
                # False alarm triggered by noise spike / interference
                fa_power = noise_floor + random.uniform(8.0, 14.0)
                return True, fa_power, fa_power - noise_floor, None, True, False
            else:
                return False, measured_noise, measured_noise - noise_floor, None, False, False

        # Real emitter present
        first_emitter_id = active_emitters[0]
        emitter_obj = next((e for e in self.emitters if e["id"] == first_emitter_id), None)
        
        # Antenna gain pattern: simple cosine beam
        antenna_gain_db = 0.0
        if emitter_obj:
            angle_diff = abs(emitter_obj["sector_deg"] - receiver_sector_deg)
            angle_diff = min(angle_diff, 360.0 - angle_diff)
            # Beamwidth ~ 90 deg
            if angle_diff < 90.0:
                antenna_gain_db = 12.0 * math.cos(math.radians(angle_diff))
            else:
                antenna_gain_db = -15.0  # side-lobe attenuation
                
        # Channel fading (log-normal / Rayleigh shadow)
        fading_db = random.gauss(0, 2.5)
        
        true_power = self.ground_truth_powers.get(band_id, noise_floor)
        received_power = true_power + antenna_gain_db + fading_db
        snr = received_power - noise_floor
        
        # Probability of detection curve: sigmoid on SNR
        # SNR = 10 dB -> Pd ~ 0.95; SNR = 3 dB -> Pd ~ 0.50; SNR < 0 -> Pd < 0.1
        pd = 1.0 / (1.0 + math.exp(-0.45 * (snr - 4.0)))
        pd = max(0.01, min(0.99, pd * (1.0 - self.config.p_miss_base)))
        
        if random.random() < pd:
            # Successful interception (HIT)
            return True, received_power, snr, first_emitter_id, False, False
        else:
            # Missed detection (signal was there, but lost in noise/fading)
            return False, measured_noise, measured_noise - noise_floor, None, False, True
