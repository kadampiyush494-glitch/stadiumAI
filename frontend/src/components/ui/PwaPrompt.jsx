import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show after 30s to avoid annoying users
      setTimeout(() => setIsVisible(true), 30000);
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-40"
        >
          <div className="glass-panel p-4 flex items-center justify-between border-cyan-400/30 bg-cyan-400/5">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-400/20">
                <Download className="text-slate-950" size={24} />
              </div>
              <div className="space-y-0.5">
                <p className="font-black text-sm text-white">Install OmniFlow</p>
                <p className="text-slate-300 text-[10px] font-bold uppercase tracking-wider">Zero-latency stadium OS</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleInstall}
                className="px-4 py-2 bg-cyan-400 text-slate-950 text-xs font-black rounded-lg active:scale-95 transition-all"
              >
                Install
              </button>
              <button onClick={() => setIsVisible(false)} className="p-2 text-slate-300 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
