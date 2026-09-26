import React from 'react';
import { Wind, Activity, Cpu, Play, Terminal, Database, Clock, RefreshCw, FileSpreadsheet, ShieldAlert, Scale, Lightbulb } from 'lucide-react';
import { CityStation } from '../../types/aqi';

interface HeaderProps {
  activeTab: 'dashboard' | 'predictor' | 'forecast' | 'model' | 'api' | 'history' | 'dataset' | 'drift' | 'benchmark' | 'decision';
  setActiveTab: (tab: 'dashboard' | 'predictor' | 'forecast' | 'model' | 'api' | 'history' | 'dataset' | 'drift' | 'benchmark' | 'decision') => void;
  stations: CityStation[];
  selectedStation: CityStation;
  setSelectedStation: (station: CityStation) => void;
  isLiveStreaming: boolean;
  setIsLiveStreaming: (val: boolean | ((prev: boolean) => boolean)) => void;
  lastUpdated: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  stations,
  selectedStation,
  setSelectedStation,
  isLiveStreaming,
  setIsLiveStreaming,
  lastUpdated,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Wind className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">AeroPulse</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
                  LightGBM v1.2
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">AI-Powered Environmental Intelligence</p>
            </div>
          </div>

          {/* City / Station Selector & Live Stream Toggle */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedStation.id}
                onChange={(e) => {
                  const found = stations.find((s) => s.id === e.target.value);
                  if (found) setSelectedStation(found);
                }}
                className="bg-slate-800 text-slate-200 text-sm rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-cyan-500 cursor-pointer font-medium"
              >
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    📍 {s.city}, {s.country}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsLiveStreaming((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isLiveStreaming
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
              }`}
              title={isLiveStreaming ? 'Sensor feed streaming active (updates every 5s)' : 'Stream paused'}
            >
              <span className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="hidden sm:inline">{isLiveStreaming ? 'LIVE FEED' : 'PAUSED'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-2 border-t border-slate-800/60 overflow-x-auto py-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-4 h-4" />
            Live Dashboard
          </button>

          <button
            onClick={() => setActiveTab('predictor')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'predictor'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Play className="w-4 h-4" />
            What-If Predictor
          </button>

          <button
            onClick={() => setActiveTab('forecast')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'forecast'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Clock className="w-4 h-4" />
            24h / 72h Forecast
          </button>

          <button
            onClick={() => setActiveTab('model')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'model'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Model Metrics & Weights
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'api'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-4 h-4" />
            FastAPI Sandbox
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Database className="w-4 h-4" />
            Audit History
          </button>

          <button
            onClick={() => setActiveTab('dataset')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'dataset'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Dataset & Training Studio
          </button>

          <button
            onClick={() => setActiveTab('drift')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'drift'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Data Drift Monitor
          </button>

          <button
            onClick={() => setActiveTab('decision')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'decision'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-purple-400 hover:text-purple-200 hover:bg-purple-950/40'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="font-bold">Level 3: Decision Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('benchmark')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'benchmark'
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Scale className="w-4 h-4 text-purple-400" />
            Model Benchmark
          </button>
        </div>
      </div>
    </header>
  );
};
