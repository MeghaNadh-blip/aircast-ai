import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ComposedChart,
  Line,
  Bar,
} from 'recharts';
import { CityStation } from '../../types/aqi';
import { TrendingUp, PieChart, Activity } from 'lucide-react';

interface ChartsSectionProps {
  station: CityStation;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ station }) => {
  const [activeChart, setActiveChart] = useState<'trend' | 'radar' | 'correlation'>('trend');

  // Prepare radar data normalized against WHO standards
  const radarData = [
    { pollutant: 'PM2.5', current: Math.min((station.current.pm25 / 15) * 100, 300), standard: 100, unit: 'µg/m³' },
    { pollutant: 'PM10', current: Math.min((station.current.pm10 / 45) * 100, 300), standard: 100, unit: 'µg/m³' },
    { pollutant: 'Ozone (O3)', current: Math.min((station.current.o3 / 100) * 100, 300), standard: 100, unit: 'µg/m³' },
    { pollutant: 'NO2', current: Math.min((station.current.no2 / 25) * 100, 300), standard: 100, unit: 'µg/m³' },
    { pollutant: 'SO2', current: Math.min((station.current.so2 / 40) * 100, 300), standard: 100, unit: 'µg/m³' },
    { pollutant: 'CO', current: Math.min((station.current.co / 4.0) * 100, 300), standard: 100, unit: 'mg/m³' },
  ];

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-sm">
      {/* Chart Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Atmospheric Analytics & Visualizations
          </h3>
          <p className="text-xs text-slate-400">
            Real-time hourly measurements from {station.stationName}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveChart('trend')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeChart === 'trend'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            24h Trend
          </button>
          <button
            onClick={() => setActiveChart('radar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeChart === 'radar'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            WHO Benchmark Radar
          </button>
          <button
            onClick={() => setActiveChart('correlation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeChart === 'correlation'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Weather Correlation
          </button>
        </div>
      </div>

      {/* Chart Viewport */}
      <div className="mt-6 h-[340px] w-full">
        {activeChart === 'trend' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={station.history24h} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="pm25Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <ReferenceLine y={50} label={{ value: 'Good (50)', fill: '#10b981', fontSize: 10, position: 'right' }} stroke="#10b981" strokeDasharray="3 3" />
              <ReferenceLine y={100} label={{ value: 'Moderate (100)', fill: '#f59e0b', fontSize: 10, position: 'right' }} stroke="#f59e0b" strokeDasharray="3 3" />
              <ReferenceLine y={150} label={{ value: 'Unhealthy (150)', fill: '#ef4444', fontSize: 10, position: 'right' }} stroke="#ef4444" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="aqi"
                name="Air Quality Index (AQI)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#aqiGradient)"
              />
              <Area
                type="monotone"
                dataKey="pm25"
                name="PM2.5 (µg/m³)"
                stroke="#f59e0b"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#pm25Gradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'radar' && (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="pollutant" stroke="#94a3b8" fontSize={12} />
              <PolarRadiusAxis stroke="#475569" angle={30} domain={[0, 250]} />
              <Radar
                name="Current Recorded Concentration (% of WHO Max)"
                dataKey="current"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.4}
              />
              <Radar
                name="WHO Safe Guideline Baseline (100%)"
                dataKey="standard"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.15}
                strokeDasharray="4 4"
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
              <Tooltip
                formatter={(val: any) => [`${val}% of WHO Threshold`, 'Level']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'correlation' && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={station.history24h} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" stroke="#64748b" fontSize={11} tickLine={false} label={{ value: 'AQI', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={11} tickLine={false} label={{ value: 'Wind (m/s) & Temp (°C)', angle: 90, position: 'insideRight', fill: '#64748b', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar yAxisId="left" dataKey="aqi" name="AQI" fill="#0891b2" radius={[4, 4, 0, 0]} opacity={0.65} />
              <Line yAxisId="right" type="monotone" dataKey="windSpeed" name="Wind Speed (m/s)" stroke="#38bdf8" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="#fb923c" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>✨ Sensor calibration protocol: Dual-laser optical scattering + electro-chemical cells</span>
        <span className="font-mono text-cyan-400">Sampling Rate: 60s / Rolling 1h Mean</span>
      </div>
    </div>
  );
};
