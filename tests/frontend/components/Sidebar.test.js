import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../frontend/src/contexts/AuthContext';
import Sidebar from '../../../frontend/src/components/Layout/Sidebar';

// Mock de react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: '/dashboard'
  })
}));

// Mock de los iconos
jest.mock('react-icons/ri', () => ({
  RiDashboardLine: () => <div data-testid="dashboard-icon">Dashboard</div>,
  RiUserLine: () => <div data-testid="hcp-icon">HCPs</div>,
  RiLightbulbLine: () => <div data-testid="recommendations-icon">Recommendations</div>,
  RiLogoutBoxLine: () => <div data-testid="logout-icon">Logout</div>
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Sidebar Component', () => {
  beforeEach(() => {
    // Mock del localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'test-token'),
        removeItem: jest.fn(),
      },
      writable: true
    });
  });

  test('debe renderizar el sidebar correctamente', () => {
    renderWithProviders(<Sidebar />);

    expect(screen.getByText('Next Best Action')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-icon')).toBeInTheDocument();
    expect(screen.getByTestId('hcp-icon')).toBeInTheDocument();
    expect(screen.getByTestId('recommendations-icon')).toBeInTheDocument();
  });

  test('debe mostrar enlaces de navegación', () => {
    renderWithProviders(<Sidebar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('HCPs')).toBeInTheDocument();
    expect(screen.getByText('Recomendaciones')).toBeInTheDocument();
  });

  test('debe mostrar información del usuario', () => {
    renderWithProviders(<Sidebar />);

    expect(screen.getByText('Usuario')).toBeInTheDocument();
    expect(screen.getByText('usuario@empresa.com')).toBeInTheDocument();
  });

  test('debe manejar logout correctamente', () => {
    const mockLogout = jest.fn();
    
    renderWithProviders(<Sidebar />);

    const logoutButton = screen.getByTestId('logout-icon').closest('button');
    fireEvent.click(logoutButton);

    expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
  });

  test('debe aplicar estilos activos al enlace actual', () => {
    renderWithProviders(<Sidebar />);

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('bg-blue-100', 'text-blue-600');
  });

  test('debe ser responsive en móviles', () => {
    // Simular pantalla móvil
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    renderWithProviders(<Sidebar />);

    const sidebar = screen.getByRole('navigation');
    expect(sidebar).toHaveClass('md:w-64');
  });

  test('debe mostrar versión del sistema', () => {
    renderWithProviders(<Sidebar />);

    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });

  test('debe manejar hover en enlaces', () => {
    renderWithProviders(<Sidebar />);

    const hcpLink = screen.getByText('HCPs').closest('a');
    
    fireEvent.mouseEnter(hcpLink);
    expect(hcpLink).toHaveClass('hover:bg-gray-100');
    
    fireEvent.mouseLeave(hcpLink);
  });

  test('debe navegar correctamente al hacer clic en enlaces', () => {
    const { container } = renderWithProviders(<Sidebar />);

    const hcpLink = screen.getByText('HCPs').closest('a');
    expect(hcpLink).toHaveAttribute('href', '/hcps');

    const recommendationsLink = screen.getByText('Recomendaciones').closest('a');
    expect(recommendationsLink).toHaveAttribute('href', '/recommendations');
  });

  test('debe mostrar iconos correctamente', () => {
    renderWithProviders(<Sidebar />);

    expect(screen.getByTestId('dashboard-icon')).toBeInTheDocument();
    expect(screen.getByTestId('hcp-icon')).toBeInTheDocument();
    expect(screen.getByTestId('recommendations-icon')).toBeInTheDocument();
    expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
  });

  test('debe tener estructura semántica correcta', () => {
    renderWithProviders(<Sidebar />);

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  test('debe manejar estado colapsado', () => {
    renderWithProviders(<Sidebar />);

    const sidebar = screen.getByRole('navigation');
    expect(sidebar).toHaveClass('w-16', 'md:w-64');
  });

  test('debe mostrar tooltips en estado colapsado', () => {
    renderWithProviders(<Sidebar />);

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('title', 'Dashboard');
  });
}); 