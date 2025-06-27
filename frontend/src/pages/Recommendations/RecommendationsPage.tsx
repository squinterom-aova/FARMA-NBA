import React, { useState, useEffect } from 'react';
import { 
  LightBulbIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  PlayIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Recomendacion, TipoRecomendacion, EstadoRecomendacion, CanalComunicacion } from '@/types';
import apiService from '@/services/api';

const RecommendationsPage: React.FC = () => {
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<TipoRecomendacion | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<EstadoRecomendacion | ''>('');
  const [selectedChannel, setSelectedChannel] = useState<CanalComunicacion | ''>('');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRecomendaciones();
      if (response.success && response.data) {
        setRecomendaciones(response.data);
      } else {
        setError(response.error || 'Error al cargar recomendaciones');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecommendations = recomendaciones.filter(rec => {
    const matchesSearch = rec.mensaje.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || rec.tipo === selectedType;
    const matchesStatus = !selectedStatus || rec.estado === selectedStatus;
    const matchesChannel = !selectedChannel || rec.canal === selectedChannel;
    
    return matchesSearch && matchesType && matchesStatus && matchesChannel;
  });

  const getTypeColor = (type: TipoRecomendacion) => {
    const colors = {
      [TipoRecomendacion.CONTACTO_INICIAL]: 'bg-blue-100 text-blue-800',
      [TipoRecomendacion.SEGUIMIENTO]: 'bg-green-100 text-green-800',
      [TipoRecomendacion.PRESENTACION_PRODUCTO]: 'bg-purple-100 text-purple-800',
      [TipoRecomendacion.ENTREGA_MUESTRA]: 'bg-yellow-100 text-yellow-800',
      [TipoRecomendacion.INVITACION_EVENTO]: 'bg-pink-100 text-pink-800',
      [TipoRecomendacion.EDUCACION_MEDICA]: 'bg-indigo-100 text-indigo-800',
      [TipoRecomendacion.APOYO_CLINICO]: 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: EstadoRecomendacion) => {
    const colors = {
      [EstadoRecomendacion.PENDIENTE]: 'bg-yellow-100 text-yellow-800',
      [EstadoRecomendacion.EN_PROCESO]: 'bg-blue-100 text-blue-800',
      [EstadoRecomendacion.COMPLETADA]: 'bg-green-100 text-green-800',
      [EstadoRecomendacion.CANCELADA]: 'bg-gray-100 text-gray-800',
      [EstadoRecomendacion.RECHAZADA]: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'bg-red-100 text-red-800';
    if (priority >= 6) return 'bg-orange-100 text-orange-800';
    if (priority >= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const handleExecute = async (id: string) => {
    try {
      await apiService.ejecutarRecomendacion(id, 'exitoso');
      loadRecommendations(); // Recargar lista
    } catch (error) {
      console.error('Error al ejecutar recomendación:', error);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await apiService.cancelarRecomendacion(id, 'Cancelado por usuario');
      loadRecommendations(); // Recargar lista
    } catch (error) {
      console.error('Error al cancelar recomendación:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recomendaciones</h1>
          <p className="text-gray-600">Next Best Actions para HCPs</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center">
            <LightBulbIcon className="w-4 h-4 mr-2" />
            Generar Nuevas
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar recomendaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as TipoRecomendacion | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            {Object.values(TipoRecomendacion).map(type => (
              <option key={type} value={type}>{type.replace('_', ' ')}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as EstadoRecomendacion | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            {Object.values(EstadoRecomendacion).map(status => (
              <option key={status} value={status}>{status.replace('_', ' ')}</option>
            ))}
          </select>

          {/* Channel Filter */}
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value as CanalComunicacion | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todos los canales</option>
            {Object.values(CanalComunicacion).map(channel => (
              <option key={channel} value={channel}>{channel.replace('_', ' ')}</option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedType('');
              setSelectedStatus('');
              setSelectedChannel('');
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center justify-center"
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {filteredRecommendations.length} recomendaciones encontradas
          </h3>
        </div>

        {error && (
          <div className="p-6 text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button 
              onClick={loadRecommendations}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Reintentar
            </button>
          </div>
        )}

        {!error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recomendación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Canal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecommendations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {rec.mensaje}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {rec.productos.join(', ')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(rec.tipo)}`}>
                        {rec.tipo.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(rec.prioridad)}`}>
                        {rec.prioridad}/10
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{rec.canal.replace('_', ' ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rec.estado)}`}>
                        {rec.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full" 
                            style={{ width: `${rec.score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{rec.score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {rec.estado === EstadoRecomendacion.PENDIENTE && (
                          <>
                            <button
                              onClick={() => handleExecute(rec.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Ejecutar"
                            >
                              <PlayIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCancel(rec.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Cancelar"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {rec.estado === EstadoRecomendacion.EN_PROCESO && (
                          <button
                            onClick={() => handleExecute(rec.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Completar"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                        )}
                        {rec.estado === EstadoRecomendacion.COMPLETADA && (
                          <ClockIcon className="w-4 h-4 text-gray-400" title="Completada" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage; 