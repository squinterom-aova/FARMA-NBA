const { DataProcessor } = require('../../src/services/DataProcessor');

// Mock de tesseract.js
jest.mock('tesseract.js', () => ({
  recognize: jest.fn()
}));

// Mock de natural
jest.mock('natural', () => ({
  WordTokenizer: jest.fn().mockImplementation(() => ({
    tokenize: jest.fn().mockReturnValue(['palabra1', 'palabra2', 'palabra3'])
  })),
  SentimentAnalyzer: jest.fn().mockImplementation(() => ({
    getSentiment: jest.fn().mockReturnValue(0.5)
  }))
}));

describe('DataProcessor', () => {
  let dataProcessor;
  let mockTesseract;

  beforeEach(() => {
    dataProcessor = new DataProcessor();
    mockTesseract = require('tesseract.js');
    jest.clearAllMocks();
  });

  describe('extractTextFromImage', () => {
    test('debe extraer texto de imagen correctamente', async () => {
      const mockResult = {
        data: {
          text: 'Texto extraído de la imagen'
        }
      };

      mockTesseract.recognize.mockResolvedValue(mockResult);

      const imagePath = '/path/to/image.jpg';
      const result = await dataProcessor.extractTextFromImage(imagePath);

      expect(result).toBe('Texto extraído de la imagen');
      expect(mockTesseract.recognize).toHaveBeenCalledWith(imagePath, 'spa');
    });

    test('debe manejar errores de OCR', async () => {
      mockTesseract.recognize.mockRejectedValue(new Error('OCR Error'));

      const imagePath = '/path/to/image.jpg';

      await expect(dataProcessor.extractTextFromImage(imagePath))
        .rejects.toThrow('Error al procesar imagen con OCR');
    });
  });

  describe('extractTextFromPDF', () => {
    test('debe extraer texto de PDF correctamente', async () => {
      const mockPdfText = 'Texto extraído del PDF';
      
      // Mock de pdf-parse
      const mockPdfParse = jest.fn().mockResolvedValue({ text: mockPdfText });
      jest.doMock('pdf-parse', () => mockPdfParse);

      const pdfBuffer = Buffer.from('fake pdf content');
      const result = await dataProcessor.extractTextFromPDF(pdfBuffer);

      expect(result).toBe(mockPdfText);
    });

    test('debe manejar PDFs sin texto', async () => {
      const mockPdfParse = jest.fn().mockResolvedValue({ text: '' });
      jest.doMock('pdf-parse', () => mockPdfParse);

      const pdfBuffer = Buffer.from('fake pdf content');
      const result = await dataProcessor.extractTextFromPDF(pdfBuffer);

      expect(result).toBe('');
    });
  });

  describe('extractHCPInfo', () => {
    test('debe extraer información de HCP del texto', () => {
      const text = `
        Dr. Juan Carlos Pérez García
        Especialidad: Cardiología
        Institución: Hospital General
        Ciudad: México
        Estado: CDMX
        Volumen de pacientes: 150
        Decil de prescripción: 8
      `;

      const result = dataProcessor.extractHCPInfo(text);

      expect(result.nombre).toBe('Juan Carlos');
      expect(result.apellidos).toBe('Pérez García');
      expect(result.especialidad).toBe('Cardiología');
      expect(result.institucion).toBe('Hospital General');
      expect(result.ciudad).toBe('México');
      expect(result.estado).toBe('CDMX');
      expect(result.volumenPacientes).toBe(150);
      expect(result.decilPrescripcion).toBe(8);
    });

    test('debe manejar texto sin información completa', () => {
      const text = 'Dr. María García';

      const result = dataProcessor.extractHCPInfo(text);

      expect(result.nombre).toBe('María');
      expect(result.apellidos).toBe('García');
      expect(result.especialidad).toBeUndefined();
    });
  });

  describe('extractContactInfo', () => {
    test('debe extraer información de contacto', () => {
      const text = `
        Fecha: 15/01/2024
        Tipo: Visita personal
        Resultado: Exitoso
        Producto: Producto A
        Notas: HCP interesado en el producto
      `;

      const result = dataProcessor.extractContactInfo(text);

      expect(result.fecha).toBe('2024-01-15');
      expect(result.tipo).toBe('visita');
      expect(result.resultado).toBe('exitoso');
      expect(result.producto).toBe('Producto A');
      expect(result.notas).toContain('interesado');
    });
  });

  describe('analyzeSentiment', () => {
    test('debe analizar sentimiento del texto', () => {
      const text = 'El producto es muy efectivo y estoy satisfecho con los resultados';

      const result = dataProcessor.analyzeSentiment(text);

      expect(result.sentiment).toBeDefined();
      expect(result.score).toBeDefined();
      expect(result.keywords).toBeDefined();
    });

    test('debe detectar sentimiento negativo', () => {
      const text = 'El producto no funcionó como esperaba, estoy decepcionado';

      const result = dataProcessor.analyzeSentiment(text);

      expect(result.sentiment).toBe('negative');
    });
  });

  describe('extractTopics', () => {
    test('debe extraer temas del texto', () => {
      const text = 'Paciente con hipertensión arterial que requiere tratamiento cardiológico';

      const result = dataProcessor.extractTopics(text);

      expect(result.topics).toContain('cardiology');
      expect(result.topics).toContain('hypertension');
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('extractKeywords', () => {
    test('debe extraer palabras clave relevantes', () => {
      const text = 'El paciente presenta síntomas de diabetes mellitus tipo 2';

      const result = dataProcessor.extractKeywords(text);

      expect(result.keywords).toContain('diabetes');
      expect(result.keywords).toContain('síntomas');
      expect(result.relevance).toBeDefined();
    });
  });

  describe('validateData', () => {
    test('debe validar datos correctos', () => {
      const data = {
        nombre: 'Juan',
        apellidos: 'Pérez',
        especialidad: 'Cardiología',
        email: 'juan.perez@email.com'
      };

      const result = dataProcessor.validateData(data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('debe detectar datos inválidos', () => {
      const data = {
        nombre: '',
        apellidos: 'Pérez',
        email: 'email-invalido'
      };

      const result = dataProcessor.validateData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('nombre es requerido');
      expect(result.errors).toContain('email tiene formato inválido');
    });
  });

  describe('normalizeText', () => {
    test('debe normalizar texto correctamente', () => {
      const text = '  Dr. Juan   Pérez   García  ';

      const result = dataProcessor.normalizeText(text);

      expect(result).toBe('Dr. Juan Pérez García');
    });

    test('debe remover caracteres especiales innecesarios', () => {
      const text = 'Dr. Juan Pérez-García (Cardiólogo)';

      const result = dataProcessor.normalizeText(text);

      expect(result).toBe('Dr. Juan Pérez García Cardiólogo');
    });
  });

  describe('extractDates', () => {
    test('debe extraer fechas en diferentes formatos', () => {
      const text = 'Fecha: 15/01/2024, Cita: 2024-02-20, Revisión: 20/03/24';

      const result = dataProcessor.extractDates(text);

      expect(result).toHaveLength(3);
      expect(result[0]).toBe('2024-01-15');
      expect(result[1]).toBe('2024-02-20');
      expect(result[2]).toBe('2024-03-20');
    });
  });

  describe('extractPhoneNumbers', () => {
    test('debe extraer números de teléfono', () => {
      const text = 'Tel: 55-1234-5678, Cel: 044-55-9876-5432';

      const result = dataProcessor.extractPhoneNumbers(text);

      expect(result).toContain('5512345678');
      expect(result).toContain('0445598765432');
    });
  });

  describe('extractEmails', () => {
    test('debe extraer direcciones de email', () => {
      const text = 'Contacto: juan.perez@hospital.com, Backup: maria.garcia@clinic.com';

      const result = dataProcessor.extractEmails(text);

      expect(result).toContain('juan.perez@hospital.com');
      expect(result).toContain('maria.garcia@clinic.com');
    });
  });
}); 