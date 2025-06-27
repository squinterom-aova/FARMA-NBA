# Sistema de Next Best Action para Marketing Farmacéutico

Un sistema inteligente en TypeScript que implementa un motor de "siguiente mejor acción" enfocado en marketing farmacéutico, diseñado para personalizar y priorizar acciones comerciales hacia profesionales de la salud (HCPs).

## 🎯 Características Principales

### 🤖 Motor de IA Inteligente
- **Integración con OpenRouter**: Acceso a modelos avanzados (GPT-4, Claude, Mistral)
- **Recomendaciones personalizadas**: Generadas en español con terminología médica
- **Cumplimiento regulatorio**: Validaciones automáticas COFEPRIS
- **Aprendizaje continuo**: Mejora basada en resultados históricos

### 📊 Análisis de Datos
- **Procesamiento estructurado**: CRM, prescripciones, métricas de engagement
- **OCR y NLP**: Extracción de contenido de PDFs, imágenes y documentos
- **Monitoreo de redes sociales**: Twitter, LinkedIn, foros médicos
- **Clasificación de perfiles**: Buyer personas y escalera de adopción

### 🔒 Seguridad y Cumplimiento
- **Validación COFEPRIS**: Contraste automático con contenido aprobado
- **Autenticación JWT**: Sistema de roles y permisos
- **Rate limiting**: Protección contra abuso
- **Logging completo**: Auditoría de todas las acciones

## 🏗️ Arquitectura del Sistema

```
src/
├── types/           # Definiciones de tipos TypeScript
├── models/          # Modelos de MongoDB
├── services/        # Lógica de negocio
│   ├── IAEngine.ts           # Motor de IA con OpenRouter
│   ├── DataProcessor.ts      # Procesamiento de datos no estructurados
│   ├── SocialMediaMonitor.ts # Monitoreo de redes sociales
│   └── RecommendationEngine.ts # Motor principal de recomendaciones
├── controllers/     # Controladores de la API
├── middleware/      # Middleware de autenticación y validación
├── routes/          # Definición de rutas
├── app.ts           # Configuración de Express
└── index.ts         # Punto de entrada
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- MongoDB 5+
- Redis (opcional, para cache)

### 1. Clonar e instalar dependencias
```bash
git clone <repository-url>
cd farma-next-best-action
npm install
```

### 2. Configurar variables de entorno
```bash
cp env.example .env
```

Editar `.env` con tus credenciales:
```env
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Base de datos
MONGODB_URI=mongodb://localhost:27017/farma_nba
REDIS_URL=redis://localhost:6379

# OpenRouter API
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# APIs de redes sociales
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_SECRET=your_twitter_access_secret

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
```

### 3. Compilar y ejecutar
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 📡 API Endpoints

### HCPs (Healthcare Professionals)
```
GET    /api/v1/hcps                    # Listar HCPs con filtros
GET    /api/v1/hcps/:id                # Obtener HCP específico
POST   /api/v1/hcps                    # Crear nuevo HCP
PUT    /api/v1/hcps/:id                # Actualizar HCP
DELETE /api/v1/hcps/:id                # Eliminar HCP
GET    /api/v1/hcps/:id/metricas       # Métricas de engagement
GET    /api/v1/hcps/estadisticas       # Estadísticas generales
POST   /api/v1/hcps/importar           # Importar desde CSV
```

### Recomendaciones
```
GET    /api/v1/recomendaciones                    # Listar recomendaciones
GET    /api/v1/recomendaciones/pendientes         # Recomendaciones pendientes
GET    /api/v1/recomendaciones/prioridad/:n       # Por prioridad
GET    /api/v1/recomendaciones/:id                # Recomendación específica
POST   /api/v1/recomendaciones/generar/:hcpId     # Generar para HCP
POST   /api/v1/recomendaciones/generar-masivas    # Generación masiva
POST   /api/v1/recomendaciones/:id/ejecutar       # Ejecutar recomendación
POST   /api/v1/recomendaciones/:id/cancelar       # Cancelar recomendación
```

### Dashboard y Análisis
```
GET    /api/v1/dashboard               # Datos del dashboard
GET    /api/v1/recomendaciones/estadisticas  # Estadísticas
POST   /api/v1/analizar-tendencias     # Análisis de tendencias
POST   /api/v1/optimizar-recomendaciones # Optimización
```

### Sistema
```
GET    /api/v1/health                  # Health check
GET    /                              # Información del sistema
```

## 🔧 Uso del Sistema

### 1. Crear un HCP
```bash
curl -X POST http://localhost:3000/api/v1/hcps \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellidos": "García",
    "especialidad": "Cardiología",
    "institucion": "Hospital General",
    "ciudad": "México",
    "estado": "CDMX",
    "volumenPacientes": 500,
    "decilPrescripcion": 8,
    "nivelRespuesta": 7,
    "buyerPersona": "innovador",
    "escaleraAdopcion": "usuario"
  }'
