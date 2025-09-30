import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Theme } from '@/types';

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
      className="fixed top-6 right-6 z-50 w-10 h-10 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-500" />
      )}
    </Button>
  );
};