import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../frontend/src/contexts/AuthContext';
import DashboardPage from '../../../frontend/src/pages/Dashboard/DashboardPage';

// Mock del servicio API
jest.mock('../../../frontend/src/services/api', () => ({
  get: jest.fn()
}));

// Mock de recharts
jest.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>
}));

const mockApi = require('../../../frontend/src/services/api');

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('DashboardPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe renderizar el dashboard correctamente', async () => {
    const mockDashboardData = {
      hcpsActivos: 150,
      recomendacionesPendientes: 25,
      contactosMes: 300,
      prescripcionesGeneradas: 120,
      valorPrescripciones: 50000,
      tasaExito: 0.75,
      topProductos: [
        { nombre: 'Producto A', prescripciones: 50 },
        { nombre: 'Producto B', prescripciones: 30 }
      ],
      tendencias: [
        { fecha: '2024-01-01', contactos: 10, prescripciones: 5 },
        { fecha: '2024-01-02', contactos: 15, prescripciones: 8 }
      ]
    };

    mockApi.get.mockResolvedValue({ data: mockDashboardData });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Resumen General')).toBeInTheDocument();
  });

  test('debe mostrar métricas principales', async () => {
    const mockDashboardData = {
      hcpsActivos: 150,
      recomendacionesPendientes: 25,
      contactosMes: 300,
      prescripcionesGeneradas: 120
    };

    mockApi.get.mockResolvedValue({ data: mockDashboardData });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument(); // HCPs Activos
      expect(screen.getByText('25')).toBeInTheDocument(); // Recomendaciones Pendientes
      expect(screen.getByText('300')).toBeInTheDocument(); // Contactos del Mes
      expect(screen.getByText('120')).toBeInTheDocument(); // Prescripciones Generadas
    });
  });

  test('debe mostrar gráficos', async () => {
    const mockDashboardData = {
      tendencias: [
        { fecha: '2024-01-01', contactos: 10, prescripciones: 5 },
        { fecha: '2024-01-02', contactos: 15, prescripciones: 8 }
      ],
      topProductos: [
        { nombre: 'Producto A', prescripciones: 50 },
        { nombre: 'Producto B', prescripciones: 30 }
      ]
    };

    mockApi.get.mockResolvedValue({ data: mockDashboardData });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  test('debe manejar estado de carga', () => {
    mockApi.get.mockImplementation(() => new Promise(() => {})); // Promise que nunca se resuelve

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  test('debe manejar errores de API', async () => {
    mockApi.get.mockRejectedValue(new Error('API Error'));

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar datos del dashboard')).toBeInTheDocument();
    });
  });

  test('debe mostrar tarjetas de métricas', async () => {
    const mockDashboardData = {
      hcpsActivos: 150,
      recomendacionesPendientes: 25,
      contactosMes: 300,
      prescripcionesGeneradas: 120,
      valorPrescripciones: 50000,
      tasaExito: 0.75
    };

    mockApi.get.mockResolvedValue({ data: mockDashboardData });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('HCPs Activos')).toBeInTheDocument();
      expect(screen.getByText('Recomendaciones Pendientes')).toBeInTheDocument();
      expect(screen.getByText('Contactos del Mes')).toBeInTheDocument();
      expect(screen.getByText('Prescripciones Generadas')).toBeInTheDocument();
      expect(screen.getByText('Valor Prescripciones')).toBeInTheDocument();
      expect(screen.getByText('Tasa de Éxito')).toBeInTheDocument();
    });
  });

  test('debe mostrar sección de tendencias', async () => {
    const mockDashboardData = {
      tendencias: [
        { fecha: '2024-01-01', contactos: 10, prescripciones: 5 },
        { fecha: '2024-01-02', contactos: 15, prescripciones: 8 }
      ]
    };

    mockApi.get.mockResolvedValue({ data: mockDashboardData });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Tendencias')).toBeInTheDocument();
    });
  });

  test('debe mostrar sección de productos top', async () => {
    const mockDashboardData = {
      topProductos: [
        { nombre: 'Producto A', prescripciones: 50 },
        { nombre: 'Producto B', prescripciones: 30 }
      ]
    };

    mockApi.get.mockResolvedValue({ data: mockDashboardData });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Productos Top')).toBeInTheDocument();
      expect(screen.getByText('Producto A')).toBeInTheDocument();
      expect(screen.getByText('Producto B')).toBeInTheDocument();
    });
  });

  test('debe formatear valores monetarios correctamente', async () => {
    const mockDashboardData = {
      valorPrescripciones: 50000
    };

    mockApi.get.mockResolvedValue({ data: mockDashboardData });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('$50,000')).toBeInTheDocument();
    });
  });

  test('debe formatear porcentajes correctamente', async () => {
    const mockDashboardData = {
      tasaExito: 0.75
    };

    mockApi.get.mockResolvedValue({ data: mockDashboardData });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  test('debe llamar a la API correctamente', async () => {
    const mockDashboardData = {
      hcpsActivos: 150,
      recomendacionesPendientes: 25
    };

    mockApi.get.mockResolvedValue({ data: mockDashboardData });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(mockApi.get).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('debe manejar datos vacíos', async () => {
    const mockDashboardData = {
      hcpsActivos: 0,
      recomendacionesPendientes: 0,
      contactosMes: 0,
      prescripcionesGeneradas: 0,
      valorPrescripciones: 0,
      tasaExito: 0,
      topProductos: [],
      tendencias: []
    };

    mockApi.get.mockResolvedValue({ data: mockDashboardData });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument(); // HCPs Activos
      expect(screen.getByText('0%')).toBeInTheDocument(); // Tasa de Éxito
    });
  });

  test('debe ser responsive', () => {
    const mockDashboardData = {
      hcpsActivos: 150,
      recomendacionesPendientes: 25
    };

    mockApi.get.mockResolvedValue({ data: mockDashboardData });

    renderWithProviders(<DashboardPage />);

    const dashboard = screen.getByText('Dashboard').closest('div');
    expect(dashboard).toHaveClass('p-6');
  });

  test('debe mostrar iconos en las tarjetas', async () => {
    const mockDashboardData = {
      hcpsActivos: 150,
      recomendacionesPendientes: 25
    };

    mockApi.get.mockResolvedValue({ data: mockDashboardData });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      // Verificar que las tarjetas tienen iconos (aunque estén mockeados)
      const cards = screen.getAllByTestId('dashboard-card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });
}); 