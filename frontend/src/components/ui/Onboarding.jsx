import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, Map, Zap, ShieldCheck } from 'lucide-react';

const STEPS = [
  {
    title: "Stadium Intelligence",
    desc: "Real-time heatmaps show you where the crowds are, helping you move like a pro.",
    icon: <Map className="text-cyan-400" size={48} />
  },
  {
    title: "AI Optimization",
    desc: "Ask OmniFlow anything. Our AI suggests the fastest routes and shortest lines.",
    icon: <Zap className="text-amber-500" size={48} />
  },
  {
    title: "Seamless Exits",
    desc: "Personalized exit timing coordinates your departure for a zero-wait experience.",
    icon: <ShieldCheck className="text-emerald-400" size={48} />
  }
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="max-w-sm w-full space-y-12 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className="space-y-8"
          >
            <div className="flex justify-center">{STEPS[step].icon}</div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black">{STEPS[step].title}</h2>
              <p className="text-slate-300 leading-relaxed">{STEPS[step].desc}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center space-x-2">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all ${i === step ? 'w-8 bg-cyan-400' : 'w-2 bg-white/10'}`} />
          ))}
        </div>

        <div className="flex flex-col space-y-4">
          <button 
            onClick={() => step < STEPS.length - 1 ? setStep(step + 1) : setIsVisible(false)}
            className="w-full py-4 bg-cyan-400 text-slate-950 font-black rounded-2xl flex items-center justify-center space-x-2 shadow-xl shadow-cyan-400/20 active:scale-95 transition-all"
          >
            <span>{step === STEPS.length - 1 ? 'Get Started' : 'Next'}</span>
            <ChevronRight size={20} />
          </button>
          <button onClick={() => setIsVisible(false)} className="text-slate-300 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors">Skip Tutorial</button>
        </div>
      </div>
    </div>
  );
}
