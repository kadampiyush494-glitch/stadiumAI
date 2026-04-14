import { Home, Map as MapIcon, MessageSquare, DoorOpen, Bell } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  return (
    <nav aria-label="Mobile Navigation" className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-xl border-t border-white/10 px-6 py-3 pb-6">
      <div className="flex justify-between items-center">
        <NavTab to="/" icon={<Home size={20} />} label="Home" />
        <NavTab to="/map" icon={<MapIcon size={20} />} label="Map" />
        <NavTab to="/ai" icon={<MessageSquare size={20} />} label="AI" />
        <NavTab to="/exit" icon={<DoorOpen size={20} />} label="Exit" />
        <NavTab to="/notifs" icon={<Bell size={20} />} label="Alerts" />
      </div>
    </nav>
  );
}

function NavTab({ to, icon, label }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `flex flex-col items-center space-y-1 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-300'}`}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </NavLink>
  );
}
