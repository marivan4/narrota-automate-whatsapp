
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { RefreshCw } from 'lucide-react';

// Mock data for the charts
const summaryData = [
  { name: 'ATIVO', value: 56.28, color: '#8257e5' },
  { name: 'ESTOQUE', value: 39.53, color: '#e73f78' },
  { name: 'PRÉ CANCELAMENTO', value: 4.19, color: '#f87171' },
];

const lineData = [
  { name: 'Mai-24', ativacoes: 2, cancelamentos: 1 },
  { name: 'Dez-24', ativacoes: 0, cancelamentos: 1 },
  { name: 'Jan-25', ativacoes: 76, cancelamentos: 1 },
  { name: 'Fev-25', ativacoes: 10, cancelamentos: 3 },
  { name: 'Mar-25', ativacoes: 5, cancelamentos: 2 },
];

const barData = [
  { name: 'Connect 4.0', ativo: 2, estoque: 0, preCancelamento: 0 },
  { name: 'Dual C', ativo: 5, estoque: 20, preCancelamento: 0 },
  { name: 'IOT MOVE', ativo: 30, estoque: 10, preCancelamento: 5 },
  { name: 'M2M Padrão', ativo: 80, estoque: 60, preCancelamento: 10 },
];

const linhasFamiliaData = [
  { name: 'Connect 4.0', value: 3.17, color: '#9b57e9' },
  { name: 'Dual C', value: 34.62, color: '#e73f78' },
  { name: 'IOT MOVE', value: 0, color: '#f87171' },
  { name: 'M2M Padrão', value: 62.31, color: '#8257e5' },
];

const estoqueFamiliaData = [
  { name: 'Dual C', value: 19, color: '#e73f78' },
  { name: 'M2M Padrão', value: 81, color: '#9b57e9' },
];

const connectionStatusData = [
  { name: 'Online', value: 49.28, color: '#a3e635' },
  { name: 'Offline', value: 50.72, color: '#ef4444' },
];

