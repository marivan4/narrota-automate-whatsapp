
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Contracts from "./pages/Contracts";
import Checklists from "./pages/Checklists";
import WhatsAppSettings from "./pages/WhatsAppSettings";
import WhatsAppConnect from "./pages/WhatsAppConnect";
import UsersManagement from "./pages/UsersManagement";
import Invoices from "./pages/Invoices";
import InvoiceEdit from "./pages/InvoiceEdit";
import Settings from "./pages/Settings";
import Clients from "./pages/Clients";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";
import ContractSignature from "./pages/ContractSignature";
import NotFound from "./pages/NotFound";
import Alerts from "./pages/Alerts";
import Vehicles from "./pages/Vehicles";
import Appointments from "./pages/Appointments";
import InvoicePrint from "./pages/InvoicePrint";
import AsaasPaymentsList from "./pages/AsaasPaymentsList";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/checklists" element={<Checklists />} />
            <Route path="/whatsapp-settings" element={<WhatsAppSettings />} />
            <Route path="/whatsapp-connect" element={<WhatsAppConnect />} />
            <Route path="/users" element={<UsersManagement />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoice-edit/:id" element={<InvoiceEdit />} />
            <Route path="/invoice-print/:id" element={<InvoicePrint />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/contract-signature" element={<ContractSignature />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/asaas-payments" element={<AsaasPaymentsList />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
