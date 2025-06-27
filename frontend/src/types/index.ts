// Tipos compartidos con el backend
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
  decilPrescripcion: number;
  nivelRespuesta: number;
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
  tiempoRespuesta: number;
  calidadInteraccion: number;
  prescripcionesGeneradas: number;
  valorPrescripciones: number;
  ultimaInteraccion: Date;
}

export interface Recomendacion {
  id: string;
  hcpId: string;
  tipo: TipoRecomendacion;
  prioridad: number;
  canal: CanalComunicacion;
  momentoIdeal: Date;
  mensaje: string;
  explicacion: string;
  productos: string[];
  contenidoAprobado: string[];
  restricciones: string[];
  score: number;
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

// Tipos específicos del frontend
export interface User {
  id: string;
  email: string;
  nombre: string;
  role: string;
  permissions: string[];
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationData {
  total: number;
  limit: number;
  offset: number;
  pages: number;
}

export interface ApiResponseWithPagination<T> extends ApiResponse<T[]> {
  pagination: PaginationData;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox';
  required?: boolean;
  options?: FilterOption[];
  validation?: any;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
} 