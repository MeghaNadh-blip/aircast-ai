import React, { useState } from 'react';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { CsvWorkflowView } from './components/workflow-csv/CsvWorkflowView';
import { LiveWorkflowView } from './components/workflow-live/LiveWorkflowView';

export default function App() {
  const [appMode, setAppMode] = useState<'welcome' | 'csv' | 'live'>('welcome');

  return (
    <div className="min-h-screen bg-[#020817] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* 1. WELCOME SCREEN */}
      {appMode === 'welcome' && (
        <WelcomeScreen
          onSelectUploadCsv={() => setAppMode('csv')}
          onSelectLivePrediction={() => setAppMode('live')}
        />
      )}

      {/* 2. FLOW 1: UPLOAD CSV WORKSPACE */}
      {appMode === 'csv' && (
        <div className="min-h-screen flex flex-col justify-between bg-[#020817]">
          <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
              <div
                onClick={() => setAppMode('welcome')}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-300 font-bold group-hover:scale-105 transition-transform">
                  AP
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">AeroPulse</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-sky-500/10 text-sky-300 border border-sky-400/30">
                      CSV Mode
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAppMode('live')}
                  className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-semibold transition-colors"
                >
                  Switch to Live Prediction
                </button>
                <button
                  onClick={() => setAppMode('welcome')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
                >
                  Home
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-[#020817]">
            <CsvWorkflowView
              onReturnHome={() => setAppMode('welcome')}
              onSwitchToLive={() => setAppMode('live')}
            />
          </main>

        </div>
      )}

      {/* 3. FLOW 2: LIVE PREDICTION WORKSPACE */}
      {appMode === 'live' && (
        <div className="min-h-screen flex flex-col justify-between bg-[#020817]">
          <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
              <div
                onClick={() => setAppMode('welcome')}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold group-hover:scale-105 transition-transform">
                  AP
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">AeroPulse</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-400/30">
                      Live Stream Mode
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAppMode('csv')}
                  className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-semibold transition-colors"
                >
                  Switch to Upload CSV
                </button>
                <button
                  onClick={() => setAppMode('welcome')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
                >
                  Home
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-[#020817]">
            <LiveWorkflowView
              onReturnHome={() => setAppMode('welcome')}
              onSwitchToCsv={() => setAppMode('csv')}
            />
          </main>

        </div>
      )}
    </div>
  );
}
