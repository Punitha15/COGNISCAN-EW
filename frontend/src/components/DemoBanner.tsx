import React from 'react';
import { Award, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { DemoStatus } from '../types';

interface DemoBannerProps {
  demoStatus?: DemoStatus;
  onStop: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ demoStatus, onStop }) => {
  if (!demoStatus || !demoStatus.is_active) return null;

  return (
    <div className="bg-gradient-to-r from-ew-surface via-ew-card to-ew-surface border-b border-ew-cyan/40 px-4 py-3 shadow-[0_4px_20px_rgba(0,240,255,0.15)] relative z-40">
      <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start md:items-center gap-3">
          <div className="p-2 rounded-lg bg-ew-cyan/20 border border-ew-cyan/50 text-ew-cyan flex-shrink-0 animate-pulse">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-ew-cyan/20 text-ew-cyan font-bold border border-ew-cyan/30">
                {demoStatus.phase}
              </span>
              <h3 className="font-mono font-bold text-sm text-white flex items-center gap-1.5">
                {demoStatus.title}
                <ChevronRight className="w-3.5 h-3.5 text-ew-cyan" />
              </h3>
            </div>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              {demoStatus.narration}
            </p>
          </div>
        </div>

        {/* Progress & Controls */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="w-48 hidden sm:block">
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span>DEMO PROGRESS</span>
              <span className="text-ew-cyan font-bold">{demoStatus.progress_pct}%</span>
            </div>
            <div className="w-full h-1.5 bg-ew-bg rounded-full overflow-hidden border border-ew-border">
              <div 
                className="h-full bg-gradient-to-r from-ew-cyan to-ew-purple transition-all duration-300 rounded-full"
                style={{ width: `${demoStatus.progress_pct}%` }}
              />
            </div>
          </div>

          <button
            onClick={onStop}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-ew-bg border border-ew-border hover:border-ew-rose text-slate-400 hover:text-ew-rose text-xs font-mono transition-all"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
