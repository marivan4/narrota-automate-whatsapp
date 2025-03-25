
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { FileText, CheckSquare, MessageSquare } from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [authState.isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <Container maxWidth="lg" className="text-center py-16">
        <div className="animate-fade-in">
          <div className="mb-8 inline-flex items-center justify-center p-2 bg-blue-500 rounded-full shadow-lg">
            <h1 className="text-3xl md:text-4xl font-bold text-white p-1">N</h1>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Narrota System
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Sistema de contratos, checklists e automações com integração WhatsApp
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="text-md px-8 py-6"
              onClick={() => navigate('/login')}
            >
              Entrar no Sistema
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-md px-8 py-6"
              onClick={() => window.open('https://api.whatsapp.com/send?phone=5511999999999&text=Olá,%20gostaria%20de%20conhecer%20mais%20sobre%20o%20sistema%20Narrota!', '_blank')}
            >
              Fale Conosco
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20 animate-slide-up">
          <div className="glass-card p-6 rounded-xl">
            <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Gerenciamento de Contratos</h3>
            <p className="text-muted-foreground">
              Crie e gerencie contratos digitais com facilidade. Envie para assinatura via WhatsApp.
            </p>
          </div>
          
          <div className="glass-card p-6 rounded-xl">
            <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <CheckSquare className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Checklists Inteligentes</h3>
            <p className="text-muted-foreground">
              Padronize processos com checklists personalizados. Acompanhe em tempo real.
            </p>
          </div>
          
          <div className="glass-card p-6 rounded-xl">
            <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Integração WhatsApp</h3>
            <p className="text-muted-foreground">
              Envie notificações automáticas e lembretes de cobranças diretamente pelo WhatsApp.
            </p>
          </div>
        </div>
      </Container>
      
      <footer className="w-full py-6 bg-white/50 backdrop-blur-sm border-t mt-auto">
        <Container maxWidth="lg">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>© 2023 Narrota System. Todos os direitos reservados.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground transition-colors">Termos</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
              <a href="#" className="hover:text-foreground transition-colors">Suporte</a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Index;