const Dashboard: React.FC = () => {
  const [refreshTimes, setRefreshTimes] = useState({
    resumo: '26/03/2025 23:05',
    linhas: '26/03/2025 23:04',
    ativacoes: '26/03/2025 23:01',
    linhasFamilia: '26/03/2025 23:02',
    estoqueFamilia: '26/03/2025 23:03',
    statusConexao: '26/03/2025 23:06'
  });

  const handleRefresh = (section: keyof typeof refreshTimes) => {
    const now = new Date();
    const formattedTime = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setRefreshTimes(prev => ({ ...prev, [section]: formattedTime }));
  };

  return (
    <DashboardLayout>
      <div className="container px-2 py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Resumo Geral */}
          <Card className="bg-evolution-card border-0">
            <CardHeader className="pb-2 flex flex-row justify-between items-start">
              <CardTitle className="text-lg font-medium text-white">Resumo geral</CardTitle>
              <button onClick={() => handleRefresh('resumo')} className="text-gray-400 hover:text-white">
                <RefreshCw className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summaryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={0}
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(2)}%`}
                    >
                      {summaryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend
                      layout="horizontal"
                      verticalAlign="top"
                      align="center"
                      payload={summaryData.map(item => ({
                        value: item.name,
                        type: 'circle',
                        color: item.color
                      }))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center text-xs text-gray-400 mt-4">
                Atualizado em {refreshTimes.resumo}
              </div>
            </CardContent>
          </Card>

          {/* Linhas por família e status */}
          <Card className="bg-evolution-card border-0">
            <CardHeader className="pb-2 flex flex-row justify-between items-start">
              <CardTitle className="text-lg font-medium text-white">Linhas por família e status</CardTitle>
              <button onClick={() => handleRefresh('linhas')} className="text-gray-400 hover:text-white">
                <RefreshCw className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: 'white' }}
                    />
                    <Legend
                      layout="horizontal"
                      verticalAlign="top"
                      align="center"
                      payload={[
                        { value: 'ATIVO', type: 'rect', color: '#8257e5' },
                        { value: 'ESTOQUE', type: 'rect', color: '#e73f78' },
                        { value: 'PRÉ CANCELAMENTO', type: 'rect', color: '#f87171' },
                      ]}
                    />
                    <Bar dataKey="ativo" name="ATIVO" fill="#8257e5" barSize={30} />
                    <Bar dataKey="estoque" name="ESTOQUE" fill="#e73f78" barSize={30} />
                    <Bar dataKey="preCancelamento" name="PRÉ CANCELAMENTO" fill="#f87171" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center text-xs text-gray-400 mt-4">
                Atualizado em {refreshTimes.linhas}
              </div>
            </CardContent>
          </Card>

          {/* Ativações e cancelamentos por mês */}
          <Card className="bg-evolution-card border-0">
            <CardHeader className="pb-2 flex flex-row justify-between items-start">
              <CardTitle className="text-lg font-medium text-white">Ativações e cancelamentos por mês</CardTitle>
              <button onClick={() => handleRefresh('ativacoes')} className="text-gray-400 hover:text-white">
                <RefreshCw className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={lineData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: 'white' }}
                    />
                    <Legend
                      layout="horizontal"
                      verticalAlign="top"
                      align="center"
                      payload={[
                        { value: 'Cancelamentos', type: 'line', color: '#38bdf8' },
                        { value: 'Ativações', type: 'line', color: '#fb7185' },
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="cancelamentos"
                      name="Cancelamentos"
                      stroke="#38bdf8"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="ativacoes"
                      name="Ativações"
                      stroke="#fb7185"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center text-xs text-gray-400 mt-4">
                Atualizado em {refreshTimes.ativacoes}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Linhas por família */}
          <Card className="bg-evolution-card border-0">
            <CardHeader className="pb-2 flex flex-row justify-between items-start">
              <CardTitle className="text-lg font-medium text-white">Linhas por família</CardTitle>
              <button onClick={() => handleRefresh('linhasFamilia')} className="text-gray-400 hover:text-white">
                <RefreshCw className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={linhasFamiliaData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={0}
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(2)}%`}
                    >
                      {linhasFamiliaData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend
                      layout="horizontal"
                      verticalAlign="top"
                      align="center"
                      payload={linhasFamiliaData.map(item => ({
                        value: item.name,
                        type: 'circle',
                        color: item.color
                      }))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center text-xs text-gray-400 mt-4">
                Atualizado em {refreshTimes.linhasFamilia}
              </div>
            </CardContent>
          </Card>

          {/* Estoque por família */}
          <Card className="bg-evolution-card border-0">
            <CardHeader className="pb-2 flex flex-row justify-between items-start">
              <CardTitle className="text-lg font-medium text-white">Estoque por família</CardTitle>
              <button onClick={() => handleRefresh('estoqueFamilia')} className="text-gray-400 hover:text-white">
                <RefreshCw className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={estoqueFamiliaData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={0}
                      dataKey="value"
                      label={(entry) => entry.value}
                    >
                      {estoqueFamiliaData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend
                      layout="horizontal"
                      verticalAlign="top"
                      align="center"
                      payload={estoqueFamiliaData.map(item => ({
                        value: item.name,
                        type: 'circle',
                        color: item.color
                      }))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center text-xs text-gray-400 mt-4">
                Atualizado em {refreshTimes.estoqueFamilia}
              </div>
            </CardContent>
          </Card>

          {/* Status da conexão */}
          <Card className="bg-evolution-card border-0">
            <CardHeader className="pb-2 flex flex-row justify-between items-start">
              <CardTitle className="text-lg font-medium text-white">Status da conexão</CardTitle>
              <button onClick={() => handleRefresh('statusConexao')} className="text-gray-400 hover:text-white">
                <RefreshCw className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={connectionStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={0}
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(2)}%`}
                    >
                      {connectionStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend
                      layout="horizontal"
                      verticalAlign="top"
                      align="center"
                      payload={connectionStatusData.map(item => ({
                        value: item.name,
                        type: 'circle',
                        color: item.color
                      }))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center text-xs text-gray-400 mt-4">
                Atualizado em {refreshTimes.statusConexao}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
