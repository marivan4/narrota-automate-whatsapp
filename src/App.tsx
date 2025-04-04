
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ApplicationProvider } from '@/context/ApplicationContext';
import AppRoutes from '@/routes';
import '@/styles/globals.css';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ApplicationProvider>
        <AppRoutes />
        <Toaster />
      </ApplicationProvider>
    </ThemeProvider>
  );
}

export default App;
