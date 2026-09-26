import React from 'react';
import { 
  Cpu, 
  Target, 
  Zap, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Scale, 
  Layers,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { SimulationStateSnapshot } from '../types';

interface CognitiveSchedulerPageProps {
  snapshot: SimulationStateSnapshot | null;
}

export const CognitiveSchedulerPage: React.FC<CognitiveSchedulerPageProps> = ({ snapshot }) => {
  const decision = snapshot?.current_decision;
  const metrics = snapshot?.metrics;
  const candidates = decision?.candidate_actions || [];
  const counterfactuals = decision?.counterfactual_analyses || [];

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Header */}
      <div className="bg-ew-card border border-ew-border p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-ew-cyan" />
            <h2 className="text-base font-mono font-bold text-white">
              COGNITIVE SCHEDULER & RESTLESS BANDIT AI BRAIN
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            Dynamically solves: <strong className="text-ew-cyan">WHERE</strong> to scan, <strong className="text-ew-emerald">WHEN</strong> to scan, <strong className="text-ew-purple">HOW LONG</strong> to dwell, and whether to <strong className="text-ew-amber">EXPLORE vs EXPLOIT</strong>.
          </p>
        </div>

        {/* Dynamic Explore/Exploit Tag */}
        <div className="flex items-center gap-3 bg-ew-surface px-4 py-2 rounded-lg border border-ew-border">
          <div className="text-center font-mono">
            <span className="text-[10px] text-slate-400 block">EXPLORE</span>
            <span className="text-sm font-bold text-ew-amber">{decision?.explore_pct || 35}%</span>
          </div>
          <div className="w-20 h-2 bg-ew-bg rounded-full overflow-hidden flex border border-ew-border">
            <div className="h-full bg-ew-amber" style={{ width: `${decision?.explore_pct || 35}%` }} />
            <div className="h-full bg-ew-cyan" style={{ width: `${decision?.exploit_pct || 65}%` }} />
          </div>
          <div className="text-center font-mono">
            <span className="text-[10px] text-slate-400 block">EXPLOIT</span>
            <span className="text-sm font-bold text-ew-cyan">{decision?.exploit_pct || 65}%</span>
          </div>
        </div>
      </div>

      {/* Visual Cognitive Closed-Loop Workflow */}
      <div className="bg-ew-surface border border-ew-border p-4 rounded-xl">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
          CENTRAL COGNITIVE INTERCEPTION LOOP
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 font-mono text-center text-xs">
          {[
            { step: '1. OBSERVE', desc: 'RF Digital Twin', color: 'border-slate-700 text-slate-300' },
            { step: '2. PREDICT', desc: 'WHERE + WHEN', color: 'border-ew-cyan/60 text-ew-cyan' },
            { step: '3. PRIORITIZE', desc: 'RMAB Utility', color: 'border-blue-600/60 text-blue-300' },
            { step: '4. SCHEDULE', desc: 'Band + Dwell', color: 'border-ew-purple/60 text-ew-purple' },
            { step: '5. SCAN', desc: 'Receiver Sensor', color: 'border-slate-700 text-slate-300' },
            { step: '6. HIT/MISS', desc: 'Binary Feedback', color: 'border-ew-emerald/60 text-ew-emerald' },
            { step: '7. LEARN', desc: 'Bayes Update', color: 'border-ew-amber/60 text-ew-amber' },
            { step: '8. RE-SCHEDULE', desc: 'Loop Closed', color: 'border-ew-cyan/80 text-white font-bold bg-ew-cyan/10' },
          ].map((item, idx) => (
            <div key={idx} className={`p-2.5 rounded-lg border bg-ew-card ${item.color} flex flex-col justify-center`}>
              <span className="font-bold text-[11px] block">{item.step}</span>
              <span className="text-[10px] opacity-75 mt-0.5">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Current Scheduling Decision Breakdown */}
      <div className="bg-ew-card border border-ew-border rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-ew-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-ew-cyan/20 border border-ew-cyan/50 flex items-center justify-center font-mono font-black text-xl text-ew-cyan shadow-[0_0_15px_rgba(0,240,255,0.25)]">
              {decision?.selected_band || 'B01'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-white text-base">SCHEDULED SCAN TARGET</span>
                <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-ew-surface border border-ew-border text-ew-cyan font-bold">
                  Dwell: {decision?.dwell_slots || 1} slots
                </span>
                <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-ew-surface border border-ew-border text-ew-amber font-bold">
                  {decision?.explore_exploit_mode || 'EXPLOIT'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Expected Reward: <strong className="text-ew-emerald">{((decision?.expected_reward || 0) * 100).toFixed(0)}%</strong> | Info Gain: <strong className="text-ew-cyan">{decision?.information_gain.toFixed(2) || '0.00'}</strong> | Confidence: <strong className="text-white">{((decision?.confidence || 0) * 100).toFixed(0)}%</strong>
              </p>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block">NET OPTIMIZATION UTILITY</span>
            <span className="text-2xl font-black text-ew-purple">
              {decision?.net_utility.toFixed(3) || '0.000'}
            </span>
          </div>
        </div>

        {/* Explainability Callout */}
        <div className="bg-ew-surface p-4 rounded-xl border border-ew-border space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-ew-cyan">
            <Sparkles className="w-4 h-4" />
            <span>AI SCHEDULER RATIONALE</span>
          </div>
          <p className="text-sm font-sans text-slate-200 leading-relaxed">
            {decision?.reason || 'Optimizing detection probability against exploration uncertainty reduction.'}
          </p>
        </div>
      </div>

      {/* Section 13: Candidate Scan Actions Table */}
      <div className="bg-ew-card border border-ew-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-ew-cyan" />
            <h3 className="font-mono font-bold text-sm text-white">
              CANDIDATE SCAN ACTIONS & UTILITY OPTIMIZATION
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Utility = E[Detection] + β·InfoGain − γ·Cost
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-ew-border text-slate-400 bg-ew-surface/60">
                <th className="py-2.5 px-3">CHANNEL</th>
                <th className="py-2.5 px-3">FREQUENCY</th>
                <th className="py-2.5 px-3">DETECTION PROB</th>
                <th className="py-2.5 px-3">INFORMATION GAIN</th>
                <th className="py-2.5 px-3">SCAN COST</th>
                <th className="py-2.5 px-3">DWELL</th>
                <th className="py-2.5 px-3">NET UTILITY</th>
                <th className="py-2.5 px-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ew-border/50">
              {candidates.map((action, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    action.selected
                      ? 'bg-ew-cyan/15 text-white font-bold'
                      : 'hover:bg-ew-surface/40 text-slate-300'
                  }`}
                >
                  <td className="py-2.5 px-3 flex items-center gap-2">
                    <span className="text-white font-bold">{action.band}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{action.freq_mhz.toFixed(0)} MHz</td>
                  <td className="py-2.5 px-3 text-ew-emerald">{(action.detection * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-ew-cyan">{action.information_gain.toFixed(3)}</td>
                  <td className="py-2.5 px-3 text-slate-400">{action.cost.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-ew-purple">{action.dwell} slots</td>
                  <td className="py-2.5 px-3 text-white font-bold text-sm">
                    {action.utility.toFixed(3)}
                  </td>
                  <td className="py-2.5 px-3">
                    {action.selected ? (
                      <span className="px-2 py-0.5 rounded bg-ew-cyan text-black font-bold text-[10px] shadow-[0_0_8px_#00f0ff]">
                        SELECTED
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Candidate</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 14: Counterfactual Scan Engine ("What If?") */}
      <div className="bg-ew-card border border-ew-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-ew-amber" />
          <h3 className="font-mono font-bold text-sm text-white">
            COUNTERFACTUAL SCAN ENGINE: "WHAT IF WE SCANNED AN ALTERNATIVE BAND?"
          </h3>
        </div>
        <p className="text-xs text-slate-300 font-sans">
          Simulated outcomes comparing counterfactual choices against the scheduler's selected action:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {counterfactuals.map((cf, idx) => (
            <div key={idx} className="bg-ew-surface p-3.5 rounded-xl border border-ew-border space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-ew-border/60">
                <span className="font-bold text-white">What if: {cf.alternative_band}?</span>
                <span className="text-ew-rose font-bold">{cf.utility_delta.toFixed(2)} Utility</span>
              </div>
              <p className="text-xs font-sans text-slate-300 leading-normal">
                {cf.rationale}
              </p>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>P(Hit): {(cf.expected_detection_prob * 100).toFixed(0)}%</span>
                <span>Info Gain: {cf.expected_info_gain.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
