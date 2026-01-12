'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export const themeColors = [
  { 
    name: 'Blue', 
    from: 'from-blue-500', 
    via: 'via-blue-600', 
    to: 'to-blue-700', 
    logo: 'from-blue-600',
    primary: 'bg-blue-600 hover:bg-blue-700',
    text: 'text-blue-600',
    border: 'border-blue-600',
    ring: 'ring-blue-500',
    lightBg: 'bg-blue-50',
    gradient: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700'
  },
  { 
    name: 'Coral', 
    from: 'from-orange-400', 
    via: 'via-orange-500', 
    to: 'to-red-500', 
    logo: 'from-orange-600',
    primary: 'bg-orange-600 hover:bg-orange-700',
    text: 'text-orange-600',
    border: 'border-orange-600',
    ring: 'ring-orange-500',
    lightBg: 'bg-orange-50',
    gradient: 'bg-gradient-to-br from-orange-400 via-orange-500 to-red-500'
  },
  { 
    name: 'Green', 
    from: 'from-green-400', 
    via: 'via-green-500', 
    to: 'to-green-600', 
    logo: 'from-green-600',
    primary: 'bg-green-600 hover:bg-green-700',
    text: 'text-green-600',
    border: 'border-green-600',
    ring: 'ring-green-500',
    lightBg: 'bg-green-50',
    gradient: 'bg-gradient-to-br from-green-400 via-green-500 to-green-600'
  },
  { 
    name: 'Purple', 
    from: 'from-purple-400', 
    via: 'via-purple-500', 
    to: 'to-purple-600', 
    logo: 'from-purple-600',
    primary: 'bg-purple-600 hover:bg-purple-700',
    text: 'text-purple-600',
    border: 'border-purple-600',
    ring: 'ring-purple-500',
    lightBg: 'bg-purple-50',
    gradient: 'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600'
  },
  { 
    name: 'Navy', 
    from: 'from-slate-700', 
    via: 'via-slate-800', 
    to: 'to-slate-900', 
    logo: 'from-slate-800',
    primary: 'bg-slate-800 hover:bg-slate-900',
    text: 'text-slate-800',
    border: 'border-slate-800',
    ring: 'ring-slate-700',
    lightBg: 'bg-slate-50',
    gradient: 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900'
  },
  { 
    name: 'Magenta', 
    from: 'from-pink-500', 
    via: 'via-fuchsia-500', 
    to: 'to-purple-600', 
    logo: 'from-fuchsia-600',
    primary: 'bg-fuchsia-600 hover:bg-fuchsia-700',
    text: 'text-fuchsia-600',
    border: 'border-fuchsia-600',
    ring: 'ring-fuchsia-500',
    lightBg: 'bg-fuchsia-50',
    gradient: 'bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-600'
  },
  { 
    name: 'Dark', 
    from: 'from-gray-700', 
    via: 'via-gray-800', 
    to: 'to-gray-900', 
    logo: 'from-gray-800',
    primary: 'bg-gray-800 hover:bg-gray-900',
    text: 'text-gray-800',
    border: 'border-gray-800',
    ring: 'ring-gray-700',
    lightBg: 'bg-gray-50',
    gradient: 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900'
  },
];

interface ThemeContextType {
  themeIndex: number;
  theme: typeof themeColors[0];
  setThemeIndex: (index: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeIndex, setThemeIndexState] = useState(0);

  useEffect(() => {
    const savedTheme = localStorage.getItem('lebolink-theme');
    if (savedTheme) {
      setThemeIndexState(parseInt(savedTheme));
    }
  }, []);

  const setThemeIndex = (index: number) => {
    setThemeIndexState(index);
    localStorage.setItem('lebolink-theme', index.toString());
  };

  const theme = themeColors[themeIndex];

  return (
    <ThemeContext.Provider value={{ themeIndex, theme, setThemeIndex }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return default theme if used outside provider
    return { themeIndex: 0, theme: themeColors[0], setThemeIndex: () => {} };
  }
  return context;
}
