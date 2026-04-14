import { useState, useEffect } from "react";
import { LogOut, Navigation, ArrowRight, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GateStatus = ({ status }) => {
  const styles = {
    Open: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Congested: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Closed: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black border ${styles[status] || styles.Open}`}>
      {status}
    </span>
  );
};

export default function ExitPlanCard({ plan, matchFinished }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!plan) return;
    const updateCountdown = () => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((plan.suggestedLeaveTime - now) / 1000));
      setTimeLeft(diff);
    };

    const timer = setInterval(updateCountdown, 1000);
    updateCountdown();
    return () => clearInterval(timer);
  }, [plan]);

  if (!plan) return null;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-w-md w-full">
      {/* Header with Exit Indicator */}
      <div className="p-6 bg-gradient-to-r from-indigo-600/20 to-cyan-600/20 border-b border-white/5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400">
              <LogOut size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Predictive Exit Plan</h3>
              <p className="text-slate-400 text-xs">Optimized for Gate {plan.recommendedGate.name}</p>
            </div>
          </div>
          <GateStatus status={plan.recommendedGate.status || 'Open'} />
        </div>

        <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Suggested Leave Time</span>
            {matchFinished && <span className="text-rose-400 text-[10px] font-bold animate-pulse">MATCH ENDED</span>}
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white tracking-tight">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
            <span className="text-slate-500 text-sm font-medium">remaining</span>
          </div>
        </div>
      </div>

      {/* Route Preview (Animated Mini Map) */}
      <div className="relative h-32 bg-slate-950 overflow-hidden border-b border-white/5">
         <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-1/2 left-10 w-4 h-4 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)]"></div>
            <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent"></div>
            <motion.div 
               animate={{ x: [0, 200], opacity: [0, 1, 0] }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="absolute top-1/2 left-10 w-20 h-0.5 bg-white shadow-[0_0_10px_white]"
            />
            <div className="absolute top-1/2 right-10 w-6 h-6 border-2 border-emerald-500 rounded flex items-center justify-center text-[8px] text-emerald-500 font-bold uppercase">Exit</div>
         </div>
         <div className="absolute bottom-4 left-6 flex items-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            <Navigation size={10} className="mr-2" /> Route Preview Active
         </div>
      </div>

      {/* Instructions */}
      <div className="p-6 space-y-4">
        <div className="space-y-3">
          <div className="flex items-start space-x-4">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-400 mt-0.5">1</div>
            <p className="text-slate-300 text-sm">Head toward section {plan.recommendedGate.direction || 'Northwest'}</p>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-400 mt-0.5">2</div>
            <p className="text-slate-300 text-sm">Take Ramp B to the main concourse level</p>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-[10px] font-black text-slate-900 mt-0.5 shadow-[0_0_10px_rgba(6,182,212,0.4)]">3</div>
            <p className="text-white text-sm font-semibold">Exit through Gate {plan.recommendedGate.name}</p>
          </div>
        </div>

        <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center space-x-2 transition-transform active:scale-95 shadow-lg shadow-cyan-500/20">
          <Navigation size={20} />
          <span>NAVIGATE TO GATE {plan.recommendedGate.name}</span>
        </button>

        <div className="flex items-center justify-between pt-2">
           <div className="flex items-center text-amber-400 text-[10px] font-bold uppercase">
              <AlertCircle size={14} className="mr-1.5" /> Est. Clear Time: {Math.round(plan.estimatedClearTime)} min
           </div>
           <button className="text-slate-500 text-[10px] font-bold uppercase hover:text-white transition-colors flex items-center">
              Alt Gates <ArrowRight size={10} className="ml-1" />
           </button>
        </div>
      </div>
    </div>
  );
}
