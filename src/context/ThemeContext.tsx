import { useEffect, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme } from './themeStore';

const THEME_KEY = 'pharmalink-theme';
const savedTheme = (): Theme | null => {
    try {
        const value = window.localStorage.getItem(THEME_KEY);
        return value === 'light' || value === 'dark' ? value : null;
    } catch {
        return null;
    }
};

const preferredTheme = (): Theme =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => savedTheme() ?? preferredTheme());

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = (event: MediaQueryListEvent) => {
            if (!savedTheme()) setTheme(event.matches ? 'dark' : 'light');
        };
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, []);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        try {
            window.localStorage.setItem(THEME_KEY, next);
        } catch {
            // The selected theme still works for the current visit.
        }
        setTheme(next);
    };

    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