```

### 2. Generar recomendaciones
```bash
curl -X POST http://localhost:3000/api/v1/recomendaciones/generar/hcp_id \
  -H "Authorization: Bearer your_jwt_token"
```

### 3. Ejecutar recomendación
```bash
curl -X POST http://localhost:3000/api/v1/recomendaciones/rec_id/ejecutar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{"resultado": "exitoso"}'
```

## 🧠 Motor de IA

### Prompt de ejemplo para OpenRouter
El sistema construye prompts contextualizados como:

```
Eres un experto en marketing farmacéutico especializado en generar 
recomendaciones personalizadas para profesionales de la salud (HCPs) en México.

CONTEXTO DEL HCP:
- Nombre: Dr. Juan García
- Especialidad: Cardiología
- Institución: Hospital General
- Buyer Persona: innovador
- Escalera de adopción: usuario

HISTORIAL DE CONTACTOS:
- 2024-01-15: visita (exitoso) - Presentación de nuevo producto
- 2024-01-20: email (parcial) - Seguimiento de muestra

INSTRUCCIONES:
1. Analiza el perfil del HCP y su historial
2. Genera 3-5 recomendaciones específicas y personalizadas
3. Cumple estrictamente con regulaciones COFEPRIS
4. Usa solo contenido pre-aprobado
```

### Tipos de recomendaciones
- **contacto_inicial**: Primer contacto con HCP
- **seguimiento**: Mantener engagement
- **presentacion_producto**: Mostrar nuevos productos
- **entrega_muestra**: Entregar muestras médicas
- **invitacion_evento**: Invitar a eventos médicos
- **educacion_medica**: Proporcionar educación médica
- **apoyo_clinico**: Ofrecer apoyo clínico

## 📈 Dashboard y Métricas

### Métricas de Engagement
- **Frecuencia de contacto**: Contactos en los últimos 30 días
- **Tasa de respuesta**: Porcentaje de contactos exitosos
- **Tiempo de respuesta**: Horas promedio de respuesta
- **Calidad de interacción**: Score 1-10 basado en resultados
- **Prescripciones generadas**: Número y valor de prescripciones

### Buyer Personas
- **Innovador**: Adopta nuevas tecnologías rápidamente
- **Seguidor temprano**: Adopta después de ver evidencia
- **Mayoría temprana**: Adopta cuando es estándar
- **Mayoría tardía**: Adopta por presión social
- **Rezagado**: Resiste al cambio

### Escalera de Adopción
- **No familiarizado**: Sin conocimiento del producto
- **En evaluación**: Conociendo y evaluando
- **Usuario**: Usando el producto
- **Promotor**: Recomendando activamente

## 🔒 Cumplimiento Regulatorio

### Validaciones COFEPRIS
- ✅ No prometer beneficios no aprobados
- ✅ Usar solo contenido pre-aprobado
- ✅ Respetar restricciones de marketing
- ✅ No hacer comparaciones directas
- ✅ Incluir advertencias requeridas

### Contenido Aprobado
El sistema valida automáticamente que:
- Los mensajes usen solo contenido aprobado
- No se incluyan promesas no autorizadas
- Se respeten las restricciones de cada canal
- Se cumplan los requisitos de etiquetado

## 🛠️ Desarrollo

### Scripts disponibles
```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Compilar para producción
npm run start        # Ejecutar en producción
npm run test         # Ejecutar tests
npm run lint         # Linting
npm run format       # Formatear código
```

### Estructura de desarrollo
```
├── src/             # Código fuente
├── dist/            # Código compilado
├── uploads/         # Archivos subidos
├── logs/            # Logs del sistema
├── tests/           # Tests unitarios
└── docs/            # Documentación
```

## 🚀 Despliegue

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Variables de entorno de producción
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://prod-db:27017/farma_nba
OPENROUTER_API_KEY=prod_key
JWT_SECRET=prod_secret
CORS_ORIGIN=https://your-frontend.com
```

## 📊 Monitoreo y Logs

### Logs estructurados
El sistema genera logs en formato JSON para facilitar el análisis:
```json
{
  "timestamp": "2024-01-20T10:30:00Z",
  "level": "info",
  "message": "Recomendación generada",
  "hcpId": "hcp_123",
  "recomendaciones": 3,
  "score": 85
}
```

### Métricas de rendimiento
- Tiempo de respuesta de la API
- Tasa de éxito de recomendaciones
- Uso de recursos del sistema
- Errores y excepciones

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:
- 📧 Email: soporte@farma-nba.com
- 📖 Documentación: [docs.farma-nba.com](https://docs.farma-nba.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/farma-nba/issues)

---

**Desarrollado con ❤️ para mejorar la eficiencia del marketing farmacéutico** 