import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { HCP, BuyerPersona, EscaleraAdopcion } from '@/types';
import apiService from '@/services/api';

const HCPListPage: React.FC = () => {
  const [hcps, setHcps] = useState<HCP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  useEffect(() => {
    loadHCPs();
  }, []);

  const loadHCPs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getHCPs();
      if (response.success && response.data) {
        setHcps(response.data);
      } else {
        setError(response.error || 'Error al cargar HCPs');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const filteredHCPs = hcps.filter(hcp => {
    const matchesSearch = hcp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hcp.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hcp.especialidad.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || hcp.especialidad === selectedSpecialty;
    const matchesRegion = !selectedRegion || hcp.estado === selectedRegion;
    
    return matchesSearch && matchesSpecialty && matchesRegion;
  });

  const specialties = [...new Set(hcps.map(hcp => hcp.especialidad))];
  const regions = [...new Set(hcps.map(hcp => hcp.estado))];

  const getBuyerPersonaColor = (persona: BuyerPersona) => {
    const colors = {
      [BuyerPersona.INNOVADOR]: 'bg-purple-100 text-purple-800',
      [BuyerPersona.SEGUIDOR_TEMPRANO]: 'bg-blue-100 text-blue-800',
      [BuyerPersona.MAYORIA_TEMPRANA]: 'bg-green-100 text-green-800',
      [BuyerPersona.MAYORIA_TARDIA]: 'bg-yellow-100 text-yellow-800',
      [BuyerPersona.REZAGADO]: 'bg-red-100 text-red-800',
    };
    return colors[persona] || 'bg-gray-100 text-gray-800';
  };

  const getEscaleraColor = (escalera: EscaleraAdopcion) => {
    const colors = {
      [EscaleraAdopcion.NO_FAMILIARIZADO]: 'bg-red-100 text-red-800',
      [EscaleraAdopcion.EN_EVALUACION]: 'bg-yellow-100 text-yellow-800',
      [EscaleraAdopcion.USUARIO]: 'bg-blue-100 text-blue-800',
      [EscaleraAdopcion.PROMOTOR]: 'bg-green-100 text-green-800',
    };
    return colors[escalera] || 'bg-gray-100 text-gray-800';
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
          <h1 className="text-2xl font-bold text-gray-900">Profesionales de la Salud</h1>
          <p className="text-gray-600">Gestiona y visualiza información de HCPs</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
            <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
            Importar CSV
          </button>
          <Link
            to="/hcps/nuevo"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Nuevo HCP
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar HCP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Specialty Filter */}
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todas las especialidades</option>
            {specialties.map(specialty => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>

          {/* Region Filter */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todas las regiones</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSpecialty('');
              setSelectedRegion('');
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
            {filteredHCPs.length} HCPs encontrados
          </h3>
        </div>

        {error && (
          <div className="p-6 text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button 
              onClick={loadHCPs}
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
                    HCP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especialidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Región
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer Persona
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Escalera
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engagement
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHCPs.map((hcp) => (
                  <tr key={hcp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {hcp.nombre} {hcp.apellidos}
                        </div>
                        <div className="text-sm text-gray-500">{hcp.institucion}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{hcp.especialidad}</div>
                      {hcp.subespecialidad && (
                        <div className="text-sm text-gray-500">{hcp.subespecialidad}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{hcp.ciudad}, {hcp.estado}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBuyerPersonaColor(hcp.buyerPersona)}`}>
                        {hcp.buyerPersona.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEscaleraColor(hcp.escaleraAdopcion)}`}>
                        {hcp.escaleraAdopcion.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full" 
                            style={{ width: `${hcp.metricasEngagement.tasaRespuesta}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{hcp.metricasEngagement.tasaRespuesta}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/hcps/${hcp.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/hcps/${hcp.id}/editar`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {/* Handle delete */}}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
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

export default HCPListPage; 