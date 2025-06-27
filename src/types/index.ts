// Tipos principales del sistema de Next Best Action farmacéutico

export interface HCP {
  id: string;
  nombre: string;
  apellidos: string;
  especialidad: string;
  subespecialidad?: string;
  institucion: string;
  ciudad: string;
  estado: string;
  volumenPacientes: number;
  decilPrescripcion: number; // 1-10
  nivelRespuesta: number; // 1-10
  historialContacto: Contacto[];
  buyerPersona: BuyerPersona;
  escaleraAdopcion: EscaleraAdopcion;
  metricasEngagement: MetricasEngagement;
  interesesClinicos: string[];
  restriccionesRegulatorias: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Contacto {
  id: string;
  tipo: TipoContacto;
  fecha: Date;
  resultado: ResultadoContacto;
  notas: string;
  producto?: string;
  canal: CanalComunicacion;
  representanteId: string;
}

export enum TipoContacto {
  VISITA = 'visita',
  EMAIL = 'email',
  LLAMADA = 'llamada',
  ENTREGA_MUESTRA = 'entrega_muestra',
  EVENTO = 'evento',
  REDES_SOCIALES = 'redes_sociales'
}

export enum ResultadoContacto {
  EXITOSO = 'exitoso',
  PARCIAL = 'parcial',
  FALLIDO = 'fallido',
  PENDIENTE = 'pendiente'
}

export enum CanalComunicacion {
  PERSONAL = 'personal',
  EMAIL = 'email',
  TELEFONO = 'telefono',
  WHATSAPP = 'whatsapp',
  LINKEDIN = 'linkedin',
  TWITTER = 'twitter',
  EVENTO_PRESENCIAL = 'evento_presencial',
  EVENTO_VIRTUAL = 'evento_virtual'
}

export enum BuyerPersona {
  INNOVADOR = 'innovador',
  SEGUIDOR_TEMPRANO = 'seguidor_temprano',
  MAYORIA_TEMPRANA = 'mayoria_temprana',
  MAYORIA_TARDIA = 'mayoria_tardia',
  REZAGADO = 'rezagado'
}

export enum EscaleraAdopcion {
  NO_FAMILIARIZADO = 'no_familiarizado',
  EN_EVALUACION = 'en_evaluacion',
  USUARIO = 'usuario',
  PROMOTOR = 'promotor'
}

export interface MetricasEngagement {
  frecuenciaContacto: number;
  tasaRespuesta: number;
  tiempoRespuesta: number; // en horas
  calidadInteraccion: number; // 1-10
  prescripcionesGeneradas: number;
  valorPrescripciones: number;
  ultimaInteraccion: Date;
}

export interface Producto {
  id: string;
  nombre: string;
  principioActivo: string;
  indicaciones: string[];
  contraindicaciones: string[];
  efectosSecundarios: string[];
  dosificacion: string;
  presentacion: string;
  precio: number;
  aprobacionCOFEPRIS: boolean;
  fechaAprobacion: Date;
  contenidoAprobado: string[];
  restriccionesMarketing: string[];
}

export interface Prescripcion {
  id: string;
  hcpId: string;
  productoId: string;
  fecha: Date;
  cantidad: number;
  tipo: TipoPrescripcion;
  region: string;
  institucion: string;
  valor: number;
}

export enum TipoPrescripcion {
  NUEVA = 'nueva',
  CONTINUA = 'continua',
  SUSPENDIDA = 'suspendida'
}

export interface Recomendacion {
  id: string;
  hcpId: string;
  tipo: TipoRecomendacion;
  prioridad: number; // 1-10
  canal: CanalComunicacion;
  momentoIdeal: Date;
  mensaje: string;
  explicacion: string;
  productos: string[];
  contenidoAprobado: string[];
  restricciones: string[];
  score: number; // 0-100
  estado: EstadoRecomendacion;
  createdAt: Date;
  ejecutadaAt?: Date;
  resultado?: ResultadoRecomendacion;
}

export enum TipoRecomendacion {
  CONTACTO_INICIAL = 'contacto_inicial',
  SEGUIMIENTO = 'seguimiento',
  PRESENTACION_PRODUCTO = 'presentacion_producto',
  ENTREGA_MUESTRA = 'entrega_muestra',
  INVITACION_EVENTO = 'invitacion_evento',
  EDUCACION_MEDICA = 'educacion_medica',
  APOYO_CLINICO = 'apoyo_clinico'
}

export enum EstadoRecomendacion {
  PENDIENTE = 'pendiente',
  EN_PROCESO = 'en_proceso',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
  RECHAZADA = 'rechazada'
}

export enum ResultadoRecomendacion {
  EXITOSO = 'exitoso',
  PARCIAL = 'parcial',
  FALLIDO = 'fallido',
  NO_APLICABLE = 'no_aplicable'
}

export interface ContenidoAprobado {
  id: string;
  tipo: TipoContenido;
  titulo: string;
  contenido: string;
  productos: string[];
  indicaciones: string[];
  contraindicaciones: string[];
  fechaAprobacion: Date;
  aprobadoPor: string;
  version: string;
  activo: boolean;
}

export enum TipoContenido {
  FICHA_TECNICA = 'ficha_tecnica',
  ESTUDIO_CLINICO = 'estudio_clinico',
  MATERIAL_MARKETING = 'material_marketing',
  GUIA_CLINICA = 'guia_clinica',
  PRESENTACION = 'presentacion'
}

export interface SenalExterna {
  id: string;
  fuente: FuenteSenal;
  contenido: string;
  autor: string;
  fecha: Date;
  temas: string[];
  sentimiento: Sentimiento;
  relevancia: number; // 1-10
  hcpsMencionados: string[];
  productosMencionados: string[];
  procesado: boolean;
}

export enum FuenteSenal {
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  MEDSCAPE = 'medscape',
  REDDIT = 'reddit',
  FORO_MEDICO = 'foro_medico',
  BLOG_MEDICO = 'blog_medico'
}

export enum Sentimiento {
  POSITIVO = 'positivo',
  NEUTRO = 'neutro',
  NEGATIVO = 'negativo'
}

export interface Representante {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  region: string;
  especialidades: string[];
  hcpsAsignados: string[];
  metricas: MetricasRepresentante;
}

export interface MetricasRepresentante {
  hcpsActivos: number;
  contactosMes: number;
  tasaExito: number;
  prescripcionesGeneradas: number;
  valorPrescripciones: number;
}

export interface ConfiguracionSistema {
  id: string;
  nombre: string;
  valor: any;
  descripcion: string;
  categoria: string;
  activo: boolean;
  updatedAt: Date;
}

// Tipos para el motor de IA
export interface PromptContext {
  hcp: HCP;
  historialContactos: Contacto[];
  prescripciones: Prescripcion[];
  senalesExternas: SenalExterna[];
  productos: Producto[];
  contenidoAprobado: ContenidoAprobado[];
  configuracion: ConfiguracionSistema[];
}

export interface IARecommendation {
  tipo: TipoRecomendacion;
  canal: CanalComunicacion;
  momentoIdeal: Date;
  mensaje: string;
  explicacion: string;
  productos: string[];
  score: number;
  razones: string[];
  restricciones: string[];
}

// Tipos para validación regulatoria
export interface ValidacionRegulatoria {
  cumpleCOFEPRIS: boolean;
  restricciones: string[];
  advertencias: string[];
  contenidoPermitido: boolean;
  canalesPermitidos: CanalComunicacion[];
}

// Tipos para el frontend
export interface DashboardData {
  hcpsActivos: number;
  recomendacionesPendientes: number;
  contactosMes: number;
  prescripcionesGeneradas: number;
  valorPrescripciones: number;
  tasaExito: number;
  topProductos: Array<{producto: string, prescripciones: number}>;
  topHCPs: Array<{hcp: string, engagement: number}>;
}

export interface FiltrosRecomendacion {
  hcpId?: string;
  tipo?: TipoRecomendacion;
  canal?: CanalComunicacion;
  prioridadMin?: number;
  prioridadMax?: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
  estado?: EstadoRecomendacion;
  especialidad?: string;
  region?: string;
} 