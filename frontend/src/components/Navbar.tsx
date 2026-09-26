import React from 'react';
import { 
  Activity, 
  Play, 
  Pause, 
  RotateCcw, 
  StepForward, 
  Zap, 
  Award, 
  Radio, 
  Compass, 
  Cpu, 
  Sliders, 
  Network, 
  HelpCircle, 
  BookOpen, 
  BarChart3, 
  Layers, 
  Workflow
} from 'lucide-react';
import { SimulationStateSnapshot } from '../types';

interface NavbarProps {
  snapshot: SimulationStateSnapshot | null;
  isConnected: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onStep: () => void;
  onModeChange: (mode: string) => void;
  onTriggerAnomaly: () => void;
  onStartDemo: () => void;
  onStopDemo: () => void;
}

export const NAV_ITEMS = [
  { id: 'command-center', label: 'Command Center', icon: Activity },
  { id: 'spectrum', label: 'Spectrum Intelligence', icon: Radio },
  { id: 'emitters', label: 'Emitter Intelligence', icon: Compass },
  { id: 'scheduler', label: 'Cognitive Scheduler', icon: Cpu },
  { id: 'sim-lab', label: 'Simulation Lab', icon: Sliders },
  { id: 'multi-receiver', label: 'Multi-Receiver', icon: Network },
  { id: 'what-if', label: 'What-If Lab', icon: HelpCircle },
  { id: 'live-learning', label: 'Live Learning', icon: Workflow },
  { id: 'benchmark', label: 'Benchmark Arena', icon: Award },
  { id: 'unseen-env', label: 'Unseen Environment', icon: Layers },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'architecture', label: 'Architecture & Tech', icon: BookOpen },
];

export const Navbar: React.FC<NavbarProps> = ({
  snapshot,
  isConnected,
  activeTab,
  setActiveTab,
  onStart,
  onPause,
  onReset,
  onStep,
  onModeChange,
  onTriggerAnomaly,
  onStartDemo,
  onStopDemo,
}) => {
  const isRunning = snapshot?.is_running ?? false;
  const isDemo = snapshot?.demo_status?.is_active ?? false;
  const currentMode = snapshot?.mission_mode ?? 'ADAPTIVE';
  const anomalyActive = snapshot?.metrics?.anomaly_status === 'ADAPTIVE_EXPLORATION';

  return (
    <header className="border-b border-ew-border bg-ew-surface/95 backdrop-blur sticky top-0 z-50">
      {/* Top Bar */}
      <div className="max-w-[1720px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-ew-cyan/20 to-ew-purple/20 border border-ew-cyan/40">
            <Radio className="w-5 h-5 text-ew-cyan animate-pulse" />
            <div className="absolute inset-0 rounded-lg border border-ew-cyan/30 animate-ping opacity-20 pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-lg tracking-wider text-white">COGNISCAN-EW</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-ew-card border border-ew-border text-ew-cyan">
                Research v2.0
              </span>
              <div className="flex items-center gap-1.5 ml-1">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-ew-emerald shadow-[0_0_8px_#10b981]' : 'bg-ew-rose'}`} />
                <span className="text-[11px] font-mono text-slate-400">
                  {isConnected ? 'LIVE FEED' : 'CONNECTING'}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-sans tracking-wide">
              Cognitive Adaptive Spectrum Scanning & Intelligent Interception Scheduler
            </p>
          </div>
        </div>

        {/* Center: Mission Mode & Anomaly Indicator */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-ew-bg/80 border border-ew-border px-3 py-1.5 rounded-lg">
            <span className="text-xs text-slate-400 font-mono">MISSION MODE:</span>
            <select
              value={currentMode}
              onChange={(e) => onModeChange(e.target.value)}
              className="bg-transparent text-xs font-mono font-semibold text-ew-cyan outline-none cursor-pointer"
            >
              <option value="ADAPTIVE" className="bg-ew-card text-white">ADAPTIVE (Balanced)</option>
              <option value="DISCOVERY" className="bg-ew-card text-white">DISCOVERY (High Explore)</option>
              <option value="TRACKING" className="bg-ew-card text-white">TRACKING (Learned Emitters)</option>
              <option value="RAPID_INTERCEPT" className="bg-ew-card text-white">RAPID INTERCEPT (Min Time)</option>
              <option value="INTELLIGENCE" className="bg-ew-card text-white">INTELLIGENCE (Max Info Gain)</option>
            </select>
          </div>

          {anomalyActive ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ew-rose/20 border border-ew-rose text-ew-rose animate-pulse text-xs font-mono font-bold">
              <Zap className="w-3.5 h-3.5" />
              SPECTRUM ANOMALY: ADAPTIVE EXPLORATION
            </div>
          ) : (
            <button
              onClick={onTriggerAnomaly}
              title="Simulates unexpected hostile hopping breakout"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-ew-card border border-ew-border hover:border-ew-amber/60 text-xs font-mono text-slate-300 hover:text-ew-amber transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-ew-amber" />
              Inject Anomaly
            </button>
          )}
        </div>

        {/* Right: Master Simulation & Judge Demo Controls */}
        <div className="flex items-center gap-2">
          {/* Slot Badge */}
          <div className="hidden sm:flex flex-col items-end pr-2 font-mono">
            <span className="text-[10px] text-slate-400">TIME SLOT</span>
            <span className="text-sm font-bold text-white tracking-wider">
              T+{snapshot?.slot ?? 0}
            </span>
          </div>

          {/* Primary Simulation Buttons */}
          <div className="flex items-center bg-ew-card border border-ew-border rounded-lg p-0.5">
            {isRunning ? (
              <button
                onClick={onPause}
                title="Pause Simulation"
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-ew-amber/20 hover:bg-ew-amber/30 text-ew-amber font-mono text-xs font-bold transition-all"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>PAUSE</span>
              </button>
            ) : (
              <button
                onClick={onStart}
                title="Start Autonomous Scanning"
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-ew-emerald/20 hover:bg-ew-emerald/30 text-ew-emerald font-mono text-xs font-bold transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>START</span>
              </button>
            )}

            <button
              onClick={onStep}
              disabled={isRunning}
              title="Step Single Slot"
              className="p-1.5 rounded hover:bg-ew-border text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <StepForward className="w-4 h-4" />
            </button>

            <button
              onClick={onReset}
              title="Reset Environment"
              className="p-1.5 rounded hover:bg-ew-border text-slate-300 hover:text-ew-rose transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Judge Demo Button */}
          {isDemo ? (
            <button
              onClick={onStopDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ew-rose/20 border border-ew-rose text-ew-rose font-mono text-xs font-bold hover:bg-ew-rose/30 transition-all"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>STOP DEMO</span>
            </button>
          ) : (
            <button
              onClick={onStartDemo}
              title="One-click 2-3 minute structured technical demonstration"
              className="relative group flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-ew-cyan/20 to-ew-purple/30 border border-ew-cyan/60 hover:border-ew-cyan text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(0,240,255,0.25)] hover:shadow-[0_0_20px_rgba(0,240,255,0.45)] transition-all"
            >
              <Award className="w-4 h-4 text-ew-cyan group-hover:rotate-12 transition-transform" />
              <span className="tracking-wide">START JUDGE DEMO</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="max-w-[1720px] mx-auto px-4 overflow-x-auto no-scrollbar">
        <nav className="flex items-center gap-1 py-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-ew-cyan/15 text-ew-cyan border border-ew-cyan/40 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-ew-card/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-ew-cyan' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
