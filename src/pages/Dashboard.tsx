
import React from 'react';
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
  Cell
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// Mock data for the charts
const lineData = [
  { name: 'Mar-24', ativacoes: 50, cancelamentos: 10 },
  { name: 'Dez-24', ativacoes: 60, cancelamentos: 20 },
  { name: 'Jan-25', ativacoes: 70, cancelamentos: 30 },
  { name: 'Fev-25', ativacoes: 40, cancelamentos: 10 },
];

const barData = [
  { name: 'Dual C', ativo: 0, estoque: 0, preCancelamento: 0 },
  { name: 'M2M Padrão', ativo: 180, estoque: 50, preCancelamento: 0 },
];

const overviewData = [
  { name: 'Ativo', value: 70 },
  { name: 'Estoque', value: 20 },
  { name: 'Pré-cancelamento', value: 10 },
];

const deviceStatusData = [
  { name: 'Ativo', value: 80 },
  { name: 'Inativo', value: 20 },
];

const inventoryData = [
  { name: 'M2M Padrão', value: 90 },
  { name: 'Dual C', value: 10 },
];

// Colors for the charts
const COLORS = {
  ativo: '#9b57e9', // Purple
  estoque: '#ea384c', // Red
  preCancelamento: '#f97316', // Orange
  ativacoes: '#9b57e9', // Purple
  cancelamentos: '#ea384c', // Red
  inativo: '#ea384c', // Red
  dualC: '#ea384c', // Red
  m2mPadrao: '#9b57e9', // Purple
};

const OVERVIEW_COLORS = ['#9b57e9', '#ea384c', '#f97316'];
const DEVICE_STATUS_COLORS = ['#4ade80', '#ea384c']; // Green and Red
const INVENTORY_COLORS = ['#9b57e9', '#ea384c']; // Purple and Red

const Dashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button className="bg-green-500 hover:bg-green-600">
            <Download className="mr-2 h-4 w-4" />
            Baixar Planilha
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Overview Chart */}
          <Card className="bg-blue-900 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Resumo geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overviewData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={0}
                      dataKey="value"
                    >
                      {overviewData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={OVERVIEW_COLORS[index % OVERVIEW_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, name]}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: 'white' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center mt-2 text-xs gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 mr-1 bg-purple-400 rounded-sm"></div>
                  <span>Ativo</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 mr-1 bg-red-500 rounded-sm"></div>
                  <span>Estoque</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 mr-1 bg-orange-500 rounded-sm"></div>
                  <span>Pré-cancelamento</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card className="bg-blue-900 text-white md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Linhas por família e status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
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
                    <Bar dataKey="ativo" name="Ativo" fill={COLORS.ativo} barSize={30} />
                    <Bar dataKey="estoque" name="Estoque" fill={COLORS.estoque} barSize={30} />
                    <Bar dataKey="preCancelamento" name="Pré-cancelamento" fill={COLORS.preCancelamento} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center mt-2 text-xs gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 mr-1 bg-purple-400 rounded-sm"></div>
                  <span>Ativo</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 mr-1 bg-red-500 rounded-sm"></div>
                  <span>Estoque</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 mr-1 bg-orange-500 rounded-sm"></div>
                  <span>Pré-cancelamento</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Line Chart */}
          <Card className="bg-blue-900 text-white md:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Ativações e cancelamentos por mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
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
                    <Line 
                      type="monotone" 
                      dataKey="ativacoes" 
                      name="Ativações" 
                      stroke={COLORS.ativacoes} 
                      strokeWidth={3} 
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cancelamentos" 
                      name="Cancelamentos" 
                      stroke={COLORS.cancelamentos} 
                      strokeWidth={3} 
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center mt-2 text-xs gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 mr-1 bg-purple-400 rounded-sm"></div>
                  <span>Ativações</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 mr-1 bg-red-500 rounded-sm"></div>
                  <span>Cancelamentos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Inventory Pie Chart */}
          <Card className="bg-blue-900 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Estoque por família</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={0}
                      dataKey="value"
                    >
                      {inventoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={INVENTORY_COLORS[index % INVENTORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, name]}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: 'white' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center mt-2 text-xs gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 mr-1 bg-purple-400 rounded-sm"></div>
                  <span>M2M Padrão</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 mr-1 bg-red-500 rounded-sm"></div>
                  <span>Dual C</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Device Status Pie Chart */}
          <Card className="bg-blue-900 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Status dos Dispositivos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={0}
                      dataKey="value"
                    >
                      {deviceStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DEVICE_STATUS_COLORS[index % DEVICE_STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, name]}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: 'white' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center mt-2 text-xs gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 mr-1 bg-green-500 rounded-sm"></div>
                  <span>Ativo</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 mr-1 bg-red-500 rounded-sm"></div>
                  <span>Inativo</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Download Button Card */}
          <Card className="bg-green-500 hover:bg-green-600 text-white flex items-center justify-center cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center h-full py-12">
              <Download className="h-12 w-12 mb-4" />
              <h3 className="text-xl font-semibold">Baixar Planilha</h3>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
