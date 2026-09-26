# COGNISCAN-EW
### Cognitive Adaptive Spectrum Scanning & Intelligent Interception Scheduler for Electronic Warfare

> **"Learn the Spectrum. Predict the Signal. Scan Smarter."**

---

## 1. Overview & Core Problem

Traditional Electronic Warfare (EW) receivers operate over wide electromagnetic spectrum bandwidths with limited instantaneous receiver bandwidth. Sweeping sequentially across wide frequency bands wastes critical interception time on dormant channels while missing short-duration, periodic, or agile frequency-hopping signals.

**COGNISCAN-EW** replaces blind sweeping with an autonomous cognitive receiver scheduler that continuously learns emitter behavioral patterns, estimates activity probability, extracts temporal pulse periodicity and frequency-hopping transition matrices, and dynamically schedules the receiver's next frequency and dwell time.

The central cognitive loop is:
```text
OBSERVE ➔ PREDICT ➔ PRIORITIZE ➔ SCHEDULE ➔ SCAN ➔ HIT / MISS ➔ LEARN ➔ RE-SCHEDULE
```

---

## 2. Core Innovation & Key Intelligence Modules

1. **RF Digital Twin / Simulation Lab**:
   - Configurable wideband spectrum (32 to 64 channels, 2000–6000 MHz).
   - Simulates 6 physical emitter behaviors: Fixed, Periodic Pulsed, Agile Frequency Hopper, Intermittent Burst, Spatial Scanning, and Novel Random Strobe.
   - Channel physics: AWGN thermal noise floor, Rayleigh fading, SNR-dependent detection probability ($P_d$), false alarm probability ($P_{fa}$), and spatial sector antenna patterns.

2. **Recursive Bayesian Activity Belief**:
   - Maintains continuous posterior belief $P(\text{Active} \mid \text{observations})$ using Beta-Bernoulli conjugate updating.
   - Dynamic time-decay: Unobserved channels drift toward prior mean with increasing Shannon entropy.

3. **Temporal Autocorrelation Periodicity Detection**:
   - Evaluates inter-arrival intervals and lag autocorrelation to detect pulse repetition periods.
   - Calculates time-to-next-transmission ($T + \Delta t$) and boosts priority during anticipated transmission windows.

4. **Markov Frequency-Hop Predictor**:
   - Builds empirical transition matrices $P(B_j \mid B_i)$ for agile transmitters.
   - Forecasts top candidate next-hop destinations with percentage confidence.

5. **Restless Multi-Armed Bandit (RMAB) Cognitive Scheduler**:
   - Solves dynamic resource allocation:
     $$U(B_i, d) = w_{\text{detect}} \cdot P_{\text{detect}}(B_i) + w_{\text{info}} \cdot \text{InfoGain}(B_i) - w_{\text{cost}} \cdot \text{Cost}(d)$$
   - Dynamically balances **Exploration vs Exploitation** (e.g. 35% Explore / 65% Exploit).
   - Dynamically allocates **Adaptive Dwell Time** (1 to 5 slots).

6. **Explainable AI Decision Engine**:
   - Every single scheduling decision details *"WHY THIS BAND?"* with evidence checklists and counterfactual comparisons.

7. **Multi-Receiver Collaborative Mesh**:
   - Coordinated distributed receivers (Alpha: 0°-120°, Bravo: 120°-240°, Charlie: 240°-360°) sharing real-time mesh cues.

8. **Head-to-Head Benchmark Arena**:
   - Monte Carlo evaluation comparing 6 scanning strategies on identical ground-truth scenarios:
     1. Sequential Sweep
     2. Random Scan
     3. Greedy Probability Scan
     4. Bandit Scheduler (UCB1)
     5. RL Scheduler (Q-Learning)
     6. **COGNISCAN-EW (Cognitive Adaptive AI)**

9. **Unseen Environment Challenge**:
   - Tests zero-day adaptation by injecting novel threats into previously dormant spectrum. Anomaly detector triggers instant transition to Adaptive Exploration.

---

## 3. Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ (already bundled into production `dist/`)

### Running the Application (One Command)
To start both the backend API and the frontend dashboard on a single port:

```bash
python run.py
```

Open your browser to:
**`http://127.0.0.1:8000/`** (or `http://localhost:8000/`)

### Running Frontend in Development Mode (Optional)
If you wish to make live frontend modifications:

```bash
# Terminal 1: Backend
python -m uvicorn backend.main:app --port 8000 --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

## 4. One-Click Judge Demo Mode

COGNISCAN-EW includes a dedicated **START JUDGE DEMO** button in the top navigation bar.
This executes a scripted 2-to-3 minute automated demonstration with live voiceover/caption banners:

1. **Phase 1: Scenario Initialization**: RF Digital Twin activated with 64 channels and 6 emitters.
2. **Phase 2: Autonomous Exploration**: Cold-start sweep driven by Shannon entropy.
3. **Phase 3: Pattern Recognition & DNA**: Locks onto pulsed radar period and agile hop transitions.
4. **Phase 4: Cognitive Exploitation**: Predictive dwells achieve $>85\%$ detection rate.
5. **Phase 5: Sudden Anomaly**: Hostile breakout injected; anomaly detector triggers Adaptive Exploration.
6. **Phase 6: Rapid Re-Convergence**: AI re-maps agile threat within 4 time slots.
7. **Phase 7: Benchmark Verification**: Head-to-head empirical metrics rendered.

---

## 5. Directory Structure

```text
COGNISCAN-EW/
├── backend/
│   ├── main.py                  # FastAPI REST + WebSocket telemetry server
│   ├── models.py                # Pydantic schemas & state models
│   ├── rf_digital_twin.py       # RF spectrum & physical emitter simulation
│   ├── bayesian_engine.py       # Recursive Bayesian belief & entropy engine
│   ├── periodicity_detector.py  # Autocorrelation periodicity detection
│   ├── hop_predictor.py         # Markov frequency-hop transition learner
│   ├── emitter_dna.py           # Behavioral fingerprinting & classification
│   ├── cognitive_scheduler.py   # Restless Bandit & Explainable AI scheduler
│   ├── multi_receiver.py        # Distributed 3-receiver spatial mesh
│   ├── anomaly_detector.py      # Bayesian surprise & anomaly detector
│   ├── benchmark_arena.py       # 6-strategy Monte Carlo comparison engine
│   └── demo_orchestrator.py     # Judge Demo automated sequence manager
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, DemoBanner, BandInspector, RadarDisplay
│   │   ├── pages/               # 12 complete, interactive application pages
│   │   ├── api.ts               # REST client & WebSocket live hook
│   │   ├── types.ts             # TypeScript interface schemas
│   │   ├── App.tsx              # Root component & page router
│   │   └── main.tsx             # Entry point
│   ├── dist/                    # Production built bundle
│   └── tailwind.config.js       # Tactical dark command-center theme
├── run.py                       # Single-command launcher
└── README.md
```

---

## 6. Scientific Integrity & Disclaimer

**SIMULATED / EXPERIMENTAL RESEARCH PROTOTYPE**  
This software is an independent research simulation developed for algorithm evaluation and cognitive scheduling demonstration. All RF signals, noise dynamics, emitter behaviors, and receiver channels are mathematically generated within an offline software environment. This platform does not claim operational military deployment or classified EW hardware integration.
