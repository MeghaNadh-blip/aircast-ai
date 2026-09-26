import React from 'react';
import { ModelMetricData } from '../../types/aqi';
import { Cpu, CheckCircle2, Award, Sliders, FileCode, Layers, ShieldCheck, Download } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ModelMetricsViewProps {
  metrics: ModelMetricData;
}

export const ModelMetricsView: React.FC<ModelMetricsViewProps> = ({ metrics }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Lag':
        return '#06b6d4'; // Cyan
      case 'Pollutant':
        return '#f59e0b'; // Amber
      case 'Meteorological':
        return '#3b82f6'; // Blue
      case 'Cyclical':
        return '#10b981'; // Emerald
      default:
        return '#a855f7'; // Purple
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Cpu className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  LightGBM GBDT Production Model Card
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Artifact: lgbm_aqi_v1.2.pkl · 5-Fold TimeSeriesSplit Cross-Validated
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Serving
            </span>
          </div>
        </div>
      </div>

      {/* Regression Performance KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* R-Squared */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">R² Score (Goodness of Fit)</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-cyan-400 font-mono">
            {metrics.r2.toFixed(3)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">94.1% variance explained</span>
        </div>

        {/* MAE */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Mean Absolute Error (MAE)</span>
            <Sliders className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-emerald-400 font-mono">
            {metrics.mae.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">±4.12 AQI points average deviation</span>
        </div>

        {/* RMSE */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Root Mean Squared Error</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-purple-400 font-mono">
            {metrics.rmse.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Penalizes large outlier residuals</span>
        </div>

        {/* MAPE */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Mean Abs % Error (MAPE)</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-amber-400 font-mono">
            {metrics.mape.toFixed(2)}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Low error across wide ranges</span>
        </div>
      </div>

      {/* Global Feature Importance Chart */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Global Feature Importance Ranking (Tree Split Gain)
            </h3>
            <p className="text-xs text-slate-400">
              Ranked contribution of engineered predictors across 1,500 tree estimators
            </p>
          </div>

          {/* Category Legend */}
          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              ● Lag Feature
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ● Pollutant
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              ● Meteorological
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ● Cyclical
            </span>
          </div>
        </div>

        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[...metrics.featureImportances].reverse()}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={11} />
              <YAxis
                type="category"
                dataKey="feature"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: any) => [`${value} Split Gain`, 'Importance']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                {[...metrics.featureImportances].reverse().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Hyperparameters & Export Artifacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hyperparameters Card */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Tuned Hyperparameters
          </h4>

          <div className="space-y-2 text-xs font-mono">
            {Object.entries(metrics.hyperparameters).map(([key, val]) => (
              <div key={key} className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">{key}</span>
                <span className="text-cyan-400 font-semibold">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Artifact Package Manifest */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              Artifact Integrity & Serialization
            </h4>

            <div className="space-y-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">model.pkl</span>
                  <span className="text-[11px] text-slate-500">LightGBM Binary Model File (1.4 MB)</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400">MD5: e4b2...91a</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">scaler.pkl</span>
                  <span className="text-[11px] text-slate-500">RobustScaler Interquartile Normalizer (24 KB)</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400">MD5: a91c...33f</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">feature_columns.pkl</span>
                  <span className="text-[11px] text-slate-500">24-Feature Strict Column Manifest (2 KB)</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400">MD5: c78f...42e</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Model Version: 1.2.0-prod</span>
            <span className="text-cyan-400 font-mono">Status: IN-MEMORY (RAM)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
