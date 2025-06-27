const { IAEngine } = require('../../src/services/IAEngine');

// Mock de axios para simular llamadas a OpenRouter
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn()
}));

describe('IAEngine', () => {
  let iaEngine;
  let mockAxios;

  beforeEach(() => {
    iaEngine = new IAEngine();
    mockAxios = require('axios');
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('debe inicializar con configuración correcta', () => {
      expect(iaEngine.apiKey).toBe(process.env.OPENROUTER_API_KEY);
      expect(iaEngine.baseURL).toBe('https://openrouter.ai/api/v1');
      expect(iaEngine.model).toBe('anthropic/claude-3.5-sonnet');
    });
  });

  describe('buildPrompt', () => {
    test('debe construir prompt básico correctamente', () => {
      const hcpData = {
        nombre: 'Dr. Juan Pérez',
        especialidad: 'Cardiología',
        buyerPersona: 'innovador',
        historialContacto: []
      };

      const prompt = iaEngine.buildPrompt(hcpData, 'contacto_inicial');
      
      expect(prompt).toContain('Dr. Juan Pérez');
      expect(prompt).toContain('Cardiología');
      expect(prompt).toContain('innovador');
      expect(prompt).toContain('contacto_inicial');
    });

    test('debe incluir historial de contactos en el prompt', () => {
      const hcpData = {
        nombre: 'Dr. María García',
        especialidad: 'Oncología',
        historialContacto: [
          { tipo: 'visita', resultado: 'exitoso', fecha: '2024-01-15' }
        ]
      };

      const prompt = iaEngine.buildPrompt(hcpData, 'seguimiento');
      
      expect(prompt).toContain('visita');
      expect(prompt).toContain('exitoso');
    });
  });

  describe('generateRecommendation', () => {
    test('debe generar recomendación exitosamente', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                tipo: 'contacto_inicial',
                prioridad: 8,
                canal: 'personal',
                mensaje: 'Contactar al Dr. Pérez para presentar nuevo producto',
                explicacion: 'HCP innovador con alto potencial',
                productos: ['Producto A'],
                score: 85
              })
            }
          }]
        }
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const hcpData = {
        nombre: 'Dr. Juan Pérez',
        especialidad: 'Cardiología',
        buyerPersona: 'innovador'
      };

      const result = await iaEngine.generateRecommendation(hcpData, 'contacto_inicial');

      expect(result).toBeDefined();
      expect(result.tipo).toBe('contacto_inicial');
      expect(result.prioridad).toBe(8);
      expect(result.score).toBe(85);
    });

    test('debe manejar errores de API correctamente', async () => {
      mockAxios.post.mockRejectedValue(new Error('API Error'));

      const hcpData = { nombre: 'Dr. Test' };

      await expect(iaEngine.generateRecommendation(hcpData, 'contacto_inicial'))
        .rejects.toThrow('Error al generar recomendación con IA');
    });

    test('debe validar respuesta de IA antes de procesar', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: 'respuesta inválida'
            }
          }]
        }
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const hcpData = { nombre: 'Dr. Test' };

      await expect(iaEngine.generateRecommendation(hcpData, 'contacto_inicial'))
        .rejects.toThrow('Respuesta de IA inválida');
    });
  });

  describe('validateRecommendation', () => {
    test('debe validar recomendación correcta', () => {
      const recommendation = {
        tipo: 'contacto_inicial',
        prioridad: 8,
        canal: 'personal',
        mensaje: 'Mensaje válido',
        explicacion: 'Explicación válida',
        productos: ['Producto A'],
        score: 85
      };

      const result = iaEngine.validateRecommendation(recommendation);
      expect(result.isValid).toBe(true);
    });

    test('debe rechazar recomendación sin campos requeridos', () => {
      const recommendation = {
        tipo: 'contacto_inicial',
        // Faltan campos requeridos
      };

      const result = iaEngine.validateRecommendation(recommendation);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('mensaje es requerido');
    });

    test('debe validar prioridad dentro del rango correcto', () => {
      const recommendation = {
        tipo: 'contacto_inicial',
        prioridad: 15, // Fuera del rango 1-10
        canal: 'personal',
        mensaje: 'Mensaje válido',
        explicacion: 'Explicación válida',
        productos: ['Producto A'],
        score: 85
      };

      const result = iaEngine.validateRecommendation(recommendation);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('prioridad debe estar entre 1 y 10');
    });
  });

  describe('validateCOFEPRIS', () => {
    test('debe aprobar contenido que cumple regulaciones', () => {
      const content = 'Información médica basada en evidencia científica';
      
      const result = iaEngine.validateCOFEPRIS(content);
      expect(result.approved).toBe(true);
    });

    test('debe rechazar contenido que menciona beneficios no aprobados', () => {
      const content = 'Este producto cura el cáncer completamente';
      
      const result = iaEngine.validateCOFEPRIS(content);
      expect(result.approved).toBe(false);
      expect(result.violations).toContain('beneficios_no_aprobados');
    });

    test('debe detectar promesas exageradas', () => {
      const content = 'Resultados garantizados al 100%';
      
      const result = iaEngine.validateCOFEPRIS(content);
      expect(result.approved).toBe(false);
      expect(result.violations).toContain('promesas_exageradas');
    });
  });

  describe('generateMultipleRecommendations', () => {
    test('debe generar múltiples recomendaciones', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: JSON.stringify([
                {
                  tipo: 'contacto_inicial',
                  prioridad: 8,
                  canal: 'personal',
                  mensaje: 'Recomendación 1',
                  explicacion: 'Explicación 1',
                  productos: ['Producto A'],
                  score: 85
                },
                {
                  tipo: 'seguimiento',
                  prioridad: 6,
                  canal: 'email',
                  mensaje: 'Recomendación 2',
                  explicacion: 'Explicación 2',
                  productos: ['Producto B'],
                  score: 75
                }
              ])
            }
          }]
        }
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const hcpData = { nombre: 'Dr. Test' };
      const result = await iaEngine.generateMultipleRecommendations(hcpData, 2);

      expect(result).toHaveLength(2);
      expect(result[0].tipo).toBe('contacto_inicial');
      expect(result[1].tipo).toBe('seguimiento');
    });
  });

  describe('analyzeSentiment', () => {
    test('debe analizar sentimiento positivo', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                sentiment: 'positive',
                score: 0.8,
                topics: ['satisfacción', 'eficacia']
              })
            }
          }]
        }
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const text = 'El producto es muy efectivo y estoy satisfecho';
      const result = await iaEngine.analyzeSentiment(text);

      expect(result.sentiment).toBe('positive');
      expect(result.score).toBe(0.8);
      expect(result.topics).toContain('satisfacción');
    });
  });

  describe('extractTopics', () => {
    test('debe extraer temas relevantes', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                topics: ['cardiology', 'hypertension', 'treatment'],
                confidence: 0.9
              })
            }
          }]
        }
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const text = 'Paciente con hipertensión arterial que requiere tratamiento cardiológico';
      const result = await iaEngine.extractTopics(text);

      expect(result.topics).toContain('cardiology');
      expect(result.topics).toContain('hypertension');
      expect(result.confidence).toBe(0.9);
    });
  });
}); 