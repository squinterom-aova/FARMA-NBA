const { RecommendationEngine } = require('../../src/services/RecommendationEngine');

// Mock de los servicios dependientes
jest.mock('../../src/services/IAEngine');
jest.mock('../../src/services/DataProcessor');
jest.mock('../../src/models/HCP');
jest.mock('../../src/models/Recomendacion');

describe('RecommendationEngine', () => {
  let recommendationEngine;
  let mockIAEngine;
  let mockDataProcessor;
  let mockHCPModel;
  let mockRecomendacionModel;

  beforeEach(() => {
    recommendationEngine = new RecommendationEngine();
    
    // Obtener los mocks
    mockIAEngine = require('../../src/services/IAEngine');
    mockDataProcessor = require('../../src/services/DataProcessor');
    mockHCPModel = require('../../src/models/HCP');
    mockRecomendacionModel = require('../../src/models/Recomendacion');
    
    jest.clearAllMocks();
  });

  describe('generateRecommendationsForHCP', () => {
    test('debe generar recomendaciones para un HCP específico', async () => {
      const hcpId = 'hcp123';
      const mockHCP = {
        id: hcpId,
        nombre: 'Dr. Juan Pérez',
        especialidad: 'Cardiología',
        buyerPersona: 'innovador',
        historialContacto: []
      };

      const mockRecommendation = {
        tipo: 'contacto_inicial',
        prioridad: 8,
        canal: 'personal',
        mensaje: 'Contactar al Dr. Pérez',
        explicacion: 'HCP innovador con alto potencial',
        productos: ['Producto A'],
        score: 85
      };

      // Configurar mocks
      mockHCPModel.findById.mockResolvedValue(mockHCP);
      mockIAEngine.prototype.generateRecommendation.mockResolvedValue(mockRecommendation);
      mockRecomendacionModel.prototype.save.mockResolvedValue({
        ...mockRecommendation,
        id: 'rec123',
        hcpId: hcpId
      });

      const result = await recommendationEngine.generateRecommendationsForHCP(hcpId);

      expect(result).toHaveLength(1);
      expect(result[0].tipo).toBe('contacto_inicial');
      expect(result[0].hcpId).toBe(hcpId);
      expect(mockHCPModel.findById).toHaveBeenCalledWith(hcpId);
      expect(mockIAEngine.prototype.generateRecommendation).toHaveBeenCalledWith(mockHCP, 'contacto_inicial');
    });

    test('debe manejar HCP no encontrado', async () => {
      mockHCPModel.findById.mockResolvedValue(null);

      await expect(recommendationEngine.generateRecommendationsForHCP('hcp123'))
        .rejects.toThrow('HCP no encontrado');
    });

    test('debe manejar errores de IA', async () => {
      const mockHCP = { id: 'hcp123', nombre: 'Dr. Test' };
      mockHCPModel.findById.mockResolvedValue(mockHCP);
      mockIAEngine.prototype.generateRecommendation.mockRejectedValue(new Error('IA Error'));

      await expect(recommendationEngine.generateRecommendationsForHCP('hcp123'))
        .rejects.toThrow('Error al generar recomendaciones');
    });
  });

  describe('generateBulkRecommendations', () => {
    test('debe generar recomendaciones masivas', async () => {
      const hcpIds = ['hcp1', 'hcp2', 'hcp3'];
      const mockHCPs = hcpIds.map(id => ({
        id,
        nombre: `Dr. ${id}`,
        especialidad: 'Cardiología'
      }));

      const mockRecommendation = {
        tipo: 'contacto_inicial',
        prioridad: 7,
        canal: 'email',
        mensaje: 'Recomendación',
        explicacion: 'Explicación',
        productos: ['Producto A'],
        score: 80
      };

      // Configurar mocks
      mockHCPModel.find.mockResolvedValue(mockHCPs);
      mockIAEngine.prototype.generateRecommendation.mockResolvedValue(mockRecommendation);
      mockRecomendacionModel.prototype.save.mockResolvedValue({
        ...mockRecommendation,
        id: 'rec123'
      });

      const result = await recommendationEngine.generateBulkRecommendations(hcpIds);

      expect(result.totalGenerated).toBe(3);
      expect(result.successCount).toBe(3);
      expect(result.errors).toHaveLength(0);
    });

    test('debe manejar errores parciales en generación masiva', async () => {
      const hcpIds = ['hcp1', 'hcp2'];
      const mockHCPs = [
        { id: 'hcp1', nombre: 'Dr. Test1' },
        { id: 'hcp2', nombre: 'Dr. Test2' }
      ];

      mockHCPModel.find.mockResolvedValue(mockHCPs);
      mockIAEngine.prototype.generateRecommendation
        .mockResolvedValueOnce({ tipo: 'contacto_inicial' })
        .mockRejectedValueOnce(new Error('IA Error'));

      const result = await recommendationEngine.generateBulkRecommendations(hcpIds);

      expect(result.totalGenerated).toBe(2);
      expect(result.successCount).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('getPendingRecommendations', () => {
    test('debe obtener recomendaciones pendientes', async () => {
      const mockRecommendations = [
        { id: 'rec1', estado: 'pendiente', prioridad: 8 },
        { id: 'rec2', estado: 'pendiente', prioridad: 6 }
      ];

      mockRecomendacionModel.find.mockResolvedValue(mockRecommendations);

      const result = await recommendationEngine.getPendingRecommendations();

      expect(result).toHaveLength(2);
      expect(mockRecomendacionModel.find).toHaveBeenCalledWith({ estado: 'pendiente' });
    });

    test('debe ordenar por prioridad descendente', async () => {
      const mockRecommendations = [
        { id: 'rec1', estado: 'pendiente', prioridad: 6 },
        { id: 'rec2', estado: 'pendiente', prioridad: 8 }
      ];

      mockRecomendacionModel.find.mockResolvedValue(mockRecommendations);

      const result = await recommendationEngine.getPendingRecommendations();

      expect(result[0].prioridad).toBe(8);
      expect(result[1].prioridad).toBe(6);
    });
  });

  describe('executeRecommendation', () => {
    test('debe ejecutar una recomendación exitosamente', async () => {
      const recommendationId = 'rec123';
      const resultado = 'exitoso';
      const mockRecommendation = {
        id: recommendationId,
        estado: 'pendiente',
        save: jest.fn().mockResolvedValue(true)
      };

      mockRecomendacionModel.findById.mockResolvedValue(mockRecommendation);

      const result = await recommendationEngine.executeRecommendation(recommendationId, resultado);

      expect(result.success).toBe(true);
      expect(mockRecommendation.estado).toBe('completada');
      expect(mockRecommendation.resultado).toBe(resultado);
      expect(mockRecommendation.ejecutadaAt).toBeDefined();
      expect(mockRecommendation.save).toHaveBeenCalled();
    });

    test('debe manejar recomendación no encontrada', async () => {
      mockRecomendacionModel.findById.mockResolvedValue(null);

      await expect(recommendationEngine.executeRecommendation('rec123', 'exitoso'))
        .rejects.toThrow('Recomendación no encontrada');
    });

    test('debe manejar recomendación ya ejecutada', async () => {
      const mockRecommendation = {
        id: 'rec123',
        estado: 'completada'
      };

      mockRecomendacionModel.findById.mockResolvedValue(mockRecommendation);

      await expect(recommendationEngine.executeRecommendation('rec123', 'exitoso'))
        .rejects.toThrow('Recomendación ya fue ejecutada');
    });
  });

  describe('cancelRecommendation', () => {
    test('debe cancelar una recomendación', async () => {
      const recommendationId = 'rec123';
      const motivo = 'Cancelado por usuario';
      const mockRecommendation = {
        id: recommendationId,
        estado: 'pendiente',
        save: jest.fn().mockResolvedValue(true)
      };

      mockRecomendacionModel.findById.mockResolvedValue(mockRecommendation);

      const result = await recommendationEngine.cancelRecommendation(recommendationId, motivo);

      expect(result.success).toBe(true);
      expect(mockRecommendation.estado).toBe('cancelada');
      expect(mockRecommendation.save).toHaveBeenCalled();
    });
  });

  describe('getDashboardData', () => {
    test('debe obtener datos del dashboard', async () => {
      const mockStats = {
        hcpsActivos: 150,
        recomendacionesPendientes: 25,
        contactosMes: 300,
        prescripcionesGeneradas: 120,
        valorPrescripciones: 50000,
        tasaExito: 0.75
      };

      // Mock de las consultas agregadas
      mockHCPModel.countDocuments.mockResolvedValue(150);
      mockRecomendacionModel.countDocuments.mockResolvedValue(25);
      mockRecomendacionModel.aggregate.mockResolvedValue([
        { _id: 'Producto A', prescripciones: 50 },
        { _id: 'Producto B', prescripciones: 30 }
      ]);

      const result = await recommendationEngine.getDashboardData();

      expect(result.hcpsActivos).toBe(150);
      expect(result.recomendacionesPendientes).toBe(25);
      expect(result.topProductos).toHaveLength(2);
    });
  });

  describe('optimizeRecommendations', () => {
    test('debe optimizar recomendaciones basado en feedback', async () => {
      const mockFeedback = [
        { recomendacionId: 'rec1', resultado: 'exitoso', score: 0.8 },
        { recomendacionId: 'rec2', resultado: 'fallido', score: 0.2 }
      ];

      const result = await recommendationEngine.optimizeRecommendations(mockFeedback);

      expect(result.optimizedCount).toBeGreaterThan(0);
      expect(result.improvements).toBeDefined();
    });
  });

  describe('analyzeTrends', () => {
    test('debe analizar tendencias de recomendaciones', async () => {
      const mockData = [
        { fecha: '2024-01-01', tipo: 'contacto_inicial', resultado: 'exitoso' },
        { fecha: '2024-01-02', tipo: 'seguimiento', resultado: 'exitoso' }
      ];

      mockRecomendacionModel.find.mockResolvedValue(mockData);

      const result = await recommendationEngine.analyzeTrends();

      expect(result.trends).toBeDefined();
      expect(result.insights).toBeDefined();
    });
  });

  describe('getRecommendationsByPriority', () => {
    test('debe obtener recomendaciones por prioridad', async () => {
      const prioridad = 8;
      const mockRecommendations = [
        { id: 'rec1', prioridad: 8, tipo: 'contacto_inicial' },
        { id: 'rec2', prioridad: 8, tipo: 'seguimiento' }
      ];

      mockRecomendacionModel.find.mockResolvedValue(mockRecommendations);

      const result = await recommendationEngine.getRecommendationsByPriority(prioridad);

      expect(result).toHaveLength(2);
      expect(result[0].prioridad).toBe(8);
      expect(mockRecomendacionModel.find).toHaveBeenCalledWith({ prioridad });
    });
  });

  describe('getRecommendationsByType', () => {
    test('debe obtener recomendaciones por tipo', async () => {
      const tipo = 'contacto_inicial';
      const mockRecommendations = [
        { id: 'rec1', tipo: 'contacto_inicial' },
        { id: 'rec2', tipo: 'contacto_inicial' }
      ];

      mockRecomendacionModel.find.mockResolvedValue(mockRecommendations);

      const result = await recommendationEngine.getRecommendationsByType(tipo);

      expect(result).toHaveLength(2);
      expect(result[0].tipo).toBe('contacto_inicial');
      expect(mockRecomendacionModel.find).toHaveBeenCalledWith({ tipo });
    });
  });

  describe('updateRecommendationScore', () => {
    test('debe actualizar score de recomendación', async () => {
      const recommendationId = 'rec123';
      const newScore = 90;
      const mockRecommendation = {
        id: recommendationId,
        score: 80,
        save: jest.fn().mockResolvedValue(true)
      };

      mockRecomendacionModel.findById.mockResolvedValue(mockRecommendation);

      const result = await recommendationEngine.updateRecommendationScore(recommendationId, newScore);

      expect(result.success).toBe(true);
      expect(mockRecommendation.score).toBe(90);
      expect(mockRecommendation.save).toHaveBeenCalled();
    });
  });

  describe('getRecommendationStats', () => {
    test('debe obtener estadísticas de recomendaciones', async () => {
      const mockStats = {
        total: 100,
        pendientes: 25,
        completadas: 60,
        canceladas: 15,
        tasaExito: 0.75
      };

      mockRecomendacionModel.aggregate.mockResolvedValue([
        { _id: 'pendiente', count: 25 },
        { _id: 'completada', count: 60 },
        { _id: 'cancelada', count: 15 }
      ]);

      const result = await recommendationEngine.getRecommendationStats();

      expect(result.total).toBeDefined();
      expect(result.tasaExito).toBeDefined();
    });
  });
}); 