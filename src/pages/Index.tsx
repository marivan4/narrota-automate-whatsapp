
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { ArrowRight, MessageSquare, Sparkles, Bot, MessageCircle } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-evolution-darker dot-pattern">
      <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6">
        <div className="container max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-evolution-blue rounded flex items-center justify-center logo-glow">
              <span className="text-white font-bold">N</span>
            </div>
            <h1 className="text-xl font-bold text-white">Narrota</h1>
          </div>
          
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => navigate('/login')} 
              className="text-white hover:text-evolution-blue transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/login')} 
              className="btn-evolution"
            >
              Começar agora <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <Container maxWidth="xl" className="text-center py-32">
        <div className="animate-fade-in space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-center">
            Gerenciamento avançado para
            <div className="bg-gradient-to-r from-evolution-blue to-evolution-purple bg-clip-text text-transparent">
              WhatsApp Narrota System
            </div>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Gerencie instâncias, crie contratos e automatize seu 
            atendimento com uma interface moderna e intuitiva.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="btn-evolution text-md px-8 py-6"
              onClick={() => navigate('/login')}
            >
              Começar agora <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="btn-outline-evolution text-md px-8 py-6"
              onClick={() => window.open('https://api.whatsapp.com/send?phone=5511999999999&text=Olá,%20gostaria%20de%20conhecer%20mais%20sobre%20o%20sistema%20Narrota!', '_blank')}
            >
              Ver demonstração
            </Button>
          </div>
        </div>

        <div className="mt-32 mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Tudo que você precisa em um só lugar
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto mb-16">
            Gerencie todos os aspectos de sua comunicação via WhatsApp com uma plataforma
            intuitiva e poderosa
          </p>
          
          <div className="grid md:grid-cols-4 gap-6 mt-20 animate-fade-in">
            <div className="card-evolution p-6 rounded-xl">
              <div className="h-12 w-12 bg-evolution-blue/10 rounded-lg flex items-center justify-center mb-4 mx-auto text-evolution-blue">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Gerenciamento de Contratos</h3>
              <p className="text-gray-400">
                Crie e gerencie contratos digitais com facilidade. Envie para assinatura via WhatsApp.
              </p>
            </div>
            
            <div className="card-evolution p-6 rounded-xl">
              <div className="h-12 w-12 bg-evolution-purple/10 rounded-lg flex items-center justify-center mb-4 mx-auto text-evolution-purple">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Checklists Inteligentes</h3>
              <p className="text-gray-400">
                Padronize processos com checklists personalizados. Acompanhe em tempo real.
              </p>
            </div>
            
            <div className="card-evolution-purple p-6 rounded-xl card-evolution">
              <div className="h-12 w-12 bg-evolution-green/10 rounded-lg flex items-center justify-center mb-4 mx-auto text-evolution-green">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Integração WhatsApp</h3>
              <p className="text-gray-400">
                Envie notificações automáticas e lembretes de cobranças diretamente pelo WhatsApp.
              </p>
            </div>
            
            <div className="card-evolution p-6 rounded-xl">
              <div className="h-12 w-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4 mx-auto text-yellow-500">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Automações</h3>
              <p className="text-gray-400">
                Automatize tarefas repetitivas e mantenha seu foco no que realmente importa.
              </p>
            </div>
          </div>
        </div>
      </Container>
      
      <footer className="w-full py-6 bg-evolution-card/50 backdrop-blur-sm border-t border-white/5 mt-auto">
        <Container maxWidth="xl">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2023 Narrota System. Todos os direitos reservados.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Termos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Suporte</a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Index;
