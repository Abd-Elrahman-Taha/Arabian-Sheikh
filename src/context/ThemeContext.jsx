import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

/**
 * ThemeProvider
 * 
 * Unified Hybrid Arabian Palace Luxury Theme (Combining Dark Wood, Cream Marble & Gold)
 * Light/Dark switcher has been removed in favor of a single master luxury aesthetic.
 */
export function ThemeProvider({ children }) {
  const theme = 'hybrid-palace';

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light');
    root.style.colorScheme = 'dark';

    // Update browser address bar / theme color meta tag
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.name = 'theme-color';
      document.head.appendChild(metaTheme);
    }
    metaTheme.content = '#21130D';
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: true,
        toggleTheme: () => {},
        setTheme: () => {}
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
