import mongoose, { Schema, Document } from 'mongoose';
import { HCP, BuyerPersona, EscaleraAdopcion, MetricasEngagement } from '@/types';

export interface HCPDocument extends HCP, Document {}

const ContactoSchema = new Schema({
  tipo: { type: String, enum: ['visita', 'email', 'llamada', 'entrega_muestra', 'evento', 'redes_sociales'], required: true },
  fecha: { type: Date, required: true },
  resultado: { type: String, enum: ['exitoso', 'parcial', 'fallido', 'pendiente'], required: true },
  notas: { type: String, required: true },
  producto: { type: String },
  canal: { type: String, enum: ['personal', 'email', 'telefono', 'whatsapp', 'linkedin', 'twitter', 'evento_presencial', 'evento_virtual'], required: true },
  representanteId: { type: String, required: true }
}, { timestamps: true });

const MetricasEngagementSchema = new Schema({
  frecuenciaContacto: { type: Number, default: 0 },
  tasaRespuesta: { type: Number, default: 0 },
  tiempoRespuesta: { type: Number, default: 0 },
  calidadInteraccion: { type: Number, default: 0 },
  prescripcionesGeneradas: { type: Number, default: 0 },
  valorPrescripciones: { type: Number, default: 0 },
  ultimaInteraccion: { type: Date, default: Date.now }
});

const HCPSchema = new Schema({
  nombre: { type: String, required: true, index: true },
  apellidos: { type: String, required: true, index: true },
  especialidad: { type: String, required: true, index: true },
  subespecialidad: { type: String },
  institucion: { type: String, required: true, index: true },
  ciudad: { type: String, required: true, index: true },
  estado: { type: String, required: true, index: true },
  volumenPacientes: { type: Number, required: true },
  decilPrescripcion: { type: Number, required: true, min: 1, max: 10 },
  nivelRespuesta: { type: Number, required: true, min: 1, max: 10 },
  historialContacto: [ContactoSchema],
  buyerPersona: { 
    type: String, 
    enum: ['innovador', 'seguidor_temprano', 'mayoria_temprana', 'mayoria_tardia', 'rezagado'], 
    required: true 
  },
  escaleraAdopcion: { 
    type: String, 
    enum: ['no_familiarizado', 'en_evaluacion', 'usuario', 'promotor'], 
    required: true 
  },
  metricasEngagement: { type: MetricasEngagementSchema, default: () => ({}) },
  interesesClinicos: [{ type: String }],
  restriccionesRegulatorias: [{ type: String }]
}, {
  timestamps: true,
  collection: 'hcps'
});

// Índices para optimizar consultas
HCPSchema.index({ especialidad: 1, ciudad: 1 });
HCPSchema.index({ decilPrescripcion: -1 });
HCPSchema.index({ 'metricasEngagement.ultimaInteraccion': -1 });
HCPSchema.index({ buyerPersona: 1, escaleraAdopcion: 1 });

// Métodos de instancia
HCPSchema.methods.calcularScoreEngagement = function(): number {
  const metricas = this.metricasEngagement;
  const score = (
    metricas.frecuenciaContacto * 0.2 +
    metricas.tasaRespuesta * 0.3 +
    (10 - metricas.tiempoRespuesta / 24) * 0.2 +
    metricas.calidadInteraccion * 0.2 +
    (metricas.prescripcionesGeneradas > 0 ? 1 : 0) * 0.1
  );
  return Math.min(100, Math.max(0, score));
};

HCPSchema.methods.actualizarMetricas = function(contacto: any): void {
  const metricas = this.metricasEngagement;
  
  // Actualizar frecuencia de contacto
  const contactosUltimoMes = this.historialContacto.filter(
    c => c.fecha > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;
  metricas.frecuenciaContacto = contactosUltimoMes;
  
  // Actualizar tasa de respuesta
  const contactosExitosos = this.historialContacto.filter(
    c => c.resultado === 'exitoso'
  ).length;
  metricas.tasaRespuesta = this.historialContacto.length > 0 
    ? (contactosExitosos / this.historialContacto.length) * 100 
    : 0;
  
  // Actualizar última interacción
  metricas.ultimaInteraccion = new Date();
  
  this.save();
};

// Métodos estáticos
HCPSchema.statics.buscarPorEspecialidad = function(especialidad: string) {
  return this.find({ especialidad: new RegExp(especialidad, 'i') });
};

HCPSchema.statics.buscarPorRegion = function(estado: string, ciudad?: string) {
  const query: any = { estado };
  if (ciudad) query.ciudad = ciudad;
  return this.find(query);
};

HCPSchema.statics.buscarPorEngagement = function(minScore: number = 0) {
  return this.find().where('metricasEngagement').exists();
};

export const HCPModel = mongoose.model<HCPDocument>('HCP', HCPSchema); 