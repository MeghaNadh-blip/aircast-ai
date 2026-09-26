import React, { useState } from 'react';
import { Database, Download, Trash2, Filter, Search, Calendar } from 'lucide-react';
import { PredictionResult, EnvironmentalData } from '../../types/aqi';

export interface AuditRecord {
  id: string;
  timestamp: string;
  prediction: PredictionResult;
  input: EnvironmentalData;
}

interface AuditHistoryViewProps {
  records: AuditRecord[];
  onClearHistory: () => void;
}

export const AuditHistoryView: React.FC<AuditHistoryViewProps> = ({
  records,
  onClearHistory,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = records.filter((r) => {
    const matchesCat = filterCategory === 'all' || r.prediction.category === filterCategory;
    const matchesQuery =
      searchQuery === '' ||
      r.prediction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.prediction.dominantPollutant.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const exportCSV = () => {
    if (records.length === 0) return;

    const headers = [
      'Timestamp',
      'Predicted_AQI',
      'Category',
      'Dominant_Pollutant',
      'PM2.5',
      'PM10',
      'O3',
      'NO2',
      'SO2',
      'CO',
      'Temperature',
      'Humidity',
      'Wind_Speed',
      'Pressure',
    ];

    const rows = records.map((r) => [
      r.timestamp,
      r.prediction.roundedAQI,
      r.prediction.category,
      r.prediction.dominantPollutant,
      r.input.pm25,
      r.input.pm10,
      r.input.o3,
      r.input.no2,
      r.input.so2,
      r.input.co,
      r.input.temperature,
      r.input.humidity,
      r.input.windSpeed,
      r.input.pressure,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aqi_prediction_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            MongoDB Audit & Prediction Logs
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological audit trail of all model inferences, inputs, and explainability payloads
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            disabled={records.length === 0}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={onClearHistory}
            disabled={records.length === 0}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-800/40 hover:bg-rose-900/60 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Logs
          </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by category or dominant pollutant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Good">Good (0-50)</option>
            <option value="Moderate">Moderate (51-100)</option>
            <option value="Unhealthy for Sensitive Groups">Unhealthy for Sensitive</option>
            <option value="Unhealthy">Unhealthy</option>
            <option value="Very Unhealthy">Very Unhealthy</option>
            <option value="Hazardous">Hazardous</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No prediction logs found. Run a prediction in the "What-If Predictor" and click "Log Prediction" to populate audit records.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Predicted AQI</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Dominant</th>
                  <th className="px-4 py-3">PM2.5</th>
                  <th className="px-4 py-3">PM10</th>
                  <th className="px-4 py-3">Temp / Humidity</th>
                  <th className="px-4 py-3">Wind / Pressure</th>
                  <th className="px-4 py-3 text-right">Inference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-bold text-white text-sm">
                      <span style={{ color: item.prediction.colorCode }}>
                        {item.prediction.roundedAQI}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-sans">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{
                          backgroundColor: `${item.prediction.colorCode}20`,
                          color: item.prediction.colorCode,
                        }}
                      >
                        {item.prediction.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-cyan-400 font-bold">
                      {item.prediction.dominantPollutant}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                      {item.input.pm25} µg/m³
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                      {item.input.pm10} µg/m³
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                      {item.input.temperature}°C / {item.input.humidity}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                      {item.input.windSpeed}m/s / {item.input.pressure}hPa
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-emerald-400">
                      {item.prediction.inferenceTimeMs}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
