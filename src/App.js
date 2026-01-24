import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import AnimatedRoutes from './components/layout/AnimatedRoutes';
import BackendHealthCheck from './components/common/BackendHealthCheck';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <BackendHealthCheck />
          <Layout>
            <AnimatedRoutes />
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
