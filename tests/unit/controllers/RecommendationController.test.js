const { RecommendationController } = require('../../src/controllers/RecommendationController');

// Mock de los modelos y servicios
jest.mock('../../src/models/Recomendacion');
jest.mock('../../src/services/RecommendationEngine');

describe('RecommendationController', () => {
  let recommendationController;
  let mockRecomendacionModel;
  let mockRecommendationEngine;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    recommendationController = new RecommendationController();
    
    // Obtener los mocks
    mockRecomendacionModel = require('../../src/models/Recomendacion');
    mockRecommendationEngine = require('../../src/services/RecommendationEngine');
    
    // Mock de request y response
    mockReq = {
      params: {},
      query: {},
      body: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    jest.clearAllMocks();
  });

  describe('getRecommendations', () => {
    test('debe obtener lista de recomendaciones con filtros', async () => {
      const mockRecommendations = [
        { id: 'rec1', tipo: 'contacto_inicial', prioridad: 8, estado: 'pendiente' },
        { id: 'rec2', tipo: 'seguimiento', prioridad: 6, estado: 'pendiente' }
      ];

      mockRecomendacionModel.find.mockResolvedValue(mockRecommendations);
      mockRecomendacionModel.countDocuments.mockResolvedValue(2);

      mockReq.query = {
        tipo: 'contacto_inicial',
        estado: 'pendiente',
        limit: '10',
        offset: '0'
      };

      await recommendationController.getRecommendations(mockReq, mockRes);

      expect(mockRecomendacionModel.find).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockRecommendations,
        pagination: expect.any(Object)
      });
    });

    test('debe manejar errores en la consulta', async () => {
      mockRecomendacionModel.find.mockRejectedValue(new Error('Database error'));

      await recommendationController.getRecommendations(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Error al obtener recomendaciones'
      });
    });
  });

  describe('getRecommendation', () => {
    test('debe obtener una recomendación específica', async () => {
      const mockRecommendation = {
        id: 'rec123',
        tipo: 'contacto_inicial',
        prioridad: 8,
        mensaje: 'Contactar al HCP'
      };

      mockRecomendacionModel.findById.mockResolvedValue(mockRecommendation);
      mockReq.params.id = 'rec123';

      await recommendationController.getRecommendation(mockReq, mockRes);

      expect(mockRecomendacionModel.findById).toHaveBeenCalledWith('rec123');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockRecommendation
      });
    });

    test('debe manejar recomendación no encontrada', async () => {
      mockRecomendacionModel.findById.mockResolvedValue(null);
      mockReq.params.id = 'rec123';

      await recommendationController.getRecommendation(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Recomendación no encontrada'
      });
    });
  });

  describe('getPendingRecommendations', () => {
    test('debe obtener recomendaciones pendientes', async () => {
      const mockRecommendations = [
        { id: 'rec1', estado: 'pendiente', prioridad: 8 },
        { id: 'rec2', estado: 'pendiente', prioridad: 6 }
      ];

      mockRecommendationEngine.prototype.getPendingRecommendations.mockResolvedValue(mockRecommendations);

      await recommendationController.getPendingRecommendations(mockReq, mockRes);

      expect(mockRecommendationEngine.prototype.getPendingRecommendations).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockRecommendations
      });
    });
  });

  describe('getRecommendationsByPriority', () => {
    test('debe obtener recomendaciones por prioridad', async () => {
      const mockRecommendations = [
        { id: 'rec1', prioridad: 8, tipo: 'contacto_inicial' },
        { id: 'rec2', prioridad: 8, tipo: 'seguimiento' }
      ];

      mockRecommendationEngine.prototype.getRecommendationsByPriority.mockResolvedValue(mockRecommendations);
      mockReq.params.prioridad = '8';

      await recommendationController.getRecommendationsByPriority(mockReq, mockRes);

      expect(mockRecommendationEngine.prototype.getRecommendationsByPriority).toHaveBeenCalledWith(8);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockRecommendations
      });
    });
  });

  describe('generateRecommendations', () => {
    test('debe generar recomendaciones para un HCP', async () => {
      const mockRecommendations = [
        { id: 'rec1', tipo: 'contacto_inicial', prioridad: 8 }
      ];

      mockRecommendationEngine.prototype.generateRecommendationsForHCP.mockResolvedValue(mockRecommendations);
      mockReq.params.hcpId = 'hcp123';

      await recommendationController.generateRecommendations(mockReq, mockRes);

      expect(mockRecommendationEngine.prototype.generateRecommendationsForHCP).toHaveBeenCalledWith('hcp123');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockRecommendations,
        message: 'Recomendaciones generadas exitosamente'
      });
    });

    test('debe manejar errores en generación', async () => {
      mockRecommendationEngine.prototype.generateRecommendationsForHCP.mockRejectedValue(new Error('IA Error'));
      mockReq.params.hcpId = 'hcp123';

      await recommendationController.generateRecommendations(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Error al generar recomendaciones'
      });
    });
  });

  describe('generateBulkRecommendations', () => {
    test('debe generar recomendaciones masivas', async () => {
      const hcpIds = ['hcp1', 'hcp2', 'hcp3'];
      const mockResult = {
        totalGenerated: 3,
        successCount: 3,
        errors: []
      };

      mockRecommendationEngine.prototype.generateBulkRecommendations.mockResolvedValue(mockResult);
      mockReq.body = { hcpIds };

      await recommendationController.generateBulkRecommendations(mockReq, mockRes);

      expect(mockRecommendationEngine.prototype.generateBulkRecommendations).toHaveBeenCalledWith(hcpIds);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Recomendaciones masivas generadas exitosamente'
      });
    });
  });

  describe('executeRecommendation', () => {
    test('debe ejecutar una recomendación', async () => {
      const recommendationId = 'rec123';
      const resultado = 'exitoso';
      const mockResult = { success: true };

      mockRecommendationEngine.prototype.executeRecommendation.mockResolvedValue(mockResult);
      mockReq.params.id = recommendationId;
      mockReq.body = { resultado };

      await recommendationController.executeRecommendation(mockReq, mockRes);

      expect(mockRecommendationEngine.prototype.executeRecommendation).toHaveBeenCalledWith(recommendationId, resultado);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Recomendación ejecutada exitosamente'
      });
    });

    test('debe validar resultado requerido', async () => {
      mockReq.params.id = 'rec123';
      mockReq.body = {};

      await recommendationController.executeRecommendation(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'resultado es requerido'
      });
    });
  });

  describe('cancelRecommendation', () => {
    test('debe cancelar una recomendación', async () => {
      const recommendationId = 'rec123';
      const motivo = 'Cancelado por usuario';
      const mockResult = { success: true };

      mockRecommendationEngine.prototype.cancelRecommendation.mockResolvedValue(mockResult);
      mockReq.params.id = recommendationId;
      mockReq.body = { motivo };

      await recommendationController.cancelRecommendation(mockReq, mockRes);

      expect(mockRecommendationEngine.prototype.cancelRecommendation).toHaveBeenCalledWith(recommendationId, motivo);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Recomendación cancelada exitosamente'
      });
    });

    test('debe validar motivo requerido', async () => {
      mockReq.params.id = 'rec123';
      mockReq.body = {};

      await recommendationController.cancelRecommendation(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'motivo es requerido'
      });
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

      mockRecommendationEngine.prototype.getRecommendationStats.mockResolvedValue(mockStats);

      await recommendationController.getRecommendationStats(mockReq, mockRes);

      expect(mockRecommendationEngine.prototype.getRecommendationStats).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockStats
      });
    });
  });

  describe('getRecommendationsByType', () => {
    test('debe obtener recomendaciones por tipo', async () => {
      const tipo = 'contacto_inicial';
      const mockRecommendations = [
        { id: 'rec1', tipo: 'contacto_inicial' },
        { id: 'rec2', tipo: 'contacto_inicial' }
      ];

      mockRecommendationEngine.prototype.getRecommendationsByType.mockResolvedValue(mockRecommendations);
      mockReq.params.tipo = tipo;

      await recommendationController.getRecommendationsByType(mockReq, mockRes);

      expect(mockRecommendationEngine.prototype.getRecommendationsByType).toHaveBeenCalledWith(tipo);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockRecommendations
      });
    });
  });

  describe('updateRecommendationScore', () => {
    test('debe actualizar score de recomendación', async () => {
      const recommendationId = 'rec123';
      const newScore = 90;
      const mockResult = { success: true };

      mockRecommendationEngine.prototype.updateRecommendationScore.mockResolvedValue(mockResult);
      mockReq.params.id = recommendationId;
      mockReq.body = { score: newScore };

      await recommendationController.updateRecommendationScore(mockReq, mockRes);

      expect(mockRecommendationEngine.prototype.updateRecommendationScore).toHaveBeenCalledWith(recommendationId, newScore);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Score actualizado exitosamente'
      });
    });

    test('debe validar score requerido', async () => {
      mockReq.params.id = 'rec123';
      mockReq.body = {};

      await recommendationController.updateRecommendationScore(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'score es requerido'
      });
    });

    test('debe validar rango de score', async () => {
      mockReq.params.id = 'rec123';
      mockReq.body = { score: 150 };

      await recommendationController.updateRecommendationScore(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'score debe estar entre 0 y 100'
      });
    });
  });

  describe('optimizeRecommendations', () => {
    test('debe optimizar recomendaciones', async () => {
      const mockFeedback = [
        { recomendacionId: 'rec1', resultado: 'exitoso', score: 0.8 }
      ];

      const mockResult = {
        optimizedCount: 5,
        improvements: ['Mejor timing', 'Canal optimizado']
      };

      mockRecommendationEngine.prototype.optimizeRecommendations.mockResolvedValue(mockResult);
      mockReq.body = { feedback: mockFeedback };

      await recommendationController.optimizeRecommendations(mockReq, mockRes);

      expect(mockRecommendationEngine.prototype.optimizeRecommendations).toHaveBeenCalledWith(mockFeedback);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Recomendaciones optimizadas exitosamente'
      });
    });
  });

  describe('analyzeTrends', () => {
    test('debe analizar tendencias', async () => {
      const mockResult = {
        trends: ['Aumento en contactos iniciales'],
        insights: ['Mejor respuesta en horario matutino']
      };

      mockRecommendationEngine.prototype.analyzeTrends.mockResolvedValue(mockResult);

      await recommendationController.analyzeTrends(mockReq, mockRes);

      expect(mockRecommendationEngine.prototype.analyzeTrends).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
    });
  });

  describe('getRecommendationsByChannel', () => {
    test('debe obtener recomendaciones por canal', async () => {
      const canal = 'personal';
      const mockRecommendations = [
        { id: 'rec1', canal: 'personal' },
        { id: 'rec2', canal: 'personal' }
      ];

      mockRecomendacionModel.find.mockResolvedValue(mockRecommendations);
      mockReq.params.canal = canal;

      await recommendationController.getRecommendationsByChannel(mockReq, mockRes);

      expect(mockRecomendacionModel.find).toHaveBeenCalledWith({ canal });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockRecommendations
      });
    });
  });

  describe('getRecommendationsByDateRange', () => {
    test('debe obtener recomendaciones por rango de fechas', async () => {
      const fechaDesde = '2024-01-01';
      const fechaHasta = '2024-01-31';
      const mockRecommendations = [
        { id: 'rec1', createdAt: '2024-01-15' },
        { id: 'rec2', createdAt: '2024-01-20' }
      ];

      mockRecomendacionModel.find.mockResolvedValue(mockRecommendations);
      mockReq.query = { fechaDesde, fechaHasta };

      await recommendationController.getRecommendationsByDateRange(mockReq, mockRes);

      expect(mockRecomendacionModel.find).toHaveBeenCalledWith({
        createdAt: {
          $gte: new Date(fechaDesde),
          $lte: new Date(fechaHasta)
        }
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockRecommendations
      });
    });
  });
}); 