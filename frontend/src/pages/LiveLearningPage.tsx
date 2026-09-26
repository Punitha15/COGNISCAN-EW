import React from 'react';
import { 
  Workflow, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles 
} from 'lucide-react';
import { SimulationStateSnapshot } from '../types';

interface LiveLearningPageProps {
  snapshot: SimulationStateSnapshot | null;
}

export const LiveLearningPage: React.FC<LiveLearningPageProps> = ({ snapshot }) => {
  const events = snapshot?.recent_events || [];
  const logs = snapshot?.recent_logs || [];

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Header */}
      <div className="bg-ew-card border border-ew-border p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-ew-emerald" />
            <h2 className="text-base font-mono font-bold text-white">
              ONLINE HIT / MISS LEARNING & BELIEF REVISION STREAM
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            Observes real-time closed-loop parameter adaptation: <code className="text-ew-cyan">Observation ➔ Feedback ➔ Bayesian Update ➔ Model Convergence</code>.
          </p>
        </div>

        <div className="font-mono text-xs text-slate-400 bg-ew-surface px-3 py-1.5 rounded-lg border border-ew-border">
          LEARNING CYCLES LOGGED: <strong className="text-ew-emerald">{events.length}</strong>
        </div>
      </div>

      {/* Visual Learning Cycle Diagram */}
      <div className="bg-ew-surface border border-ew-border p-4 rounded-xl">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
          RECURSIVE BELIEF ADAPTATION PIPELINE
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 font-mono text-center text-xs">
          <div className="p-3 rounded-lg border border-slate-700 bg-ew-card">
            <span className="text-slate-400 block text-[10px]">STAGE 1</span>
            <span className="font-bold text-white">RECEIVER SCAN</span>
            <span className="text-[10px] text-slate-500 block mt-1">Dwell & Sample Channel</span>
          </div>

          <div className="p-3 rounded-lg border border-ew-cyan/40 bg-ew-card">
            <span className="text-ew-cyan block text-[10px]">STAGE 2</span>
            <span className="font-bold text-white">HIT / MISS DISCRIMINATOR</span>
            <span className="text-[10px] text-slate-500 block mt-1">Energy vs Threshold</span>
          </div>

          <div className="p-3 rounded-lg border border-ew-emerald/40 bg-ew-card">
            <span className="text-ew-emerald block text-[10px]">STAGE 3</span>
            <span className="font-bold text-white">BAYESIAN POSTERIOR</span>
            <span className="text-[10px] text-slate-500 block mt-1">Beta-Bernoulli Update</span>
          </div>

          <div className="p-3 rounded-lg border border-ew-purple/40 bg-ew-card">
            <span className="text-ew-purple block text-[10px]">STAGE 4</span>
            <span className="font-bold text-white">PATTERN LEARNING</span>
            <span className="text-[10px] text-slate-500 block mt-1">Hop Matrix + Autocorr</span>
          </div>

          <div className="p-3 rounded-lg border border-ew-amber/40 bg-ew-card">
            <span className="text-ew-amber block text-[10px]">STAGE 5</span>
            <span className="font-bold text-white">PRIORITY RE-INDEXING</span>
            <span className="text-[10px] text-slate-500 block mt-1">Whittle RMAB Policy</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Recent Learning Events Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            RECENT INTERCEPTION FEEDBACK EVENTS
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {events.length > 0 ? (
              events.slice().reverse().map((ev, idx) => {
                const isHit = ev.status === 'HIT';
                const isFA = ev.status === 'FALSE_ALARM';

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border font-mono text-xs flex items-center justify-between transition-all ${
                      isHit
                        ? 'bg-ew-emerald/10 border-ew-emerald/40 text-white'
                        : (isFA
                            ? 'bg-ew-amber/10 border-ew-amber/40 text-slate-200'
                            : 'bg-ew-card border-ew-border text-slate-400')
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {isHit ? (
                          <CheckCircle2 className="w-5 h-5 text-ew-emerald" />
                        ) : (isFA ? (
                          <AlertTriangle className="w-5 h-5 text-ew-amber" />
                        ) : (
                          <XCircle className="w-5 h-5 text-slate-600" />
                        ))}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{ev.band}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            isHit ? 'bg-ew-emerald/20 text-ew-emerald' : (isFA ? 'bg-ew-amber/20 text-ew-amber' : 'bg-slate-800 text-slate-400')
                          }`}>
                            {ev.status}
                          </span>
                          <span className="text-[10px] text-slate-500">Slot T+{ev.slot}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {isHit
                            ? `Interception confirmed (SNR: ${ev.snr_db} dB, Emitter: ${ev.emitter || 'Tactical'})`
                            : (isFA ? 'Noise burst threshold trigger' : 'No transmission detected')}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-bold block ${ev.delta >= 0 ? 'text-ew-emerald' : 'text-ew-rose'}`}>
                        {ev.delta >= 0 ? `+${ev.delta.toFixed(2)}` : ev.delta.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-500">Belief Δ</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs font-mono text-slate-500 border border-dashed border-ew-border rounded-xl">
                Awaiting initial receiver observations...
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Complete Telemetry Log Terminal */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            CHRONOLOGICAL SYSTEM TELEMETRY AUDIT
          </h3>

          <div className="bg-ew-card border border-ew-border rounded-xl p-4 font-mono text-xs text-slate-300 max-h-[500px] overflow-y-auto space-y-1.5 leading-relaxed">
            {logs.slice().reverse().map((line, idx) => (
              <div
                key={idx}
                className={`py-1 px-2 rounded border-l-2 transition-all ${
                  line.includes('HIT')
                    ? 'border-ew-emerald bg-ew-emerald/5 text-ew-emerald'
                    : (line.includes('ANOMALY')
                        ? 'border-ew-rose bg-ew-rose/10 text-ew-rose font-bold'
                        : (line.includes('MISS')
                            ? 'border-slate-700 text-slate-400'
                            : 'border-ew-cyan/50 text-slate-300'))
                }`}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
