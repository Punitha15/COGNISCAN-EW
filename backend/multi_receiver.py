"""
Multi-Receiver Collaborative Cognitive Scanning Module for COGNISCAN-EW.
Simulates a distributed tactical receiver network (Receivers Alpha, Bravo, Charlie)
covering complementary spatial sectors and sharing real-time detection intelligence.
"""

from typing import List, Dict, Optional, Any, Tuple
from .models import ReceiverState
from .rf_digital_twin import RFDigitalTwin
from .bayesian_engine import BayesianActivityEngine


class MultiReceiverNetwork:
    def __init__(self, digital_twin: RFDigitalTwin, bayesian_engine: BayesianActivityEngine):
        self.digital_twin = digital_twin
        self.bayesian_engine = bayesian_engine
        
        # 3 Virtual Distributed Receivers
        self.receivers: Dict[str, Dict[str, Any]] = {
            "RX-ALPHA": {
                "id": "RX-ALPHA",
                "name": "Receiver Alpha (North Sector)",
                "sector_deg": 60.0,
                "beam_width_deg": 120.0,
                "current_band": "B08",
                "dwell_remaining": 0,
                "last_hit_band": None,
                "last_hit_slot": -1,
                "shared_clues_sent": 0,
                "shared_clues_received": 0,
                "status": "ACTIVE",
            },
            "RX-BRAVO": {
                "id": "RX-BRAVO",
                "name": "Receiver Bravo (East/South Sector)",
                "sector_deg": 180.0,
                "beam_width_deg": 120.0,
                "current_band": "B24",
                "dwell_remaining": 0,
                "last_hit_band": None,
                "last_hit_slot": -1,
                "shared_clues_sent": 0,
                "shared_clues_received": 0,
                "status": "ACTIVE",
            },
            "RX-CHARLIE": {
                "id": "RX-CHARLIE",
                "name": "Receiver Charlie (West Sector)",
                "sector_deg": 300.0,
                "beam_width_deg": 120.0,
                "current_band": "B48",
                "dwell_remaining": 0,
                "last_hit_band": None,
                "last_hit_slot": -1,
                "shared_clues_sent": 0,
                "shared_clues_received": 0,
                "status": "ACTIVE",
            }
        }
        self.cooperative_logs: List[str] = []

    def step_receivers(self, current_slot: int, primary_scan_band: str) -> List[Dict[str, Any]]:
        """
        Steps auxiliary receivers Alpha, Bravo, Charlie.
        They independently sample sectors and share clues across the mesh network.
        """
        results = []
        bands = self.digital_twin.bands
        
        for rx_id, rx in self.receivers.items():
            # If dwell complete, assign next band complementary to primary
            if rx["dwell_remaining"] <= 0:
                # Pick a band not currently covered by primary to maximize spectrum coverage
                offset = 12 if rx_id == "RX-ALPHA" else (24 if rx_id == "RX-BRAVO" else 36)
                if bands:
                    band_idx = (current_slot * 3 + offset) % len(bands)
                    rx["current_band"] = bands[band_idx]
                rx["dwell_remaining"] = 2
            else:
                rx["dwell_remaining"] -= 1

            # Observe through receiver channel with sector antenna pattern
            is_hit, power_dbm, snr_db, emitter_id, fa, missed = self.digital_twin.observe_band(
                rx["current_band"],
                receiver_sector_deg=rx["sector_deg"]
            )

            if is_hit and not fa:
                rx["last_hit_band"] = rx["current_band"]
                rx["last_hit_slot"] = current_slot
                rx["shared_clues_sent"] += 1
                
                # Share clue to Central Bayesian Engine & Peer Receivers!
                self.bayesian_engine.update_observation(rx["current_band"], current_slot, is_hit=True)
                
                # Record in cooperative intelligence log
                log_msg = f"[{rx_id}] Detected {emitter_id or 'Signal'} on {rx['current_band']} at SNR {snr_db:.1f}dB -> Dispatched Mesh Cue to all units"
                self.cooperative_logs.append(log_msg)
                if len(self.cooperative_logs) > 20:
                    self.cooperative_logs.pop(0)

                # Increment received clues on peers
                for peer_id, peer in self.receivers.items():
                    if peer_id != rx_id:
                        peer["shared_clues_received"] += 1

                results.append({
                    "receiver_id": rx_id,
                    "band": rx["current_band"],
                    "hit": True,
                    "emitter_id": emitter_id,
                    "snr_db": round(snr_db, 1),
                    "sector_deg": rx["sector_deg"]
                })
            else:
                results.append({
                    "receiver_id": rx_id,
                    "band": rx["current_band"],
                    "hit": False,
                    "emitter_id": None,
                    "snr_db": round(snr_db, 1),
                    "sector_deg": rx["sector_deg"]
                })

        return results

    def get_receiver_states(self) -> List[ReceiverState]:
        return [
            ReceiverState(
                receiver_id=rx["id"],
                name=rx["name"],
                sector_deg=rx["sector_deg"],
                beam_width_deg=rx["beam_width_deg"],
                current_band=rx["current_band"],
                dwell_remaining=rx["dwell_remaining"],
                last_hit_band=rx["last_hit_band"],
                last_hit_slot=rx["last_hit_slot"],
                shared_clues_sent=rx["shared_clues_sent"],
                shared_clues_received=rx["shared_clues_received"],
                status=rx["status"]
            )
            for rx in self.receivers.values()
        ]
