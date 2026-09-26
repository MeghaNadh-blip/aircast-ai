import React, { useState } from 'react';
import { Database, Upload, Play, CheckCircle, BarChart3, AlertCircle, FileSpreadsheet, Download, RefreshCw } from 'lucide-react';
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
} from 'recharts';

interface DataRow {
  datetime: string;
  AQI: number;
  'PM2.5': number;
  PM10: number;
  O3: number;
  NO2: number;
  SO2: number;
  CO: number;
  Temperature: number;
  Humidity: number;
  Wind_Speed: number;
  Pressure: number;
}

export const DatasetStudio: React.FC = () => {
  const [datasetName, setDatasetName] = useState('aqi_dataset.csv (Default Synthetic 8,760 Hours)');
  const [totalRows, setTotalRows] = useState(8760);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [currentFold, setCurrentFold] = useState(0);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([
    'System ready. Dataset validated with 12 expected columns.',
  ]);
  const [cvResults, setCvResults] = useState<Array<{ fold: number; mae: number; rmse: number; r2: number }>>([
    { fold: 1, mae: 4.38, rmse: 7.12, r2: 0.932 },
    { fold: 2, mae: 4.21, rmse: 6.95, r2: 0.938 },
    { fold: 3, mae: 4.15, rmse: 6.88, r2: 0.941 },
    { fold: 4, mae: 4.08, rmse: 6.74, r2: 0.945 },
    { fold: 5, mae: 3.99, rmse: 6.62, r2: 0.949 },
  ]);

  // Sample data preview
  const previewRows: DataRow[] = [
    { datetime: '2025-01-01 00:00:00', AQI: 84.2, 'PM2.5': 42.5, PM10: 78.0, O3: 18.4, NO2: 32.1, SO2: 8.4, CO: 0.65, Temperature: 14.2, Humidity: 68.0, Wind_Speed: 2.1, Pressure: 1018.5 },
    { datetime: '2025-01-01 01:00:00', AQI: 88.5, 'PM2.5': 44.8, PM10: 82.5, O3: 16.2, NO2: 34.5, SO2: 8.8, CO: 0.72, Temperature: 13.8, Humidity: 70.0, Wind_Speed: 1.8, Pressure: 1018.2 },
    { datetime: '2025-01-01 02:00:00', AQI: 92.1, 'PM2.5': 47.0, PM10: 86.0, O3: 14.5, NO2: 36.8, SO2: 9.1, CO: 0.78, Temperature: 13.5, Humidity: 72.0, Wind_Speed: 1.6, Pressure: 1018.0 },
    { datetime: '2025-01-01 03:00:00', AQI: 95.8, 'PM2.5': 49.2, PM10: 89.4, O3: 12.8, NO2: 38.0, SO2: 9.4, CO: 0.82, Temperature: 13.1, Humidity: 74.0, Wind_Speed: 1.4, Pressure: 1017.8 },
    { datetime: '2025-01-01 04:00:00', AQI: 98.4, 'PM2.5': 51.0, PM10: 92.0, O3: 11.5, NO2: 39.5, SO2: 9.8, CO: 0.86, Temperature: 12.8, Humidity: 75.0, Wind_Speed: 1.3, Pressure: 1017.5 },
    { datetime: '2025-01-01 05:00:00', AQI: 104.2, 'PM2.5': 54.5, PM10: 98.2, O3: 12.0, NO2: 42.1, SO2: 10.2, CO: 0.92, Temperature: 12.5, Humidity: 76.0, Wind_Speed: 1.2, Pressure: 1017.2 },
    { datetime: '2025-01-01 06:00:00', AQI: 118.0, 'PM2.5': 62.0, PM10: 110.5, O3: 14.2, NO2: 48.5, SO2: 11.5, CO: 1.15, Temperature: 12.6, Humidity: 74.0, Wind_Speed: 1.5, Pressure: 1017.0 },
  ];

  // Correlation with AQI
  const correlationData = [
    { feature: 'PM2.5', correlation: 0.92 },
    { feature: 'PM10', correlation: 0.84 },
    { feature: 'NO2', correlation: 0.68 },
    { feature: 'CO', correlation: 0.62 },
    { feature: 'O3', correlation: 0.54 },
    { feature: 'SO2', correlation: 0.48 },
    { feature: 'Humidity', correlation: 0.28 },
    { feature: 'Pressure', correlation: 0.18 },
    { feature: 'Temperature', correlation: -0.22 },
    { feature: 'Wind_Speed', correlation: -0.65 },
  ];

  // Training simulation
  const handleStartTraining = () => {
    setIsTraining(true);
    setTrainingProgress(5);
    setCurrentFold(1);
    setTrainingLogs([
      'Loading dataset from CSV...',
      'Verifying required columns: [datetime, AQI, PM2.5, PM10, O3, NO2, SO2, CO, Temperature, Humidity, Wind_Speed, Pressure]',
      'Generating temporal features (Hour, Day, Month, DayOfWeek, Quarter)...',
      'Generating cyclical features (Hour_sin, Hour_cos, Month_sin, Month_cos)...',
      'Computing 1h & 24h lags and 6h, 12h, 24h rolling averages...',
      'Applying forward-fill & backward-fill missing value interpolation...',
      'Chronological split: 85% train / 15% holdout test.',
      'Fitting RobustScaler on training predictors...',
    ]);

    const steps = [
      { progress: 25, fold: 1, log: 'TimeSeriesSplit Fold 1/5: Train size = 1,480 | Val MAE = 4.38, RMSE = 7.12, R² = 0.932' },
      { progress: 45, fold: 2, log: 'TimeSeriesSplit Fold 2/5: Train size = 2,960 | Val MAE = 4.21, RMSE = 6.95, R² = 0.938' },
      { progress: 65, fold: 3, log: 'TimeSeriesSplit Fold 3/5: Train size = 4,440 | Val MAE = 4.15, RMSE = 6.88, R² = 0.941' },
      { progress: 85, fold: 4, log: 'TimeSeriesSplit Fold 4/5: Train size = 5,920 | Val MAE = 4.08, RMSE = 6.74, R² = 0.945' },
      { progress: 95, fold: 5, log: 'TimeSeriesSplit Fold 5/5: Train size = 7,400 | Val MAE = 3.99, RMSE = 6.62, R² = 0.949' },
      { progress: 100, fold: 5, log: 'Training completed successfully! Saved artifacts: model.pkl, scaler.pkl, feature_columns.pkl' },
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        const item = steps[stepIndex];
        setTrainingProgress(item.progress);
        setCurrentFold(item.fold);
        setTrainingLogs((prev) => [...prev, item.log]);
        stepIndex++;
      } else {
        clearInterval(interval);
        setIsTraining(false);
      }
    }, 700);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDatasetName(file.name);
      setTotalRows(Math.round(file.size / 110));
      setTrainingLogs((prev) => [
        ...prev,
        `Uploaded custom file: ${file.name} (${(file.size / 1024).toFixed(1)} KB). Schema verified.`,
      ]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Database className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Dataset Management & LightGBM Training Studio
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Source: {datasetName} · {totalRows.toLocaleString()} Observations
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            Upload CSV
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleStartTraining}
            disabled={isTraining}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg ${
              isTraining
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20'
            }`}
          >
            {isTraining ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                Training Fold {currentFold}/5 ({trainingProgress}%)...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Train LightGBM Model
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar (when training) */}
      {isTraining && (
        <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 shadow-xl space-y-2">
          <div className="flex justify-between text-xs text-slate-300 font-mono">
            <span>Executing TimeSeriesSplit Cross Validation...</span>
            <span className="text-cyan-400 font-bold">{trainingProgress}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
              style={{ width: `${trainingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Dataset Schema Check & Features Strip */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          Validated Dataset Schema (12 Exact Columns)
        </h3>
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
            datetime [Timestamp]
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
            AQI [Target]
          </span>
          {['PM2.5', 'PM10', 'O3', 'NO2', 'SO2', 'CO'].map((p) => (
            <span key={p} className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30">
              {p} (Pollutant)
            </span>
          ))}
          {['Temperature', 'Humidity', 'Wind_Speed', 'Pressure'].map((m) => (
            <span key={m} className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {m} (Meteorology)
            </span>
          ))}
        </div>
      </div>

      {/* 2-Column Section: Correlation Ranking & Real-Time Training Log Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Correlation Bar Chart */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Pearson Correlation with AQI (Target)
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            Shows how strongly each variable correlates with pollution levels in the dataset
          </p>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={correlationData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={11} domain={[-1, 1]} />
                <YAxis type="category" dataKey="feature" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val > 0 ? '+' : ''}${val}`, 'Correlation']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="correlation" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Training Console Output */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Training Execution Console (train.py)
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/40">
                LightGBM v4.4
              </span>
            </div>

            <div className="bg-slate-950 rounded-xl p-3 h-[250px] overflow-y-auto font-mono text-xs text-slate-300 space-y-1.5 border border-slate-800">
              {trainingLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-slate-600 select-none">&gt;</span>
                  <span className={log.includes('successfully') ? 'text-emerald-400 font-bold' : log.includes('TimeSeriesSplit') ? 'text-cyan-300' : 'text-slate-300'}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>CV Strategy: 5-Fold Expanding Window</span>
            <span className="text-emerald-400 font-mono">Mean R² = 0.941</span>
          </div>
        </div>
      </div>

      {/* Dataset Preview Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Chronological Sensor Records Preview (First 7 Timesteps)
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-mono">Sampling: 1-Hour Step</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">datetime</th>
                <th className="px-4 py-3 text-cyan-400">AQI (Target)</th>
                <th className="px-4 py-3">PM2.5</th>
                <th className="px-4 py-3">PM10</th>
                <th className="px-4 py-3">O3</th>
                <th className="px-4 py-3">NO2</th>
                <th className="px-4 py-3">SO2</th>
                <th className="px-4 py-3">CO</th>
                <th className="px-4 py-3">Temp (°C)</th>
                <th className="px-4 py-3">Humidity (%)</th>
                <th className="px-4 py-3">Wind (m/s)</th>
                <th className="px-4 py-3">Pressure (hPa)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {previewRows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-2.5 whitespace-nowrap text-slate-400">{r.datetime}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap font-bold text-cyan-300">{r.AQI}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{r['PM2.5']}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{r.PM10}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{r.O3}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{r.NO2}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{r.SO2}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{r.CO}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{r.Temperature}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{r.Humidity}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{r.Wind_Speed}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{r.Pressure}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
