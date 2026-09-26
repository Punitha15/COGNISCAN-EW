import React from 'react';
import { X, Radio, BarChart2, Clock, ShieldAlert, Cpu, Sparkles } from 'lucide-react';
import { BandState } from '../types';

interface BandInspectorModalProps {
  band: BandState | null;
  onClose: () => void;
  onTestWhatIf?: (bandId: string) => void;
}

export const BandInspectorModal: React.FC<BandInspectorModalProps> = ({ band, onClose, onTestWhatIf }) => {
  if (!band) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-ew-surface border border-ew-border rounded-xl max-w-lg w-full overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-ew-border bg-ew-card/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-ew-cyan/20 border border-ew-cyan/40 flex items-center justify-center text-ew-cyan font-mono font-bold text-sm">
              {band.band_id}
            </div>
            <div>
              <h3 className="font-mono font-bold text-white text-base">Channel Intelligence Deep Dive</h3>
              <p className="text-xs text-slate-400 font-mono">
                Center Freq: <span className="text-ew-cyan">{band.center_freq_mhz.toFixed(1)} MHz</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-ew-border text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Main Gauges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-ew-card border border-ew-border p-3 rounded-lg text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Priority Score</span>
              <span className="text-xl font-mono font-bold text-ew-cyan">
                {(band.priority_score * 100).toFixed(0)}%
              </span>
              <div className="w-full h-1 bg-ew-bg rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-ew-cyan" style={{ width: `${band.priority_score * 100}%` }} />
              </div>
            </div>

            <div className="bg-ew-card border border-ew-border p-3 rounded-lg text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Activity Belief</span>
              <span className="text-xl font-mono font-bold text-ew-emerald">
                {(band.activity_prob * 100).toFixed(1)}%
              </span>
              <div className="w-full h-1 bg-ew-bg rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-ew-emerald" style={{ width: `${band.activity_prob * 100}%` }} />
              </div>
            </div>

            <div className="bg-ew-card border border-ew-border p-3 rounded-lg text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Uncertainty (Entropy)</span>
              <span className="text-xl font-mono font-bold text-ew-amber">
                {band.uncertainty.toFixed(2)} <span className="text-[10px] font-normal">bits</span>
              </span>
              <div className="w-full h-1 bg-ew-bg rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-ew-amber" style={{ width: `${Math.min(100, band.uncertainty * 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Observations & History */}
          <div className="bg-ew-card/40 border border-ew-border rounded-lg p-3.5 space-y-2">
            <h4 className="text-xs font-mono text-slate-300 font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-ew-cyan" />
              Scan History & State-Space Parameters
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-mono">
              <div className="flex justify-between border-b border-ew-border/50 pb-1">
                <span className="text-slate-400">Last Observation:</span>
                <span className={`font-bold ${band.last_observed_state === 'HIT' ? 'text-ew-emerald' : (band.last_observed_state === 'MISS' ? 'text-ew-rose' : 'text-slate-500')}`}>
                  {band.last_observed_state}
                </span>
              </div>
              <div className="flex justify-between border-b border-ew-border/50 pb-1">
                <span className="text-slate-400">Total Intercepts:</span>
                <span className="text-white font-bold">{band.hit_count} hits</span>
              </div>
              <div className="flex justify-between border-b border-ew-border/50 pb-1">
                <span className="text-slate-400">Missed Scans:</span>
                <span className="text-white font-bold">{band.miss_count} misses</span>
              </div>
              <div className="flex justify-between border-b border-ew-border/50 pb-1">
                <span className="text-slate-400">Last Detection Slot:</span>
                <span className="text-white">{band.last_detection_slot > 0 ? `T+${band.last_detection_slot}` : 'Never'}</span>
              </div>
              <div className="flex justify-between border-b border-ew-border/50 pb-1">
                <span className="text-slate-400">Information Gain:</span>
                <span className="text-ew-cyan font-bold">{band.information_gain.toFixed(3)}</span>
              </div>
              <div className="flex justify-between border-b border-ew-border/50 pb-1">
                <span className="text-slate-400">Optimal Dwell:</span>
                <span className="text-ew-purple font-bold">{band.dwell_recommendation} slots</span>
              </div>
            </div>
          </div>

          {/* Timing Prediction */}
          <div className="bg-ew-card/40 border border-ew-border rounded-lg p-3.5 space-y-1">
            <h4 className="text-xs font-mono text-slate-300 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-ew-amber" />
              WHERE + WHEN Forecast
            </h4>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Next Expected Transmission:</span>
              <span className="text-white font-bold">
                {band.expected_time_to_tx !== null ? `T + ${band.expected_time_to_tx} slots` : 'Aperiodic / Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Predicted Next Probability:</span>
              <span className="text-ew-cyan font-bold">{(band.predicted_next_activity * 100).toFixed(1)}%</span>
            </div>
          </div>

          {/* Ground Truth Section (Research Simulation Disclosure) */}
          <div className="border border-dashed border-ew-border/80 bg-ew-bg/50 p-3 rounded-lg text-xs font-mono">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
              [Digital Twin Ground Truth]
            </span>
            <div className="flex justify-between text-slate-400">
              <span>Active Emitters:</span>
              <span className={band.ground_truth_active ? 'text-ew-emerald font-bold' : 'text-slate-500'}>
                {band.active_emitter_ids.length > 0 ? band.active_emitter_ids.join(', ') : 'None (Silent)'}
              </span>
            </div>
            <div className="flex justify-between text-slate-400 mt-1">
              <span>Ground Truth SNR:</span>
              <span className="text-white">{band.ground_truth_snr_db.toFixed(1)} dB</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-ew-border bg-ew-card/30 flex justify-end gap-2">
          {onTestWhatIf && (
            <button
              onClick={() => {
                onTestWhatIf(band.band_id);
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-ew-cyan/20 border border-ew-cyan/40 text-ew-cyan font-mono text-xs font-bold hover:bg-ew-cyan/30 transition-all"
            >
              Analyze in What-If Lab
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-ew-card border border-ew-border text-slate-300 font-mono text-xs hover:bg-ew-border transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
