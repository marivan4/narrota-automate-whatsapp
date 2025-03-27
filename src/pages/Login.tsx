
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/layout/AuthLayout';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

const Login: React.FC = () => {
  const { login, authState } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  // Demo account information
  const demoAccounts = [
    { email: 'admin@example.com', password: 'admin123', role: UserRole.ADMIN },
    { email: 'manager@example.com', password: 'manager123', role: UserRole.MANAGER },
    { email: 'user@example.com', password: 'user123', role: UserRole.USER },
  ];

  const setDemoAccount = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-white">Bem-vindo de volta</h1>
          <p className="text-gray-400">
            Entre com sua conta para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full p-2 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-evolution-blue hover:bg-evolution-blue/90 text-white"
            disabled={authState.isLoading}
          >
            {authState.isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        {authState.error && (
          <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md">
            {authState.error}
          </div>
        )}

        <div className="space-y-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-evolution-card px-2 text-gray-400">
                Contas para demonstração
              </span>
            </div>
          </div>

          <div className="grid gap-2 text-xs">
            {demoAccounts.map((account) => (
              <Button
                key={account.email}
                variant="outline"
                size="sm"
                className="justify-between bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                onClick={() => setDemoAccount(account.email, account.password)}
                disabled={authState.isLoading}
              >
                <span>{account.email}</span>
                <span className="rounded bg-evolution-blue/20 px-2 py-0.5 text-xs text-evolution-blue">
                  {account.role}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
