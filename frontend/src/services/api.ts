import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  HCP, 
  Recomendacion, 
  DashboardData, 
  FiltrosRecomendacion,
  ApiResponse,
  ApiResponseWithPagination,
  ResultadoRecomendacion
} from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || '/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token de autenticación
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar errores de respuesta
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Métodos para HCPs
  async getHCPs(params?: any): Promise<ApiResponseWithPagination<HCP>> {
    const response: AxiosResponse<ApiResponseWithPagination<HCP>> = await this.api.get('/hcps', { params });
    return response.data;
  }

  async getHCP(id: string): Promise<ApiResponse<HCP>> {
    const response: AxiosResponse<ApiResponse<HCP>> = await this.api.get(`/hcps/${id}`);
    return response.data;
  }

  async createHCP(hcpData: Partial<HCP>): Promise<ApiResponse<HCP>> {
    const response: AxiosResponse<ApiResponse<HCP>> = await this.api.post('/hcps', hcpData);
    return response.data;
  }

  async updateHCP(id: string, hcpData: Partial<HCP>): Promise<ApiResponse<HCP>> {
    const response: AxiosResponse<ApiResponse<HCP>> = await this.api.put(`/hcps/${id}`, hcpData);
    return response.data;
  }

  async deleteHCP(id: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(`/hcps/${id}`);
    return response.data;
  }

  async getHCPMetrics(id: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(`/hcps/${id}/metricas`);
    return response.data;
  }

  async getHCPStats(): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/hcps/estadisticas');
    return response.data;
  }

  async importHCPs(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('csv', file);
    
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post('/hcps/importar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Métodos para recomendaciones
  async getRecomendaciones(filtros?: FiltrosRecomendacion): Promise<ApiResponse<Recomendacion[]>> {
    const response: AxiosResponse<ApiResponse<Recomendacion[]>> = await this.api.get('/recomendaciones', { params: filtros });
    return response.data;
  }

  async getRecomendacion(id: string): Promise<ApiResponse<Recomendacion>> {
    const response: AxiosResponse<ApiResponse<Recomendacion>> = await this.api.get(`/recomendaciones/${id}`);
    return response.data;
  }

  async getRecomendacionesPendientes(): Promise<ApiResponse<Recomendacion[]>> {
    const response: AxiosResponse<ApiResponse<Recomendacion[]>> = await this.api.get('/recomendaciones/pendientes');
    return response.data;
  }

  async getRecomendacionesPorPrioridad(prioridad: number): Promise<ApiResponse<Recomendacion[]>> {
    const response: AxiosResponse<ApiResponse<Recomendacion[]>> = await this.api.get(`/recomendaciones/prioridad/${prioridad}`);
    return response.data;
  }

  async generarRecomendaciones(hcpId: string): Promise<ApiResponse<Recomendacion[]>> {
    const response: AxiosResponse<ApiResponse<Recomendacion[]>> = await this.api.post(`/recomendaciones/generar/${hcpId}`);
    return response.data;
  }

  async generarRecomendacionesMasivas(hcpIds: string[]): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post('/recomendaciones/generar-masivas', { hcpIds });
    return response.data;
  }

  async ejecutarRecomendacion(id: string, resultado: ResultadoRecomendacion): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.post(`/recomendaciones/${id}/ejecutar`, { resultado });
    return response.data;
  }

  async cancelarRecomendacion(id: string, motivo: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.post(`/recomendaciones/${id}/cancelar`, { motivo });
    return response.data;
  }

  // Métodos para dashboard
  async getDashboardData(): Promise<ApiResponse<DashboardData>> {
    const response: AxiosResponse<ApiResponse<DashboardData>> = await this.api.get('/dashboard');
    return response.data;
  }

  async getRecomendacionesStats(): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/recomendaciones/estadisticas');
    return response.data;
  }

  // Métodos para análisis y optimización
  async analizarTendencias(): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.post('/analizar-tendencias');
    return response.data;
  }

  async optimizarRecomendaciones(): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.post('/optimizar-recomendaciones');
    return response.data;
  }

  // Métodos de autenticación
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    const response: AxiosResponse<ApiResponse<{ token: string; user: any }>> = await this.api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
    localStorage.removeItem('authToken');
  }

  async getProfile(): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/auth/profile');
    return response.data;
  }

  // Método de health check
  async healthCheck(): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 