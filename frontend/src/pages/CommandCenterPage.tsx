import React from 'react';
import { 
  Activity, 
  Target, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Cpu, 
  Zap, 
  BarChart2, 
  Radio, 
  ChevronRight,
  TrendingUp,
  Crosshair,
  Sparkles
} from 'lucide-react';
import { SimulationStateSnapshot, BandState } from '../types';

interface CommandCenterPageProps {
  snapshot: SimulationStateSnapshot | null;
  onSelectBand: (band: BandState) => void;
  onNavigateTab: (tab: string) => void;
}

export const CommandCenterPage: React.FC<CommandCenterPageProps> = ({
  snapshot,
  onSelectBand,
  onNavigateTab,
}) => {
  const metrics = snapshot?.metrics;
  const decision = snapshot?.current_decision;
  const lastResult = snapshot?.last_scan_result;
  const bands = snapshot?.bands || [];

  const pdPct = metrics ? (metrics.probability_of_detection_pd * 100).toFixed(1) : '0.0';
  const pfaPct = metrics ? (metrics.probability_of_false_alarm_pfa * 100).toFixed(2) : '0.00';
  const intRatioPct = metrics ? (metrics.interception_ratio * 100).toFixed(1) : '0.0';
  const avgLatency = metrics ? metrics.avg_intercept_time_slots.toFixed(1) : '0.0';

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Central Philosophy Hero Strip */}
      <div className="bg-gradient-to-r from-ew-card via-ew-surface to-ew-card border border-ew-border p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-ew-cyan/15 border border-ew-cyan/30 text-ew-cyan">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-mono font-bold text-white tracking-wide">
              COGNITIVE RECURSIVE SCANNING ENGINE
            </h2>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              Continuously balances <strong className="text-ew-cyan">Information Gain</strong>, <strong className="text-ew-emerald">Interception Probability</strong>, and <strong className="text-ew-purple">Adaptive Dwell</strong> without blind sweeping.
            </p>
          </div>
        </div>

        {/* Dynamic Explore vs Exploit Pill */}
        <div className="flex items-center gap-3 bg-ew-bg/80 border border-ew-border px-4 py-2 rounded-lg">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400">EXPLORE</span>
            <span className="text-xs font-mono font-bold text-ew-amber">
              {metrics ? (metrics.explore_ratio * 100).toFixed(0) : '35'}%
            </span>
          </div>
          <div className="w-24 h-2 bg-ew-surface border border-ew-border rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-ew-amber transition-all duration-300"
              style={{ width: `${metrics ? metrics.explore_ratio * 100 : 35}%` }}
              title="Exploration Ratio"
            />
            <div 
              className="h-full bg-ew-cyan transition-all duration-300"
              style={{ width: `${metrics ? metrics.exploit_ratio * 100 : 65}%` }}
              title="Exploitation Ratio"
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400">EXPLOIT</span>
            <span className="text-xs font-mono font-bold text-ew-cyan">
              {metrics ? (metrics.exploit_ratio * 100).toFixed(0) : '65'}%
            </span>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Pd */}
        <div className="bg-ew-card border border-ew-border p-3.5 rounded-xl hover:border-ew-cyan/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>Pd (DETECTION)</span>
            <Crosshair className="w-3.5 h-3.5 text-ew-cyan" />
          </div>
          <div className="text-2xl font-mono font-bold text-white tracking-tight">
            {pdPct}<span className="text-sm font-normal text-ew-cyan">%</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            {metrics?.total_hits ?? 0} hits / {(metrics?.total_hits ?? 0) + (metrics?.missed_detections ?? 0)} signals
          </span>
        </div>

        {/* Pfa */}
        <div className="bg-ew-card border border-ew-border p-3.5 rounded-xl hover:border-ew-rose/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>Pfa (FALSE ALARM)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-ew-rose" />
          </div>
          <div className="text-2xl font-mono font-bold text-white tracking-tight">
            {pfaPct}<span className="text-sm font-normal text-ew-rose">%</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            {metrics?.false_alarms ?? 0} false triggers
          </span>
        </div>

        {/* Interception Ratio */}
        <div className="bg-ew-card border border-ew-border p-3.5 rounded-xl hover:border-ew-emerald/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>INTERCEPT RATIO</span>
            <ShieldCheck className="w-3.5 h-3.5 text-ew-emerald" />
          </div>
          <div className="text-2xl font-mono font-bold text-white tracking-tight">
            {intRatioPct}<span className="text-sm font-normal text-ew-emerald">%</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            Vs {metrics?.total_ground_truth_transmissions ?? 0} ground-truth tx
          </span>
        </div>

        {/* Mean Intercept Time */}
        <div className="bg-ew-card border border-ew-border p-3.5 rounded-xl hover:border-ew-purple/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>INTERCEPT TIME</span>
            <Clock className="w-3.5 h-3.5 text-ew-purple" />
          </div>
          <div className="text-2xl font-mono font-bold text-white tracking-tight">
            {avgLatency} <span className="text-xs font-normal text-slate-400">slots</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            Mean detection latency
          </span>
        </div>

        {/* Cumulative Reward */}
        <div className="bg-ew-card border border-ew-border p-3.5 rounded-xl hover:border-ew-amber/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>CUMULATIVE REWARD</span>
            <TrendingUp className="w-3.5 h-3.5 text-ew-amber" />
          </div>
          <div className="text-2xl font-mono font-bold text-white tracking-tight">
            {metrics?.cumulative_reward.toFixed(1) ?? '0.0'}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            Bandit policy utility
          </span>
        </div>

        {/* Spectrum Coverage */}
        <div className="bg-ew-card border border-ew-border p-3.5 rounded-xl hover:border-ew-blue/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>SPECTRUM COVERAGE</span>
            <Radio className="w-3.5 h-3.5 text-ew-blue" />
          </div>
          <div className="text-2xl font-mono font-bold text-white tracking-tight">
            {metrics?.spectrum_coverage_pct.toFixed(0) ?? '0'}<span className="text-sm font-normal text-ew-blue">%</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            Entropy: {metrics?.entropy_spectrum_bits.toFixed(2) ?? '0.85'} bits
          </span>
        </div>
      </div>

      {/* Main Operations Split: Live Receiver Decision & Explainable Rationale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Live Target & Explainable AI */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Target Banner */}
          <div className="bg-ew-card border border-ew-border rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-ew-cyan/5 rounded-bl-full pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-ew-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-ew-cyan/20 border border-ew-cyan/60 flex items-center justify-center font-mono font-black text-xl text-ew-cyan shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                  {decision?.selected_band || 'B01'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono font-bold text-white text-base">ACTIVE SCAN CHANNEL</h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      decision?.explore_exploit_mode === 'EXPLORE' ? 'bg-ew-amber/20 text-ew-amber border border-ew-amber/40' : 'bg-ew-cyan/20 text-ew-cyan border border-ew-cyan/40'
                    }`}>
                      {decision?.explore_exploit_mode || 'EXPLOIT'} MODE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Dwell Allocation: <strong className="text-white">{decision?.dwell_slots || 1} slots</strong> | Center Freq: <strong className="text-ew-cyan">{bands.find(b => b.band_id === decision?.selected_band)?.center_freq_mhz.toFixed(1) || '2450.0'} MHz</strong>
                  </p>
                </div>
              </div>

              {/* Last Scan Status Pill */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">LAST SCAN:</span>
                <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                  lastResult?.is_hit && !lastResult?.false_alarm
                    ? 'bg-ew-emerald/20 text-ew-emerald border-ew-emerald/50'
                    : (lastResult?.false_alarm
                        ? 'bg-ew-amber/20 text-ew-amber border-ew-amber/50'
                        : 'bg-ew-card text-slate-400 border-ew-border')
                }`}>
                  {lastResult?.is_hit && !lastResult?.false_alarm ? `HIT (+${lastResult.belief_delta.toFixed(2)})` : (lastResult?.false_alarm ? 'FALSE ALARM' : 'MISS')}
                </span>
              </div>
            </div>

            {/* Explainable AI: "WHY THIS BAND?" */}
            <div className="pt-4 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-ew-cyan">
                <Sparkles className="w-4 h-4" />
                <span>EXPLAINABLE AI: WHY DID THE SCHEDULER CHOOSE THIS BAND?</span>
              </div>
              <p className="text-sm text-slate-200 font-sans leading-relaxed bg-ew-surface/70 p-3 rounded-lg border border-ew-border">
                {decision?.reason || 'Balancing anticipated signal transmission probability with maximum reduction of spectral entropy.'}
              </p>

              {/* Evidence Checklist */}
              {decision?.supporting_evidence && decision.supporting_evidence.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {decision.supporting_evidence.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-mono text-slate-300 bg-ew-bg/50 px-2.5 py-1.5 rounded border border-ew-border/50">
                      <span className="text-ew-emerald font-bold">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Math Utility Metrics */}
            <div className="grid grid-cols-4 gap-2 pt-4 mt-4 border-t border-ew-border/60 text-center font-mono">
              <div className="bg-ew-bg/60 p-2 rounded">
                <span className="text-[10px] text-slate-400 block">P(DETECT)</span>
                <span className="text-sm font-bold text-ew-emerald">
                  {decision ? (decision.expected_reward * 100).toFixed(0) : '0'}%
                </span>
              </div>
              <div className="bg-ew-bg/60 p-2 rounded">
                <span className="text-[10px] text-slate-400 block">INFO GAIN</span>
                <span className="text-sm font-bold text-ew-cyan">
                  {decision?.information_gain.toFixed(2) ?? '0.00'}
                </span>
              </div>
              <div className="bg-ew-bg/60 p-2 rounded">
                <span className="text-[10px] text-slate-400 block">SCAN COST</span>
                <span className="text-sm font-bold text-slate-400">
                  {decision?.scan_cost.toFixed(2) ?? '0.10'}
                </span>
              </div>
              <div className="bg-ew-bg/60 p-2 rounded">
                <span className="text-[10px] text-slate-400 block">NET UTILITY</span>
                <span className="text-sm font-bold text-ew-purple">
                  {decision?.net_utility.toFixed(2) ?? '0.75'}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Spectrum Heatmap Mini View */}
          <div className="bg-ew-card border border-ew-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-ew-cyan" />
                <h3 className="font-mono font-bold text-sm text-white">LIVE SPECTRUM ATTENTION GRID (64 BANDS)</h3>
              </div>
              <button
                onClick={() => onNavigateTab('spectrum')}
                className="text-xs font-mono text-ew-cyan hover:underline flex items-center gap-1"
              >
                <span>Full Heatmap View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Grid of 64 Bands */}
            <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 pt-1">
              {bands.map((b) => {
                const isCurrent = b.band_id === decision?.selected_band;
                const isHit = b.last_observed_state === 'HIT';
                const p = b.priority_score;

                // Priority coloring
                let bgClass = 'bg-slate-900 border-slate-800 text-slate-400';
                if (p > 0.70) bgClass = 'bg-ew-cyan/25 border-ew-cyan text-white shadow-[0_0_8px_rgba(0,240,255,0.3)]';
                else if (p > 0.40) bgClass = 'bg-blue-900/30 border-blue-600/40 text-blue-200';
                else if (p > 0.20) bgClass = 'bg-slate-800/60 border-slate-700/60 text-slate-400';

                return (
                  <button
                    key={b.band_id}
                    onClick={() => onSelectBand(b)}
                    title={`${b.band_id} | Priority: ${(p*100).toFixed(0)}% | P(Act): ${(b.activity_prob*100).toFixed(0)}%`}
                    className={`relative p-1.5 rounded flex flex-col items-center justify-center border font-mono text-[10px] transition-all hover:scale-105 ${bgClass} ${
                      isCurrent ? 'ring-2 ring-ew-purple animate-pulse' : ''
                    }`}
                  >
                    <span className="font-bold">{b.band_id}</span>
                    <span className="text-[9px] opacity-75">{(p*100).toFixed(0)}%</span>
                    {isHit && (
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-ew-emerald" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Tactical Log Stream & Discovered Threats */}
        <div className="space-y-4">
          {/* Discovered Emitters Mini Summary */}
          <div className="bg-ew-card border border-ew-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-ew-rose" />
                <h3 className="font-mono font-bold text-sm text-white">EMITTER PROFILES</h3>
              </div>
              <button
                onClick={() => onNavigateTab('emitters')}
                className="text-xs font-mono text-ew-rose hover:underline flex items-center gap-1"
              >
                <span>DNA Lab</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {snapshot?.emitters && snapshot.emitters.length > 0 ? (
                snapshot.emitters.slice(0, 4).map((em) => (
                  <div
                    key={em.emitter_id}
                    className="p-2.5 rounded-lg bg-ew-surface border border-ew-border hover:border-slate-600 transition-all font-mono text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{em.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-ew-card border border-ew-border text-ew-cyan">
                          {em.behavior_classification}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {em.detection_count} intercepts | Bands: {em.observed_bands.slice(0, 3).join(', ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-ew-emerald font-bold block">
                        {(em.confidence * 100).toFixed(0)}% Conf
                      </span>
                      {em.detected_periodicity && (
                        <span className="text-[10px] text-slate-400">T_p={em.detected_periodicity}s</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs font-mono text-slate-500 border border-dashed border-ew-border rounded-lg">
                  No emitters fingerprinted yet. Commencing spectrum surveillance...
                </div>
              )}
            </div>
          </div>

          {/* Real-Time Learning Stream */}
          <div className="bg-ew-card border border-ew-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-ew-emerald" />
                <h3 className="font-mono font-bold text-sm text-white">LIVE COGNITIVE LOG</h3>
              </div>
              <button
                onClick={() => onNavigateTab('live-learning')}
                className="text-xs font-mono text-ew-emerald hover:underline flex items-center gap-1"
              >
                <span>Full Stream</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 font-mono text-[11px] max-h-60 overflow-y-auto pr-1">
              {snapshot?.recent_logs && snapshot.recent_logs.length > 0 ? (
                snapshot.recent_logs.slice(-8).reverse().map((entry, idx) => {
                  const isHit = entry.includes('HIT');
                  const isAnomaly = entry.includes('ANOMALY');
                  const isMiss = entry.includes('MISS');

                  return (
                    <div
                      key={idx}
                      className={`p-1.5 rounded border transition-all ${
                        isAnomaly
                          ? 'bg-ew-rose/15 border-ew-rose text-ew-rose'
                          : (isHit
                              ? 'bg-ew-emerald/10 border-ew-emerald/30 text-ew-emerald'
                              : (isMiss ? 'bg-ew-surface border-ew-border text-slate-400' : 'bg-ew-surface border-ew-border text-slate-300'))
                      }`}
                    >
                      {entry}
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-500 text-xs">Waiting for telemetry frames...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
