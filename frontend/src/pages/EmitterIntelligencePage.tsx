import React, { useState } from 'react';
import { 
  Compass, 
  Activity, 
  Clock, 
  Shuffle, 
  Zap, 
  ShieldAlert, 
  BarChart2, 
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { SimulationStateSnapshot, EmitterDNA } from '../types';

interface EmitterIntelligencePageProps {
  snapshot: SimulationStateSnapshot | null;
}

export const EmitterIntelligencePage: React.FC<EmitterIntelligencePageProps> = ({ snapshot }) => {
  const emitters = snapshot?.emitters || [];
  const [selectedEmitterId, setSelectedEmitterId] = useState<string | null>(
    emitters.length > 0 ? emitters[0].emitter_id : null
  );

  const selectedEmitter = emitters.find(e => e.emitter_id === selectedEmitterId) || emitters[0] || null;

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Page Header */}
      <div className="bg-ew-card border border-ew-border p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-ew-purple" />
            <h2 className="text-base font-mono font-bold text-white">
              EMITTER BEHAVIOUR DNA & TACTICAL SIGNATURES
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            Statistical behavioral fingerprinting extracting frequency agility, temporal pulse periodicity, Markov hop transition matrices, and threat classification.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-ew-surface px-3 py-1.5 rounded-lg border border-ew-border">
          FINGERPRINTED EMITTERS: <strong className="text-ew-cyan">{emitters.length}</strong>
        </div>
      </div>

      {emitters.length === 0 ? (
        <div className="bg-ew-card border border-ew-border p-12 rounded-xl text-center space-y-3">
          <Activity className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
          <h3 className="font-mono text-slate-300 font-bold">Awaiting Signal Interceptions</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            The receiver is exploring the spectrum. Once transmitters are intercepted across multiple time slots, their behavioral DNA will be synthesized here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column: Emitter Directory List */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              DISCOVERED EMITTERS
            </h3>
            <div className="space-y-2">
              {emitters.map((em) => {
                const isSelected = selectedEmitter?.emitter_id === em.emitter_id;

                let badgeColor = 'bg-slate-800 text-slate-400';
                if (em.behavior_classification === 'Frequency Agile') badgeColor = 'bg-ew-amber/20 text-ew-amber border border-ew-amber/40';
                else if (em.behavior_classification === 'Periodic') badgeColor = 'bg-ew-cyan/20 text-ew-cyan border border-ew-cyan/40';
                else if (em.behavior_classification === 'Fixed') badgeColor = 'bg-ew-emerald/20 text-ew-emerald border border-ew-emerald/40';
                else if (em.behavior_classification === 'Burst') badgeColor = 'bg-ew-purple/20 text-ew-purple border border-ew-purple/40';

                return (
                  <div
                    key={em.emitter_id}
                    onClick={() => setSelectedEmitterId(em.emitter_id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-ew-surface border-ew-cyan shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                        : 'bg-ew-card/80 border-ew-border hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-white text-xs">{em.name}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${badgeColor}`}>
                        {em.behavior_classification}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>ID: {em.emitter_id}</span>
                      <span className="text-ew-emerald font-bold">{(em.confidence * 100).toFixed(0)}% Conf</span>
                    </div>

                    <div className="mt-2 text-[10px] font-mono text-slate-500 truncate">
                      Bands: {em.observed_bands.join(', ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 2 Columns: Detailed Emitter DNA Dossier */}
          {selectedEmitter && (
            <div className="lg:col-span-2 space-y-4">
              {/* Dossier Card */}
              <div className="bg-ew-card border border-ew-border rounded-xl p-5 space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-ew-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-mono font-bold text-white">{selectedEmitter.name}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-ew-surface border border-ew-border text-ew-cyan">
                        {selectedEmitter.emitter_id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Classified as <strong className="text-white">{selectedEmitter.behavior_classification}</strong> with <strong className="text-ew-emerald">{(selectedEmitter.confidence * 100).toFixed(0)}% confidence</strong>.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-400">Spatial Sector:</span>
                    <span className="px-2 py-1 bg-ew-surface rounded border border-ew-border text-ew-cyan font-bold">
                      {selectedEmitter.spatial_sector_deg.toFixed(0)}°
                    </span>
                  </div>
                </div>

                {/* Behavioral DNA Multi-Parameter Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-ew-surface p-3 rounded-lg border border-ew-border font-mono">
                    <span className="text-[10px] text-slate-400 uppercase block mb-1">Frequency Stability</span>
                    <span className="text-lg font-bold text-ew-cyan">
                      {(selectedEmitter.frequency_stability * 100).toFixed(0)}%
                    </span>
                    <div className="w-full h-1 bg-ew-bg rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-ew-cyan" style={{ width: `${selectedEmitter.frequency_stability * 100}%` }} />
                    </div>
                  </div>

                  <div className="bg-ew-surface p-3 rounded-lg border border-ew-border font-mono">
                    <span className="text-[10px] text-slate-400 uppercase block mb-1">Hopping Tendency</span>
                    <span className="text-lg font-bold text-ew-amber">
                      {(selectedEmitter.hopping_tendency * 100).toFixed(0)}%
                    </span>
                    <div className="w-full h-1 bg-ew-bg rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-ew-amber" style={{ width: `${selectedEmitter.hopping_tendency * 100}%` }} />
                    </div>
                  </div>

                  <div className="bg-ew-surface p-3 rounded-lg border border-ew-border font-mono">
                    <span className="text-[10px] text-slate-400 uppercase block mb-1">Burst Behavior</span>
                    <span className="text-lg font-bold text-ew-purple">
                      {(selectedEmitter.burst_behavior * 100).toFixed(0)}%
                    </span>
                    <div className="w-full h-1 bg-ew-bg rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-ew-purple" style={{ width: `${selectedEmitter.burst_behavior * 100}%` }} />
                    </div>
                  </div>

                  <div className="bg-ew-surface p-3 rounded-lg border border-ew-border font-mono">
                    <span className="text-[10px] text-slate-400 uppercase block mb-1">Total Interceptions</span>
                    <span className="text-lg font-bold text-ew-emerald">
                      {selectedEmitter.detection_count}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">Across {selectedEmitter.observed_bands.length} bands</span>
                  </div>
                </div>

                {/* Section 8 & 9: Frequency-Hop Prediction & Periodicity Detection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Periodicity Detection Card */}
                  <div className="bg-ew-surface p-4 rounded-xl border border-ew-border space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-ew-cyan">
                      <Clock className="w-4 h-4" />
                      <span>PERIODICITY AUTOCORRELATION</span>
                    </div>

                    {selectedEmitter.detected_periodicity ? (
                      <div className="space-y-2 font-mono text-xs">
                        <div className="flex justify-between border-b border-ew-border/60 pb-1.5">
                          <span className="text-slate-400">Detected Period:</span>
                          <span className="text-white font-bold">{selectedEmitter.detected_periodicity} slots</span>
                        </div>
                        <div className="flex justify-between border-b border-ew-border/60 pb-1.5">
                          <span className="text-slate-400">Autocorrelation Conf:</span>
                          <span className="text-ew-emerald font-bold">{(selectedEmitter.periodicity_confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Next Expected TX:</span>
                          <span className="text-ew-cyan font-bold">
                            {selectedEmitter.next_expected_tx_slot ? `Slot T+${selectedEmitter.next_expected_tx_slot}` : 'Calculating...'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs font-mono text-slate-400 pt-2">
                        No recurring period detected yet. Transmission intervals appear aperiodic or chaotic.
                      </p>
                    )}
                  </div>

                  {/* Frequency Hop Prediction Card */}
                  <div className="bg-ew-surface p-4 rounded-xl border border-ew-border space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-ew-amber">
                      <Shuffle className="w-4 h-4" />
                      <span>MARKOV NEXT-HOP PREDICTION</span>
                    </div>

                    {selectedEmitter.top_next_hops && selectedEmitter.top_next_hops.length > 0 ? (
                      <div className="space-y-1.5 font-mono text-xs">
                        {selectedEmitter.top_next_hops.map((hop, idx) => (
                          <div key={idx} className="space-y-0.5">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-white font-bold">{hop.band}</span>
                              <span className="text-ew-amber">{(hop.probability * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-1 bg-ew-bg rounded-full overflow-hidden">
                              <div
                                className="h-full bg-ew-amber"
                                style={{ width: `${hop.probability * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-mono text-slate-400 pt-2">
                        Single band transmitter or insufficient hop transitions observed.
                      </p>
                    )}
                  </div>
                </div>

                {/* Observed Channel Fingerprint */}
                <div className="bg-ew-surface p-4 rounded-xl border border-ew-border space-y-2">
                  <span className="text-xs font-mono font-bold text-slate-300 block">
                    OBSERVED SPECTRUM OCCUPANCY CHANNELS:
                  </span>
                  <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                    {selectedEmitter.observed_bands.map((b) => (
                      <span
                        key={b}
                        className="px-2.5 py-1 rounded bg-ew-card border border-ew-border text-ew-cyan font-bold"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
