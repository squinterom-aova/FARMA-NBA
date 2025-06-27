import { startServer } from './app';

// Iniciar el servidor
startServer().catch((error) => {
  console.error('Error fatal iniciando la aplicación:', error);
  process.exit(1);
}); 