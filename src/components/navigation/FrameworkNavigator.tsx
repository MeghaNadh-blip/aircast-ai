import React from 'react';
import { Search, BrainCircuit, Lightbulb, ChevronRight, ArrowUpRight, ShieldCheck, Zap, Award } from 'lucide-react';

interface FrameworkNavigatorProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export const FrameworkNavigator: React.FC<FrameworkNavigatorProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="mb-6 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-cyan-500/30">
            End-To-End Architecture
          </div>
          <span className="text-xs font-bold text-white tracking-wide">
            3-Tier Analytics & Environmental Intelligence Framework
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Click any level to jump directly to its workspace
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* LEVEL 1: ANALYTICS */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className={`cursor-pointer group p-3.5 rounded-xl border transition-all ${
            ['dashboard', 'drift', 'dataset'].includes(activeTab)
              ? 'bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
              : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/30'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Search className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase font-mono">
                Level 1: Analytics
              </span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
          </div>

          <p className="text-xs font-semibold text-white mb-1">
            Data Ingestion & Pattern Discovery
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
            Real-time global Open-Meteo & ECMWF streams, WHO limit violation analysis, and Kolmogorov-Smirnov distribution drift tests.
          </p>

          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/60 text-[10px] font-mono">
            <span
              onClick={(e) => { e.stopPropagation(); setActiveTab('dashboard'); }}
              className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              Live Sensors
            </span>
            <span
              onClick={(e) => { e.stopPropagation(); setActiveTab('drift'); }}
              className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              Drift Monitor
            </span>
            <span
              onClick={(e) => { e.stopPropagation(); setActiveTab('dataset'); }}
              className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              Dataset Studio
            </span>
          </div>
        </div>

        {/* LEVEL 2: PREDICTION */}
        <div
          onClick={() => setActiveTab('predictor')}
          className={`cursor-pointer group p-3.5 rounded-xl border transition-all ${
            ['predictor', 'forecast', 'model', 'benchmark'].includes(activeTab)
              ? 'bg-cyan-950/25 border-cyan-500/50 shadow-lg shadow-cyan-950/30'
              : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/30'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <BrainCircuit className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase font-mono">
                Level 2: Prediction
              </span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
          </div>

          <p className="text-xs font-semibold text-white mb-1">
            Machine Learning & Probabilistic Forecast
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
            LightGBM GBDT (R²=0.941, MAE=4.12, 1.8ms), 72h forecast with 95% confidence corridor, and additive TreeSHAP waterfalls.
          </p>

          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/60 text-[10px] font-mono">
            <span
              onClick={(e) => { e.stopPropagation(); setActiveTab('predictor'); }}
              className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              TreeSHAP Sim
            </span>
            <span
              onClick={(e) => { e.stopPropagation(); setActiveTab('forecast'); }}
              className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              95% Intervals
            </span>
            <span
              onClick={(e) => { e.stopPropagation(); setActiveTab('benchmark'); }}
              className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              Leaderboard
            </span>
          </div>
        </div>

        {/* LEVEL 3: DECISION ENGINE */}
        <div
          onClick={() => setActiveTab('decision')}
          className={`cursor-pointer group p-3.5 rounded-xl border transition-all ${
            activeTab === 'decision'
              ? 'bg-purple-950/30 border-purple-500/60 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/30'
              : 'bg-slate-950/60 border-slate-800/90 hover:border-purple-500/40 hover:bg-purple-950/10'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Lightbulb className="w-3.5 h-3.5 text-purple-400" />
              </span>
              <span className="text-xs font-bold text-purple-400 tracking-wider uppercase font-mono">
                Level 3: Decision Engine
              </span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-all" />
          </div>

          <p className="text-xs font-semibold text-white mb-1">
            Actionable Prescriptive Interventions
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
            Automated institutional protocols for clinics, schools, runners, and cities with quantified exposure reductions (up to 82%).
          </p>

          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/60 text-[10px] font-mono">
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
              5 Personas
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              SOP Protocols
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Export Brief
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
