
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, UserProfile, WhatsAppConfig } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";
import WhatsAppConnectionComponent from '@/components/shared/WhatsAppConnection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  ArrowLeft,
  User,
  Save,
  Key,
  Lock,
  Settings,
  MessageSquare,
} from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(10, { message: "Telefone deve ter pelo menos 10 dígitos" }).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, { message: "Senha atual é obrigatória" }),
  newPassword: z.string().min(6, { message: "Nova senha deve ter pelo menos 6 caracteres" }),
  confirmPassword: z.string().min(6, { message: "Confirmação de senha é obrigatória" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { authState, isAuthorized } = useAuth();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Load user profile
  useEffect(() => {
    // Check authentication first
    if (!authState.isAuthenticated) {
      navigate('/login');
      return;
    }
    
    loadUserProfile();
  }, [authState.isAuthenticated, navigate]);
  
  const loadUserProfile = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (authState.user) {
        // Create a mock profile based on the authenticated user
        const profile: UserProfile = {
          id: authState.user.id,
          name: authState.user.name,
          email: authState.user.email,
          phone: "(11) 98765-4321", // Mock phone number
          role: authState.user.role,
          avatar: `https://i.pravatar.cc/150?u=${authState.user.id}`,
          whatsappConfig: authState.user.role === UserRole.ADMIN || authState.user.role === UserRole.MANAGER ? {
            apiKey: "A80892194E8E-401D-BDC2-763C9430A09E",
            instance: "assas",
            serverUrl: "api.example.com",
            lastConnected: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          } : undefined,
        };
        
        setUserProfile(profile);
      }
      
      setIsLoading(false);
    }, 800);
  };
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userProfile?.name || "",
      email: userProfile?.email || "",
      phone: userProfile?.phone || "",
    },
    values: {
      name: userProfile?.name || "",
      email: userProfile?.email || "",
      phone: userProfile?.phone || "",
    },
  });
  
  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Save profile changes
  const handleProfileSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    
    try {
      // Capture IP and geolocation for audit purposes
      const ip = await getClientIP();
      const geolocation = await captureClientGeolocation();
      
      console.log("Update data:", { ...data, ip, geolocation });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          name: data.name,
          email: data.email,
          phone: data.phone || userProfile.phone,
        });
      }
      
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar perfil. Tente novamente.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Change password
  const handlePasswordSubmit = async (data: PasswordFormValues) => {
    setIsSaving(true);
    
    try {
      // Capture IP for audit purposes
      const ip = await getClientIP();
      
      console.log("Password change:", { ip, timestamp: new Date().toISOString() });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Senha alterada com sucesso!");
      passwordForm.reset();
    } catch (error) {
      toast.error("Erro ao alterar senha. Tente novamente.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle WhatsApp status change
  const handleWhatsAppStatusChange = (status: 'disconnected' | 'connecting' | 'connected' | 'error') => {
    console.log("WhatsApp status changed:", status);
    
    if (status === 'connected' && userProfile) {
      setUserProfile({
        ...userProfile,
        whatsappConfig: {
          ...userProfile.whatsappConfig!,
          lastConnected: new Date(),
        },
      });
    }
  };
  
  // Get client's IP address
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting IP:', error);
      return '0.0.0.0';
    }
  };
  
  // Get client's current geolocation
  const captureClientGeolocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting geolocation:', error);
      return null;
    }
  };
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container py-8 flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Carregando perfil...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Usuário</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {userProfile?.avatar && (
                  <div className="mb-4">
                    <img 
                      src={userProfile.avatar} 
                      alt={userProfile.name} 
                      className="rounded-full w-32 h-32 object-cover border-4 border-primary/10"
                    />
                  </div>
                )}
                <h2 className="text-xl font-bold">{userProfile?.name}</h2>
                <p className="text-muted-foreground">{userProfile?.email}</p>
                <div className="mt-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {userProfile?.role === UserRole.ADMIN ? 'Administrador' : 
                   userProfile?.role === UserRole.MANAGER ? 'Gerente' : 'Usuário'}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Perfil</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>Segurança</span>
                </TabsTrigger>
                {(userProfile?.role === UserRole.ADMIN || userProfile?.role === UserRole.MANAGER) && (
                  <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="profile" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Dados Pessoais</CardTitle>
                    <CardDescription>
                      Atualize suas informações pessoais.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome Completo</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end">
                          <Button type="submit" disabled={isSaving}>
                            {isSaving ? "Salvando..." : "Salvar Alterações"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Alterar Senha</CardTitle>
                    <CardDescription>
                      Atualize sua senha de acesso.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha Atual</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nova Senha</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirmar Nova Senha</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end">
                          <Button type="submit" disabled={isSaving}>
                            {isSaving ? "Salvando..." : "Alterar Senha"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {(userProfile?.role === UserRole.ADMIN || userProfile?.role === UserRole.MANAGER) && (
                <TabsContent value="whatsapp" className="mt-4">
                  <WhatsAppConnectionComponent onStatusChange={handleWhatsAppStatusChange} />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
