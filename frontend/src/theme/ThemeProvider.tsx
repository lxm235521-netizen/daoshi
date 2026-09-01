import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeId = 'night' | 'ocean' | 'terracotta' | 'paper' | 'cream' | 'sage';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  description: string;
  colors: [string, string, string];
}

export const themeOptions: ThemeOption[] = [
  { id: 'night', name: '夜幕紫', description: '沉浸式创作夜色', colors: ['#0b0812', '#7c3aed', '#f0abfc'] },
  { id: 'ocean', name: '深海蓝', description: '清醒而克制的蓝调', colors: ['#07131f', '#1677a8', '#8bd5ff'] },
  { id: 'terracotta', name: '赤陶剧场', description: '温暖的纸张与舞台', colors: ['#211514', '#c45d3b', '#f6c58a'] },
  { id: 'paper', name: '米白纸页', description: '安静、明亮的编辑感', colors: ['#f6f1e8', '#9a5b3b', '#e7b77a'] },
  { id: 'cream', name: '奶油珊瑚', description: '柔软而有活力的暖色', colors: ['#fff7f1', '#d95f59', '#f4a261'] },
  { id: 'sage', name: '鼠尾草庭院', description: '自然、清新的阅读感', colors: ['#f1f5ed', '#46735b', '#a7c7a1'] }
];

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const isThemeId = (value: string | null): value is ThemeId =>
  value === 'night' || value === 'ocean' || value === 'terracotta' || value === 'paper' || value === 'cream' || value === 'sage';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeId>(() => {
    const savedTheme = localStorage.getItem('manju_theme');
    return isThemeId(savedTheme) ? savedTheme : 'night';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
    localStorage.setItem('manju_theme', theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('主题上下文必须在主题提供器内使用');
  return context;
};
