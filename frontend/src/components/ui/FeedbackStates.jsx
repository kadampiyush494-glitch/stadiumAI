import { Component } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center h-[400px]">
          <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle size={32} className="text-rose-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-slate-300 text-sm mb-6 max-w-xs">We encountered an unexpected error while optimizing your flow.</p>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
          >
            <RefreshCcw size={18} />
            <span className="font-bold">Retry Session</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const EmptyState = ({ title, description, icon: Icon }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center">
    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/5">
      <Icon size={40} className="text-slate-700" />
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-300 text-sm max-w-xs leading-relaxed">{description}</p>
  </div>
);
