import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Layout/Sidebar';
import DashboardPage from '@/pages/Dashboard/DashboardPage';
import HCPListPage from '@/pages/HCPs/HCPListPage';
import RecommendationsPage from '@/pages/Recommendations/RecommendationsPage';
import LoginPage from '@/pages/Auth/LoginPage';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DashboardPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hcps"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <HCPListPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recomendaciones"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <RecommendationsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analisis"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Análisis</h2>
                        <p className="text-gray-600">Página en desarrollo</p>
                      </div>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documentos"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Documentos</h2>
                        <p className="text-gray-600">Página en desarrollo</p>
                      </div>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notificaciones"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Notificaciones</h2>
                        <p className="text-gray-600">Página en desarrollo</p>
                      </div>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/configuracion"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuración</h2>
                        <p className="text-gray-600">Página en desarrollo</p>
                      </div>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App; 