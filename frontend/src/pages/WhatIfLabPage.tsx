import React, { useState } from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Calculator, 
  Scale, 
  TrendingUp, 
  Clock 
} from 'lucide-react';
import { SimulationStateSnapshot } from '../types';
import { evaluateWhatIf } from '../api';

interface WhatIfLabPageProps {
  snapshot: SimulationStateSnapshot | null;
  initialBand?: string;
}

export const WhatIfLabPage: React.FC<WhatIfLabPageProps> = ({ snapshot, initialBand = 'B12' }) => {
  const [selectedBand, setSelectedBand] = useState<string>(initialBand);
  const [dwellSlots, setDwellSlots] = useState<number>(2);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const bands = snapshot?.bands || [];
  const currentScheduled = snapshot?.current_decision?.selected_band || 'B01';
  const currentUtility = snapshot?.current_decision?.net_utility || 0.75;

  const handleEvaluate = async (band: string = selectedBand, dwell: number = dwellSlots) => {
    setIsCalculating(true);
    try {
      const res = await evaluateWhatIf(band, dwell);
      setAnalysisResult(res);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Header */}
      <div className="bg-ew-card border border-ew-border p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-ew-amber" />
            <h2 className="text-base font-mono font-bold text-white">
              WHAT-IF LAB & COUNTERFACTUAL SCAN EVALUATOR
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            Interactively simulate alternative receiver scan actions and mathematically verify why the Cognitive Scheduler's chosen band maximizes utility.
          </p>
        </div>

        <div className="font-mono text-xs text-slate-400 bg-ew-surface px-3 py-1.5 rounded-lg border border-ew-border">
          AI CHOSEN TARGET: <strong className="text-ew-cyan">{currentScheduled}</strong> (Utility: <strong className="text-ew-purple">{currentUtility.toFixed(3)}</strong>)
        </div>
      </div>

      {/* Interactive Evaluation Form */}
      <div className="bg-ew-surface border border-ew-border p-5 rounded-xl space-y-4">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
          HYPOTHETICAL SCAN CONFIGURATION
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          {/* Band Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-400">Target Candidate Band:</label>
            <select
              value={selectedBand}
              onChange={(e) => setSelectedBand(e.target.value)}
              className="w-full bg-ew-card border border-ew-border px-3 py-2 rounded-lg text-white font-bold outline-none focus:border-ew-cyan"
            >
              {bands.map((b) => (
                <option key={b.band_id} value={b.band_id} className="bg-ew-card text-white">
                  {b.band_id} ({b.center_freq_mhz.toFixed(0)} MHz) - P: {(b.activity_prob*100).toFixed(0)}%
                </option>
              ))}
            </select>
          </div>

          {/* Dwell Allocation */}
          <div className="space-y-1.5">
            <label className="text-slate-400">Hypothetical Dwell Time:</label>
            <select
              value={dwellSlots}
              onChange={(e) => setDwellSlots(parseInt(e.target.value))}
              className="w-full bg-ew-card border border-ew-border px-3 py-2 rounded-lg text-white font-bold outline-none focus:border-ew-purple"
            >
              <option value="1">1 Slot (Rapid Sweep)</option>
              <option value="2">2 Slots (Balanced)</option>
              <option value="3">3 Slots (Extended Surveillance)</option>
              <option value="4">4 Slots (Deep Listen)</option>
              <option value="5">5 Slots (Maximum Persistence)</option>
            </select>
          </div>

          {/* Action Button */}
          <div className="flex items-end">
            <button
              onClick={() => handleEvaluate(selectedBand, dwellSlots)}
              disabled={isCalculating}
              className="w-full py-2.5 rounded-lg bg-ew-amber/20 border border-ew-amber/60 text-ew-amber font-bold hover:bg-ew-amber/30 transition-all flex items-center justify-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              <span>{isCalculating ? 'Computing...' : 'Evaluate Counterfactual'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Counterfactual Comparison Result */}
      {analysisResult ? (
        <div className="bg-ew-card border border-ew-border rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-ew-border">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-sm font-bold text-white">EVALUATION RESULT FOR:</span>
              <span className="px-2.5 py-1 rounded bg-ew-surface border border-ew-border text-ew-cyan font-bold text-base">
                {analysisResult.band}
              </span>
              <span className="text-xs text-slate-400">
                ({analysisResult.dwell_slots} slot dwell)
              </span>
            </div>

            {/* Utility Delta Tag */}
            <div className="font-mono text-xs">
              <span className="text-slate-400">Utility vs Scheduled: </span>
              <span className={`font-bold ${analysisResult.net_utility >= currentUtility ? 'text-ew-emerald' : 'text-ew-rose'}`}>
                {(analysisResult.net_utility - currentUtility).toFixed(3)}
              </span>
            </div>
          </div>

          {/* Metrics Comparison Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="bg-ew-surface p-3 rounded-lg border border-ew-border text-center">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">Expected P(Detection)</span>
              <span className="text-xl font-bold text-ew-emerald">
                {(analysisResult.activity_prob * 100).toFixed(1)}%
              </span>
            </div>

            <div className="bg-ew-surface p-3 rounded-lg border border-ew-border text-center">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">Information Gain</span>
              <span className="text-xl font-bold text-ew-cyan">
                {analysisResult.information_gain.toFixed(3)}
              </span>
            </div>

            <div className="bg-ew-surface p-3 rounded-lg border border-ew-border text-center">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">Scan Cost</span>
              <span className="text-xl font-bold text-slate-400">
                {analysisResult.scan_cost.toFixed(3)}
              </span>
            </div>

            <div className="bg-ew-surface p-3 rounded-lg border border-ew-border text-center">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">Net Utility</span>
              <span className="text-xl font-bold text-ew-purple">
                {analysisResult.net_utility.toFixed(3)}
              </span>
            </div>
          </div>

          {/* Qualitative Synthesis */}
          <div className="bg-ew-surface p-4 rounded-xl border border-ew-border space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-ew-cyan">
              <Sparkles className="w-4 h-4" />
              <span>MATHEMATICAL SYNTHESIS</span>
            </div>
            <p className="text-sm font-sans text-slate-200 leading-relaxed">
              Scanning <strong>{analysisResult.band}</strong> with {analysisResult.dwell_slots} slot dwell achieves a net utility of <strong>{analysisResult.net_utility.toFixed(3)}</strong>. 
              {analysisResult.net_utility < currentUtility
                ? ` The AI Scheduler's selected band (${currentScheduled}) yields a superior utility of ${currentUtility.toFixed(3)}, proving that scanning ${analysisResult.band} would represent sub-optimal resource allocation.`
                : ` This candidate matches or exceeds the current priority threshold, making it a viable high-priority target for future scheduling cycles.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-ew-card border border-ew-border p-8 rounded-xl text-center space-y-2 font-mono">
          <p className="text-slate-400 text-xs">
            Select any channel above and click "Evaluate Counterfactual" to run hypothetical utility calculations.
          </p>
        </div>
      )}
    </div>
  );
};
