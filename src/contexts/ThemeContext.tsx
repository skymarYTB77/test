import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  background: string | null;
  setBackground: (background: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState(() => 
    localStorage.getItem('theme') || 'neon'
  );
  const [background, setBackground] = useState<string | null>(() =>
    localStorage.getItem('background')
  );

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (background) {
      localStorage.setItem('background', background);
    } else {
      localStorage.removeItem('background');
    }
  }, [background]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, background, setBackground }}>
      {children}
    </ThemeContext.Provider>
  );
};