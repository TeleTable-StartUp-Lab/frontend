import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import PageTransition from './PageTransition';
import Landing from '../../pages/Landing';
import Login from '../../pages/Login';
import Register from '../../pages/Register';
import Dashboard from '../../pages/Dashboard';
import Diary from '../../pages/Diary';
import PublicDiary from '../../pages/PublicDiary';
import QueueControl from '../../pages/QueueControl';
import AdminPanel from '../../pages/AdminPanel';
import About from '../../pages/About';
import Privacy from '../../pages/Privacy';
import Terms from '../../pages/Terms';
import Contact from '../../pages/Contact';

const AnimatedRoutes = () => {
    const location = useLocation();

    const page = (element) => <PageTransition>{element}</PageTransition>;
    const protectedPage = (element) => (
        <ProtectedRoute>{page(element)}</ProtectedRoute>
    );
    const adminPage = (element) => (
        <AdminRoute>{page(element)}</AdminRoute>
    );

    return (
        <Routes location={location} key={location.key}>
            <Route path="/" element={page(<Landing />)} />
            <Route path="/login" element={page(<Login />)} />
            <Route path="/register" element={page(<Register />)} />
            <Route path="/about" element={page(<About />)} />
            <Route path="/privacy" element={page(<Privacy />)} />
            <Route path="/terms" element={page(<Terms />)} />
            <Route path="/contact" element={page(<Contact />)} />

            <Route path="/dashboard" element={protectedPage(<Dashboard />)} />
            <Route path="/diary" element={protectedPage(<Diary />)} />
            <Route path="/diary/public" element={page(<PublicDiary />)} />

            <Route path="/queue" element={adminPage(<QueueControl />)} />
            <Route path="/admin" element={adminPage(<AdminPanel />)} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AnimatedRoutes;
