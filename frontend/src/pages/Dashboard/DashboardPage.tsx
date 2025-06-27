import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  LightBulbIcon, 
  PhoneIcon, 
  CurrencyDollarIcon,
  TrendingUpIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DashboardCard from '@/components/Dashboard/DashboardCard';
import { DashboardData, ChartData } from '@/types';
import apiService from '@/services/api';

const DashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDashboardData();
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        setError(response.error || 'Error al cargar datos del dashboard');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const chartData: ChartData[] = [
    { name: 'Lun', value: 12, color: '#3b82f6' },
    { name: 'Mar', value: 19, color: '#3b82f6' },
    { name: 'Mié', value: 15, color: '#3b82f6' },
    { name: 'Jue', value: 22, color: '#3b82f6' },
    { name: 'Vie', value: 18, color: '#3b82f6' },
    { name: 'Sáb', value: 8, color: '#3b82f6' },
    { name: 'Dom', value: 5, color: '#3b82f6' },
  ];

  const pieData = [
    { name: 'Exitosas', value: 65, color: '#22c55e' },
    { name: 'Parciales', value: 20, color: '#f59e0b' },
    { name: 'Fallidas', value: 15, color: '#ef4444' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={loadDashboardData}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Resumen de actividades y métricas clave</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Generar Reporte
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            Exportar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="HCPs Activos"
          value={dashboardData?.hcpsActivos || 0}
          change={{ value: 12, isPositive: true }}
          icon={UserGroupIcon}
          color="primary"
          trend={chartData}
        />
        <DashboardCard
          title="Recomendaciones Pendientes"
          value={dashboardData?.recomendacionesPendientes || 0}
          change={{ value: -5, isPositive: false }}
          icon={LightBulbIcon}
          color="warning"
        />
        <DashboardCard
          title="Contactos del Mes"
          value={dashboardData?.contactosMes || 0}
          change={{ value: 8, isPositive: true }}
          icon={PhoneIcon}
          color="secondary"
        />
        <DashboardCard
          title="Valor Prescripciones"
          value={`$${(dashboardData?.valorPrescripciones || 0).toLocaleString()}`}
          change={{ value: 15, isPositive: true }}
          icon={CurrencyDollarIcon}
          color="success"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contactos por día */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contactos por Día</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resultado de recomendaciones */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultado de Recomendaciones</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top HCPs and Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top HCPs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top HCPs por Engagement</h3>
          <div className="space-y-3">
            {dashboardData?.topHCPs?.slice(0, 5).map((hcp, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-medium text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{hcp.hcp}</p>
                    <p className="text-sm text-gray-500">Engagement: {hcp.engagement}%</p>
                  </div>
                </div>
                <TrendingUpIcon className="w-5 h-5 text-success-600" />
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Productos</h3>
          <div className="space-y-3">
            {dashboardData?.topProductos?.slice(0, 5).map((producto, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                    <span className="text-secondary-700 font-medium text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{producto.producto}</p>
                    <p className="text-sm text-gray-500">{producto.prescripciones} prescripciones</p>
                  </div>
                </div>
                <CheckCircleIcon className="w-5 h-5 text-secondary-600" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 