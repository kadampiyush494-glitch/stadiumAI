import { useState, useEffect } from 'react';
import GlassCard from '../components/ui/GlassCard';
import StadiumMap from '../components/map/StadiumMap';
import RealtimeTicker from '../components/ui/RealtimeTicker';
import DensityCircle, { GateStatus } from '../components/ui/Indicators';
import { CardSkeleton } from '../components/ui/Skeleton';
import { Zap, Users, Navigation } from 'lucide-react';

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    queues: [],
    zones: [],
    ticks: []
  });

  useEffect(() => {
    // Simulate initial load for skeletons
    const timer = setTimeout(() => {
      setData({
        queues: [
          { id: 1, name: 'Gate A Entrance', waitTime: 4, status: 'open' },
          { id: 2, name: 'Food Stall C', waitTime: 12, status: 'congested' },
          { id: 3, name: 'Main Restroom', waitTime: 22, status: 'congested' }
        ],
        zones: [
          { name: 'North Stand', density: 88 },
          { name: 'South Stand', density: 32 },
          { name: 'East Plaza', density: 56 }
        ],
        ticks: [
          "Gate 4 now OPEN - Normal flow",
          "Beverage Stand 12: Wait time < 2 mins",
          "High density detected in Zone B - Use alternate route",
          "Match time remaining: 15 minutes"
        ]
      });
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">
          Command <span className="text-cyan-400">Center</span>
        </h1>
        <p className="text-slate-300 font-bold uppercase tracking-[0.2em] text-xs">OmniFlow Live Stadium Optimization</p>
      </header>

      <RealtimeTicker updates={data.ticks} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <GlassCard className="lg:col-span-3 h-[600px] relative border-none" delay={0.1}>
          <StadiumMap onRouteAnnounce={(msg) => console.log('A11y:', msg)} />
          <div className="absolute top-6 left-6 p-4 glass-panel border-cyan-400/20 pointer-events-none">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">Live Optimization Active</span>
            </div>
          </div>
        </GlassCard>
        
        <div className="space-y-6">
          <GlassCard className="p-6" delay={0.2}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Users size={16} className="text-cyan-400" />
                Crowd Density
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {data.zones.map(z => (
                <div key={z.name} className="flex flex-col items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                  <DensityCircle percentage={z.density} />
                  <span className="mt-3 text-[10px] uppercase font-bold text-slate-300">{z.name}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6" delay={0.3}>
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              Real-time Queues
            </h3>
            <div className="space-y-4">
              {data.queues.map(q => (
                <div key={q.id} className="group p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm tracking-tight">{q.name}</span>
                    <GateStatus status={q.status} />
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="flex items-center space-x-1 text-slate-300">
                      <Navigation size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Estimated Wait</span>
                    </div>
                    <span className="text-xl font-black font-mono text-white">{q.waitTime}m</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
