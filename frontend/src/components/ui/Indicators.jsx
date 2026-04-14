
export default function DensityCircle({ percentage, size = 60 }) {
  const radius = size * 0.4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = (p) => {
    if (p > 80) return 'stroke-rose-500';
    if (p > 50) return 'stroke-amber-500';
    return 'stroke-emerald-500';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-white/5 fill-none"
          strokeWidth="4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`${getColor(percentage)} fill-none transition-all duration-1000`}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[10px] font-black font-mono text-white">
        {percentage}%
      </span>
    </div>
  );
}

export function GateStatus({ status = 'open' }) {
  const color = {
    open: 'bg-emerald-500 shadow-emerald-500/50',
    congested: 'bg-amber-500 shadow-amber-500/50',
    closed: 'bg-rose-500 shadow-rose-500/50'
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${color[status]} pulse-scale shadow-lg`} />
      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300">
        Gate {status}
      </span>
    </div>
  );
}
