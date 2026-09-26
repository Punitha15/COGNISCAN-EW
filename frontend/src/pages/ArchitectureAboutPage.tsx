import React from 'react';
import { 
  BookOpen, 
  Cpu, 
  Workflow, 
  Layers, 
  ShieldCheck, 
  Code, 
  Sparkles,
  Radio,
  Clock,
  Terminal,
  FileText
} from 'lucide-react';

export const ArchitectureAboutPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in">
      {/* Platform Title Banner */}
      <div className="bg-gradient-to-r from-ew-card via-ew-surface to-ew-card border border-ew-border p-6 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 font-mono text-xs text-ew-cyan uppercase tracking-wider">
          <Radio className="w-4 h-4" />
          <span>Independent Autonomous EW Research Platform</span>
        </div>
        <h1 className="text-2xl font-mono font-black text-white tracking-wide">
          COGNISCAN-EW
        </h1>
        <p className="text-sm font-mono text-slate-300">
          Cognitive Adaptive Spectrum Scanning & Intelligent Interception Scheduler for Electronic Warfare
        </p>
        <blockquote className="border-l-2 border-ew-cyan pl-3 text-xs text-slate-300 italic font-sans mt-2">
          "COGNISCAN-EW does not blindly sweep the spectrum. It continuously learns emitter behaviour, predicts WHERE and WHEN transmissions are likely to occur, and dynamically schedules the receiver's next frequency and dwell time using interception probability, information gain, uncertainty, and scan cost."
        </blockquote>
      </div>

      {/* Visual System Architecture Pipeline */}
      <div className="bg-ew-card border border-ew-border p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <Workflow className="w-5 h-5 text-ew-cyan" />
          <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
            END-TO-END SYSTEM ARCHITECTURE PIPELINE
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="bg-ew-surface p-4 rounded-xl border border-ew-border space-y-2">
            <span className="px-2 py-0.5 rounded bg-ew-card border border-ew-border text-ew-cyan font-bold text-[10px]">
              LAYER 1: DIGITAL TWIN
            </span>
            <h3 className="font-bold text-white">RF Physical Environment</h3>
            <p className="text-slate-400 font-sans text-xs">
              Wideband multi-channel synthesizer with AWGN thermal noise, Rayleigh fading, spatial sectors, and 6 heterogenous tactical emitter behaviors.
            </p>
          </div>

          <div className="bg-ew-surface p-4 rounded-xl border border-ew-border space-y-2">
            <span className="px-2 py-0.5 rounded bg-ew-card border border-ew-border text-ew-purple font-bold text-[10px]">
              LAYER 2: INTELLIGENCE ENGINE
            </span>
            <h3 className="font-bold text-white">Bayesian Belief & DNA</h3>
            <p className="text-slate-400 font-sans text-xs">
              Beta-Bernoulli recursive filtering, Shannon entropy quantification, temporal autocorrelation periodicity detection, and Markov hop predictors.
            </p>
          </div>

          <div className="bg-ew-surface p-4 rounded-xl border border-ew-border space-y-2">
            <span className="px-2 py-0.5 rounded bg-ew-card border border-ew-border text-ew-emerald font-bold text-[10px]">
              LAYER 3: COGNITIVE BRAIN
            </span>
            <h3 className="font-bold text-white">Restless Multi-Armed Bandit</h3>
            <p className="text-slate-400 font-sans text-xs">
              Dynamic utility maximization: balances expected detection against Shannon information gain and scan cost, selecting optimal band & dwell time.
            </p>
          </div>
        </div>
      </div>

      {/* Mathematical Formulations */}
      <div className="bg-ew-card border border-ew-border p-6 rounded-2xl space-y-4 font-mono text-xs">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-ew-amber" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            MATHEMATICAL PRINCIPLES & FORMULATIONS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-ew-surface p-4 rounded-xl border border-ew-border space-y-2">
            <span className="text-ew-emerald font-bold block">1. Recursive Bayesian Posterior Belief</span>
            <code className="block bg-ew-bg p-2.5 rounded text-[11px] text-slate-200">
              P(Active | Hit) = [Pd · P(Active)] / [Pd·P(Active) + Pfa·(1 - P(Active))]
            </code>
            <p className="text-[11px] text-slate-400 font-sans">
              Maintains posterior occupancy probability distribution for every channel under noisy observation channels.
            </p>
          </div>

          <div className="bg-ew-surface p-4 rounded-xl border border-ew-border space-y-2">
            <span className="text-ew-cyan font-bold block">2. Shannon Information Gain</span>
            <code className="block bg-ew-bg p-2.5 rounded text-[11px] text-slate-200">
              IG(Band) = H(Current) - E[ H(Posterior) ]
            </code>
            <p className="text-[11px] text-slate-400 font-sans">
              Quantifies mutual information reduction. Allows the scheduler to deliberately investigate uncertain channels.
            </p>
          </div>

          <div className="bg-ew-surface p-4 rounded-xl border border-ew-border space-y-2">
            <span className="text-ew-purple font-bold block">3. RMAB Utility Optimization</span>
            <code className="block bg-ew-bg p-2.5 rounded text-[11px] text-slate-200">
              U(B_i, d) = w_det · P_det(B_i) + w_inf · IG(B_i) - w_cost · Cost(d)
            </code>
            <p className="text-[11px] text-slate-400 font-sans">
              Restless Multi-Armed Bandit Whittle index balancing exploitation reward against exploration info value.
            </p>
          </div>

          <div className="bg-ew-surface p-4 rounded-xl border border-ew-border space-y-2">
            <span className="text-ew-amber font-bold block">4. Markov Frequency-Hop Transition</span>
            <code className="block bg-ew-bg p-2.5 rounded text-[11px] text-slate-200">
              P(Next = B_j | Current = B_i) = N(B_i ➔ B_j) / Σ_k N(B_i ➔ B_k)
            </code>
            <p className="text-[11px] text-slate-400 font-sans">
              Learns agile hopping transition matrices to forecast the next carrier frequency with confidence intervals.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-ew-card border border-ew-border p-6 rounded-2xl space-y-3 font-mono text-xs">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          TECHNOLOGY STACK & RUNTIME ARCHITECTURE
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-ew-surface p-3 rounded-lg border border-ew-border">
            <span className="text-slate-400 block text-[10px]">BACKEND</span>
            <span className="text-white font-bold">Python 3.14 + FastAPI</span>
          </div>
          <div className="bg-ew-surface p-3 rounded-lg border border-ew-border">
            <span className="text-slate-400 block text-[10px]">NUMERICS</span>
            <span className="text-white font-bold">NumPy + SciPy</span>
          </div>
          <div className="bg-ew-surface p-3 rounded-lg border border-ew-border">
            <span className="text-slate-400 block text-[10px]">FRONTEND</span>
            <span className="text-white font-bold">React 18 + TypeScript</span>
          </div>
          <div className="bg-ew-surface p-3 rounded-lg border border-ew-border">
            <span className="text-slate-400 block text-[10px]">STREAMING</span>
            <span className="text-white font-bold">WebSockets (60 Hz)</span>
          </div>
        </div>
      </div>

      {/* Section 35: Scientific Honesty & Simulation Disclaimer */}
      <div className="border border-dashed border-ew-border/80 bg-ew-card/40 p-4 rounded-xl text-xs font-mono space-y-1.5 text-slate-400">
        <div className="flex items-center gap-1.5 text-ew-cyan font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>SCIENTIFIC INTEGRITY & SIMULATION DISCLOSURE</span>
        </div>
        <p className="font-sans leading-relaxed text-slate-400">
          This application is a <strong>simulated research prototype</strong> intended exclusively for algorithm development, cognitive scheduling evaluation, and academic demonstration. All RF signals, noise dynamics, emitter behaviors, and receiver channels are mathematically generated within an offline software environment. This platform contains zero classified or operational military telemetry.
        </p>
      </div>
    </div>
  );
};
