import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../context/themeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const applied = document.documentElement.dataset.theme || 'light';
  const isDark = applied === 'dark';
  return (
    <button
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="btn btn-secondary"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
    >
      {isDark ? <FiSun /> : <FiMoon />}
      <span style={{ fontSize: '0.75rem' }}>{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
};

export default ThemeToggle;
