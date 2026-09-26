import React from 'react';
import { 
  Network, 
  Radio, 
  Share2, 
  MapPin, 
  ShieldCheck, 
  Activity, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { SimulationStateSnapshot } from '../types';
import { RadarDisplay } from '../components/RadarDisplay';

interface MultiReceiverPageProps {
  snapshot: SimulationStateSnapshot | null;
}

export const MultiReceiverPage: React.FC<MultiReceiverPageProps> = ({ snapshot }) => {
  const receivers = snapshot?.receivers || [];
  const emitters = snapshot?.emitters || [];
  const currentScannedBand = snapshot?.current_decision?.selected_band;

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Header */}
      <div className="bg-ew-card border border-ew-border p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-ew-cyan" />
            <h2 className="text-base font-mono font-bold text-white">
              COLLABORATIVE COGNITIVE SCANNING (MULTI-RECEIVER MESH)
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            Distributed tactical sensor network covering 360° spatial sectors. Shared clues synthesize cooperative Bayesian beliefs and coordinated frequency assignments.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-ew-surface px-3 py-1.5 rounded-lg border border-ew-border">
          <span className="w-2 h-2 rounded-full bg-ew-emerald animate-pulse" />
          <span>MESH CONSENSUS: SYNCHRONIZED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Col: Radar PPI Scope */}
        <div className="bg-ew-card border border-ew-border rounded-xl p-4 flex flex-col items-center justify-center space-y-3">
          <h3 className="font-mono font-bold text-xs text-slate-300 uppercase tracking-wider self-start">
            TACTICAL 360° PPI RADAR SCOPE
          </h3>
          <RadarDisplay
            emitters={emitters}
            receivers={receivers}
            currentScannedBand={currentScannedBand}
            width={340}
            height={340}
          />
          <p className="text-[11px] text-slate-400 font-sans text-center px-4">
            Visualizes directional receiver sector beams (Alpha 0°-120°, Bravo 120°-240°, Charlie 240°-360°) and dynamic emitter tracks.
          </p>
        </div>

        {/* Right 2 Cols: Distributed Receivers Status & Shared Clues Stream */}
        <div className="lg:col-span-2 space-y-4">
          {/* Receiver Nodes Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {receivers.map((rx) => {
              const isPrimary = rx.receiver_id === 'RX-ALPHA';
              return (
                <div
                  key={rx.receiver_id}
                  className={`bg-ew-card border rounded-xl p-4 space-y-3 font-mono text-xs transition-all ${
                    isPrimary ? 'border-ew-cyan/60 shadow-[0_0_15px_rgba(0,240,255,0.15)]' : 'border-ew-border'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-ew-border">
                    <span className="font-bold text-white text-sm">{rx.receiver_id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-ew-emerald/20 text-ew-emerald font-bold">
                      {rx.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 font-sans">{rx.name}</p>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sector Angle:</span>
                      <span className="text-white font-bold">{rx.sector_deg}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Band:</span>
                      <span className="text-ew-cyan font-bold">{rx.current_band}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last Intercept:</span>
                      <span className="text-ew-emerald font-bold">
                        {rx.last_hit_band ? `${rx.last_hit_band} (T+${rx.last_hit_slot})` : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-ew-border/50">
                      <span className="text-slate-400">Cues Sent / Recv:</span>
                      <span className="text-ew-purple font-bold">
                        {rx.shared_clues_sent} / {rx.shared_clues_received}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cooperative Mesh Intelligence Flow */}
          <div className="bg-ew-card border border-ew-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-ew-purple" />
                <h3 className="font-mono font-bold text-sm text-white">
                  COOPERATIVE INTELLIGENCE SHARING BUS
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Mesh Latency: &lt;1 slot</span>
            </div>

            <p className="text-xs text-slate-300 font-sans">
              When Receiver Alpha intercepts an agile hop, it immediately broadcasts a high-priority cue to Bravo and Charlie, dynamically adjusting their scheduled dwell priorities to intercept subsequent hops across spatial sectors.
            </p>

            <div className="bg-ew-surface p-3 rounded-lg border border-ew-border space-y-1.5 font-mono text-xs">
              <div className="flex items-center gap-2 text-ew-cyan">
                <Radio className="w-3.5 h-3.5" />
                <span className="font-bold">SHARED CUE PROTOCOL:</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                <code>RX-ALPHA [Hit on B24, SNR 14.2dB] ➔ Broadcast to RX-BRAVO & RX-CHARLIE ➔ Markov Hop Matrix Updated ➔ RX-BRAVO pre-positions to B37.</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
