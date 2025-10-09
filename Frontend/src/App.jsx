// App.jsx
import './App.css';
import AppRoute from './routes/AppRoute';
import Layout from './components/Layout/Layout';
import { Toaster, toast } from 'sonner';


function App() {
  return (<>
    <Toaster position="top-right"
      theme="system" // auto dark/light
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
}

export default App;