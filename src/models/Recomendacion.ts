import mongoose, { Schema, Document } from 'mongoose';
import { Recomendacion, TipoRecomendacion, CanalComunicacion, EstadoRecomendacion, ResultadoRecomendacion } from '@/types';

export interface RecomendacionDocument extends Recomendacion, Document {}

const RecomendacionSchema = new Schema({
  hcpId: { type: String, required: true, index: true },
  tipo: { 
    type: String, 
    enum: ['contacto_inicial', 'seguimiento', 'presentacion_producto', 'entrega_muestra', 'invitacion_evento', 'educacion_medica', 'apoyo_clinico'], 
    required: true 
  },
  prioridad: { type: Number, required: true, min: 1, max: 10, index: true },
  canal: { 
    type: String, 
    enum: ['personal', 'email', 'telefono', 'whatsapp', 'linkedin', 'twitter', 'evento_presencial', 'evento_virtual'], 
    required: true 
  },
  momentoIdeal: { type: Date, required: true, index: true },
  mensaje: { type: String, required: true },
  explicacion: { type: String, required: true },
  productos: [{ type: String }],
  contenidoAprobado: [{ type: String }],
  restricciones: [{ type: String }],
  score: { type: Number, required: true, min: 0, max: 100, index: true },
  estado: { 
    type: String, 
    enum: ['pendiente', 'en_proceso', 'completada', 'cancelada', 'rechazada'], 
    default: 'pendiente',
    index: true 
  },
  ejecutadaAt: { type: Date },
  resultado: { 
    type: String, 
    enum: ['exitoso', 'parcial', 'fallido', 'no_aplicable'] 
  }
}, {
  timestamps: true,
  collection: 'recomendaciones'
});

// Índices para optimizar consultas
RecomendacionSchema.index({ hcpId: 1, estado: 1 });
RecomendacionSchema.index({ prioridad: -1, score: -1 });
RecomendacionSchema.index({ momentoIdeal: 1 });
RecomendacionSchema.index({ tipo: 1, canal: 1 });

// Métodos de instancia
RecomendacionSchema.methods.marcarComoEjecutada = function(resultado: ResultadoRecomendacion): void {
  this.estado = 'completada';
  this.ejecutadaAt = new Date();
  this.resultado = resultado;
  this.save();
};

RecomendacionSchema.methods.cancelar = function(): void {
  this.estado = 'cancelada';
  this.save();
};

// Métodos estáticos
RecomendacionSchema.statics.buscarPendientes = function() {
  return this.find({ estado: 'pendiente' }).sort({ prioridad: -1, score: -1 });
};

RecomendacionSchema.statics.buscarPorHCP = function(hcpId: string) {
  return this.find({ hcpId }).sort({ createdAt: -1 });
};

RecomendacionSchema.statics.buscarPorTipo = function(tipo: TipoRecomendacion) {
  return this.find({ tipo }).sort({ prioridad: -1 });
};

RecomendacionSchema.statics.buscarPorCanal = function(canal: CanalComunicacion) {
  return this.find({ canal }).sort({ momentoIdeal: 1 });
};

RecomendacionSchema.statics.obtenerEstadisticas = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$estado',
        count: { $sum: 1 },
        avgScore: { $avg: '$score' },
        avgPrioridad: { $avg: '$prioridad' }
      }
    }
  ]);
};

export const RecomendacionModel = mongoose.model<RecomendacionDocument>('Recomendacion', RecomendacionSchema); 