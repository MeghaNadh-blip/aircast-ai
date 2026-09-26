import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Info, HeartPulse } from 'lucide-react';
import { getAQICategoryInfo } from '../../utils/aqiCalculator';

interface AQIGaugeProps {
  aqi: number;
  dominantPollutant: string;
  stationName: string;
  cityName: string;
  countryName: string;
}

export const AQIGauge: React.FC<AQIGaugeProps> = ({
  aqi,
  dominantPollutant,
  stationName,
  cityName,
  countryName,
}) => {
  const cat = getAQICategoryInfo(aqi);

  // Calculate angle for semi-circle arc (0 to 180 degrees)
  // Max AQI mapped to 400 for gauge visualization
  const percentage = Math.min(Math.max(aqi / 400, 0), 1);
  const strokeDashoffset = 440 - 440 * (percentage * 0.75); // 270 degree arc

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between shadow-xl relative overflow-hidden backdrop-blur-sm">
      {/* Subtle background glow matching AQI color */}
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: cat.color }}
      />

      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Current Air Quality Index (AQI)
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            {cityName}, {countryName}
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{stationName}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-800 border border-slate-700 text-slate-300">
            Primary: <strong className="text-cyan-400">{dominantPollutant}</strong>
          </span>
        </div>
      </div>

      {/* Radial Gauge Visualizer */}
      <div className="flex flex-col items-center justify-center my-4 relative">
        <div className="relative w-56 h-56 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-135" viewBox="0 0 160 160">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r="65"
              fill="none"
              stroke="#1e293b"
              strokeWidth="14"
              strokeDasharray="306"
              strokeDashoffset="76"
              strokeLinecap="round"
            />
            {/* Active Value Arc */}
            <circle
              cx="80"
              cy="80"
              r="65"
              fill="none"
              stroke={cat.color}
              strokeWidth="14"
              strokeDasharray="306"
              strokeDashoffset={306 - (306 - 76) * percentage}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className="text-6xl font-extrabold tracking-tighter transition-colors duration-500"
              style={{ color: cat.color }}
            >
              {Math.round(aqi)}
            </span>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">
              US-EPA AQI
            </span>
          </div>
        </div>

        {/* Category Pill */}
        <div
          className={`mt-[-16px] px-4 py-1.5 rounded-full border text-xs sm:text-sm font-bold tracking-wide flex items-center gap-2 shadow-lg transition-all ${cat.bgColor} ${cat.borderColor} ${cat.textColor}`}
        >
          {aqi <= 50 ? (
            <CheckCircle className="w-4 h-4" />
          ) : aqi <= 100 ? (
            <Info className="w-4 h-4" />
          ) : aqi <= 200 ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <ShieldAlert className="w-4 h-4" />
          )}
          <span>{cat.category.toUpperCase()}</span>
        </div>
      </div>

      {/* Advisory & Impact Banner */}
      <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 space-y-2">
        <div className="flex items-start gap-2.5">
          <HeartPulse className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white">Health Advisory: </strong>
            {cat.advisory}
          </p>
        </div>
        <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
          <span className="text-amber-400 font-semibold">Sensitive Groups: </span>
          {cat.vulnerableGroups}
        </div>
      </div>
    </div>
  );
};
