import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck,
  Clock,
  Target,
  ShieldAlert,
  BarChart3,
  Settings,
  Star,
  Flame,
  Zap,
  Sun,
  Moon,
  Shield,
} from 'lucide-react';
import { useStore } from '../store';
import ConfettiEffect from './ConfettiEffect';
import ToastContainer from './ToastContainer';
import BreakPanel from './BreakPanel';

const tabs = [
  { path: '/', icon: CalendarCheck, label: 'Today' },
  { path: '/routine', icon: Clock, label: 'Routine' },
  { path: '/habits', icon: Target, label: 'Habits' },
  { path: '/break', icon: ShieldAlert, label: 'Break' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    xpInfo,
    showConfetti,
    colorMode,
    toggleColorMode,
    todayHabits,
    breakPanelOpen,
    toggleBreakPanel,
    breakPanelPinned,
  } = useStore();
  const isDesktop = useIsDesktop();

  const currentTab = tabs.find(t => t.path === location.pathname) || tabs[0];

  // Count unchecked break habits for badge
  const uncheckedBreakCount = todayHabits.filter(h => h.type === 'break' && !h.todayCompletion?.done).length;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-pattern" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border-light)',
          boxShadow: '0 1px 8px var(--color-shadow)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-display text-white font-extrabold text-sm"
            style={{ background: 'var(--color-gradient)' }}
          >
            AH
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight" style={{ color: 'var(--color-text)' }}>
              {currentTab.label}
            </h1>
          </div>
        </div>

        {/* XP & Level */}
        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={toggleColorMode}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{
              backgroundColor: 'var(--color-primary-faded)',
              color: 'var(--color-primary)',
            }}
            aria-label="Toggle dark mode"
          >
            {colorMode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Today XP */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: 'var(--color-primary-faded)',
              color: 'var(--color-primary)',
            }}
          >
            <Zap size={13} />
            <span className="tabular-nums">{xpInfo.todayXP}</span>
            <span className="opacity-60">XP</span>
          </div>

          {/* Level Badge */}
          <div className="relative">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-display font-extrabold text-sm text-white relative"
              style={{ background: 'var(--color-gradient)' }}
            >
              {xpInfo.level}
              {/* Progress ring */}
              <svg
                className="absolute inset-0 -rotate-90"
                width="36"
                height="36"
                viewBox="0 0 36 36"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="rgba(255,255,255,0.85)"
                  strokeWidth="2.5"
                  strokeDasharray={`${2 * Math.PI * 16}`}
                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - xpInfo.levelProgress / 100)}`}
                  strokeLinecap="round"
                  className="strength-ring"
                />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="flex-1 overflow-y-auto pb-20 transition-all duration-300"
        style={{
          marginRight: isDesktop && breakPanelOpen && breakPanelPinned ? '320px' : '0',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border-light)',
          boxShadow: '0 -2px 12px var(--color-shadow)',
          paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
          paddingTop: '6px',
        }}
      >
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-0.5 px-2 py-1 tap-highlight relative min-w-[50px]"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={20}
                style={{
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                }}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className="text-[10px] font-medium"
                style={{
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Break Panel floating tab */}
      {!breakPanelOpen && (
        <button
          onClick={toggleBreakPanel}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-[55] flex items-center gap-1 py-3 px-1.5 rounded-l-xl transition-all active:scale-95"
          style={{
            backgroundColor: 'var(--color-secondary)',
            color: '#fff',
            boxShadow: '-2px 2px 12px rgba(0,0,0,0.15)',
            writingMode: 'vertical-rl',
          }}
          aria-label="Open break habits panel"
        >
          <Shield size={14} />
          <span className="text-[10px] font-bold tracking-wider">BREAK</span>
          {uncheckedBreakCount > 0 && (
            <span
              className="absolute -left-1.5 -top-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
              style={{
                backgroundColor: 'var(--color-danger)',
                color: '#fff',
                writingMode: 'horizontal-tb',
              }}
            >
              {uncheckedBreakCount}
            </span>
          )}
        </button>
      )}

      {/* Break Panel slide-out */}
      <AnimatePresence>
        {breakPanelOpen && <BreakPanel isDesktop={isDesktop} />}
      </AnimatePresence>

      {/* Global overlays */}
      <ConfettiEffect active={showConfetti} />
      <ToastContainer />
    </div>
  );
}
