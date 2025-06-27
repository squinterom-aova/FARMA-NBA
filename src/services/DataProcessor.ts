import * as Tesseract from 'tesseract.js';
import * as pdf from 'pdf-parse';
import * as sharp from 'sharp';
import * as natural from 'natural';
import * as nlp from 'compromise';
import { SenalExterna, FuenteSenal, Sentimiento, ContenidoAprobado, TipoContenido } from '@/types';

export class DataProcessor {
  private tokenizer: natural.WordTokenizer;
  private classifier: natural.BayesClassifier;

  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.classifier = new natural.BayesClassifier();
    this.entrenarClasificador();
  }

  /**
   * Procesa documentos PDF y extrae texto
   */
  async procesarPDF(buffer: Buffer): Promise<string> {
    try {
      const data = await pdf(buffer);
      return data.text;
    } catch (error) {
      console.error('Error procesando PDF:', error);
      throw new Error('Error al procesar documento PDF');
    }
  }

  /**
   * Procesa imágenes con OCR
   */
  async procesarImagen(buffer: Buffer): Promise<string> {
    try {
      // Optimizar imagen para OCR
      const imagenOptimizada = await sharp(buffer)
        .grayscale()
        .contrast(1.2)
        .toBuffer();

      const resultado = await Tesseract.recognize(
        imagenOptimizada,
        'spa+eng',
        {
          logger: m => console.log(m)
        }
      );

      return resultado.data.text;
    } catch (error) {
      console.error('Error procesando imagen con OCR:', error);
      throw new Error('Error al procesar imagen con OCR');
    }
  }

  /**
   * Extrae información clave de documentos
   */
  async extraerInformacionClave(texto: string): Promise<{
    productos: string[];
    indicaciones: string[];
    contraindicaciones: string[];
    efectosSecundarios: string[];
    dosificacion: string;
    aprobaciones: string[];
  }> {
    const doc = nlp(texto);
    
    // Extraer productos (nombres de medicamentos)
    const productos = this.extraerProductos(texto);
    
    // Extraer indicaciones
    const indicaciones = this.extraerIndicaciones(texto);
    
    // Extraer contraindicaciones
    const contraindicaciones = this.extraerContraindicaciones(texto);
    
    // Extraer efectos secundarios
    const efectosSecundarios = this.extraerEfectosSecundarios(texto);
    
    // Extraer dosificación
    const dosificacion = this.extraerDosificacion(texto);
    
    // Extraer aprobaciones regulatorias
    const aprobaciones = this.extraerAprobaciones(texto);

    return {
      productos,
      indicaciones,
      contraindicaciones,
      efectosSecundarios,
      dosificacion,
      aprobaciones
    };
  }

  /**
   * Analiza sentimiento de texto
   */
  async analizarSentimiento(texto: string): Promise<Sentimiento> {
    const tokens = this.tokenizer.tokenize(texto.toLowerCase());
    if (!tokens) return Sentimiento.NEUTRO;

    const palabrasPositivas = [
      'efectivo', 'beneficioso', 'mejora', 'excelente', 'bueno', 'positivo',
      'recomendado', 'aprobado', 'seguro', 'confiable', 'innovador'
    ];

    const palabrasNegativas = [
      'peligroso', 'dañino', 'efectos secundarios', 'contraindicado',
      'riesgo', 'advertencia', 'precaución', 'negativo', 'malo'
    ];

    let score = 0;
    tokens.forEach(token => {
      if (palabrasPositivas.includes(token)) score += 1;
      if (palabrasNegativas.includes(token)) score -= 1;
    });

    if (score > 0) return Sentimiento.POSITIVO;
    if (score < 0) return Sentimiento.NEGATIVO;
    return Sentimiento.NEUTRO;
  }

  /**
   * Extrae temas relevantes del texto
   */
  extraerTemas(texto: string): string[] {
    const temasMedicos = [
      'diabetes', 'hipertensión', 'cáncer', 'cardiología', 'neurología',
      'pediatría', 'ginecología', 'dermatología', 'psiquiatría', 'oncología',
      'reumatología', 'endocrinología', 'gastroenterología', 'neumología'
    ];

    const temasEncontrados = temasMedicos.filter(tema => 
      texto.toLowerCase().includes(tema.toLowerCase())
    );

    return temasEncontrados;
  }

  /**
   * Identifica HCPs mencionados en el texto
   */
  identificarHCPs(texto: string): string[] {
    const doc = nlp(texto);
    const personas = doc.people().out('array');
    
    // Filtrar por títulos médicos
    const hcps = personas.filter(persona => {
      const titulos = ['dr.', 'dra.', 'doctor', 'doctora', 'prof.', 'profesor'];
      return titulos.some(titulo => 
        texto.toLowerCase().includes(`${titulo} ${persona.toLowerCase()}`)
      );
    });

    return hcps;
  }

  /**
   * Identifica productos mencionados
   */
  identificarProductos(texto: string): string[] {
    // Patrones comunes para nombres de medicamentos
    const patrones = [
      /\b[A-Z][a-z]+(?:[A-Z][a-z]+)*\b/g, // CamelCase
      /\b[A-Z]{2,}\b/g, // Acrónimos
      /\b[a-z]+(?:-[a-z]+)*\b/g // Kebab-case
    ];

    const productos: string[] = [];
    patrones.forEach(patron => {
      const matches = texto.match(patron);
      if (matches) {
        productos.push(...matches);
      }
    });

    return [...new Set(productos)]; // Eliminar duplicados
  }

  /**
   * Valida contenido contra regulaciones COFEPRIS
   */
  validarContenidoCOFEPRIS(texto: string): {
    cumple: boolean;
    advertencias: string[];
    restricciones: string[];
  } {
    const advertencias: string[] = [];
    const restricciones: string[] = [];

    // Palabras prohibidas o restrictivas
    const palabrasProhibidas = [
      'cura', '100% efectivo', 'sin efectos secundarios', 'milagroso',
      'revolucionario', 'único', 'mejor que', 'superior a'
    ];

    palabrasProhibidas.forEach(palabra => {
      if (texto.toLowerCase().includes(palabra.toLowerCase())) {
        advertencias.push(`Palabra restrictiva encontrada: "${palabra}"`);
      }
    });

    // Verificar comparaciones directas
    if (texto.toLowerCase().includes('mejor que') || texto.toLowerCase().includes('superior a')) {
      restricciones.push('Comparaciones directas con competidores no permitidas');
    }

    // Verificar promesas no aprobadas
    if (texto.toLowerCase().includes('garantiza') || texto.toLowerCase().includes('promete')) {
      restricciones.push('Promesas específicas no permitidas sin evidencia aprobada');
    }

    return {
      cumple: advertencias.length === 0 && restricciones.length === 0,
      advertencias,
      restricciones
    };
  }

  /**
   * Procesa señales externas de redes sociales
   */
  async procesarSenalExterna(
    contenido: string,
    fuente: FuenteSenal,
    autor: string
  ): Promise<SenalExterna> {
    const sentimiento = await this.analizarSentimiento(contenido);
    const temas = this.extraerTemas(contenido);
    const hcpsMencionados = this.identificarHCPs(contenido);
    const productosMencionados = this.identificarProductos(contenido);
    
    // Calcular relevancia basada en contenido médico
    const relevancia = this.calcularRelevancia(contenido, temas, productosMencionados);

    return {
      id: this.generarId(),
      fuente,
      contenido,
      autor,
      fecha: new Date(),
      temas,
      sentimiento,
      relevancia,
      hcpsMencionados,
      productosMencionados,
      procesado: true
    };
  }

  /**
   * Crea contenido aprobado a partir de documento procesado
   */
  async crearContenidoAprobado(
    texto: string,
    tipo: TipoContenido,
    titulo: string
  ): Promise<ContenidoAprobado> {
    const informacion = await this.extraerInformacionClave(texto);
    const validacion = this.validarContenidoCOFEPRIS(texto);

    if (!validacion.cumple) {
      throw new Error(`Contenido no cumple con regulaciones COFEPRIS: ${validacion.advertencias.join(', ')}`);
    }

    return {
      id: this.generarId(),
      tipo,
      titulo,
      contenido: texto,
      productos: informacion.productos,
      indicaciones: informacion.indicaciones,
      contraindicaciones: informacion.contraindicaciones,
      fechaAprobacion: new Date(),
      aprobadoPor: 'Sistema Automático',
      version: '1.0',
      activo: true
    };
  }

  // Métodos privados auxiliares
  private entrenarClasificador(): void {
    // Entrenar clasificador con términos médicos
    this.classifier.addDocument('diabetes mellitus tipo 2', 'diabetes');
    this.classifier.addDocument('hipertensión arterial', 'cardiovascular');
    this.classifier.addDocument('cáncer de mama', 'oncología');
    this.classifier.addDocument('depresión mayor', 'psiquiatría');
    this.classifier.train();
  }

  private extraerProductos(texto: string): string[] {
    const doc = nlp(texto);
    const sustantivos = doc.nouns().out('array');
    return sustantivos.filter(sustantivo => 
      sustantivo.length > 3 && /^[A-Z]/.test(sustantivo)
    );
  }

  private extraerIndicaciones(texto: string): string[] {
    const indicaciones: string[] = [];
    const patrones = [
      /indicado para (.+?)(?:\.|,)/gi,
      /tratamiento de (.+?)(?:\.|,)/gi,
      /para (.+?)(?:\.|,)/gi
    ];

    patrones.forEach(patron => {
      const matches = texto.match(patron);
      if (matches) {
        indicaciones.push(...matches.map(m => m.replace(/^(indicado para |tratamiento de |para )/i, '')));
      }
    });

    return [...new Set(indicaciones)];
  }

  private extraerContraindicaciones(texto: string): string[] {
    const contraindicaciones: string[] = [];
    const patrones = [
      /contraindicado en (.+?)(?:\.|,)/gi,
      /no usar en (.+?)(?:\.|,)/gi,
      /evitar en (.+?)(?:\.|,)/gi
    ];

    patrones.forEach(patron => {
      const matches = texto.match(patron);
      if (matches) {
        contraindicaciones.push(...matches.map(m => m.replace(/^(contraindicado en |no usar en |evitar en )/i, '')));
      }
    });

    return [...new Set(contraindicaciones)];
  }

  private extraerEfectosSecundarios(texto: string): string[] {
    const efectos: string[] = [];
    const patrones = [
      /efectos secundarios:? (.+?)(?:\.|,)/gi,
      /puede causar (.+?)(?:\.|,)/gi,
      /reacciones adversas:? (.+?)(?:\.|,)/gi
    ];

    patrones.forEach(patron => {
      const matches = texto.match(patron);
      if (matches) {
        efectos.push(...matches.map(m => m.replace(/^(efectos secundarios:? |puede causar |reacciones adversas:? )/i, '')));
      }
    });

    return [...new Set(efectos)];
  }

  private extraerDosificacion(texto: string): string {
    const patrones = [
      /dosificación:? (.+?)(?:\.|,)/i,
      /dosis:? (.+?)(?:\.|,)/i,
      /administrar (.+?)(?:\.|,)/i
    ];

    for (const patron of patrones) {
      const match = texto.match(patron);
      if (match) {
        return match[1];
      }
    }

    return '';
  }

  private extraerAprobaciones(texto: string): string[] {
    const aprobaciones: string[] = [];
    const patrones = [
      /COFEPRIS (.+?)(?:\.|,)/gi,
      /FDA (.+?)(?:\.|,)/gi,
      /EMA (.+?)(?:\.|,)/gi,
      /aprobado por (.+?)(?:\.|,)/gi
    ];

    patrones.forEach(patron => {
      const matches = texto.match(patron);
      if (matches) {
        aprobaciones.push(...matches);
      }
    });

    return [...new Set(aprobaciones)];
  }

  private calcularRelevancia(contenido: string, temas: string[], productos: string[]): number {
    let score = 0;
    
    // Puntos por temas médicos
    score += temas.length * 2;
    
    // Puntos por productos mencionados
    score += productos.length * 1.5;
    
    // Puntos por contenido médico específico
    const terminosMedicos = ['paciente', 'tratamiento', 'medicamento', 'dosis', 'efectos'];
    terminosMedicos.forEach(termino => {
      if (contenido.toLowerCase().includes(termino)) score += 1;
    });

    return Math.min(10, Math.max(1, Math.round(score)));
  }

  private generarId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
} 