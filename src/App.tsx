import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Today from './pages/Today';
import Routine from './pages/Routine';
import Habits from './pages/Habits';
import Break from './pages/Break';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { useStore } from './store';
import { seedIfEmpty } from './seed';

export default function App() {
  const { loadAll, isLoading } = useStore();

  useEffect(() => {
    const init = async () => {
      await seedIfEmpty();
      await loadAll();
    };
    init();
  }, []);

  if (isLoading) {
    return (
      <div
        className="min-h-[100dvh] flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <div className="text-center animate-fade-in">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white font-display font-extrabold text-xl animate-pulse-soft"
            style={{ background: 'var(--color-gradient)' }}
          >
            AH
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Loading your habits...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Today />} />
        <Route path="/routine" element={<Routine />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/break" element={<Break />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
