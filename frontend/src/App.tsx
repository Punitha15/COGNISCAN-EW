import React, { useState } from 'react';
import { useLiveSimulation } from './api';
import { BandState } from './types';
import { Navbar } from './components/Navbar';
import { DemoBanner } from './components/DemoBanner';
import { BandInspectorModal } from './components/BandInspectorModal';

import { CommandCenterPage } from './pages/CommandCenterPage';
import { SpectrumIntelligencePage } from './pages/SpectrumIntelligencePage';
import { EmitterIntelligencePage } from './pages/EmitterIntelligencePage';
import { CognitiveSchedulerPage } from './pages/CognitiveSchedulerPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { MultiReceiverPage } from './pages/MultiReceiverPage';
import { WhatIfLabPage } from './pages/WhatIfLabPage';
import { LiveLearningPage } from './pages/LiveLearningPage';
import { BenchmarkArenaPage } from './pages/BenchmarkArenaPage';
import { UnseenEnvironmentPage } from './pages/UnseenEnvironmentPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ArchitectureAboutPage } from './pages/ArchitectureAboutPage';

export function App() {
  const { snapshot, isConnected, sendAction } = useLiveSimulation();
  const [activeTab, setActiveTab] = useState<string>('command-center');
  const [inspectedBand, setInspectedBand] = useState<BandState | null>(null);
  const [whatIfTargetBand, setWhatIfTargetBand] = useState<string>('B12');

  const handleStart = () => sendAction('start');
  const handlePause = () => sendAction('pause');
  const handleReset = () => sendAction('reset');
  const handleStep = () => sendAction('step');
  const handleModeChange = (mode: string) => sendAction('mode', { mode });
  const handleTriggerAnomaly = () => sendAction('anomaly');
  const handleStartDemo = () => sendAction('demo_start');
  const handleStopDemo = () => sendAction('demo_stop');

  const handleSelectBand = (band: BandState) => {
    setInspectedBand(band);
  };

  const handleTestWhatIfFromModal = (bandId: string) => {
    setWhatIfTargetBand(bandId);
    setActiveTab('what-if');
  };

  return (
    <div className="min-h-screen bg-ew-bg text-slate-100 flex flex-col font-sans selection:bg-ew-cyan selection:text-black">
      {/* Top Navbar */}
      <Navbar
        snapshot={snapshot}
        isConnected={isConnected}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
        onStep={handleStep}
        onModeChange={handleModeChange}
        onTriggerAnomaly={handleTriggerAnomaly}
        onStartDemo={handleStartDemo}
        onStopDemo={handleStopDemo}
      />

      {/* Judge Demo Banner (Active during 2-3 minute structured demo) */}
      <DemoBanner
        demoStatus={snapshot?.demo_status}
        onStop={handleStopDemo}
      />

      {/* Main Page Viewport */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 py-5">
        {activeTab === 'command-center' && (
          <CommandCenterPage
            snapshot={snapshot}
            onSelectBand={handleSelectBand}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'spectrum' && (
          <SpectrumIntelligencePage
            snapshot={snapshot}
            onSelectBand={handleSelectBand}
          />
        )}

        {activeTab === 'emitters' && (
          <EmitterIntelligencePage snapshot={snapshot} />
        )}

        {activeTab === 'scheduler' && (
          <CognitiveSchedulerPage snapshot={snapshot} />
        )}

        {activeTab === 'sim-lab' && (
          <DigitalTwinPage snapshot={snapshot} />
        )}

        {activeTab === 'multi-receiver' && (
          <MultiReceiverPage snapshot={snapshot} />
        )}

        {activeTab === 'what-if' && (
          <WhatIfLabPage
            snapshot={snapshot}
            initialBand={whatIfTargetBand}
          />
        )}

        {activeTab === 'live-learning' && (
          <LiveLearningPage snapshot={snapshot} />
        )}

        {activeTab === 'benchmark' && (
          <BenchmarkArenaPage />
        )}

        {activeTab === 'unseen-env' && (
          <UnseenEnvironmentPage snapshot={snapshot} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsPage snapshot={snapshot} />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureAboutPage />
        )}
      </main>

      {/* Deep Dive Channel Inspector Modal */}
      <BandInspectorModal
        band={inspectedBand}
        onClose={() => setInspectedBand(null)}
        onTestWhatIf={handleTestWhatIfFromModal}
      />

      {/* Tactical Status Footer */}
      <footer className="border-t border-ew-border bg-ew-surface/80 py-2.5 px-4 font-mono text-[11px] text-slate-400">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">COGNISCAN-EW</span>
            <span>— Cognitive Adaptive Spectrum Scanning & Intelligent Interception Scheduler</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Core: <strong className="text-ew-cyan">Restless Multi-Armed Bandit</strong></span>
            <span>Channel Model: <strong className="text-ew-emerald">Bayesian Beta-Bernoulli</strong></span>
            <span className="text-slate-500">[Offline Simulation Research Environment]</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
