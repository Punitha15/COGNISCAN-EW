import React, { useState } from 'react';
import { 
  Sliders, 
  Settings, 
  ShieldAlert, 
  Radio, 
  Zap, 
  RotateCcw, 
  Check, 
  AlertCircle,
  Gauge
} from 'lucide-react';
import { SimulationStateSnapshot } from '../types';
import { setEnvironmentPreset, updateRobustness, triggerAnomaly } from '../api';

interface DigitalTwinPageProps {
  snapshot: SimulationStateSnapshot | null;
}

const PRESETS = [
  { id: 'Dense Spectrum', name: 'Dense Spectrum (Default)', desc: '64 channels, 6 heterogenous tactical emitters with high spectral density.' },
  { id: 'Simple', name: 'Simple (Baseline)', desc: '32 channels, 2 predictable emitters for initial baseline verification.' },
  { id: 'Frequency Agile', name: 'Frequency Agile Comms', desc: 'Fast frequency hoppers jumping across channels at 90% transition rate.' },
  { id: 'Periodic', name: 'Periodic Radar Pulse', desc: 'Pulsed radar trackers with varying pulse repetition intervals (4-10 slots).' },
  { id: 'High Noise', name: 'High Noise Environment', desc: '-82 dBm thermal noise floor, frequent false alarms and signal fading.' },
  { id: 'Unknown Environment', name: 'Unknown / Zero-Day', desc: 'Exotic hopping and burst emitters with zero prior intelligence.' },
  { id: 'Stress Test', name: 'Stress Test (Overload)', desc: '8 simultaneous emitters, severe interference, and spatial jamming.' },
];

