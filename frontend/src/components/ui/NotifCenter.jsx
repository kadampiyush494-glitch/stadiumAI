import React, { useState, useEffect } from 'react';
import { Bell, X, ShieldAlert, Users, LogOut, Clock, CheckCircle2, Filter } from 'lucide-react';
import { onForegroundMessage, NOTIFICATION_TYPES } from '../../lib/fcmService';
import { motion, AnimatePresence } from 'framer-motion';

const NotifIcon = ({ type }) => {
  switch (type) {
    case NOTIFICATION_TYPES.EMERGENCY: return <ShieldAlert size={18} className="text-rose-500" />;
    case NOTIFICATION_TYPES.CONGESTION_ALERT: return <Users size={18} className="text-amber-500" />;
    case NOTIFICATION_TYPES.EXIT_REMINDER: return <LogOut size={18} className="text-cyan-500" />;
    default: return <Clock size={18} className="text-slate-400" />;
  }
};

export default function NotifCenter() {
  const [notifications, setNotifications] = useState([
     { id: 1, title: 'Welcome to StadiumAI', body: 'Enjoy the match! Stay updated with live crowd alerts.', type: 'GENERAL', timestamp: new Date(), read: false },
     { id: 2, title: 'Zone C Congested', body: 'Concourse C is experiencing high traffic. We recommend Zone B.', type: NOTIFICATION_TYPES.CONGESTION_ALERT, timestamp: new Date(Date.now() - 300000), read: false }
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const unsub = onForegroundMessage((payload) => {
       const newNotif = {
         id: Date.now(),
         title: payload.notification.title,
         body: payload.notification.body,
         type: payload.data?.type || 'GENERAL',
         timestamp: new Date(),
         read: false
       };
       setNotifications(prev => [newNotif, ...prev]);
    });
    return () => unsub && unsub();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  
  const filteredNotifications = filter === 'ALL' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      {/* Bell Trigger */}
      <button 
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-full hover:bg-white/5 transition-colors text-slate-300"
        aria-label="Open notifications"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-slate-900">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Slide-in Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsOpen(false)}
               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-slate-900 border-l border-white/10 z-[1000] flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-white flex items-center">
                     Notifications <span className="ml-3 px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-400 font-medium">{notifications.length}</span>
                  </h2>
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                   <div className="flex space-x-2">
                      <button 
                        onClick={() => setFilter('ALL')}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${filter === 'ALL' ? 'bg-cyan-500 text-slate-900 border-cyan-500' : 'text-slate-500 border-slate-800 hover:border-slate-700'}`}
                      >ALL</button>
                      <button 
                        onClick={() => setFilter(NOTIFICATION_TYPES.EMERGENCY)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${filter === NOTIFICATION_TYPES.EMERGENCY ? 'bg-rose-500 text-white border-rose-500' : 'text-slate-500 border-slate-800 hover:border-slate-700'}`}
                      >ALERTS</button>
                   </div>
                   <button onClick={markAllRead} className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400 transition-colors uppercase tracking-widest">Mark All Read</button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {filteredNotifications.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-600">
                     <Bell size={48} className="mb-4 opacity-10" />
                     <p className="text-sm italic">No notifications matching your criteria</p>
                  </div>
                )}
                {filteredNotifications.map((n) => (
                  <div 
                    key={n.id}
                    className={`p-4 rounded-2xl border transition-all ${!n.read ? 'bg-white/[0.03] border-white/10' : 'bg-transparent border-transparent opacity-60'}`}
                  >
                    <div className="flex space-x-4">
                      <div className="flex-shrink-0 mt-1">
                         <NotifIcon type={n.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm font-bold truncate ${n.type === NOTIFICATION_TYPES.EMERGENCY ? 'text-rose-400' : 'text-slate-100'}`}>
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">5m ago</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-3">
                           {n.body}
                        </p>
                        {n.type === NOTIFICATION_TYPES.EMERGENCY && (
                           <div aria-live="assertive" className="sr-only">EMERGENCY: {n.body}</div>
                        )}
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">{n.type}</span>
                           {!n.read && <div className="w-2 h-2 rounded-full bg-cyan-500"></div>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-slate-950/50 border-t border-white/5">
                 <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors">
                    <Clock size={14} />
                    <span>VIEW NOTIFICATION SETTINGS</span>
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
