import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type ThemeName =
  | 'apple'
  | 'midnight'
  | 'aurora'
  | 'sunlit'
  | 'glass-coast'
  | 'nordic-calm'
  | 'solar-pulse';

export interface ThemeDefinition {
  name: ThemeName;
  label: string;
  description: string;
}

export const themes: ThemeDefinition[] = [
  {
    name: 'apple',
    label: 'Apple',
    description: 'Current glassy weather look with blue-gray horizons.',
  },
  {
    name: 'midnight',
    label: 'Midnight',
    description: 'A darker, radar-style dashboard with electric accents.',
  },
  {
    name: 'aurora',
    label: 'Aurora',
    description: 'A vivid sky-gradient theme with luminous cool tones.',
  },
  {
    name: 'sunlit',
    label: 'Sunlit',
    description: 'A warm editorial theme with lighter neutrals and gold.',
  },
  {
    name: 'glass-coast',
    label: 'Glass Coast',
    description: 'A breezy coastal palette with misty translucency and cool sky light.',
  },
  {
    name: 'nordic-calm',
    label: 'Nordic Calm',
    description: 'A restrained minimal theme with pale neutrals and precise structure.',
  },
  {
    name: 'solar-pulse',
    label: 'Solar Pulse',
    description: 'A vivid sun-forward palette with energetic contrast and warm accents.',
  },
];

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const storageKey = 'weather-starter-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>('apple');

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (
      stored === 'apple' ||
      stored === 'midnight' ||
      stored === 'aurora' ||
      stored === 'sunlit' ||
      stored === 'glass-coast' ||
      stored === 'nordic-calm' ||
      stored === 'solar-pulse'
    ) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(storageKey, theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
