import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function HighContrastToggle() {
  const [isHighContrast, setIsHighContrast] = useState(() => {
    return localStorage.getItem('high-contrast') === 'true';
  });

  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    localStorage.setItem('high-contrast', isHighContrast);
  }, [isHighContrast]);

  return (
    <button
      onClick={() => setIsHighContrast(!isHighContrast)}
      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors flex items-center space-x-2"
      aria-pressed={isHighContrast}
      aria-label="Toggle High Contrast Mode"
      title="High Contrast Mode"
    >
      {isHighContrast ? <EyeOff size={20} /> : <Eye size={20} />}
      <span className="text-xs font-bold uppercase tracking-wider">Contrast</span>
    </button>
  );
}
