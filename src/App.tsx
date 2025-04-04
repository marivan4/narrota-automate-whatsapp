
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ApplicationProvider } from '@/context/ApplicationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import AppRoutes from '@/routes';
import '@/styles/globals.css';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <ApplicationProvider>
          <AppRoutes />
          <Toaster />
        </ApplicationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
