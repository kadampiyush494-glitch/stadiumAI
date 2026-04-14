import { useState } from 'react';
import GlassCard from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login({ id: '1', name: 'Test User', email, role: 'fan' }, 'mock-jwt-token');
      setIsLoading(false);
      navigate('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0E1A] p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-400/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full" />
      
      <GlassCard className="w-full max-w-md p-8 md:p-12 space-y-8" delay={0.2}>
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">
            Omni<span className="text-cyan-400">Flow</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Smart Stadium OS</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="terminal-id" className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-1">Terminal ID (Email)</label>
            <Input 
              id="terminal-id"
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="bg-white/5 border-white/5 rounded-2xl h-14"
              placeholder="fan@omniflow.io"
              required 
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="secure-key" className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-1">Secure Key (Password)</label>
            <Input 
              id="secure-key"
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="bg-white/5 border-white/5 rounded-2xl h-14"
              placeholder="••••••••"
              required 
            />
          </div>
          <Button type="submit" variant="accent" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-cyan-400/20" isLoading={isLoading}>
            Initialize Session
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
