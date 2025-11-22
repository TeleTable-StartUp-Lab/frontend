import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import AnimatedRoutes from './components/layout/AnimatedRoutes';
import BackendHealthCheck from './components/common/BackendHealthCheck';

function App() {
  return (
    <AuthProvider>
      <Router>
        <BackendHealthCheck />
        <Layout>
          <AnimatedRoutes />
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
