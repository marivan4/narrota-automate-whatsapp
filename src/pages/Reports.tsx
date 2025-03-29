
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Download, Calendar as CalendarIcon, ChevronDown, FileText, Car, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Report {
  id: string;
  title: string;
  type: string;
  createdAt: Date;
  status: string;
}

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [reportsFilter, setReportsFilter] = useState('all');
  const [reportType, setReportType] = useState('all');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Mock reports data
  const mockReports: Report[] = [
    {
      id: '1',
      title: 'Relatório de Contratos - Janeiro 2023',
      type: 'contracts',
      createdAt: new Date('2023-01-15'),
      status: 'completed'
    },
    {
      id: '2',
      title: 'Relatório de Veículos Ativos',
      type: 'vehicles',
      createdAt: new Date('2023-02-10'),
      status: 'completed'
    },
    {
      id: '3',
      title: 'Relatório de Instalações - Fevereiro 2023',
      type: 'installations',
      createdAt: new Date('2023-02-28'),
      status: 'completed'
    },
    {
      id: '4',
      title: 'Relatório de Faturas em Atraso',
      type: 'invoices',
      createdAt: new Date('2023-03-05'),
      status: 'completed'
    },
    {
      id: '5',
      title: 'Relatório de Manutenções',
      type: 'maintenance',
      createdAt: new Date('2023-03-15'),
      status: 'completed'
    }
  ];

  const generateReport = () => {
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      toast.success('Relatório gerado com sucesso!');
    }, 1500);
  };

  const downloadReport = (reportId: string) => {
    // In a real implementation, this would download the actual report file
    toast.success('Iniciando download do relatório...');
    
    // Simulate download delay
    setTimeout(() => {
      toast.success('Relatório baixado com sucesso!');
    }, 1000);
  };

  const filteredReports = mockReports.filter(report => {
    // Filter by type
    if (reportType !== 'all' && report.type !== reportType) return false;
    
    // Filter by date range
    if (startDate && report.createdAt < startDate) return false;
    if (endDate) {
      // Set time to end of day for end date
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      if (report.createdAt > endOfDay) return false;
    }
    
    return true;
  });

  return (
    <DashboardLayout>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Relatórios e Análises</h1>

        <Tabs defaultValue="generate" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Gerar Relatórios</TabsTrigger>
            <TabsTrigger value="history">Histórico de Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerar Novo Relatório</CardTitle>
                <CardDescription>
                  Selecione o tipo de relatório e o período desejado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="report-type">Tipo de Relatório</Label>
                    <Select defaultValue="contracts">
                      <SelectTrigger id="report-type">
                        <SelectValue placeholder="Selecione o tipo de relatório" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contracts">Contratos</SelectItem>
                        <SelectItem value="invoices">Faturas</SelectItem>
                        <SelectItem value="vehicles">Veículos</SelectItem>
                        <SelectItem value="installations">Instalações</SelectItem>
                        <SelectItem value="clients">Clientes</SelectItem>
                        <SelectItem value="maintenance">Manutenções</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="report-format">Formato do Relatório</Label>
                    <Select defaultValue="pdf">
                      <SelectTrigger id="report-format">
                        <SelectValue placeholder="Selecione o formato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date-from">Data Inicial</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date-from"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP", { locale: ptBR }) : "Selecionar data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date-to">Data Final</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date-to"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PPP", { locale: ptBR }) : "Selecionar data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                            disabled={(date) =>
                              startDate ? date < startDate : false
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="report-title">Título do Relatório</Label>
                    <Input
                      id="report-title"
                      placeholder="Ex: Relatório de Contratos - Janeiro 2023"
                    />
                  </div>

                  <Button className="w-full" onClick={generateReport} disabled={isGenerating}>
                    {isGenerating ? (
                      <>Gerando Relatório...</>
                    ) : (
                      <>Gerar Relatório</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader className="space-y-0 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Histórico de Relatórios</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    Filtros
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Relatórios gerados anteriormente
                </CardDescription>
              </CardHeader>

              {showFilters && (
                <CardContent className="border-b pt-0 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label htmlFor="filter-type">Tipo</Label>
                      <Select
                        value={reportType}
                        onValueChange={setReportType}
                      >
                        <SelectTrigger id="filter-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="contracts">Contratos</SelectItem>
                          <SelectItem value="invoices">Faturas</SelectItem>
                          <SelectItem value="vehicles">Veículos</SelectItem>
                          <SelectItem value="installations">Instalações</SelectItem>
                          <SelectItem value="maintenance">Manutenções</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="filter-start-date">De</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="filter-start-date"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "dd/MM/yyyy") : "Data inicial"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div>
                      <Label htmlFor="filter-end-date">Até</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="filter-end-date"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "dd/MM/yyyy") : "Data final"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardContent>
              )}

              <CardContent>
                <div className="space-y-4">
                  {filteredReports.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[400px]">Título</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Data de Geração</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                {report.type === 'contracts' && <FileText className="h-4 w-4 mr-2" />}
                                {report.type === 'vehicles' && <Car className="h-4 w-4 mr-2" />}
                                {report.type === 'installations' && <FileCheck className="h-4 w-4 mr-2" />}
                                {report.title}
                              </div>
                            </TableCell>
                            <TableCell>
                              {report.type === 'contracts' && 'Contratos'}
                              {report.type === 'vehicles' && 'Veículos'}
                              {report.type === 'invoices' && 'Faturas'}
                              {report.type === 'installations' && 'Instalações'}
                              {report.type === 'maintenance' && 'Manutenções'}
                            </TableCell>
                            <TableCell>
                              {report.createdAt.toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                report.status === 'completed' && "bg-green-100 text-green-800",
                                report.status === 'pending' && "bg-yellow-100 text-yellow-800",
                                report.status === 'error' && "bg-red-100 text-red-800"
                              )}>
                                {report.status === 'completed' && 'Concluído'}
                                {report.status === 'pending' && 'Pendente'}
                                {report.status === 'error' && 'Erro'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadReport(report.id)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-10">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg text-muted-foreground">Nenhum relatório encontrado</p>
                      <p className="text-sm text-muted-foreground">Ajuste os filtros ou gere um novo relatório</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
