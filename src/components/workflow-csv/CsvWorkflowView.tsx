import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Search,
  BrainCircuit,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Download,
  ArrowLeft,
  ChevronRight,
  TrendingDown,
  Layers,
  Sparkles,
  BarChart3,
  Calendar,
  ShieldCheck,
  Activity,
  HeartPulse,
  School,
  Building2,
  Factory,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  parseAndAnalyzeCsv,
  ParsedCsvDataset,
  getSampleCsvContent,
} from '../../utils/csvAnalytics';

interface CsvWorkflowViewProps {
  onReturnHome: () => void;
  onSwitchToLive: () => void;
}

const MAX_CSV_FILE_SIZE_BYTES = 100 * 1024 * 1024;

export const CsvWorkflowView: React.FC<CsvWorkflowViewProps> = ({
  onReturnHome,
  onSwitchToLive,
}) => {
  const [dataset, setDataset] = useState<ParsedCsvDataset | null>(null);
  const [activeLevel, setActiveLevel] = useState<'level1' | 'level2' | 'level3'>('level1');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [actionDone, setActionDone] = useState<Record<string, boolean>>({});

  const toggleAction = (id: string) => {
    setActionDone((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMessage('Please upload a valid .csv file only.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_CSV_FILE_SIZE_BYTES) {
      setErrorMessage(`CSV file exceeds the 100 MB upload limit. Please choose a smaller file.`);
      e.target.value = '';
      return;
    }

    setErrorMessage(null);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseAndAnalyzeCsv(text, file.name);
        setDataset(parsed);
        setActiveLevel('level1');
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to parse CSV file.');
      } finally {
        setIsParsing(false);
        e.target.value = '';
      }
    };
    reader.onerror = () => {
      setErrorMessage('Error reading file.');
      setIsParsing(false);
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setIsParsing(true);
    setErrorMessage(null);
    setTimeout(() => {
      try {
        const sampleText = getSampleCsvContent();
        const parsed = parseAndAnalyzeCsv(sampleText, 'sample_atmospheric_telemetry.csv');
        setDataset(parsed);
        setActiveLevel('level1');
      } catch (err: any) {
        setErrorMessage(err.message || 'Error generating sample dataset.');
      } finally {
        setIsParsing(false);
      }
    }, 400);
  };

  // UPLOADER SCREEN IF NO DATASET LOADED
  if (!dataset) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={onReturnHome}
            className="flex items-center gap-2 text-xs font-mono text-sky-700 hover:text-sky-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Welcome Screen
          </button>
          <button
            onClick={onSwitchToLive}
            className="text-xs font-mono text-sky-700 hover:text-sky-900 hover:underline"
          >
            Switch to Live Prediction Mode →
          </button>
        </div>

        {/* Upload Container */}
        <div className="bg-white/90 rounded-3xl border border-sky-200 p-8 shadow-2xl backdrop-blur-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 mx-auto mb-5">
            <FileSpreadsheet className="w-8 h-8" />
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-sky-100 text-sky-700 border border-sky-200">
            Flow 1: CSV Analysis Engine
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold text-sky-950 tracking-tight mt-3">
            Upload Historical Air Quality Dataset
          </h2>

          <p className="text-sm text-sky-700 max-w-lg mx-auto mt-2">
            Upload any CSV containing sensor telemetry (e.g., datetime, AQI, PM2.5, PM10, gases, weather). 
            All analytics and predictions will run <strong>100% locally</strong> without calling external APIs.
          </p>

          {/* Drag & Drop Target */}
          <div className="mt-8 border-2 border-dashed border-sky-200 hover:border-sky-400 rounded-2xl p-10 bg-sky-50 transition-all flex flex-col items-center justify-center cursor-pointer relative group">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <Upload className="w-10 h-10 text-sky-600 mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-sky-900">
              Drop your CSV file here, or <span className="text-sky-700 underline">browse</span>
            </span>
            <span className="text-xs text-sky-600 font-mono mt-1">Accepted: .csv files only · Max 100 MB</span>
          </div>

          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-rose-100 border border-rose-200 text-rose-700 text-xs flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* One-Click Sample Dataset Button */}
          <div className="mt-8 pt-6 border-t border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <span className="text-xs font-bold text-sky-800 block">No CSV on hand right now?</span>
              <span className="text-[11px] text-sky-600">
                Load our validated 72-hour multi-pollutant dataset with one click.
              </span>
            </div>
            <button
              onClick={handleLoadSample}
              disabled={isParsing}
              className="w-full sm:w-auto px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white border border-sky-500 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-white" />
              {isParsing ? 'Processing...' : 'Load Sample CSV Dataset'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // DATASET LOADED: 3-LEVEL WORKFLOW
  const { summary, aqiDistribution, trends, correlationMatrix, pairwiseMatrix, prediction } = dataset;
  const isHighRisk = prediction.targetPredictedAQI >= 101;
  const isSevere = prediction.targetPredictedAQI >= 151;

  return (
    <div className="space-y-6">
      {/* Top Banner: Strict Isolation Status & Mode Switch */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                Offline CSV Telemetry Mode
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                Zero API Calls · 100% Isolated
              </span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Dataset: <span className="text-emerald-300">{dataset.filename}</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              {dataset.totalRows.toLocaleString()} rows · {dataset.headers.length} attributes · {summary.dateRange.start} → {summary.dateRange.end}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors">
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            Upload Another CSV
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
          <button
            onClick={onReturnHome}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            Return to Welcome
          </button>
        </div>
      </div>

      {/* 3-Tier Interactive Level Switcher */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* LEVEL 1: ANALYTICS (GREEN) */}
        <button
          onClick={() => setActiveLevel('level1')}
          className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
            activeLevel === 'level1'
              ? 'bg-emerald-500/15 border-emerald-500/60 shadow-lg shadow-emerald-950/40 text-emerald-200'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`p-2.5 rounded-xl border ${
                activeLevel === 'level1'
                  ? 'bg-emerald-500/25 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Search className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                Level 1
              </span>
              <h3 className="text-sm font-bold text-white">Analytics (Observe)</h3>
              <p className="text-[11px] text-slate-400">Quality, Heatmaps & Correlations</p>
            </div>
          </div>
          <ChevronRight
            className={`w-4 h-4 ${activeLevel === 'level1' ? 'text-emerald-400' : 'text-slate-600'}`}
          />
        </button>

        {/* LEVEL 2: PREDICTION (BLUE) */}
        <button
          onClick={() => setActiveLevel('level2')}
          className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
            activeLevel === 'level2'
              ? 'bg-cyan-500/15 border-cyan-500/60 shadow-lg shadow-cyan-950/40 text-cyan-200'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`p-2.5 rounded-xl border ${
                activeLevel === 'level2'
                  ? 'bg-cyan-500/25 text-cyan-400 border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <BrainCircuit className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block">
                Level 2
              </span>
              <h3 className="text-sm font-bold text-white">Prediction (Predict)</h3>
              <p className="text-[11px] text-slate-400">Trained Forecast & Confidence</p>
            </div>
          </div>
          <ChevronRight
            className={`w-4 h-4 ${activeLevel === 'level2' ? 'text-cyan-400' : 'text-slate-600'}`}
          />
        </button>

        {/* LEVEL 3: RECOMMENDATION (PURPLE) */}
        <button
          onClick={() => setActiveLevel('level3')}
          className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
            activeLevel === 'level3'
              ? 'bg-purple-500/20 border-purple-500/60 shadow-lg shadow-purple-950/50 text-purple-200'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`p-2.5 rounded-xl border ${
                activeLevel === 'level3'
                  ? 'bg-purple-500/25 text-purple-300 border-purple-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Lightbulb className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 block">
                Level 3
              </span>
              <h3 className="text-sm font-bold text-white">Recommendation (Act)</h3>
              <p className="text-[11px] text-slate-400">Institutional & Public Action</p>
            </div>
          </div>
          <ChevronRight
            className={`w-4 h-4 ${activeLevel === 'level3' ? 'text-purple-400' : 'text-slate-600'}`}
          />
        </button>
      </div>

      {/* LEVEL 1: ANALYTICS (OBSERVE) VIEW */}
      {activeLevel === 'level1' && (
        <div className="space-y-6">
          {/* Summary Metric Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow">
              <span className="text-[10px] font-mono uppercase text-slate-400">Observations</span>
              <div className="text-xl font-bold text-white font-mono mt-1">
                {dataset.totalRows.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500">Rows processed</span>
            </div>

            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow">
              <span className="text-[10px] font-mono uppercase text-slate-400">Average AQI</span>
              <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
                {summary.avgAQI}
              </div>
              <span className="text-[10px] text-slate-500">Dataset mean</span>
            </div>

            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow">
              <span className="text-[10px] font-mono uppercase text-slate-400">Min / Max AQI</span>
              <div className="text-xl font-bold text-white font-mono mt-1">
                {summary.minAQI} - {summary.maxAQI}
              </div>
              <span className="text-[10px] text-slate-500">Spread range</span>
            </div>

            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow">
              <span className="text-[10px] font-mono uppercase text-slate-400">Standard Dev</span>
              <div className="text-xl font-bold text-cyan-400 font-mono mt-1">
                ±{summary.stdAQI}
              </div>
              <span className="text-[10px] text-slate-500">Variability score</span>
            </div>

            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow">
              <span className="text-[10px] font-mono uppercase text-slate-400">Missing Values</span>
              <div className="text-xl font-bold text-amber-400 font-mono mt-1">
                {summary.totalMissingValues}
              </div>
              <span className="text-[10px] text-slate-500">Null cells detected</span>
            </div>

            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow">
              <span className="text-[10px] font-mono uppercase text-slate-400">Data Quality</span>
              <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
                {summary.dataQualityScore}%
              </div>
              <span className="text-[10px] text-slate-500">Completeness index</span>
            </div>
          </div>

          {/* Charts Row: Distribution & Time Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AQI Distribution Histogram */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">AQI Distribution Breakdown</h3>
                  <p className="text-xs text-slate-400">Frequency of air quality categories in dataset</p>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  EPA Buckets
                </span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={aqiDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="category"
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Time Trends (Multi-Pollutant) */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Continuous Time Series Trends</h3>
                  <p className="text-xs text-slate-400">AQI vs. Primary Particulates (PM2.5, PM10)</p>
                </div>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  Sampled Curve
                </span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line
                      type="monotone"
                      dataKey="AQI"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                    {trends[0]?.pm25 !== undefined && (
                      <Line
                        type="monotone"
                        dataKey="pm25"
                        name="PM2.5 (µg/m³)"
                        stroke="#06b6d4"
                        strokeWidth={1.5}
                        dot={false}
                      />
                    )}
                    {trends[0]?.pm10 !== undefined && (
                      <Line
                        type="monotone"
                        dataKey="pm10"
                        name="PM10 (µg/m³)"
                        stroke="#a855f7"
                        strokeWidth={1.5}
                        dot={false}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Missing Values & Correlation Matrix Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Missing Value Profiler */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-1">
                Data Quality & Missing Value Audit
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Audit of completeness across all {dataset.headers.length} attributes
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2">Column Header</th>
                      <th className="pb-2">Null Count</th>
                      <th className="pb-2">Missing %</th>
                      <th className="pb-2">Health Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {dataset.headers.slice(0, 8).map((h) => {
                      const stat = summary.missingByColumn[h] || { count: 0, percentage: 0 };
                      const isClean = stat.count === 0;
                      return (
                        <tr key={h}>
                          <td className="py-2 text-white font-semibold">{h}</td>
                          <td className="py-2 text-slate-400">{stat.count}</td>
                          <td className="py-2 text-slate-400">{stat.percentage}%</td>
                          <td className="py-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isClean
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : 'bg-amber-500/15 text-amber-400'
                              }`}
                            >
                              {isClean ? '100% Complete' : 'Interpolated'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pearson Correlation Matrix with AQI */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-1">
                Pearson Correlation with AQI
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Identifies dominant emission drivers (+) and dispersion flush factors (-)
              </p>

              <div className="space-y-3">
                {correlationMatrix.slice(0, 6).map((c) => {
                  const isPositive = c.correlationWithAQI >= 0;
                  return (
                    <div key={c.feature} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-white font-semibold">{c.feature}</span>
                        <span
                          className={`font-bold ${
                            isPositive ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {isPositive ? `+${c.correlationWithAQI}` : c.correlationWithAQI}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isPositive ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.abs(c.correlationWithAQI) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500">{c.description}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEVEL 2: PREDICTION (PREDICT) VIEW */}
      {activeLevel === 'level2' && (
        <div className="space-y-6">
          {/* Prediction Metric Callout Strip */}
          <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/40 rounded-2xl border border-cyan-800/40 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center font-black text-2xl text-cyan-300 font-mono shadow-inner">
                {prediction.targetPredictedAQI}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    ML Model Output
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Trained exclusively on {dataset.filename}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  Projected AQI: {prediction.predictedCategory}
                </h3>
                <p className="text-xs text-slate-400 max-w-xl">
                  Regression model fitted on temporal lags and top correlations from the uploaded time series.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 text-xs font-mono">
              <div>
                <span className="text-slate-400 block">R² Score</span>
                <span className="text-base font-bold text-emerald-400">{prediction.r2Score}</span>
              </div>
              <div>
                <span className="text-slate-400 block">MAE</span>
                <span className="text-base font-bold text-cyan-400">{prediction.mae} AQI</span>
              </div>
              <div>
                <span className="text-slate-400 block">Confidence</span>
                <span className="text-base font-bold text-purple-400">
                  {prediction.confidenceScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Future Forecast Graph with 95% Confidence Corridor */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Future AQI Forecast with 95% Confidence Intervals
                </h3>
                <p className="text-xs text-slate-400">
                  Autoregressive multi-horizon projection from the end of the uploaded dataset
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
                Next 12 Projection Intervals
              </span>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={prediction.forecastFuture}>
                  <defs>
                    <linearGradient id="csvConfidenceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="step" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="upperBound"
                    name="95% Upper Bound"
                    stroke="#0284c7"
                    strokeDasharray="4 4"
                    fill="url(#csvConfidenceGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="lowerBound"
                    name="95% Lower Bound"
                    stroke="#0284c7"
                    strokeDasharray="4 4"
                    fill="transparent"
                  />
                  <Line
                    type="monotone"
                    dataKey="predictedAQI"
                    name="Point Prediction"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    dot={{ fill: '#38bdf8', r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Model Features & Importance */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-1">
              Top Predictive Feature Weights
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Relative contribution of dataset features to the regression forecast
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {prediction.featureImportances.map((f, idx) => (
                <div key={f.feature} className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-slate-300 font-semibold">
                      #{idx + 1} {f.feature}
                    </span>
                    <span className="text-cyan-400 font-bold">{f.weight}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, f.weight * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LEVEL 3: RECOMMENDATION (ACT) VIEW */}
      {activeLevel === 'level3' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 rounded-2xl border border-purple-800/40 p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-purple-400" />
                Level 3: Prescriptive Decision Engine
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                Action Protocols Derived from {dataset.filename}
              </h3>
              <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
                Targeting projected AQI of <strong>{prediction.targetPredictedAQI}</strong> ({prediction.predictedCategory}).
              </p>
            </div>

            <button
              onClick={() => {
                const content = `AEROPULSE LEVEL 3 DECISION BRIEF (CSV MODE)\nDataset: ${dataset.filename}\nGenerated: ${new Date().toISOString()}\nTarget Predicted AQI: ${prediction.targetPredictedAQI} (${prediction.predictedCategory})\nConfidence: ${prediction.confidenceScore}%\n\nInterventions:\n1. Health: Deploy True-HEPA purifiers (CADR 300+) and wear certified N95/FFP2 respirators.\n2. Schools: Suspend outdoor physical education if AQI > 100.\n3. Industry: Implement dust suppression misting curtains per EPA Rule 403.\n4. Transit: Reroute heavy freight bypasses away from residential corridors.`;
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `AeroPulse_L3_Brief_${dataset.filename.replace(/[^a-z0-9]/gi, '_')}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-purple-600/20 whitespace-nowrap self-start md:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              Download Decision Brief (.txt)
            </button>
          </div>

          {/* 5 Sector Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Health & Clinical */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <HeartPulse className="w-5 h-5 text-rose-400" />
                <h4 className="text-sm font-bold text-white">Health & Vulnerable Groups</h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Deploy True-HEPA filtration units in sealed living spaces (CADR &gt; 300).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Transition sensitive individuals from surgical masks to certified N95/FFP2 respirators.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Keep rescue bronchodilator inhalers accessible for asthma and COPD patients.
                  </span>
                </li>
              </ul>
            </div>

            {/* Schools & Campuses */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <School className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-bold text-white">Schools & Educational Campuses</h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    {isHighRisk
                      ? 'Mandatory suspension of outdoor P.E. and athletic recess.'
                      : 'Maintain outdoor recess with caution for asthmatic students.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Enforce strict "No-Idle" bus loading protocols at morning arrival and dismissal.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Operate school HVAC air handlers on recirculate mode with MERV-13 filters.
                  </span>
                </li>
              </ul>
            </div>

            {/* Municipal & Traffic */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Building2 className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">Government & City Transit</h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Implement dynamic heavy-diesel truck diversion around congested central zones.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Increase electric bus and metro frequency by +20% during commute peaks.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Deploy anti-smog mist water cannons along heavy arterial corridors.
                  </span>
                </li>
              </ul>
            </div>

            {/* Industrial & Construction */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Factory className="w-5 h-5 text-purple-400" />
                <h4 className="text-sm font-bold text-white">Industry & Site Operations</h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Halt heavy excavation and concrete demolition during boundary inversion hours.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Maintain active wet dust scrubbers and continuous perimeter misting curtains.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Curtail non-essential industrial boiler and kiln throughput by 30%.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
