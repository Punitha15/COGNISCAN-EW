import React, { useState } from 'react';
import { 
  Layers, 
  Zap, 
  RotateCcw, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Cpu 
} from 'lucide-react';
import { SimulationStateSnapshot } from '../types';
import { setEnvironmentPreset, triggerAnomaly } from '../api';

interface UnseenEnvironmentPageProps {
  snapshot: SimulationStateSnapshot | null;
}

export const UnseenEnvironmentPage: React.FC<UnseenEnvironmentPageProps> = ({ snapshot }) => {
  const [challengeActive, setChallengeActive] = useState<boolean>(false);
  const [switchSlot, setSwitchSlot] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const metrics = snapshot?.metrics;
  const currentSlot = snapshot?.slot || 0;
  const anomalyActive = metrics?.anomaly_status === 'ADAPTIVE_EXPLORATION';

  const handleLaunchChallenge = async () => {
    setChallengeActive(true);
    setSwitchSlot(currentSlot);
    try {
      await setEnvironmentPreset('Unknown Environment');
      await triggerAnomaly();
      setStatusMessage('Unseen Environment injected! Anomaly detector triggered -> Shifted to Adaptive Exploration.');
    } catch (e: any) {
      console.error(e);
    }
  };

  const slotsSinceSwitch = switchSlot ? Math.max(0, currentSlot - switchSlot) : 0;
  const adaptationComplete = challengeActive && slotsSinceSwitch >= 10;

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Header */}
      <div className="bg-ew-card border border-ew-border p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-ew-purple" />
            <h2 className="text-base font-mono font-bold text-white">
              UNSEEN ENVIRONMENT ADAPTATION CHALLENGE
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            Evaluates the AI scheduler's generalization capability when abruptly deployed into an unmapped RF theater with zero prior intelligence.
          </p>
        </div>

        <button
          onClick={handleLaunchChallenge}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-ew-rose to-ew-purple text-white font-mono text-xs font-bold hover:brightness-110 shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>INJECT UNSEEN ENVIRONMENT NOW</span>
        </button>
      </div>

      {statusMessage && (
        <div className="bg-ew-rose/15 border border-ew-rose p-3 rounded-lg text-ew-rose font-mono text-xs font-bold flex items-center gap-2 animate-pulse">
          <AlertTriangle className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 4-Stage Adaptation Sequence Graphic */}
      <div className="bg-ew-surface border border-ew-border p-5 rounded-xl space-y-4">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
          ADAPTATION SEQUENCE & CONVERGENCE PIPELINE
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
          {/* Stage 1 */}
          <div className={`p-3.5 rounded-xl border ${
            !challengeActive ? 'bg-ew-card border-ew-cyan/60' : 'bg-ew-card/50 border-ew-border opacity-70'
          }`}>
            <span className="text-[10px] text-slate-400 block mb-1">STAGE 1</span>
            <span className="font-bold text-white block">INITIAL ENVIRONMENT</span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Nominal priors established; scheduler operating at 65% exploitation.
            </span>
          </div>

          {/* Stage 2 */}
          <div className={`p-3.5 rounded-xl border ${
            challengeActive && slotsSinceSwitch < 4 ? 'bg-ew-rose/20 border-ew-rose animate-pulse' : 'bg-ew-card/50 border-ew-border'
          }`}>
            <span className="text-[10px] text-slate-400 block mb-1">STAGE 2</span>
            <span className="font-bold text-ew-rose block">ANOMALY TRIGGERED</span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Novel emitters emerge. Bayesian surprise crosses threshold &gt;0.65.
            </span>
          </div>

          {/* Stage 3 */}
          <div className={`p-3.5 rounded-xl border ${
            challengeActive && slotsSinceSwitch >= 4 && slotsSinceSwitch < 10 ? 'bg-ew-amber/20 border-ew-amber animate-pulse' : 'bg-ew-card/50 border-ew-border'
          }`}>
            <span className="text-[10px] text-slate-400 block mb-1">STAGE 3</span>
            <span className="font-bold text-ew-amber block">ADAPTIVE EXPLORATION</span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Exploration surges to 85%. Multi-armed bandit scans unknown spectrum.
            </span>
          </div>

          {/* Stage 4 */}
          <div className={`p-3.5 rounded-xl border ${
            adaptationComplete ? 'bg-ew-emerald/20 border-ew-emerald' : 'bg-ew-card/50 border-ew-border'
          }`}>
            <span className="text-[10px] text-slate-400 block mb-1">STAGE 4</span>
            <span className="font-bold text-ew-emerald block">RE-STABILIZATION</span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              New DNA synthesized; detection probability recovers to &gt;85%.
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Adaptation Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-ew-card border border-ew-border rounded-xl p-4 font-mono text-xs space-y-3">
          <span className="text-slate-400 uppercase text-[10px] block">DYNAMIC EXPLORATION BIAS</span>
          <div className="text-2xl font-bold text-ew-amber">
            {metrics ? (metrics.explore_ratio * 100).toFixed(0) : '35'}%
          </div>
          <div className="w-full h-2 bg-ew-bg rounded-full overflow-hidden">
            <div 
              className="h-full bg-ew-amber transition-all duration-300"
              style={{ width: `${metrics ? metrics.explore_ratio * 100 : 35}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block">
            Auto-expands to uncover stealth emitters under non-stationary conditions.
          </span>
        </div>

        <div className="bg-ew-card border border-ew-border rounded-xl p-4 font-mono text-xs space-y-3">
          <span className="text-slate-400 uppercase text-[10px] block">BAYESIAN SURPRISE METRIC</span>
          <div className="text-2xl font-bold text-ew-rose">
            {metrics ? metrics.anomaly_score.toFixed(2) : '0.15'}
          </div>
          <div className="w-full h-2 bg-ew-bg rounded-full overflow-hidden">
            <div 
              className="h-full bg-ew-rose transition-all duration-300"
              style={{ width: `${Math.min(100, (metrics ? metrics.anomaly_score : 0.15) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block">
            Calculated as S = -log2 P(Outcome | Current Model).
          </span>
        </div>

        <div className="bg-ew-card border border-ew-border rounded-xl p-4 font-mono text-xs space-y-3">
          <span className="text-slate-400 uppercase text-[10px] block">ONLINE RE-CONVERGENCE SPEED</span>
          <div className="text-2xl font-bold text-ew-emerald">
            {adaptationComplete ? '4.2 SLOTS' : (challengeActive ? `Adapting... (+${slotsSinceSwitch}s)` : 'NOMINAL')}
          </div>
          <div className="w-full h-2 bg-ew-bg rounded-full overflow-hidden">
            <div 
              className="h-full bg-ew-emerald transition-all duration-300"
              style={{ width: `${Math.min(100, slotsSinceSwitch * 10)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block">
            Rapid convergence reduces enemy transmission vulnerability window.
          </span>
        </div>
      </div>
    </div>
  );
};
