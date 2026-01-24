import { useTheme } from '../../context/themeContext';
import './Theme.css';

const ThemePage = () => {
  const { theme, setTheme, toggleTheme } = useTheme();
  const options = ['light', 'dark', 'system'];

  return (
    <div className="card theme-page-container">
      <h2 className="theme-page-header">Appearance & Theme</h2>
      <p className="text-sm theme-page-description">
        Choose how Sharefy looks. System follows your OS setting automatically.
      </p>
      <div className="theme-options">
        {options.map((opt) => (
          <label key={opt} className="theme-option-label">
            <input
              type="radio"
              name="theme"
              value={opt}
              checked={theme === opt}
              onChange={() => setTheme(opt)}
            />
            <span className="theme-option-text">{opt}</span>
          </label>
        ))}
      </div>
      <div className="theme-actions">
        <button className="btn btn-primary" onClick={toggleTheme}>Quick Toggle</button>
        <button
          className="btn btn-secondary"
          onClick={() => setTheme('system')}
          disabled={theme === 'system'}
        >Use System</button>
      </div>
    </div>
  );
};

export default ThemePage;
