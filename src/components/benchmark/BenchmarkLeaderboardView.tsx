import React from 'react';
import { Award, Zap, Cpu, Check, ShieldCheck, Scale } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

interface BenchmarkModel {
  name: string;
  type: string;
  mae: number;
  rmse: number;
  r2: number;
  inferenceLatencyMs: number;
  modelSizeKb: number;
  isChampion: boolean;
}

export const BenchmarkLeaderboardView: React.FC = () => {
  const models: BenchmarkModel[] = [
    {
      name: 'LightGBM GBDT (Production)',
      type: 'Gradient Boosted Decision Trees',
      mae: 4.12,
      rmse: 6.84,
      r2: 0.941,
      inferenceLatencyMs: 1.8,
      modelSizeKb: 1420,
      isChampion: true,
    },
    {
      name: 'CatBoost Regressor',
      type: 'Symmetric Tree Ensembles',
      mae: 4.22,
      rmse: 6.91,
      r2: 0.939,
      inferenceLatencyMs: 4.2,
      modelSizeKb: 2850,
      isChampion: false,
    },
    {
      name: 'XGBoost (Hist Gradient)',
      type: 'Extreme Gradient Boosting',
      mae: 4.28,
      rmse: 7.02,
      r2: 0.936,
      inferenceLatencyMs: 3.5,
      modelSizeKb: 3100,
      isChampion: false,
    },
    {
      name: 'Random Forest (100 Trees)',
      type: 'Bagged Decision Trees',
      mae: 5.45,
      rmse: 8.60,
      r2: 0.898,
      inferenceLatencyMs: 8.4,
      modelSizeKb: 18400,
      isChampion: false,
    },
    {
      name: 'Ridge Linear Baseline',
      type: 'L2 Regularized Linear Model',
      mae: 8.30,
      rmse: 12.15,
      r2: 0.785,
      inferenceLatencyMs: 0.4,
      modelSizeKb: 45,
      isChampion: false,
    },
  ];

  const chartData = models.map((m) => ({
    name: m.name.split(' ')[0],
    mae: m.mae,
    rmse: m.rmse,
    r2: (m.r2 * 100).toFixed(1),
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Scale className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Multi-Model Benchmark Tournament & Model Selection
              </h2>
              <p className="text-xs text-slate-400">
                Identical 5-Fold TimeSeriesSplit cross-validation on 8,760 hourly atmospheric records
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> LightGBM Selected (Pareto Optimal)
          </span>
        </div>
      </div>

      {/* Benchmark Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4">
          <span className="text-xs text-slate-400 font-medium">Champion Accuracy Gap</span>
          <div className="mt-2 text-2xl font-bold text-cyan-400 font-mono">
            +15.6% R²
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">LightGBM vs. Ridge Linear Baseline</span>
        </div>

        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4">
          <span className="text-xs text-slate-400 font-medium">Serving Latency Advantage</span>
          <div className="mt-2 text-2xl font-bold text-emerald-400 font-mono">
            1.8 ms <span className="text-xs text-slate-500">/ inference</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">4.6x faster than Random Forest</span>
        </div>

        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4">
          <span className="text-xs text-slate-400 font-medium">Memory Footprint</span>
          <div className="mt-2 text-2xl font-bold text-purple-400 font-mono">
            1.42 MB
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">13x more compact than Random Forest</span>
        </div>
      </div>

      {/* MAE & RMSE Comparison Chart */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
          Holdout Test Error Comparison (Lower is Better)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Comparing Mean Absolute Error (MAE) and Root Mean Squared Error (RMSE) across algorithms
        </p>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="mae" name="MAE (AQI pts)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rmse" name="RMSE (AQI pts)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Evaluation Matrix & Resource Efficiency
          </span>
          <span className="text-[11px] font-mono text-slate-500">Test Split: 15% Latest Chronological</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Algorithm</th>
                <th className="px-4 py-3">Family</th>
                <th className="px-4 py-3">MAE</th>
                <th className="px-4 py-3">RMSE</th>
                <th className="px-4 py-3">R² Score</th>
                <th className="px-4 py-3">Latency</th>
                <th className="px-4 py-3">Artifact Size</th>
                <th className="px-4 py-3 text-right">Production Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {models.map((m) => (
                <tr
                  key={m.name}
                  className={`transition-colors ${
                    m.isChampion ? 'bg-cyan-500/10 hover:bg-cyan-500/15' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="px-4 py-3 font-semibold text-white flex items-center gap-2">
                    {m.isChampion && <Award className="w-4 h-4 text-cyan-400" />}
                    {m.name}
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-sans text-xs">{m.type}</td>
                  <td className="px-4 py-3 font-bold text-cyan-300">{m.mae.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-300">{m.rmse.toFixed(2)}</td>
                  <td className="px-4 py-3 font-bold text-emerald-400">{m.r2.toFixed(3)}</td>
                  <td className="px-4 py-3 text-slate-300">{m.inferenceLatencyMs} ms</td>
                  <td className="px-4 py-3 text-slate-400">
                    {m.modelSizeKb > 1000 ? `${(m.modelSizeKb / 1024).toFixed(1)} MB` : `${m.modelSizeKb} KB`}
                  </td>
                  <td className="px-4 py-3 text-right font-sans">
                    {m.isChampion ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        Champion (Serving)
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">Evaluated Benchmark</span>
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
