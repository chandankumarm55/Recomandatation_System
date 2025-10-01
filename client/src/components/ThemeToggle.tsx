import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Theme } from '../types';

interface ThemeToggleProps {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeToggle = ({ theme, toggleTheme }: ThemeToggleProps) => {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-background border-2 hover:scale-110 active:scale-95 p-0 flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-7 h-7 text-slate-700 dark:text-slate-300 transition-transform duration-300" />
      ) : (
        <Sun className="w-7 h-7 text-yellow-500 dark:text-yellow-400 transition-transform duration-300 rotate-0 hover:rotate-90" />
      )}
    </Button>
  );
};