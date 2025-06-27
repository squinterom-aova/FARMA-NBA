import axios from 'axios';
import { 
  PromptContext, 
  IARecommendation, 
  TipoRecomendacion, 
  CanalComunicacion,
  HCP,
  Contacto,
  Prescripcion,
  SenalExterna,
  Producto,
  ContenidoAprobado
} from '@/types';

export class IAEngine {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  }

  /**
   * Genera recomendaciones personalizadas para un HCP
   */
  async generarRecomendaciones(context: PromptContext): Promise<IARecommendation[]> {
    try {
      const prompt = this.construirPrompt(context);
      const response = await this.llamarOpenRouter(prompt);
      
      return this.procesarRespuestaIA(response, context);
    } catch (error) {
      console.error('Error generando recomendaciones:', error);
      throw new Error('Error al generar recomendaciones con IA');
    }
  }

  /**
   * Construye el prompt contextualizado para el modelo de IA
   */
  private construirPrompt(context: PromptContext): string {
    const { hcp, historialContactos, prescripciones, senalesExternas, productos, contenidoAprobado } = context;

    return `
Eres un experto en marketing farmacéutico especializado en generar recomendaciones personalizadas para profesionales de la salud (HCPs) en México.

CONTEXTO DEL HCP:
- Nombre: ${hcp.nombre} ${hcp.apellidos}
- Especialidad: ${hcp.especialidad}
- Institución: ${hcp.institucion}
- Ciudad: ${hcp.ciudad}, ${hcp.estado}
- Volumen de pacientes: ${hcp.volumenPacientes}
- Decil de prescripción: ${hcp.decilPrescripcion}/10
- Nivel de respuesta: ${hcp.nivelRespuesta}/10
- Buyer Persona: ${hcp.buyerPersona}
- Escalera de adopción: ${hcp.escaleraAdopcion}
- Intereses clínicos: ${hcp.interesesClinicos.join(', ')}

HISTORIAL DE CONTACTOS (últimos 6 meses):
${this.formatearHistorialContactos(historialContactos)}

PRESCRIPCIONES RECIENTES:
${this.formatearPrescripciones(prescripciones)}

SEÑALES EXTERNAS RELEVANTES:
${this.formatearSenalesExternas(senalesExternas)}

PRODUCTOS DISPONIBLES:
${this.formatearProductos(productos)}

CONTENIDO APROBADO DISPONIBLE:
${this.formatearContenidoAprobado(contenidoAprobado)}

INSTRUCCIONES:
1. Analiza el perfil del HCP y su historial
2. Identifica oportunidades de engagement
3. Genera 3-5 recomendaciones específicas y personalizadas
4. Cada recomendación debe incluir:
   - Tipo de acción (contacto_inicial, seguimiento, presentacion_producto, etc.)
   - Canal de comunicación preferido
   - Momento ideal para la acción
   - Mensaje personalizado en español
   - Explicación de por qué esta acción es apropiada
   - Productos relevantes a mencionar
   - Score de probabilidad de éxito (0-100)
   - Razones del score
   - Restricciones regulatorias a considerar

5. Cumple estrictamente con regulaciones COFEPRIS:
   - No prometer beneficios no aprobados
   - Usar solo contenido pre-aprobado
   - Respetar restricciones de marketing
   - No hacer comparaciones directas con competidores

RESPONDE EN FORMATO JSON:
{
  "recomendaciones": [
    {
      "tipo": "tipo_recomendacion",
      "canal": "canal_comunicacion",
      "momentoIdeal": "YYYY-MM-DD HH:MM",
      "mensaje": "Mensaje personalizado en español",
      "explicacion": "Explicación de la recomendación",
      "productos": ["producto1", "producto2"],
      "score": 85,
      "razones": ["razón1", "razón2"],
      "restricciones": ["restricción1", "restricción2"]
    }
  ]
}
`;
  }

  /**
   * Llama a la API de OpenRouter
   */
  private async llamarOpenRouter(prompt: string): Promise<any> {
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en marketing farmacéutico con conocimiento profundo de regulaciones COFEPRIS y mejores prácticas de engagement con HCPs.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://farma-nba.com',
          'X-Title': 'Farma Next Best Action'
        }
      }
    );

    return response.data;
  }

  /**
   * Procesa la respuesta de la IA y la convierte en recomendaciones estructuradas
   */
  private procesarRespuestaIA(response: any, context: PromptContext): IARecommendation[] {
    try {
      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content);
      
      return parsed.recomendaciones.map((rec: any) => ({
        tipo: rec.tipo as TipoRecomendacion,
        canal: rec.canal as CanalComunicacion,
        momentoIdeal: new Date(rec.momentoIdeal),
        mensaje: rec.mensaje,
        explicacion: rec.explicacion,
        productos: rec.productos || [],
        score: rec.score,
        razones: rec.razones || [],
        restricciones: rec.restricciones || []
      }));
    } catch (error) {
      console.error('Error procesando respuesta de IA:', error);
      return this.generarRecomendacionesFallback(context);
    }
  }

  /**
   * Genera recomendaciones básicas como fallback
   */
  private generarRecomendacionesFallback(context: PromptContext): IARecommendation[] {
    const { hcp } = context;
    const recomendaciones: IARecommendation[] = [];

    // Recomendación de contacto inicial si no hay historial reciente
    const contactosRecientes = context.historialContactos.filter(
      c => c.fecha > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    if (contactosRecientes.length === 0) {
      recomendaciones.push({
        tipo: 'contacto_inicial',
        canal: 'personal',
        momentoIdeal: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 semana
        mensaje: `Estimado Dr. ${hcp.apellidos}, me gustaría presentarme y conocer más sobre su práctica en ${hcp.especialidad}.`,
        explicacion: 'Primer contacto para establecer relación profesional',
        productos: [],
        score: 70,
        razones: ['Sin contactos recientes', 'Oportunidad de establecer relación'],
        restricciones: ['Solo contenido aprobado', 'No promesas específicas']
      });
    }

    // Recomendación de seguimiento si hay contactos previos
    if (contactosRecientes.length > 0) {
      recomendaciones.push({
        tipo: 'seguimiento',
        canal: 'email',
        momentoIdeal: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días
        mensaje: `Dr. ${hcp.apellidos}, espero que se encuentre bien. Me gustaría hacer seguimiento a nuestra conversación anterior.`,
        explicacion: 'Seguimiento para mantener engagement',
        productos: [],
        score: 80,
        razones: ['Historial de contactos positivo', 'Mantener momentum'],
        restricciones: ['Respetar frecuencia de contacto', 'Contenido aprobado']
      });
    }

    return recomendaciones;
  }

  /**
   * Formatea el historial de contactos para el prompt
   */
  private formatearHistorialContactos(contactos: Contacto[]): string {
    if (contactos.length === 0) return 'Sin contactos recientes';
    
    return contactos
      .slice(-5) // Últimos 5 contactos
      .map(c => `- ${c.fecha.toLocaleDateString()}: ${c.tipo} (${c.resultado}) - ${c.notas}`)
      .join('\n');
  }

  /**
   * Formatea las prescripciones para el prompt
   */
  private formatearPrescripciones(prescripciones: Prescripcion[]): string {
    if (prescripciones.length === 0) return 'Sin prescripciones recientes';
    
    return prescripciones
      .slice(-3) // Últimas 3 prescripciones
      .map(p => `- ${p.fecha.toLocaleDateString()}: ${p.tipo} - Valor: $${p.valor}`)
      .join('\n');
  }

  /**
   * Formatea las señales externas para el prompt
   */
  private formatearSenalesExternas(senales: SenalExterna[]): string {
    if (senales.length === 0) return 'Sin señales externas relevantes';
    
    return senales
      .filter(s => s.relevancia >= 7)
      .slice(-3)
      .map(s => `- ${s.fuente}: ${s.contenido.substring(0, 100)}... (${s.sentimiento})`)
      .join('\n');
  }

  /**
   * Formatea los productos para el prompt
   */
  private formatearProductos(productos: Producto[]): string {
    if (productos.length === 0) return 'Sin productos disponibles';
    
    return productos
      .map(p => `- ${p.nombre}: ${p.principioActivo} - ${p.indicaciones.join(', ')}`)
      .join('\n');
  }

  /**
   * Formatea el contenido aprobado para el prompt
   */
  private formatearContenidoAprobado(contenido: ContenidoAprobado[]): string {
    if (contenido.length === 0) return 'Sin contenido aprobado disponible';
    
    return contenido
      .filter(c => c.activo)
      .map(c => `- ${c.tipo}: ${c.titulo} (v${c.version})`)
      .join('\n');
  }

  /**
   * Valida que una recomendación cumpla con regulaciones
   */
  async validarRecomendacion(recomendacion: IARecommendation, context: PromptContext): Promise<boolean> {
    // Validaciones básicas de COFEPRIS
    const validaciones = [
      !recomendacion.mensaje.includes('cura'),
      !recomendacion.mensaje.includes('100% efectivo'),
      !recomendacion.mensaje.includes('sin efectos secundarios'),
      recomendacion.score >= 0 && recomendacion.score <= 100,
      recomendacion.restricciones.length > 0
    ];

    return validaciones.every(v => v);
  }
} 