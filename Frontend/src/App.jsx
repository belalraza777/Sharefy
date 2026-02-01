// App.jsx
import AppRoute from './routes/AppRoute';
import Layout from './components/Layout/Layout';
import { Toaster } from 'sonner';
import { ThemeProvider, useTheme } from './context/themeContext';

// AppShell component to handle theming and layout
const AppShell = () => {
  const { theme } = useTheme();
  const applied = theme === 'system'
    ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light')
    : theme;
  return (
    <>
      <Toaster
        position="top-right"
        theme={theme === 'system' ? 'system' : applied}
        richColors
        toastOptions={{
          duration: 3000,
          style: { borderRadius: 12, padding: '10px' },
        }}
      />
      <Layout>
        <AppRoute />
      </Layout>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}

export default App;