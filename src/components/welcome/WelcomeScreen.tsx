import React from 'react';
import { FileSpreadsheet, Globe2, ArrowRight, ShieldCheck, Sparkles, BrainCircuit, Lightbulb, Activity, CheckCircle2 } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectUploadCsv: () => void;
  onSelectLivePrediction: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectUploadCsv,
  onSelectLivePrediction,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-100 text-sky-900 flex flex-col justify-between selection:bg-sky-600 selection:text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-200/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-100/80 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Brand */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-300/40 border border-sky-200">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[11px] text-sky-700 font-mono">Air Quality Intelligence Platform</p>
          </div>
        </div>
      </header>

      {/* Main Hero & Dual Mode Cards */}
      <main className="max-w-5xl w-full mx-auto px-6 py-12 flex-1 flex flex-col justify-center items-center text-center z-10">
        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-sky-950 tracking-tight leading-tight max-w-4xl">
          Welcome to Air Quality Intelligence Platform
        </h1>

        <p className="mt-4 text-sm sm:text-base text-sky-700 max-w-2xl">
          Select an operating mode to begin. Analyze your own proprietary CSV telemetry or stream live global atmospheric sensor observations.
        </p>

        <div className="mt-5 rounded-2xl border border-sky-200 bg-white/80 px-4 py-3 text-sm text-sky-800 shadow-sm max-w-2xl">
          <span className="font-semibold">No API key required.</span> Live prediction uses public Open-Meteo air quality and weather APIs, so you do not need to provide any key or token to use this mode.
        </div>

        {/* Two Primary Mode Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {/* OPTION 1: UPLOAD CSV */}
          <div
            onClick={onSelectUploadCsv}
            className="group cursor-pointer bg-white/85 hover:bg-white border-2 border-sky-200 hover:border-sky-300 rounded-3xl p-8 text-left transition-all duration-300 shadow-xl hover:shadow-sky-200/80 relative flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100/80 rounded-full blur-2xl transition-all pointer-events-none" />

            <div>
              <div className="w-14 h-14 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 mb-6 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-7 h-7" />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-sky-100 text-sky-700 border border-sky-200">
                  Option 1
                </span>
                <span className="text-xs text-sky-600 font-mono">Custom Telemetry</span>
              </div>

              <h2 className="text-2xl font-bold text-sky-950 transition-colors">
                Upload CSV
              </h2>

              <p className="text-sm text-sky-700 mt-2 leading-relaxed">
                Analyze your own historical air quality dataset.
              </p>

              <div className="mt-6 space-y-2 border-t border-sky-100 pt-4">
                <div className="flex items-center gap-2 text-xs text-sky-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>100% Offline dataset isolation (Zero external API calls)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-sky-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Missing value profiling & Pearson correlation matrix</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-sky-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Custom regression model & dataset-trained forecasts</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between pt-4 border-t border-sky-100">
              <span className="text-xs font-bold text-sky-700 tracking-wide uppercase font-mono">
                Launch CSV Studio
              </span>
              <div className="w-9 h-9 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* OPTION 2: LIVE PREDICTION */}
          <div
            onClick={onSelectLivePrediction}
            className="group cursor-pointer bg-white/85 hover:bg-white border-2 border-sky-200 hover:border-sky-300 rounded-3xl p-8 text-left transition-all duration-300 shadow-xl hover:shadow-sky-200/80 relative flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-100/80 rounded-full blur-2xl transition-all pointer-events-none" />

            <div>
              <div className="w-14 h-14 rounded-2xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-700 mb-6 group-hover:scale-110 transition-transform">
                <Globe2 className="w-7 h-7" />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-100 text-cyan-700 border border-cyan-200">
                  Option 2
                </span>
                <span className="text-xs text-sky-600 font-mono">Global Sensor Stream</span>
              </div>

              <h2 className="text-2xl font-bold text-sky-950 transition-colors">
                Live Prediction
              </h2>

              <p className="text-sm text-sky-700 mt-2 leading-relaxed">
                Fetch real-time air quality data for any city.
              </p>

              <div className="mt-6 space-y-2 border-t border-sky-100 pt-4">
                <div className="flex items-center gap-2 text-xs text-sky-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Cascading Country → State → City selectors</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-sky-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Real-time Open-Meteo & ECMWF satellite stream</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-sky-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Next 24h, 3 Days & 7 Days probabilistic forecast</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between pt-4 border-t border-sky-100">
              <span className="text-xs font-bold text-cyan-700 tracking-wide uppercase font-mono">
                Launch Live Engine
              </span>
              <div className="w-9 h-9 rounded-xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-700 group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto px-6 py-6 border-t border-sky-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sky-700 font-mono z-10">
        <div>Enterprise Environmental Decision-Intelligence Platform</div>
      </footer>
    </div>
  );
};
