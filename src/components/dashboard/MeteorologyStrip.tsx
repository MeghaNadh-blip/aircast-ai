import React from 'react';
import { Thermometer, Droplets, Wind, Gauge } from 'lucide-react';

interface MeteorologyStripProps {
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
}

export const MeteorologyStrip: React.FC<MeteorologyStripProps> = ({
  temperature,
  humidity,
  windSpeed,
  pressure,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Temperature */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-3.5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
          <Thermometer className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Temperature
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-white">{temperature.toFixed(1)}</span>
            <span className="text-xs text-slate-400">°C</span>
          </div>
          <span className="text-[10px] text-slate-500">
            {temperature > 30 ? 'Thermal Ozone Driver' : 'Standard Inversion'}
          </span>
        </div>
      </div>

      {/* Humidity */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-3.5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
          <Droplets className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Humidity
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-white">{humidity.toFixed(0)}</span>
            <span className="text-xs text-slate-400">%</span>
          </div>
          <span className="text-[10px] text-slate-500">
            {humidity > 70 ? 'Moisture Condensation' : 'Dry Particulate'}
          </span>
        </div>
      </div>

      {/* Wind Speed */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-3.5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
          <Wind className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Wind Speed
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-white">{windSpeed.toFixed(1)}</span>
            <span className="text-xs text-slate-400">m/s</span>
          </div>
          <span className="text-[10px] text-slate-500">
            {windSpeed < 2.0 ? 'Stagnant (Trap)' : 'Active Dispersion'}
          </span>
        </div>
      </div>

      {/* Atmospheric Pressure */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-3.5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
          <Gauge className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Pressure
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-white">{pressure.toFixed(1)}</span>
            <span className="text-xs text-slate-400">hPa</span>
          </div>
          <span className="text-[10px] text-slate-500">
            {pressure > 1015 ? 'High (Inversion Cap)' : 'Standard Atmospheric'}
          </span>
        </div>
      </div>
    </div>
  );
};
