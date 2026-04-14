import { useState, useEffect } from "react";
import { Clock, TrendingUp, Star } from 'lucide-react';
import { queueService } from '../../lib/queueService';

const Badge = ({ minutes }) => {
  let colorClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
  let label = '< 5 min';
  
  if (minutes > 15) {
    colorClass = 'bg-rose-500/20 text-rose-400 border-rose-500/50';
    label = '> 15 min';
  } else if (minutes >= 5) {
    colorClass = 'bg-amber-500/20 text-amber-400 border-amber-500/50';
    label = '5-15 min';
  }

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${colorClass}`}>
      {label}
    </span>
  );
};

const QueueCard = ({ item, isBest }) => {
  const [timeLeft, setTimeLeft] = useState(item.waitTime * 60);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className={`relative p-4 rounded-xl transition-all duration-300 ${
      isBest 
        ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
        : 'bg-slate-800/50 border border-slate-700 hover:border-slate-500'
    }`}>
      {isBest && (
        <div className="absolute -top-3 left-4 bg-amber-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
          <Star size={10} className="mr-1 fill-current" /> SMART CHOICE
        </div>
      )}
      
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-slate-100 font-semibold text-sm">{item.name}</h4>
          <p className="text-slate-400 text-xs">{item.subtext || 'Main concourse'}</p>
        </div>
        <Badge minutes={item.waitTime} />
      </div>

      <div className="flex items-end justify-between">
        <div className="flex items-center text-slate-300">
          <Clock size={14} className="mr-1.5 text-cyan-400" />
          <span className="text-lg font-mono font-bold tracking-tighter">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
        </div>
        <div className="flex items-center text-[10px] text-slate-500 uppercase tracking-wider font-bold">
          <TrendingUp size={12} className="mr-1 text-emerald-400" /> Stable
        </div>
      </div>
    </div>
  );
};

const Skeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
    {[1, 2, 3].map(i => (
      <div key={i} className="h-32 bg-slate-800 rounded-xl border border-slate-700"></div>
    ))}
  </div>
);

export default function QueuePanel({ category = 'food', userLocation }) {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = queueService.listenToQueues(category, (data) => {
      // Optimistic sorting / enhancement
      const ranked = queueService.getBestOptions(data, userLocation || { lat: 37.7749, lng: -122.4194 });
      setQueues(ranked);
      setLoading(false);
    });
    return () => unsub();
  }, [category, userLocation]);

  if (loading) return <Skeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white capitalize">{category} Queues</h3>
        <div className="text-xs text-slate-400">Live updates every 30s</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {queues.map((item, index) => (
          <QueueCard 
            key={item.id} 
            item={item} 
            isBest={index === 0} 
          />
        ))}
      </div>
      
      {queues.length === 0 && (
        <div className="text-center py-10 text-slate-500 italic">
          No live data available for this section.
        </div>
      )}
    </div>
  );
}
