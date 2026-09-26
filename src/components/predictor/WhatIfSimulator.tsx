import React, { useState } from 'react';
import { EnvironmentalData, PredictionResult } from '../../types/aqi';
import { predictAQI, getAQICategoryInfo } from '../../utils/aqiCalculator';
import { Sliders, Sparkles, RefreshCw, BarChart2, ShieldCheck, Save, Clock, HelpCircle } from 'lucide-react';

interface WhatIfSimulatorProps {
  initialData: EnvironmentalData;
  onSavePrediction?: (prediction: PredictionResult, input: EnvironmentalData) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  initialData,
  onSavePrediction,
}) => {
  const [formData, setFormData] = useState<EnvironmentalData>(initialData);
  const [prediction, setPrediction] = useState<PredictionResult>(() => predictAQI(initialData));
  const [isSaved, setIsSaved] = useState(false);

  // Update input and run immediate inference
  const updateField = (field: keyof EnvironmentalData, value: number) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    setPrediction(predictAQI(updated));
    setIsSaved(false);
  };

  // Presets
  const applyPreset = (presetName: string) => {
    let preset: Partial<EnvironmentalData> = {};

    if (presetName === 'post-rain') {
      preset = {
        pm25: 14.0,
        pm10: 25.0,
        o3: 28.0,
        no2: 18.0,
        so2: 4.0,
        co: 0.35,
        temperature: 20.0,
        humidity: 88,
        windSpeed: 4.5,
        pressure: 1011.0,
      };
    } else if (presetName === 'rush-hour') {
      preset = {
        pm25: 85.0,
        pm10: 140.0,
        o3: 35.0,
        no2: 82.0,
        so2: 22.0,
        co: 2.8,
        temperature: 28.0,
        humidity: 55,
        windSpeed: 1.4,
        pressure: 1013.0,
      };
    } else if (presetName === 'dust-storm') {
      preset = {
        pm25: 95.0,
        pm10: 380.0,
        o3: 42.0,
        no2: 30.0,
        so2: 12.0,
        co: 0.9,
        temperature: 34.0,
        humidity: 24,
        windSpeed: 8.5,
        pressure: 1005.0,
      };
    } else if (presetName === 'winter-smog') {
      preset = {
        pm25: 240.0,
        pm10: 340.0,
        o3: 22.0,
        no2: 95.0,
        so2: 45.0,
        co: 3.5,
        temperature: 11.0,
        humidity: 82,
        windSpeed: 0.8,
        pressure: 1022.0,
      };
    } else if (presetName === 'summer-ozone') {
      preset = {
        pm25: 38.0,
        pm10: 75.0,
        o3: 135.0,
        no2: 48.0,
        so2: 9.0,
        co: 0.8,
        temperature: 36.5,
        humidity: 40,
        windSpeed: 2.1,
        pressure: 1010.0,
      };
    }

    const merged = { ...formData, ...preset };
    setFormData(merged);
    setPrediction(predictAQI(merged));
    setIsSaved(false);
  };

  const handleSave = () => {
    if (onSavePrediction) {
      onSavePrediction(prediction, formData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  const catInfo = getAQICategoryInfo(prediction.predictedAQI);

  return (
    <div className="space-y-6">
      {/* Top Banner & Scenario Presets */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              Interactive What-If Simulation Engine
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate atmospheric conditions and evaluate instant LightGBM GBDT response curves
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Presets:
            </span>
            <button
              onClick={() => applyPreset('post-rain')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
            >
              🌧️ Post-Rain Wash
            </button>
            <button
              onClick={() => applyPreset('rush-hour')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
            >
              🚗 Rush-Hour Traffic
            </button>
            <button
              onClick={() => applyPreset('dust-storm')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-orange-500/10 text-orange-300 border border-orange-500/30 hover:bg-orange-500/20 transition-colors"
            >
              🌪️ Dust Storm
            </button>
            <button
              onClick={() => applyPreset('winter-smog')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
            >
              🌫️ Thermal Inversion Smog
            </button>
            <button
              onClick={() => applyPreset('summer-ozone')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition-colors"
            >
              ☀️ Ozone Surge
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Adjustment Controls (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              Sensor & Meteorological Predictors
            </span>
            <button
              onClick={() => {
                setFormData(initialData);
                setPrediction(predictAQI(initialData));
              }}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset to Baseline
            </button>
          </div>

          {/* Pollutant Controls */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Air Pollutants (Concentration Metrics)
            </h4>

            <div className="space-y-4">
              {/* PM2.5 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-200">PM2.5 (Fine Particulate)</span>
                  <span className="font-mono text-cyan-400 font-bold">{formData.pm25} µg/m³</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="350"
                  step="0.5"
                  value={formData.pm25}
                  onChange={(e) => updateField('pm25', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>0 (Pristine)</span>
                  <span className="text-amber-500">35 (Moderate)</span>
                  <span className="text-rose-500">150+ (Hazardous)</span>
                </div>
              </div>

              {/* PM10 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-200">PM10 (Coarse Particulate)</span>
                  <span className="font-mono text-cyan-400 font-bold">{formData.pm10} µg/m³</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="1"
                  value={formData.pm10}
                  onChange={(e) => updateField('pm10', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>0 (Safe)</span>
                  <span className="text-amber-500">100 (Threshold)</span>
                  <span className="text-rose-500">300+ (Extreme)</span>
                </div>
              </div>

              {/* Ground-level Ozone O3 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-200">Ground-Level Ozone (O3)</span>
                  <span className="font-mono text-cyan-400 font-bold">{formData.o3} µg/m³</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="250"
                  step="1"
                  value={formData.o3}
                  onChange={(e) => updateField('o3', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* NO2, SO2, CO Triple Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">NO2 (µg/m³)</label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={formData.no2}
                    onChange={(e) => updateField('no2', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">SO2 (µg/m³)</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={formData.so2}
                    onChange={(e) => updateField('so2', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">CO (mg/m³)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={formData.co}
                    onChange={(e) => updateField('co', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Meteorological Controls */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Meteorological Dynamics & Atmospheric Boundary
            </h4>

            <div className="grid grid-cols-2 gap-4">
              {/* Temperature */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300">Temperature</span>
                  <span className="font-mono text-cyan-400 font-bold">{formData.temperature} °C</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="48"
                  step="0.5"
                  value={formData.temperature}
                  onChange={(e) => updateField('temperature', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Humidity */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300">Relative Humidity</span>
                  <span className="font-mono text-cyan-400 font-bold">{formData.humidity} %</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={formData.humidity}
                  onChange={(e) => updateField('humidity', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Wind Speed */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300">Wind Speed (Dispersal)</span>
                  <span className="font-mono text-cyan-400 font-bold">{formData.windSpeed} m/s</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="20"
                  step="0.2"
                  value={formData.windSpeed}
                  onChange={(e) => updateField('windSpeed', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Atmospheric Pressure */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300">Pressure</span>
                  <span className="font-mono text-cyan-400 font-bold">{formData.pressure} hPa</span>
                </div>
                <input
                  type="range"
                  min="970"
                  max="1035"
                  step="0.5"
                  value={formData.pressure}
                  onChange={(e) => updateField('pressure', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Prediction Output & Feature Attribution (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Prediction Scorecard */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-25 pointer-events-none"
              style={{ backgroundColor: catInfo.color }}
            />

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Predicted Air Quality Index
              </span>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/40">
                ⚡ {prediction.inferenceTimeMs}ms
              </span>
            </div>

            {/* Big Value Display */}
            <div className="my-5 flex items-baseline gap-3">
              <span
                className="text-6xl font-black tracking-tight"
                style={{ color: catInfo.color }}
              >
                {prediction.roundedAQI}
              </span>
              <div>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${catInfo.bgColor} ${catInfo.borderColor} ${catInfo.textColor}`}>
                  {prediction.category}
                </span>
                <span className="block text-[11px] text-slate-400 mt-1 font-mono">
                  Confidence: {(prediction.confidenceScore * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Health Directive */}
            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-xs text-slate-300 leading-relaxed mb-4">
              <strong className="text-white">Guidance: </strong>
              {prediction.healthAdvice}
            </div>

            {/* Save to Log Button */}
            <button
              onClick={handleSave}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
                isSaved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20'
              }`}
            >
              {isSaved ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Saved to Audit History!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Log Prediction to MongoDB Audit Store
                </>
              )}
            </button>
          </div>

          {/* Local Feature Attribution (TreeSHAP Waterfall Plot) */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-cyan-400" />
                  TreeSHAP Local Explainability Waterfall
                </h4>
                <span className="text-[10px] text-slate-400">
                  Decomposition: f(x) = E[f(x)] + Σ φᵢ
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/40">
                Base E[f(x)] = 42.0
              </span>
            </div>

            {/* Waterfall step-by-step contribution breakdown */}
            <div className="mt-4 space-y-2.5">
              {/* Baseline row */}
              <div className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-800/60 text-slate-400 font-mono">
                <span>Expected Value E[f(x)]</span>
                <span className="text-white font-bold">42.0 AQI</span>
              </div>

              {prediction.featureContributions.map((fc, i) => (
                <div key={i} className="text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-300 font-medium">{fc.feature}</span>
                    <span
                      className={`font-mono font-bold ${
                        fc.direction === 'positive' ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {fc.direction === 'positive' ? `+${fc.impact.toFixed(1)}` : `-${fc.impact.toFixed(1)}`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        fc.direction === 'positive'
                          ? 'bg-gradient-to-r from-rose-500 to-red-400'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                      style={{ width: `${Math.min(fc.impact * 2.4, 100)}%` }}
                    />
                  </div>
                </div>
              ))}

              {/* Total final sum */}
              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800 font-mono font-bold">
                <span className="text-white">Predicted Output f(x)</span>
                <span style={{ color: catInfo.color }} className="text-sm">
                  {prediction.predictedAQI.toFixed(1)} AQI
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 mt-3 leading-tight">
              TreeSHAP calculates exact additive Shapley values ensuring efficiency and symmetry. Rose bars push AQI higher; teal bars depress AQI toward clean air.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
