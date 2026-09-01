import React, { useEffect, useRef, useState } from 'react';
import { Check, Palette } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { themeOptions, useTheme } from '../theme/ThemeProvider';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const currentTheme = themeOptions.find(option => option.id === theme) || themeOptions[0];

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  if (location.pathname === '/admin') return null;

  return (
    <div ref={switcherRef} className="fixed bottom-5 right-5 z-[100]">
      {isOpen && (
        <div className="theme-switcher-panel mb-3 w-64 rounded-2xl border p-3 shadow-2xl backdrop-blur-xl" role="dialog" aria-label="页面主题选择">
          <div className="mb-2 px-2">
            <p className="theme-switcher-heading text-sm font-semibold">选择页面主题</p>
            <p className="theme-switcher-muted mt-1 text-xs">配色、文字与界面气质会同步调整</p>
          </div>
          <div className="space-y-1">
            {themeOptions.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => { setTheme(option.id); setIsOpen(false); }}
                className={`theme-option flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors ${theme === option.id ? 'theme-option-active' : ''}`}
              >
                <span className="flex shrink-0 gap-1 rounded-lg border border-white/10 bg-black/10 p-1">
                  {option.colors.map(color => <span key={color} className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="theme-switcher-heading block text-sm font-medium">{option.name}</span>
                  <span className="theme-switcher-muted mt-0.5 block text-xs">{option.description}</span>
                </span>
                {theme === option.id && <Check size={16} className="theme-switcher-check shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        aria-expanded={isOpen}
        aria-label="切换页面主题"
        className="theme-switcher-trigger inline-flex items-center gap-2 rounded-full border px-3.5 py-2.5 text-sm font-medium shadow-xl backdrop-blur-xl transition-all hover:-translate-y-0.5"
      >
        <Palette size={16} />
        <span>主题 · {currentTheme.name}</span>
      </button>
    </div>
  );
};
