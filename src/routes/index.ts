import { Router } from 'express';
import { HCPController } from '@/controllers/HCPController';
import { RecommendationController } from '@/controllers/RecommendationController';
import { upload } from '@/middleware/upload';

const router = Router();
const hcpController = new HCPController();
const recommendationController = new RecommendationController();

// Rutas de HCPs
router.get('/hcps', hcpController.obtenerHCPs.bind(hcpController));
router.get('/hcps/:id', hcpController.obtenerHCP.bind(hcpController));
router.post('/hcps', hcpController.crearHCP.bind(hcpController));
router.put('/hcps/:id', hcpController.actualizarHCP.bind(hcpController));
router.delete('/hcps/:id', hcpController.eliminarHCP.bind(hcpController));
router.get('/hcps/:id/metricas', hcpController.obtenerMetricasHCP.bind(hcpController));
router.get('/hcps/estadisticas', hcpController.obtenerEstadisticas.bind(hcpController));
router.post('/hcps/importar', upload.single('csv'), hcpController.importarHCPs.bind(hcpController));

// Rutas de recomendaciones
router.get('/recomendaciones', recommendationController.obtenerRecomendaciones.bind(recommendationController));
router.get('/recomendaciones/pendientes', recommendationController.obtenerRecomendacionesPendientes.bind(recommendationController));
router.get('/recomendaciones/prioridad/:prioridad', recommendationController.obtenerRecomendacionesPorPrioridad.bind(recommendationController));
router.get('/recomendaciones/:id', recommendationController.obtenerRecomendacion.bind(recommendationController));
router.post('/recomendaciones/generar/:hcpId', recommendationController.generarRecomendaciones.bind(recommendationController));
router.post('/recomendaciones/generar-masivas', recommendationController.generarRecomendacionesMasivas.bind(recommendationController));
router.post('/recomendaciones/:id/ejecutar', recommendationController.ejecutarRecomendacion.bind(recommendationController));
router.post('/recomendaciones/:id/cancelar', recommendationController.cancelarRecomendacion.bind(recommendationController));

// Rutas del dashboard
router.get('/dashboard', recommendationController.obtenerDashboardData.bind(recommendationController));
router.get('/recomendaciones/estadisticas', recommendationController.obtenerEstadisticas.bind(recommendationController));

// Rutas de análisis y optimización
router.post('/analizar-tendencias', recommendationController.analizarTendencias.bind(recommendationController));
router.post('/optimizar-recomendaciones', recommendationController.optimizarRecomendaciones.bind(recommendationController));

// Ruta de salud del sistema
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router; 