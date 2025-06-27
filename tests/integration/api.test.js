const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');

// Mock de servicios externos
jest.mock('../../src/services/IAEngine');
jest.mock('../../src/services/DataProcessor');
jest.mock('../../src/services/SocialMediaMonitor');

describe('API Integration Tests', () => {
  let server;
  let testToken;

  beforeAll(async () => {
    // Conectar a base de datos de prueba
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/farma_nba_test');
    
    server = app.listen(0); // Puerto aleatorio para tests
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await server.close();
  });

  beforeEach(async () => {
    // Limpiar base de datos antes de cada test
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }

    // Generar token de prueba
    testToken = 'test-jwt-token';
  });

  describe('Health Check', () => {
    test('GET /health debe retornar estado del sistema', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('HCPs API', () => {
    test('GET /api/v1/hcps debe retornar lista de HCPs', async () => {
      const response = await request(app)
        .get('/api/v1/hcps')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });

    test('POST /api/v1/hcps debe crear un nuevo HCP', async () => {
      const hcpData = {
        nombre: 'Dr. Juan Pérez',
        apellidos: 'García',
        especialidad: 'Cardiología',
        institucion: 'Hospital General',
        ciudad: 'México',
        estado: 'CDMX',
        volumenPacientes: 150,
        decilPrescripcion: 8
      };

      const response = await request(app)
        .post('/api/v1/hcps')
        .set('Authorization', `Bearer ${testToken}`)
        .send(hcpData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('nombre', hcpData.nombre);
      expect(response.body.data).toHaveProperty('especialidad', hcpData.especialidad);
    });

    test('GET /api/v1/hcps/:id debe retornar un HCP específico', async () => {
      // Primero crear un HCP
      const hcpData = {
        nombre: 'Dr. María García',
        apellidos: 'López',
        especialidad: 'Oncología'
      };

      const createResponse = await request(app)
        .post('/api/v1/hcps')
        .set('Authorization', `Bearer ${testToken}`)
        .send(hcpData);

      const hcpId = createResponse.body.data.id;

      // Luego obtener el HCP
      const response = await request(app)
        .get(`/api/v1/hcps/${hcpId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('nombre', hcpData.nombre);
    });

    test('PUT /api/v1/hcps/:id debe actualizar un HCP', async () => {
      // Primero crear un HCP
      const hcpData = {
        nombre: 'Dr. Carlos Ruiz',
        apellidos: 'Martínez',
        especialidad: 'Neurología'
      };

      const createResponse = await request(app)
        .post('/api/v1/hcps')
        .set('Authorization', `Bearer ${testToken}`)
        .send(hcpData);

      const hcpId = createResponse.body.data.id;

      // Luego actualizar el HCP
      const updateData = {
        especialidad: 'Neurología Intervencionista'
      };

      const response = await request(app)
        .put(`/api/v1/hcps/${hcpId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('especialidad', updateData.especialidad);
    });

    test('DELETE /api/v1/hcps/:id debe eliminar un HCP', async () => {
      // Primero crear un HCP
      const hcpData = {
        nombre: 'Dr. Ana Silva',
        apellidos: 'Rodríguez',
        especialidad: 'Dermatología'
      };

      const createResponse = await request(app)
        .post('/api/v1/hcps')
        .set('Authorization', `Bearer ${testToken}`)
        .send(hcpData);

      const hcpId = createResponse.body.data.id;

      // Luego eliminar el HCP
      const response = await request(app)
        .delete(`/api/v1/hcps/${hcpId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('GET /api/v1/hcps/search debe buscar HCPs', async () => {
      const response = await request(app)
        .get('/api/v1/hcps/search')
        .set('Authorization', `Bearer ${testToken}`)
        .query({ q: 'Cardiología' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('Recommendations API', () => {
    test('GET /api/v1/recomendaciones debe retornar lista de recomendaciones', async () => {
      const response = await request(app)
        .get('/api/v1/recomendaciones')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    test('GET /api/v1/recomendaciones/pendientes debe retornar recomendaciones pendientes', async () => {
      const response = await request(app)
        .get('/api/v1/recomendaciones/pendientes')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    test('POST /api/v1/recomendaciones/generar/:hcpId debe generar recomendaciones', async () => {
      // Primero crear un HCP
      const hcpData = {
        nombre: 'Dr. Pedro López',
        apellidos: 'González',
        especialidad: 'Cardiología'
      };

      const createResponse = await request(app)
        .post('/api/v1/hcps')
        .set('Authorization', `Bearer ${testToken}`)
        .send(hcpData);

      const hcpId = createResponse.body.data.id;

      // Luego generar recomendaciones
      const response = await request(app)
        .post(`/api/v1/recomendaciones/generar/${hcpId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    test('POST /api/v1/recomendaciones/:id/ejecutar debe ejecutar una recomendación', async () => {
      // Primero crear un HCP y generar recomendaciones
      const hcpData = {
        nombre: 'Dr. Laura Torres',
        apellidos: 'Vargas',
        especialidad: 'Oncología'
      };

      const createResponse = await request(app)
        .post('/api/v1/hcps')
        .set('Authorization', `Bearer ${testToken}`)
        .send(hcpData);

      const hcpId = createResponse.body.data.id;

      const generateResponse = await request(app)
        .post(`/api/v1/recomendaciones/generar/${hcpId}`)
        .set('Authorization', `Bearer ${testToken}`);

      const recommendationId = generateResponse.body.data[0].id;

      // Luego ejecutar la recomendación
      const response = await request(app)
        .post(`/api/v1/recomendaciones/${recommendationId}/ejecutar`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ resultado: 'exitoso' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('POST /api/v1/recomendaciones/:id/cancelar debe cancelar una recomendación', async () => {
      // Primero crear un HCP y generar recomendaciones
      const hcpData = {
        nombre: 'Dr. Roberto Díaz',
        apellidos: 'Hernández',
        especialidad: 'Neurología'
      };

      const createResponse = await request(app)
        .post('/api/v1/hcps')
        .set('Authorization', `Bearer ${testToken}`)
        .send(hcpData);

      const hcpId = createResponse.body.data.id;

      const generateResponse = await request(app)
        .post(`/api/v1/recomendaciones/generar/${hcpId}`)
        .set('Authorization', `Bearer ${testToken}`);

      const recommendationId = generateResponse.body.data[0].id;

      // Luego cancelar la recomendación
      const response = await request(app)
        .post(`/api/v1/recomendaciones/${recommendationId}/cancelar`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ motivo: 'Cancelado por usuario' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Dashboard API', () => {
    test('GET /api/v1/dashboard debe retornar datos del dashboard', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('hcpsActivos');
      expect(response.body.data).toHaveProperty('recomendacionesPendientes');
    });

    test('GET /api/v1/recomendaciones/estadisticas debe retornar estadísticas', async () => {
      const response = await request(app)
        .get('/api/v1/recomendaciones/estadisticas')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('Error Handling', () => {
    test('debe manejar rutas no encontradas', async () => {
      const response = await request(app)
        .get('/api/v1/ruta-inexistente')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('debe manejar errores de validación', async () => {
      const invalidData = {
        nombre: '', // Campo requerido vacío
        especialidad: 'Cardiología'
      };

      const response = await request(app)
        .post('/api/v1/hcps')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('debe manejar errores de autenticación', async () => {
      const response = await request(app)
        .get('/api/v1/hcps')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Pagination', () => {
    test('debe manejar paginación correctamente', async () => {
      const response = await request(app)
        .get('/api/v1/hcps')
        .set('Authorization', `Bearer ${testToken}`)
        .query({ limit: 5, offset: 0 })
        .expect(200);

      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('limit', 5);
      expect(response.body.pagination).toHaveProperty('offset', 0);
    });
  });

  describe('Filtering', () => {
    test('debe filtrar HCPs por especialidad', async () => {
      const response = await request(app)
        .get('/api/v1/hcps')
        .set('Authorization', `Bearer ${testToken}`)
        .query({ especialidad: 'Cardiología' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    test('debe filtrar recomendaciones por tipo', async () => {
      const response = await request(app)
        .get('/api/v1/recomendaciones')
        .set('Authorization', `Bearer ${testToken}`)
        .query({ tipo: 'contacto_inicial' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });
}); 