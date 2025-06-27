import { Request, Response } from 'express';
import { HCP, BuyerPersona, EscaleraAdopcion } from '@/types';

export class HCPController {
  /**
   * Obtiene todos los HCPs con filtros opcionales
   */
  async obtenerHCPs(req: Request, res: Response): Promise<void> {
    try {
      const { 
        especialidad, 
        ciudad, 
        estado, 
        buyerPersona, 
        escaleraAdopcion,
        limit = 50,
        offset = 0 
      } = req.query;

      // Construir filtros
      const filtros: any = {};
      if (especialidad) filtros.especialidad = new RegExp(especialidad as string, 'i');
      if (ciudad) filtros.ciudad = new RegExp(ciudad as string, 'i');
      if (estado) filtros.estado = new RegExp(estado as string, 'i');
      if (buyerPersona) filtros.buyerPersona = buyerPersona;
      if (escaleraAdopcion) filtros.escaleraAdopcion = escaleraAdopcion;

      // En producción, consultaría la base de datos
      const hcps = await this.consultarHCPsDB(filtros, Number(limit), Number(offset));
      const total = await this.contarHCPsDB(filtros);

      res.json({
        success: true,
        data: hcps,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error obteniendo HCPs:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene un HCP específico por ID
   */
  async obtenerHCP(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const hcp = await this.consultarHCPPorId(id);
      
      if (!hcp) {
        res.status(404).json({
          success: false,
          error: 'HCP no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: hcp
      });
    } catch (error) {
      console.error('Error obteniendo HCP:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Crea un nuevo HCP
   */
  async crearHCP(req: Request, res: Response): Promise<void> {
    try {
      const hcpData: Partial<HCP> = req.body;

      // Validar datos requeridos
      const errores = this.validarDatosHCP(hcpData);
      if (errores.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          detalles: errores
        });
        return;
      }

      const hcp = await this.guardarHCP(hcpData);

      res.status(201).json({
        success: true,
        data: hcp,
        message: 'HCP creado exitosamente'
      });
    } catch (error) {
      console.error('Error creando HCP:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualiza un HCP existente
   */
  async actualizarHCP(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const hcpData: Partial<HCP> = req.body;

      // Verificar que el HCP existe
      const hcpExistente = await this.consultarHCPPorId(id);
      if (!hcpExistente) {
        res.status(404).json({
          success: false,
          error: 'HCP no encontrado'
        });
        return;
      }

      // Validar datos
      const errores = this.validarDatosHCP(hcpData, true);
      if (errores.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          detalles: errores
        });
        return;
      }

      const hcpActualizado = await this.actualizarHCPDB(id, hcpData);

      res.json({
        success: true,
        data: hcpActualizado,
        message: 'HCP actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error actualizando HCP:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Elimina un HCP
   */
  async eliminarHCP(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Verificar que el HCP existe
      const hcpExistente = await this.consultarHCPPorId(id);
      if (!hcpExistente) {
        res.status(404).json({
          success: false,
          error: 'HCP no encontrado'
        });
        return;
      }

      await this.eliminarHCPDB(id);

      res.json({
        success: true,
        message: 'HCP eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando HCP:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene métricas de engagement de un HCP
   */
  async obtenerMetricasHCP(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const hcp = await this.consultarHCPPorId(id);
      if (!hcp) {
        res.status(404).json({
          success: false,
          error: 'HCP no encontrado'
        });
        return;
      }

      const metricas = await this.calcularMetricasHCP(id);

      res.json({
        success: true,
        data: metricas
      });
    } catch (error) {
      console.error('Error obteniendo métricas:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene estadísticas de HCPs
   */
  async obtenerEstadisticas(req: Request, res: Response): Promise<void> {
    try {
      const estadisticas = await this.calcularEstadisticasHCPs();

      res.json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Importa HCPs desde un archivo CSV
   */
  async importarHCPs(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'Archivo CSV requerido'
        });
        return;
      }

      const resultados = await this.procesarCSVHCPs(req.file.buffer);

      res.json({
        success: true,
        data: resultados,
        message: `Importación completada: ${resultados.exitosos} exitosos, ${resultados.fallidos} fallidos`
      });
    } catch (error) {
      console.error('Error importando HCPs:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // Métodos privados auxiliares
  private validarDatosHCP(hcpData: Partial<HCP>, esActualizacion: boolean = false): string[] {
    const errores: string[] = [];

    if (!esActualizacion) {
      if (!hcpData.nombre) errores.push('Nombre es requerido');
      if (!hcpData.apellidos) errores.push('Apellidos son requeridos');
      if (!hcpData.especialidad) errores.push('Especialidad es requerida');
      if (!hcpData.institucion) errores.push('Institución es requerida');
      if (!hcpData.ciudad) errores.push('Ciudad es requerida');
      if (!hcpData.estado) errores.push('Estado es requerido');
    }

    if (hcpData.volumenPacientes !== undefined && hcpData.volumenPacientes < 0) {
      errores.push('Volumen de pacientes debe ser positivo');
    }

    if (hcpData.decilPrescripcion !== undefined && (hcpData.decilPrescripcion < 1 || hcpData.decilPrescripcion > 10)) {
      errores.push('Decil de prescripción debe estar entre 1 y 10');
    }

    if (hcpData.nivelRespuesta !== undefined && (hcpData.nivelRespuesta < 1 || hcpData.nivelRespuesta > 10)) {
      errores.push('Nivel de respuesta debe estar entre 1 y 10');
    }

    if (hcpData.buyerPersona && !Object.values(BuyerPersona).includes(hcpData.buyerPersona)) {
      errores.push('Buyer persona inválido');
    }

    if (hcpData.escaleraAdopcion && !Object.values(EscaleraAdopcion).includes(hcpData.escaleraAdopcion)) {
      errores.push('Escalera de adopción inválida');
    }

    return errores;
  }

  // Métodos de simulación para base de datos
  private async consultarHCPsDB(filtros: any, limit: number, offset: number): Promise<HCP[]> {
    // Simulación - en producción consultaría MongoDB
    return [];
  }

  private async contarHCPsDB(filtros: any): Promise<number> {
    // Simulación
    return 150;
  }

  private async consultarHCPPorId(id: string): Promise<HCP | null> {
    // Simulación
    return null;
  }

  private async guardarHCP(hcpData: Partial<HCP>): Promise<HCP> {
    // Simulación
    return hcpData as HCP;
  }

  private async actualizarHCPDB(id: string, hcpData: Partial<HCP>): Promise<HCP> {
    // Simulación
    return hcpData as HCP;
  }

  private async eliminarHCPDB(id: string): Promise<void> {
    // Simulación
    console.log(`Eliminando HCP: ${id}`);
  }

  private async calcularMetricasHCP(id: string): Promise<any> {
    // Simulación
    return {
      frecuenciaContacto: 3,
      tasaRespuesta: 75,
      tiempoRespuesta: 24,
      calidadInteraccion: 8,
      prescripcionesGeneradas: 15,
      valorPrescripciones: 25000,
      ultimaInteraccion: new Date()
    };
  }

  private async calcularEstadisticasHCPs(): Promise<any> {
    // Simulación
    return {
      total: 150,
      porEspecialidad: {
        'Cardiología': 25,
        'Endocrinología': 20,
        'Neurología': 15
      },
      porRegion: {
        'CDMX': 45,
        'Jalisco': 30,
        'Nuevo León': 25
      },
      promedioEngagement: 72.5
    };
  }

  private async procesarCSVHCPs(buffer: Buffer): Promise<{exitosos: number, fallidos: number}> {
    // Simulación
    return { exitosos: 50, fallidos: 2 };
  }
} 