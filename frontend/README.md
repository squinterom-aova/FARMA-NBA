# Farma NBA Frontend

Frontend React con TypeScript para el Sistema de Next Best Action Farmacéutico.

## Características

- **Dashboard Interactivo**: Visualización de métricas clave y KPIs
- **Gestión de HCPs**: Lista, filtros, búsqueda y gestión de profesionales de la salud
- **Recomendaciones Inteligentes**: Visualización y ejecución de Next Best Actions
- **Interfaz Moderna**: Diseño responsive con Tailwind CSS
- **Autenticación**: Sistema de login seguro
- **Gráficos Interactivos**: Visualizaciones con Recharts
- **Notificaciones**: Sistema de toast notifications

## Tecnologías

- **React 18** con TypeScript
- **React Router** para navegación
- **React Query** para gestión de estado del servidor
- **Tailwind CSS** para estilos
- **Heroicons** para iconografía
- **Recharts** para gráficos
- **React Hot Toast** para notificaciones
- **Axios** para peticiones HTTP

## Instalación

1. **Instalar dependencias**:
```bash
cd frontend
npm install
```

2. **Configurar variables de entorno**:
Crear archivo `.env` en la raíz del frontend:
```env
REACT_APP_API_URL=http://localhost:3000/api/v1
```

3. **Ejecutar en desarrollo**:
```bash
npm start
```

La aplicación estará disponible en `http://localhost:3001`

## Estructura del Proyecto

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   │   └── DashboardCard.tsx
│   │   └── Layout/
│   │       └── Sidebar.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── Auth/
│   │   │   └── LoginPage.tsx
│   │   ├── Dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── HCPs/
│   │   │   └── HCPListPage.tsx
│   │   └── Recommendations/
│   │       └── RecommendationsPage.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## Componentes Principales

### Dashboard
- **DashboardPage**: Página principal con métricas y gráficos
- **DashboardCard**: Tarjetas de métricas con tendencias

### HCPs
- **HCPListPage**: Lista de profesionales con filtros y búsqueda
- Filtros por especialidad, región y búsqueda por nombre
- Visualización de buyer persona y escalera de adopción

### Recomendaciones
- **RecommendationsPage**: Lista de Next Best Actions
- Filtros por tipo, estado y canal
- Acciones de ejecutar y cancelar recomendaciones

### Autenticación
- **LoginPage**: Página de inicio de sesión
- **AuthContext**: Contexto para gestión de autenticación

## API Integration

El frontend se comunica con el backend a través del servicio `api.ts` que incluye:

- **HCPs**: CRUD completo, métricas, estadísticas
- **Recomendaciones**: Listado, generación, ejecución
- **Dashboard**: Datos agregados y métricas
- **Autenticación**: Login, logout, perfil

## Estilos y Diseño

- **Tailwind CSS** para estilos utilitarios
- **Inter Font** de Google Fonts
- **Paleta de colores personalizada**:
  - Primary: Azul (#3b82f6)
  - Success: Verde (#22c55e)
  - Warning: Amarillo (#f59e0b)
  - Danger: Rojo (#ef4444)

## Scripts Disponibles

- `npm start`: Ejecutar en modo desarrollo
- `npm build`: Construir para producción
- `npm test`: Ejecutar tests
- `npm run lint`: Linting del código
- `npm run format`: Formateo del código

## Credenciales de Prueba

Para desarrollo, puedes usar:
- **Email**: admin@farma.com
- **Password**: password123

## Configuración de Desarrollo

### Proxy
El frontend está configurado para hacer proxy al backend en desarrollo:
```json
{
  "proxy": "http://localhost:3000"
}
```

### TypeScript
Configuración estricta con paths aliases para mejor organización:
```json
{
  "baseUrl": "src",
  "paths": {
    "@/*": ["*"],
    "@/components/*": ["components/*"],
    "@/pages/*": ["pages/*"],
    "@/services/*": ["services/*"],
    "@/types/*": ["types/*"]
  }
}
```

## Despliegue

1. **Construir para producción**:
```bash
npm run build
```

2. **Los archivos generados estarán en `build/`**

3. **Servir con cualquier servidor web estático**

## Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. 

# Configuración del servidor
PORT=3000
NODE_ENV=development

# Base de datos
MONGODB_URI=mongodb://localhost:27017/farma_nba
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=farma_nba_secret_key_2024
JWT_EXPIRES_IN=24h

# Configuración de archivos
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Configuración de logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Configuración de seguridad
CORS_ORIGIN=http://localhost:3001
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100 