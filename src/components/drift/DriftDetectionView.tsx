import React, { useState } from 'react';
import { ShieldAlert, Activity, CheckCircle2, AlertTriangle, ArrowUpRight, RefreshCw, BarChart2, Zap } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts';

interface DriftMetric {
  feature: string;
  baselineMean: number;
  currentMean: number;
  ksStatistic: number; // Kolmogorov-Smirnov distance (0 - 1)
  pValue: number;
  driftDetected: boolean;
  status: 'Normal' | 'Warning' | 'Drift Detected';
}

export const DriftDetectionView: React.FC = () => {
  const [windowSize, setWindowSize] = useState<'24h' | '7d' | '30d'>('7d');
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [driftMetrics, setDriftMetrics] = useState<DriftMetric[]>([
    {
      feature: 'PM2.5',
      baselineMean: 42.8,
      currentMean: 58.4,
      ksStatistic: 0.142,
      pValue: 0.012,
      driftDetected: true,
      status: 'Drift Detected',
    },
    {
      feature: 'PM10',
      baselineMean: 76.5,
      currentMean: 91.2,
      ksStatistic: 0.118,
      pValue: 0.038,
      driftDetected: true,
      status: 'Warning',
    },
    {
      feature: 'Wind_Speed',
      baselineMean: 3.4,
      currentMean: 2.1,
      ksStatistic: 0.088,
      pValue: 0.075,
      driftDetected: false,
      status: 'Warning',
    },
    {
      feature: 'Temperature',
      baselineMean: 24.2,
      currentMean: 25.1,
      ksStatistic: 0.032,
      pValue: 0.420,
      driftDetected: false,
      status: 'Normal',
    },
    {
      feature: 'Humidity',
      baselineMean: 58.0,
      currentMean: 61.2,
      ksStatistic: 0.045,
      pValue: 0.280,
      driftDetected: false,
      status: 'Normal',
    },
    {
      feature: 'O3',
      baselineMean: 38.2,
      currentMean: 39.5,
      ksStatistic: 0.028,
      pValue: 0.540,
      driftDetected: false,
      status: 'Normal',
    },
    {
      feature: 'Prediction AQI',
      baselineMean: 86.4,
      currentMean: 104.8,
      ksStatistic: 0.165,
      pValue: 0.006,
      driftDetected: true,
      status: 'Drift Detected',
    },
  ]);

  // Distribution comparison data for PM2.5 (Baseline vs Current)
  const distributionData = [
    { bin: '0-25', baseline: 28, current: 14 },
    { bin: '25-50', baseline: 42, current: 26 },
    { bin: '50-75', baseline: 18, current: 34 },
    { bin: '75-100', baseline: 8, current: 16 },
    { bin: '100-150', baseline: 3, current: 7 },
    { bin: '150+', baseline: 1, current: 3 },
  ];

  const handleRunEvaluation = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
    }, 600);
  };

  const overallDriftCount = driftMetrics.filter((m) => m.driftDetected).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Production Data & Prediction Drift Monitor
              </h2>
              <p className="text-xs text-slate-400">
                Evidently-style statistical divergence tests (Two-Sample Kolmogorov-Smirnov & Wasserstein Distance)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-xs">
            {(['24h', '7d', '30d'] as const).map((w) => (
              <button
                key={w}
                onClick={() => setWindowSize(w)}
                className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-all ${
                  windowSize === w
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Window: {w}
              </button>
            ))}
          </div>

          <button
            onClick={handleRunEvaluation}
            disabled={isEvaluating}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors shadow"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin text-cyan-400' : ''}`} />
            Run Test
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4">
          <span className="text-xs text-slate-400 font-medium">Model Health Status</span>
          <div className="mt-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xl font-bold text-amber-400 font-mono">Moderate Drift</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Inversion episode in current window</span>
        </div>

        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4">
          <span className="text-xs text-slate-400 font-medium">Features in Drift</span>
          <div className="mt-2 text-2xl font-bold text-white font-mono">
            {overallDriftCount} <span className="text-sm text-slate-500">/ {driftMetrics.length}</span>
          </div>
          <span className="text-[11px] text-rose-400 mt-1 block">p-value &lt; 0.05 threshold</span>
        </div>

        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4">
          <span className="text-xs text-slate-400 font-medium">Dataset Stability Score</span>
          <div className="mt-2 text-2xl font-bold text-emerald-400 font-mono">
            87.4%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Wasserstein distance: 0.126</span>
        </div>

        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4">
          <span className="text-xs text-slate-400 font-medium">Recommended Action</span>
          <div className="mt-2 text-sm font-semibold text-cyan-300">
            Automated Retraining Scheduled
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Cron trigger at 00:00 UTC</span>
        </div>
      </div>

      {/* Distribution Comparison Chart */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              PM2.5 Density Shift: Baseline Training Data vs. Current {windowSize} Stream
            </h3>
            <p className="text-xs text-slate-400">
              Noticeable rightward shift towards 50–75 µg/m³ indicates atmospheric stagnation
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-3 rounded bg-slate-600 inline-block" /> Training Baseline (2025)
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-3 h-3 rounded bg-cyan-500 inline-block" /> Current Ingestion ({windowSize})
            </span>
          </div>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="bin" stroke="#64748b" fontSize={11} label={{ value: 'PM2.5 Concentration (µg/m³)', position: 'insideBottom', offset: -4, fill: '#64748b', fontSize: 11 }} />
              <YAxis stroke="#64748b" fontSize={11} label={{ value: 'Frequency %', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="baseline" name="Training Baseline %" fill="#475569" radius={[4, 4, 0, 0]} />
              <Bar dataKey="current" name="Current Stream %" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature-by-Feature Statistical Drift Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Statistical Drift Hypothesis Test (Significance Level α = 0.05)
          </span>
          <span className="text-[11px] font-mono text-slate-500">Method: Two-Sample KS Test</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Feature Name</th>
                <th className="px-4 py-3">Baseline Mean</th>
                <th className="px-4 py-3">Current Mean</th>
                <th className="px-4 py-3">KS Statistic</th>
                <th className="px-4 py-3">p-Value</th>
                <th className="px-4 py-3">Drift State</th>
                <th className="px-4 py-3 text-right">Health Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {driftMetrics.map((m) => (
                <tr key={m.feature} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">{m.feature}</td>
                  <td className="px-4 py-3 text-slate-400">{m.baselineMean.toFixed(1)}</td>
                  <td className="px-4 py-3 font-bold text-cyan-300">{m.currentMean.toFixed(1)}</td>
                  <td className="px-4 py-3 text-slate-300">{m.ksStatistic.toFixed(3)}</td>
                  <td className="px-4 py-3">
                    <span className={m.pValue < 0.05 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {m.pValue.toFixed(3)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-sans border ${
                        m.status === 'Drift Detected'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : m.status === 'Warning'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-sans text-xs">
                    {m.driftDetected ? (
                      <span className="text-amber-400 flex items-center justify-end gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> High Retrain Priority
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> In-Bounds
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