export const DigitalTwinPage: React.FC<DigitalTwinPageProps> = ({ snapshot }) => {
  const [selectedPreset, setSelectedPreset] = useState<string>(snapshot?.environment_name || 'Dense Spectrum');
  const [noiseFloor, setNoiseFloor] = useState<number>(-95);
  const [interference, setInterference] = useState<number>(15);
  const [speedMs, setSpeedMs] = useState<number>(400);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleApplyPreset = async (presetId: string) => {
    setIsApplying(true);
    setSelectedPreset(presetId);
    try {
      await setEnvironmentPreset(presetId);
      setStatusMsg(`Applied environment preset: ${presetId}`);
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (e: any) {
      setStatusMsg(`Failed to apply preset: ${e.message}`);
    } finally {
      setIsApplying(false);
    }
  };

  const handleApplyRobustness = async () => {
    try {
      await updateRobustness({
        noise_floor_dbm: noiseFloor,
        interference_level: interference / 100.0,
        simulation_speed_ms: speedMs,
      });
      setStatusMsg('Updated RF physics & channel parameters.');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (e: any) {
      setStatusMsg(`Error updating parameters: ${e.message}`);
    }
  };

  const handleTriggerAnomaly = async () => {
    try {
      await triggerAnomaly();
      setStatusMsg('Injected hostile frequency breakout into spectrum.');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (e: any) {
      setStatusMsg(`Error injecting anomaly: ${e.message}`);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Header */}
      <div className="bg-ew-card border border-ew-border p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-ew-cyan" />
            <h2 className="text-base font-mono font-bold text-white">
              RF DIGITAL TWIN & SIMULATION STUDIO
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            Configure RF electromagnetic environment, emitter profiles, AWGN noise floor, fading, interference spikes, and mission presets.
          </p>
        </div>

        {statusMsg && (
          <div className="px-3 py-1.5 rounded-lg bg-ew-cyan/20 border border-ew-cyan/40 text-ew-cyan font-mono text-xs font-bold animate-pulse">
            {statusMsg}
          </div>
        )}
      </div>

      {/* Preset Scenarios Grid */}
      <div className="bg-ew-surface border border-ew-border p-4 rounded-xl space-y-3">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
          TACTICAL SCENARIO PRESETS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESETS.map((p) => {
            const isActive = selectedPreset === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handleApplyPreset(p.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-ew-card border-ew-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                    : 'bg-ew-card/50 border-ew-border hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 font-mono">
                  <span className="text-xs font-bold text-white">{p.name}</span>
                  {isActive && <Check className="w-4 h-4 text-ew-cyan" />}
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-normal">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 21: Robustness Testing & Physical Channel Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Physical Channel Sliders */}
        <div className="bg-ew-card border border-ew-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-ew-amber" />
            <h3 className="font-mono font-bold text-sm text-white">
              RF PHYSICAL CHANNEL PARAMETERS
            </h3>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {/* Thermal Noise Floor */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Thermal Noise Floor (dBm):</span>
                <span className="text-white font-bold">{noiseFloor} dBm</span>
              </div>
              <input
                type="range"
                min="-105"
                max="-75"
                step="1"
                value={noiseFloor}
                onChange={(e) => setNoiseFloor(parseInt(e.target.value))}
                className="w-full accent-ew-cyan"
              />
              <span className="text-[10px] text-slate-500">
                Nominal: -95 dBm. Lower values increase signal clarity; higher values reduce receiver SNR.
              </span>
            </div>

            {/* Interference Level */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">RF Interference / Jamming Level:</span>
                <span className="text-ew-amber font-bold">{interference}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={interference}
                onChange={(e) => setInterference(parseInt(e.target.value))}
                className="w-full accent-ew-amber"
              />
              <span className="text-[10px] text-slate-500">
                Probability of sporadic noise bursts inducing false alarms in non-active channels.
              </span>
            </div>

            {/* Simulation Speed */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Time Slot Tick Duration:</span>
                <span className="text-ew-purple font-bold">{speedMs} ms</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={speedMs}
                onChange={(e) => setSpeedMs(parseInt(e.target.value))}
                className="w-full accent-ew-purple"
              />
              <span className="text-[10px] text-slate-500">
                Execution speed of the autonomous simulation loop.
              </span>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={handleApplyRobustness}
                className="flex-1 py-2 rounded-lg bg-ew-cyan/20 border border-ew-cyan/50 text-ew-cyan font-bold hover:bg-ew-cyan/30 transition-all"
              >
                Apply Parameters
              </button>
              <button
                onClick={() => {
                  setNoiseFloor(-95);
                  setInterference(15);
                  setSpeedMs(400);
                }}
                className="px-3 py-2 rounded-lg bg-ew-surface border border-ew-border text-slate-400 hover:text-white transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tactical Anomaly & Stress Injection */}
        <div className="bg-ew-card border border-ew-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-ew-rose" />
            <h3 className="font-mono font-bold text-sm text-white">
              TACTICAL ANOMALY & STRESS INJECTION
            </h3>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Test the AI's resilience to sudden non-stationary spectrum shifts. Injects unexpected frequency breakouts into dormant bands, testing whether the anomaly detector prompts instant transition into Adaptive Exploration.
          </p>

          <div className="bg-ew-surface p-4 rounded-xl border border-ew-border space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Anomaly Status:</span>
              <span className={`px-2 py-0.5 rounded font-bold ${
                snapshot?.metrics?.anomaly_status === 'ADAPTIVE_EXPLORATION'
                  ? 'bg-ew-rose/20 text-ew-rose border border-ew-rose'
                  : 'bg-ew-card text-ew-emerald border border-ew-border'
              }`}>
                {snapshot?.metrics?.anomaly_status || 'NOMINAL'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Bayesian Surprise Score:</span>
              <span className="text-white font-bold">
                {snapshot?.metrics?.anomaly_score.toFixed(2) || '0.15'} / 1.00
              </span>
            </div>

            <button
              onClick={handleTriggerAnomaly}
              className="w-full py-2.5 rounded-lg bg-ew-rose/20 border border-ew-rose/60 text-ew-rose font-bold hover:bg-ew-rose/30 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Inject Hostile Frequency Breakout Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
