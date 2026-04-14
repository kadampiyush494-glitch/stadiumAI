import React from 'react';
import { Outlet } from 'react-router-dom';
import { useStore } from '../../store';
import { cn } from '../ui/Button';

export function Layout() {
  const { accessibilityHighContrast, toggleHighContrast } = useStore();

  return (
    <div className={cn("min-h-screen transition-colors duration-300", 
        accessibilityHighContrast ? "bg-black text-white" : "bg-primary text-white"
    )}>
      <header className="border-b border-white/10 bg-primary/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tighter text-secondary">
              Omni<span className="text-white">Flow</span>
            </h1>
          </div>
          
          <nav className="flex items-center gap-4">
            <button 
              onClick={toggleHighContrast}
              aria-label="Toggle High Contrast"
              className="text-sm p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              {accessibilityHighContrast ? 'Normal Contrast' : 'High Contrast'}
            </button>
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-sm">
              U
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
