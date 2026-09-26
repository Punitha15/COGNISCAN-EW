import React, { useState } from 'react';
import { 
  Radio, 
  Filter, 
  ArrowUpDown, 
  Search, 
  Info, 
  Clock, 
  Sparkles,
  BarChart3,
  SlidersHorizontal
} from 'lucide-react';
import { SimulationStateSnapshot, BandState } from '../types';

interface SpectrumIntelligencePageProps {
  snapshot: SimulationStateSnapshot | null;
  onSelectBand: (band: BandState) => void;
}

export const SpectrumIntelligencePage: React.FC<SpectrumIntelligencePageProps> = ({
  snapshot,
  onSelectBand,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'priority' | 'prob' | 'uncertainty' | 'hits'>('priority');
  const [filterMode, setFilterMode] = useState<'all' | 'high-priority' | 'active-gt' | 'hits'>('all');

  const bands = snapshot?.bands || [];
  const currentScannedBand = snapshot?.current_decision?.selected_band;

  // Filter & Sort
  const filteredBands = bands
    .filter((b) => {
      const matchSearch = b.band_id.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;

      if (filterMode === 'high-priority') return b.priority_score >= 0.65;
      if (filterMode === 'active-gt') return b.ground_truth_active;
      if (filterMode === 'hits') return b.hit_count > 0;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') return b.priority_score - a.priority_score;
      if (sortBy === 'prob') return b.activity_prob - a.activity_prob;
      if (sortBy === 'uncertainty') return b.uncertainty - a.uncertainty;
      if (sortBy === 'hits') return b.hit_count - a.hit_count;
      return a.band_id.localeCompare(b.band_id);
    });

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-ew-card border border-ew-border p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-ew-cyan" />
            <h2 className="text-base font-mono font-bold text-white">
              DYNAMIC SPECTRUM ATTENTION MAP
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            Real-time Bayesian posterior belief <code className="text-ew-cyan">P(Activity | obs)</code>, Shannon entropy, and dynamic scan priority across 64 RF channels (2000–6000 MHz).
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono bg-ew-surface px-3 py-1.5 rounded-lg border border-ew-border">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-ew-cyan shadow-[0_0_6px_#00f0ff]" /> High Priority (&gt;70%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-blue-600" /> Medium (40-70%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700" /> Quiescent (&lt;40%)
          </span>
        </div>
      </div>

      {/* Control Strip: Search & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-ew-surface p-3 rounded-lg border border-ew-border font-mono text-xs">
        <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search band (e.g. B12, B37)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-ew-card border border-ew-border px-2.5 py-1 rounded text-white outline-none focus:border-ew-cyan text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px]">FILTER:</span>
            <select
              value={filterMode}
              onChange={(e: any) => setFilterMode(e.target.value)}
              className="bg-ew-card border border-ew-border px-2 py-1 rounded text-slate-300 outline-none cursor-pointer"
            >
              <option value="all">All Channels (64)</option>
              <option value="high-priority">High Priority Only</option>
              <option value="active-gt">Ground Truth Active</option>
              <option value="hits">Intercepted Channels</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px]">SORT BY:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-ew-card border border-ew-border px-2 py-1 rounded text-slate-300 outline-none cursor-pointer"
            >
              <option value="priority">Priority Score (Highest)</option>
              <option value="prob">Activity Probability</option>
              <option value="uncertainty">Entropy / Uncertainty</option>
              <option value="hits">Total Intercepts</option>
              <option value="id">Channel Number (B01-B64)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Spectrum Attention Heatmap Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
        {filteredBands.map((band) => {
          const isScanning = band.band_id === currentScannedBand;
          const priorityPct = (band.priority_score * 100).toFixed(0);
          const probPct = (band.activity_prob * 100).toFixed(0);
          const isHit = band.last_observed_state === 'HIT';

          // Color calculation
          let cardBorder = 'border-ew-border';
          let priorityBadge = 'bg-slate-800 text-slate-400';
          if (band.priority_score >= 0.70) {
            cardBorder = 'border-ew-cyan/80 bg-ew-cyan/10 shadow-[0_0_12px_rgba(0,240,255,0.2)]';
            priorityBadge = 'bg-ew-cyan/20 text-ew-cyan font-bold border border-ew-cyan/40';
          } else if (band.priority_score >= 0.40) {
            cardBorder = 'border-blue-700/50 bg-blue-950/20';
            priorityBadge = 'bg-blue-900/40 text-blue-300';
          } else {
            cardBorder = 'border-ew-border/60 bg-ew-card/40';
          }

          return (
            <div
              key={band.band_id}
              onClick={() => onSelectBand(band)}
              className={`relative cursor-pointer rounded-xl p-3 border transition-all duration-200 hover:scale-[1.02] hover:border-ew-cyan ${cardBorder} ${
                isScanning ? 'ring-2 ring-ew-purple animate-pulse' : ''
              }`}
            >
              {/* Scan Line Indicator */}
              {isScanning && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-ew-purple shadow-[0_0_8px_#a855f7]" />
              )}

              {/* Top Row: Band ID & Priority */}
              <div className="flex items-center justify-between font-mono mb-2">
                <span className="text-sm font-black text-white">{band.band_id}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${priorityBadge}`}>
                  {priorityPct}% Pri
                </span>
              </div>

              {/* Freq */}
              <div className="text-[10px] font-mono text-slate-400 mb-2">
                {band.center_freq_mhz.toFixed(0)} MHz
              </div>

              {/* Activity Probability Bar */}
              <div className="space-y-1 font-mono text-[10px]">
                <div className="flex justify-between text-slate-300">
                  <span>P(Act):</span>
                  <span className="font-bold text-ew-emerald">{probPct}%</span>
                </div>
                <div className="w-full h-1 bg-ew-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ew-emerald transition-all duration-300"
                    style={{ width: `${probPct}%` }}
                  />
                </div>
              </div>

              {/* Bottom Metrics Pill */}
              <div className="mt-2.5 pt-2 border-t border-ew-border/50 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>{band.hit_count} hits</span>
                <span>H: {band.uncertainty.toFixed(1)}b</span>
                {isHit && (
                  <span className="w-2 h-2 rounded-full bg-ew-emerald animate-ping" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
