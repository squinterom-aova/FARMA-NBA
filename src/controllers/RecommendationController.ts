import { Request, Response } from 'express';
import { RecommendationEngine } from '@/services/RecommendationEngine';
import { FiltrosRecomendacion, ResultadoRecomendacion } from '@/types';

export class RecommendationController {
  private recommendationEngine: RecommendationEngine;

  constructor() {
    this.recommendationEngine = new RecommendationEngine();
  }

  /**
   * Obtiene recomendaciones con filtros
   */
  async obtenerRecomendaciones(req: Request, res: Response): Promise<void> {
    try {
      const filtros: FiltrosRecomendacion = {
        hcpId: req.query.hcpId as string,
        tipo: req.query.tipo as any,
        canal: req.query.canal as any,
        prioridadMin: req.query.prioridadMin ? Number(req.query.prioridadMin) : undefined,
        prioridadMax: req.query.prioridadMax ? Number(req.query.prioridadMax) : undefined,
        fechaDesde: req.query.fechaDesde ? new Date(req.query.fechaDesde as string) : undefined,
        fechaHasta: req.query.fechaHasta ? new Date(req.query.fechaHasta as string) : undefined,
        estado: req.query.estado as any,
        especialidad: req.query.especialidad as string,
        region: req.query.region as string
      };

      const recomendaciones = await this.recommendationEngine.obtenerRecomendaciones(filtros);

      res.json({
        success: true,
        data: recomendaciones,
        total: recomendaciones.length
      });
    } catch (error) {
      console.error('Error obteniendo recomendaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene una recomendación específica
   */
  async obtenerRecomendacion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const recomendacion = await this.obtenerRecomendacionPorId(id);
      
      if (!recomendacion) {
        res.status(404).json({
          success: false,
          error: 'Recomendación no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: recomendacion
      });
    } catch (error) {
      console.error('Error obteniendo recomendación:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Genera recomendaciones para un HCP específico
   */
  async generarRecomendaciones(req: Request, res: Response): Promise<void> {
    try {
      const { hcpId } = req.params;

      const recomendaciones = await this.recommendationEngine.generarRecomendacionesParaHCP(hcpId);

      res.json({
        success: true,
        data: recomendaciones,
        message: `${recomendaciones.length} recomendaciones generadas exitosamente`
      });
    } catch (error) {
      console.error('Error generando recomendaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error al generar recomendaciones'
      });
    }
  }

  /**
   * Genera recomendaciones masivas para múltiples HCPs
   */
  async generarRecomendacionesMasivas(req: Request, res: Response): Promise<void> {
    try {
      const { hcpIds } = req.body;

      if (!Array.isArray(hcpIds) || hcpIds.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Lista de HCP IDs requerida'
        });
        return;
      }

      const resultados = await this.recommendationEngine.generarRecomendacionesMasivas(hcpIds);

      res.json({
        success: true,
        data: resultados,
        message: `Proceso completado: ${resultados.exitosas} exitosas, ${resultados.fallidas} fallidas`
      });
    } catch (error) {
      console.error('Error generando recomendaciones masivas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al generar recomendaciones masivas'
      });
    }
  }

  /**
   * Ejecuta una recomendación
   */
  async ejecutarRecomendacion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { resultado } = req.body;

      if (!resultado || !Object.values(ResultadoRecomendacion).includes(resultado)) {
        res.status(400).json({
          success: false,
          error: 'Resultado válido requerido'
        });
        return;
      }

      await this.recommendationEngine.ejecutarRecomendacion(id, resultado);

      res.json({
        success: true,
        message: 'Recomendación ejecutada exitosamente'
      });
    } catch (error) {
      console.error('Error ejecutando recomendación:', error);
      res.status(500).json({
        success: false,
        error: 'Error al ejecutar recomendación'
      });
    }
  }

  /**
   * Obtiene datos del dashboard
   */
  async obtenerDashboardData(req: Request, res: Response): Promise<void> {
    try {
      const dashboardData = await this.recommendationEngine.obtenerDashboardData();

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('Error obteniendo datos del dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener datos del dashboard'
      });
    }
  }

  /**
   * Analiza tendencias y genera recomendaciones proactivas
   */
  async analizarTendencias(req: Request, res: Response): Promise<void> {
    try {
      await this.recommendationEngine.analizarTendenciasYRecomendar();

      res.json({
        success: true,
        message: 'Análisis de tendencias completado'
      });
    } catch (error) {
      console.error('Error analizando tendencias:', error);
      res.status(500).json({
        success: false,
        error: 'Error al analizar tendencias'
      });
    }
  }

  /**
   * Optimiza recomendaciones basado en resultados históricos
   */
  async optimizarRecomendaciones(req: Request, res: Response): Promise<void> {
    try {
      await this.recommendationEngine.optimizarRecomendaciones();

      res.json({
        success: true,
        message: 'Optimización de recomendaciones completada'
      });
    } catch (error) {
      console.error('Error optimizando recomendaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error al optimizar recomendaciones'
      });
    }
  }

  /**
   * Obtiene estadísticas de recomendaciones
   */
  async obtenerEstadisticas(req: Request, res: Response): Promise<void> {
    try {
      const estadisticas = await this.calcularEstadisticasRecomendaciones();

      res.json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas'
      });
    }
  }

  /**
   * Obtiene recomendaciones por prioridad
   */
  async obtenerRecomendacionesPorPrioridad(req: Request, res: Response): Promise<void> {
    try {
      const { prioridad } = req.params;
      const prioridadNum = Number(prioridad);

      if (isNaN(prioridadNum) || prioridadNum < 1 || prioridadNum > 10) {
        res.status(400).json({
          success: false,
          error: 'Prioridad debe estar entre 1 y 10'
        });
        return;
      }

      const filtros: FiltrosRecomendacion = {
        prioridadMin: prioridadNum,
        prioridadMax: prioridadNum
      };

      const recomendaciones = await this.recommendationEngine.obtenerRecomendaciones(filtros);

      res.json({
        success: true,
        data: recomendaciones,
        total: recomendaciones.length
      });
    } catch (error) {
      console.error('Error obteniendo recomendaciones por prioridad:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene recomendaciones pendientes
   */
  async obtenerRecomendacionesPendientes(req: Request, res: Response): Promise<void> {
    try {
      const filtros: FiltrosRecomendacion = {
        estado: 'pendiente'
      };

      const recomendaciones = await this.recommendationEngine.obtenerRecomendaciones(filtros);

      res.json({
        success: true,
        data: recomendaciones,
        total: recomendaciones.length
      });
    } catch (error) {
      console.error('Error obteniendo recomendaciones pendientes:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Cancela una recomendación
   */
  async cancelarRecomendacion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      await this.cancelarRecomendacionDB(id, motivo);

      res.json({
        success: true,
        message: 'Recomendación cancelada exitosamente'
      });
    } catch (error) {
      console.error('Error cancelando recomendación:', error);
      res.status(500).json({
        success: false,
        error: 'Error al cancelar recomendación'
      });
    }
  }

  // Métodos privados auxiliares
  private async obtenerRecomendacionPorId(id: string): Promise<any> {
    // Simulación - en producción consultaría la base de datos
    return null;
  }

  private async calcularEstadisticasRecomendaciones(): Promise<any> {
    // Simulación
    return {
      total: 150,
      pendientes: 45,
      completadas: 89,
      canceladas: 16,
      porTipo: {
        'contacto_inicial': 25,
        'seguimiento': 35,
        'presentacion_producto': 20,
        'entrega_muestra': 15,
        'invitacion_evento': 10,
        'educacion_medica': 30,
        'apoyo_clinico': 15
      },
      porCanal: {
        'personal': 40,
        'email': 35,
        'telefono': 20,
        'whatsapp': 15,
        'linkedin': 10,
        'twitter': 5,
        'evento_presencial': 15,
        'evento_virtual': 10
      },
      tasaExito: 78.5,
      promedioScore: 72.3
    };
  }

  private async cancelarRecomendacionDB(id: string, motivo: string): Promise<void> {
    // Simulación - en producción actualizaría en base de datos
    console.log(`Cancelando recomendación ${id} con motivo: ${motivo}`);
  }
} 