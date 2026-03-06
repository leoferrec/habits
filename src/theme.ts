import type { ThemeName, ThemeColors } from './types';

export const themes: Record<ThemeName, ThemeColors> = {
  mint: {
    bg: '#f0fdfa',
    bgSecondary: '#e6faf5',
    surface: '#ffffff',
    surfaceHover: '#f7fffe',
    primary: '#0d9488',
    primaryLight: '#5eead4',
    primaryFaded: 'rgba(13, 148, 136, 0.08)',
    secondary: '#f59e0b',
    accent: '#8b5cf6',
    danger: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    shadow: 'rgba(13, 148, 136, 0.08)',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #5eead4 100%)',
    gradientSubtle: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
  },
  sunset: {
    bg: '#fff7ed',
    bgSecondary: '#fff1e0',
    surface: '#ffffff',
    surfaceHover: '#fffbf7',
    primary: '#ea580c',
    primaryLight: '#fdba74',
    primaryFaded: 'rgba(234, 88, 12, 0.08)',
    secondary: '#ec4899',
    accent: '#eab308',
    danger: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
    text: '#1c1917',
    textSecondary: '#57534e',
    textMuted: '#a8a29e',
    border: '#e7e5e4',
    borderLight: '#f5f5f4',
    shadow: 'rgba(234, 88, 12, 0.08)',
    gradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fdba74 100%)',
    gradientSubtle: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
  },
  grape: {
    bg: '#faf5ff',
    bgSecondary: '#f3e8ff',
    surface: '#ffffff',
    surfaceHover: '#fdfaff',
    primary: '#7c3aed',
    primaryLight: '#c4b5fd',
    primaryFaded: 'rgba(124, 58, 237, 0.08)',
    secondary: '#ec4899',
    accent: '#06b6d4',
    danger: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
    text: '#1e1b4b',
    textSecondary: '#4c1d95',
    textMuted: '#a78bfa',
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
    shadow: 'rgba(124, 58, 237, 0.08)',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #c4b5fd 100%)',
    gradientSubtle: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
  },
};

export function applyTheme(themeName: ThemeName): void {
  const t = themes[themeName];
  const root = document.documentElement;
  Object.entries(t).forEach(([key, value]) => {
    root.style.setProperty(`--color-${camelToKebab(key)}`, value);
  });
}

function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
}
