import React from 'react';

interface PollutantCardProps {
  name: string;
  formula: string;
  value: number;
  unit: string;
  whoStandard: number;
  description: string;
  dangerThreshold: number;
}

export const PollutantCard: React.FC<PollutantCardProps> = ({
  name,
  formula,
  value,
  unit,
  whoStandard,
  description,
  dangerThreshold,
}) => {
  const ratio = value / whoStandard;
  const isElevated = ratio > 1.0;
  const isDangerous = value >= dangerThreshold;

  const barWidth = Math.min((value / (whoStandard * 3)) * 100, 100);

  const getStatusColor = () => {
    if (isDangerous) return { text: 'text-rose-400', bg: 'bg-rose-500', pill: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
    if (isElevated) return { text: 'text-amber-400', bg: 'bg-amber-500', pill: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    return { text: 'text-emerald-400', bg: 'bg-emerald-500', pill: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
  };

  const status = getStatusColor();

  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white text-base">{name}</span>
            <span className="text-xs font-mono text-cyan-400 font-semibold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
              {formula}
            </span>
          </div>
          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${status.pill}`}>
            {isDangerous ? 'Hazard' : isElevated ? 'Elevated' : 'Optimal'}
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className={`text-2xl font-black tracking-tight ${status.text}`}>
            {value.toFixed(1)}
          </span>
          <span className="text-xs font-medium text-slate-400">{unit}</span>
        </div>

        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{description}</p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
          <span>WHO Guideline: {whoStandard} {unit}</span>
          <span className="font-semibold text-slate-300">{(ratio * 100).toFixed(0)}% limit</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${status.bg}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
};
