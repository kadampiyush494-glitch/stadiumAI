import React from 'react';
import { AlertTriangle, Users } from 'lucide-react';

const TrendSparkline = ({ data }) => {
  const max = Math.max(...data, 10);
  return (
    <div className="flex items-end space-x-0.5 h-6">
      {data.map((val, i) => (
        <div 
          key={i} 
          className="w-1 bg-cyan-500/40 rounded-t-sm" 
          style={{ height: `${(val / max) * 100}%` }}
        ></div>
      ))}
    </div>
  );
};

const DensityBar = ({ density }) => {
  const isDanger = density >= 85;
  return (
    <div className="mt-2 group">
      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-1">
        <span>Density</span>
        <span className={isDanger ? 'text-rose-400' : 'text-slate-300'}>{density}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${
            isDanger ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 
            density > 60 ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${density}%` }}
        ></div>
      </div>
    </div>
  );
};

const ZoneCard = ({ zone }) => {
  const isDanger = zone.density >= 85;
  
  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 ${
      isDanger 
        ? 'bg-rose-500/10 border-rose-500/50 shadow-[inset_0_0_20px_rgba(244,63,94,0.1)]' 
        : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg mr-3 ${isDanger ? 'bg-rose-500/20 text-rose-500' : 'bg-slate-700 text-slate-400'}`}>
            <Users size={18} />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm leading-tight">{zone.name}</h4>
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{zone.capacityLabel || 'Section 100-120'}</span>
          </div>
        </div>
        {isDanger && (
          <div className="relative">
            <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-25"></div>
            <AlertTriangle size={18} className="text-rose-500 relative z-10" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between py-2 border-y border-white/5">
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-thinner">Historical (30m)</div>
        <TrendSparkline data={zone.history || [20, 45, 30, 60, 80, 75]} />
      </div>

      <DensityBar density={zone.density} />
    </div>
  );
};

export default function CrowdPanel() {
  const mockZones = [
    { id: 'z1', name: 'North Entrance', density: 92, capacityLabel: 'Main Gate', history: [40, 50, 70, 85, 95, 92] },
    { id: 'z2', name: 'East Concourse', density: 45, capacityLabel: 'Sections 101-115', history: [20, 25, 35, 40, 50, 45] },
    { id: 'z3', name: 'West Food Court', density: 72, capacityLabel: 'Level 2', history: [80, 75, 70, 65, 70, 72] },
    { id: 'z4', name: 'Plaza Seating', density: 30, capacityLabel: 'Premium Lounge', history: [10, 15, 20, 25, 30, 30] },
    { id: 'z5', name: 'Parking Hub', density: 15, capacityLabel: 'Ride Share', history: [5, 10, 12, 18, 20, 15] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Live Crowd Density</h3>
          <p className="text-slate-500 text-xs">Real-time heat visualization by zone</p>
        </div>
        <div className="flex space-x-2">
          <div className="flex items-center text-[10px] font-bold text-slate-400">
             <div className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></div> SAFE
          </div>
          <div className="flex items-center text-[10px] font-bold text-slate-400">
             <div className="w-2 h-2 rounded-full bg-rose-500 mr-1.5 animate-pulse"></div> CRITICAL
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
        {mockZones.map(zone => (
          <ZoneCard key={zone.id} zone={zone} />
        ))}
      </div>
      
      <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center text-slate-400 text-xs italic">
           <AlertTriangle size={14} className="mr-2 text-amber-500" />
           Average stadium density at 42%. Flow is optimal.
        </div>
        <button className="text-[10px] font-bold text-cyan-500 uppercase hover:text-cyan-400 transition-colors">
          View Heatmap
        </button>
      </div>
    </div>
  );
}
