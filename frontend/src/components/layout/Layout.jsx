import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Onboarding from '../ui/Onboarding';
import PwaPrompt from '../ui/PwaPrompt';
import { ErrorBoundary } from '../ui/FeedbackStates';
import { useStore } from '../../store';

export function Layout() {
  const { accessibilityHighContrast } = useStore();

  return (
    <div className={`min-h-screen flex flex-col md:flex-row bg-[#0A0E1A] font-ui transition-all ${accessibilityHighContrast ? 'contrast-200' : ''}`}>
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <main className="flex-1 p-4 md:p-12 pb-24 md:pb-12 overflow-y-auto overflow-x-hidden">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      <BottomNav />
      <Onboarding />
      <PwaPrompt />
    </div>
  );
}
