import { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function RealtimeTicker({ updates = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (updates.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % updates.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [updates]);

  if (updates.length === 0) return null;

  return (
    <div className="bg-slate-900/50 border-y border-white/5 py-2 overflow-hidden flex items-center">
      <div className="px-4 border-r border-white/10 flex items-center space-x-2 text-cyan-400 font-black text-xs uppercase tracking-tighter">
        <Zap size={14} className="fill-current" />
        <span>Live</span>
      </div>
      
      <div className="flex-1 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="text-slate-400 text-xs font-medium flash"
          >
            {updates[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
