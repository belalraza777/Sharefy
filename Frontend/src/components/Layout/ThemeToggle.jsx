import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../context/themeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const applied = document.documentElement.dataset.theme || 'light';
  const isDark = applied === 'dark';
  return (
    <button
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="btn btn-secondary theme-toggle-btn"
    >
      {isDark ? <FiSun /> : <FiMoon />}
      <span>{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
};

export default ThemeToggle;
