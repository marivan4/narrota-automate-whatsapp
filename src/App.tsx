
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ApplicationProvider } from '@/context/ApplicationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from '@/routes';
import '@/styles/globals.css';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <ApplicationProvider>
          <QueryClientProvider client={queryClient}>
            <AppRoutes />
            <Toaster />
          </QueryClientProvider>
        </ApplicationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
