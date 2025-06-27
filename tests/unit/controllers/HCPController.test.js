const { HCPController } = require('../../src/controllers/HCPController');

// Mock de los modelos y servicios
jest.mock('../../src/models/HCP');
jest.mock('../../src/services/DataProcessor');
jest.mock('../../src/services/RecommendationEngine');

describe('HCPController', () => {
  let hcpController;
  let mockHCPModel;
  let mockDataProcessor;
  let mockRecommendationEngine;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    hcpController = new HCPController();
    
    // Obtener los mocks
    mockHCPModel = require('../../src/models/HCP');
    mockDataProcessor = require('../../src/services/DataProcessor');
    mockRecommendationEngine = require('../../src/services/RecommendationEngine');
    
    // Mock de request y response
    mockReq = {
      params: {},
      query: {},
      body: {},
      file: null
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    jest.clearAllMocks();
  });

  describe('getHCPs', () => {
    test('debe obtener lista de HCPs con filtros', async () => {
      const mockHCPs = [
        { id: 'hcp1', nombre: 'Dr. Juan Pérez', especialidad: 'Cardiología' },
        { id: 'hcp2', nombre: 'Dr. María García', especialidad: 'Oncología' }
      ];

      mockHCPModel.find.mockResolvedValue(mockHCPs);
      mockHCPModel.countDocuments.mockResolvedValue(2);

      mockReq.query = {
        especialidad: 'Cardiología',
        limit: '10',
        offset: '0'
      };

      await hcpController.getHCPs(mockReq, mockRes);

      expect(mockHCPModel.find).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockHCPs,
        pagination: expect.any(Object)
      });
    });

    test('debe manejar errores en la consulta', async () => {
      mockHCPModel.find.mockRejectedValue(new Error('Database error'));

      await hcpController.getHCPs(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Error al obtener HCPs'
      });
    });
  });

  describe('getHCP', () => {
    test('debe obtener un HCP específico', async () => {
      const mockHCP = {
        id: 'hcp123',
        nombre: 'Dr. Juan Pérez',
        especialidad: 'Cardiología'
      };

      mockHCPModel.findById.mockResolvedValue(mockHCP);
      mockReq.params.id = 'hcp123';

      await hcpController.getHCP(mockReq, mockRes);

      expect(mockHCPModel.findById).toHaveBeenCalledWith('hcp123');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockHCP
      });
    });

    test('debe manejar HCP no encontrado', async () => {
      mockHCPModel.findById.mockResolvedValue(null);
      mockReq.params.id = 'hcp123';

      await hcpController.getHCP(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'HCP no encontrado'
      });
    });
  });

  describe('createHCP', () => {
    test('debe crear un nuevo HCP', async () => {
      const hcpData = {
        nombre: 'Dr. Juan Pérez',
        apellidos: 'García',
        especialidad: 'Cardiología',
        institucion: 'Hospital General'
      };

      const mockCreatedHCP = {
        id: 'hcp123',
        ...hcpData
      };

      mockHCPModel.prototype.save.mockResolvedValue(mockCreatedHCP);
      mockReq.body = hcpData;

      await hcpController.createHCP(mockReq, mockRes);

      expect(mockHCPModel.prototype.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedHCP,
        message: 'HCP creado exitosamente'
      });
    });

    test('debe validar datos requeridos', async () => {
      mockReq.body = {
        nombre: '',
        especialidad: 'Cardiología'
      };

      await hcpController.createHCP(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'nombre es requerido'
      });
    });
  });

  describe('updateHCP', () => {
    test('debe actualizar un HCP existente', async () => {
      const updateData = {
        especialidad: 'Cardiología Intervencionista'
      };

      const mockUpdatedHCP = {
        id: 'hcp123',
        nombre: 'Dr. Juan Pérez',
        especialidad: 'Cardiología Intervencionista'
      };

      mockHCPModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedHCP);
      mockReq.params.id = 'hcp123';
      mockReq.body = updateData;

      await hcpController.updateHCP(mockReq, mockRes);

      expect(mockHCPModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'hcp123',
        updateData,
        { new: true, runValidators: true }
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedHCP,
        message: 'HCP actualizado exitosamente'
      });
    });

    test('debe manejar HCP no encontrado en actualización', async () => {
      mockHCPModel.findByIdAndUpdate.mockResolvedValue(null);
      mockReq.params.id = 'hcp123';
      mockReq.body = { especialidad: 'Cardiología' };

      await hcpController.updateHCP(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'HCP no encontrado'
      });
    });
  });

  describe('deleteHCP', () => {
    test('debe eliminar un HCP', async () => {
      const mockDeletedHCP = {
        id: 'hcp123',
        nombre: 'Dr. Juan Pérez'
      };

      mockHCPModel.findByIdAndDelete.mockResolvedValue(mockDeletedHCP);
      mockReq.params.id = 'hcp123';

      await hcpController.deleteHCP(mockReq, mockRes);

      expect(mockHCPModel.findByIdAndDelete).toHaveBeenCalledWith('hcp123');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'HCP eliminado exitosamente'
      });
    });

    test('debe manejar HCP no encontrado en eliminación', async () => {
      mockHCPModel.findByIdAndDelete.mockResolvedValue(null);
      mockReq.params.id = 'hcp123';

      await hcpController.deleteHCP(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'HCP no encontrado'
      });
    });
  });

  describe('getHCPMetrics', () => {
    test('debe obtener métricas de un HCP', async () => {
      const mockMetrics = {
        engagement: 0.75,
        contactos: 15,
        prescripciones: 8,
        valorPrescripciones: 25000
      };

      mockHCPModel.findById.mockResolvedValue({
        id: 'hcp123',
        metricasEngagement: mockMetrics
      });
      mockReq.params.id = 'hcp123';

      await hcpController.getHCPMetrics(mockReq, mockRes);

      expect(mockHCPModel.findById).toHaveBeenCalledWith('hcp123');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockMetrics
      });
    });
  });

  describe('getHCPStats', () => {
    test('debe obtener estadísticas generales de HCPs', async () => {
      const mockStats = {
        total: 150,
        porEspecialidad: [
          { especialidad: 'Cardiología', count: 25 },
          { especialidad: 'Oncología', count: 20 }
        ],
        porRegion: [
          { region: 'CDMX', count: 50 },
          { region: 'Jalisco', count: 30 }
        ]
      };

      mockHCPModel.aggregate.mockResolvedValue(mockStats.porEspecialidad);
      mockHCPModel.countDocuments.mockResolvedValue(mockStats.total);

      await hcpController.getHCPStats(mockReq, mockRes);

      expect(mockHCPModel.aggregate).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          total: mockStats.total
        })
      });
    });
  });

  describe('importHCPs', () => {
    test('debe importar HCPs desde CSV', async () => {
      const mockFile = {
        buffer: Buffer.from('nombre,apellidos,especialidad\nDr. Juan,Pérez,Cardiología'),
        originalname: 'hcps.csv'
      };

      const mockProcessedData = [
        { nombre: 'Juan', apellidos: 'Pérez', especialidad: 'Cardiología' }
      ];

      mockReq.file = mockFile;
      mockDataProcessor.prototype.processCSV.mockResolvedValue(mockProcessedData);
      mockHCPModel.insertMany.mockResolvedValue(mockProcessedData);

      await hcpController.importHCPs(mockReq, mockRes);

      expect(mockDataProcessor.prototype.processCSV).toHaveBeenCalledWith(mockFile.buffer);
      expect(mockHCPModel.insertMany).toHaveBeenCalledWith(mockProcessedData);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { imported: mockProcessedData.length },
        message: 'HCPs importados exitosamente'
      });
    });

    test('debe manejar errores en importación', async () => {
      mockReq.file = null;

      await hcpController.importHCPs(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Archivo CSV requerido'
      });
    });
  });

  describe('searchHCPs', () => {
    test('debe buscar HCPs por término', async () => {
      const mockHCPs = [
        { id: 'hcp1', nombre: 'Dr. Juan Pérez' }
      ];

      mockHCPModel.find.mockResolvedValue(mockHCPs);
      mockReq.query.q = 'Juan';

      await hcpController.searchHCPs(mockReq, mockRes);

      expect(mockHCPModel.find).toHaveBeenCalledWith({
        $or: [
          { nombre: { $regex: 'Juan', $options: 'i' } },
          { apellidos: { $regex: 'Juan', $options: 'i' } },
          { especialidad: { $regex: 'Juan', $options: 'i' } }
        ]
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockHCPs
      });
    });
  });

  describe('getHCPsBySpecialty', () => {
    test('debe obtener HCPs por especialidad', async () => {
      const mockHCPs = [
        { id: 'hcp1', nombre: 'Dr. Juan Pérez', especialidad: 'Cardiología' },
        { id: 'hcp2', nombre: 'Dr. María García', especialidad: 'Cardiología' }
      ];

      mockHCPModel.find.mockResolvedValue(mockHCPs);
      mockReq.params.especialidad = 'Cardiología';

      await hcpController.getHCPsBySpecialty(mockReq, mockRes);

      expect(mockHCPModel.find).toHaveBeenCalledWith({ especialidad: 'Cardiología' });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockHCPs
      });
    });
  });

  describe('getHCPsByRegion', () => {
    test('debe obtener HCPs por región', async () => {
      const mockHCPs = [
        { id: 'hcp1', nombre: 'Dr. Juan Pérez', estado: 'CDMX' },
        { id: 'hcp2', nombre: 'Dr. María García', estado: 'CDMX' }
      ];

      mockHCPModel.find.mockResolvedValue(mockHCPs);
      mockReq.params.region = 'CDMX';

      await hcpController.getHCPsByRegion(mockReq, mockRes);

      expect(mockHCPModel.find).toHaveBeenCalledWith({ estado: 'CDMX' });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockHCPs
      });
    });
  });

  describe('generateRecommendationsForHCP', () => {
    test('debe generar recomendaciones para un HCP', async () => {
      const mockRecommendations = [
        { id: 'rec1', tipo: 'contacto_inicial', prioridad: 8 }
      ];

      mockRecommendationEngine.prototype.generateRecommendationsForHCP.mockResolvedValue(mockRecommendations);
      mockReq.params.hcpId = 'hcp123';

      await hcpController.generateRecommendationsForHCP(mockReq, mockRes);

      expect(mockRecommendationEngine.prototype.generateRecommendationsForHCP).toHaveBeenCalledWith('hcp123');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockRecommendations,
        message: 'Recomendaciones generadas exitosamente'
      });
    });
  });
}); 