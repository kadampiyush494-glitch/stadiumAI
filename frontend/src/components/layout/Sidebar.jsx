import React, { useState } from 'react';
import { Home, Map as MapIcon, MessageSquare, DoorOpen, Bell, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`hidden md:flex flex-col h-screen sticky top-0 bg-slate-950/50 backdrop-blur-2xl border-r border-white/10 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-6 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-400 flex-shrink-0" />
        {!isCollapsed && <span className="text-xl font-black italic tracking-tighter">OMNI<span className="text-cyan-400">FLOW</span></span>}
      </div>

      <nav aria-label="Main Navigation" className="flex-1 px-4 py-8 space-y-2">
        <SidebarItem to="/" icon={<Home size={22} />} label="Overview" collapsed={isCollapsed} />
        <SidebarItem to="/map" icon={<MapIcon size={22} />} label="Stadium Map" collapsed={isCollapsed} />
        <SidebarItem to="/ai" icon={<MessageSquare size={22} />} label="AI Assistant" collapsed={isCollapsed} />
        <SidebarItem to="/exit" icon={<DoorOpen size={22} />} label="Smart Exit" collapsed={isCollapsed} />
        <SidebarItem to="/notifs" icon={<Bell size={22} />} label="Notifications" collapsed={isCollapsed} />
      </nav>

      <div className="p-4 border-t border-white/5 space-y-2">
        <SidebarItem to="/settings" icon={<Settings size={22} />} label="Settings" collapsed={isCollapsed} />
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center p-3 rounded-xl text-slate-300 hover:bg-white/5 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={22} /> : <div className="flex items-center space-x-3"><ChevronLeft size={22} /><span>Collapse</span></div>}
        </button>
      </div>
    </aside>
  );
}

function SidebarItem({ to, icon, label, collapsed }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `flex items-center space-x-4 p-3 rounded-xl transition-all ${isActive ? 'bg-cyan-400/10 text-cyan-400 ring-1 ring-cyan-400/20' : 'text-slate-300 hover:bg-white/5'}`}
    >
      <div className="flex-shrink-0">{icon}</div>
      {!collapsed && <span className="font-bold text-sm">{label}</span>}
    </NavLink>
  );
}
