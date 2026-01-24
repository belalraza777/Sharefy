import React from 'react';
import { useTheme } from '../../context/themeContext';

const Option = ({ label, value, current, onSelect }) => (
  <button
    className={`theme-option ${current === value ? 'active' : ''}`}
    onClick={() => onSelect(value)}
    aria-pressed={current === value}
  >
    {label}
  </button>
);

const AppearanceSettings = () => {
  const { theme, setTheme, toggleTheme } = useTheme();

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2>Appearance</h2>
        <p>Control the app appearance and theme preference</p>
      </div>

      <div className="appearance-grid">
        <div className="appearance-card">
          <h3>Theme</h3>
          <p className="muted">Choose your preferred theme. 'System' follows OS setting.</p>

          <div className="theme-options">
            <Option label="Light" value="light" current={theme} onSelect={setTheme} />
            <Option label="Dark" value="dark" current={theme} onSelect={setTheme} />
            <Option label="System" value="system" current={theme} onSelect={setTheme} />
          </div>

          <div style={{ marginTop: 12 }}>
            <button className="btn btn-outline" onClick={toggleTheme}>
              Toggle Light/Dark
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
