import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '', variant = 'pill', showLabel = false }) {
  const { theme, isDark, toggleTheme } = useTheme();

  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to Warm Light Theme' : 'Switch to Deep Arabian Dark Theme'}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className={`relative p-2 rounded-full border border-[var(--border-gold-subtle)] hover:border-[var(--gold-primary)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:text-[var(--gold-primary)] transition-all duration-300 shadow-sm flex items-center gap-2 group ${className}`}
      >
        <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
          {/* Sun Icon */}
          <Sun
            className={`w-4 h-4 text-[#D2A55F] absolute transition-all duration-500 transform ${
              isDark
                ? 'rotate-90 scale-0 opacity-0'
                : 'rotate-0 scale-100 opacity-100'
            }`}
          />
          {/* Moon Icon */}
          <Moon
            className={`w-4 h-4 text-[#E0B978] absolute transition-all duration-500 transform ${
              isDark
                ? 'rotate-0 scale-100 opacity-100'
                : '-rotate-90 scale-0 opacity-0'
            }`}
          />
        </div>
        {showLabel && (
          <span className="text-xs uppercase tracking-widest font-cinzel text-[var(--text-primary)]">
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </span>
        )}
      </button>
    );
  }

  // Default Luxury Pill Switch
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <button
        onClick={toggleTheme}
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className="relative w-14 h-7 rounded-full p-0.5 bg-[var(--bg-card)] border border-[var(--border-gold-subtle)] hover:border-[var(--gold-primary)] transition-all duration-400 focus:outline-none shadow-inner cursor-pointer"
        style={{
          boxShadow: isDark
            ? 'inset 0 2px 4px rgba(0,0,0,0.6), 0 0 10px rgba(210,165,95,0.15)'
            : 'inset 0 2px 4px rgba(19,12,5,0.1), 0 0 10px rgba(210,165,95,0.2)'
        }}
      >
        {/* Track Icons */}
        <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none text-[10px]">
          <Sun className={`w-3 h-3 text-[#D2A55F] transition-opacity duration-300 ${isDark ? 'opacity-30' : 'opacity-90'}`} />
          <Moon className={`w-3 h-3 text-[#E0B978] transition-opacity duration-300 ${isDark ? 'opacity-90' : 'opacity-30'}`} />
        </div>

        {/* Sliding Thumb */}
        <div
          className={`relative w-5 h-6 rounded-full bg-gradient-to-b from-[#E0B978] via-[#D2A55F] to-[#A97B3F] shadow-md flex items-center justify-center transform transition-transform duration-400 ease-out ${
            isDark ? 'translate-x-7' : 'translate-x-0'
          }`}
        >
          {isDark ? (
            <Moon className="w-3 h-3 text-[#130C05]" />
          ) : (
            <Sun className="w-3 h-3 text-[#130C05]" />
          )}
        </div>
      </button>

      {showLabel && (
        <span className="text-xs uppercase tracking-widest font-cinzel text-[var(--text-secondary)] select-none">
          {isDark ? 'Dark Palace' : 'Sunlit Salon'}
        </span>
      )}
    </div>
  );
}
