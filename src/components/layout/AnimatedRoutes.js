import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import PageTransition from './PageTransition';
import Landing from '../../pages/Landing';
import Login from '../../pages/Login';
import Register from '../../pages/Register';
import Dashboard from '../../pages/Dashboard';
import Diary from '../../pages/Diary';
import PublicDiary from '../../pages/PublicDiary';
import AdminPanel from '../../pages/AdminPanel';
import About from '../../pages/About';

const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route
                    path="/"
                    element={
                        <PageTransition>
                            <Landing />
                        </PageTransition>
                    }
                />
                <Route
                    path="/login"
                    element={
                        <PageTransition>
                            <Login />
                        </PageTransition>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PageTransition>
                            <Register />
                        </PageTransition>
                    }
                />
                <Route
                    path="/about"
                    element={
                        <PageTransition>
                            <About />
                        </PageTransition>
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <PageTransition>
                                <Dashboard />
                            </PageTransition>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/diary"
                    element={
                        <ProtectedRoute>
                            <PageTransition>
                                <Diary />
                            </PageTransition>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/diary/public"
                    element={
                        <PageTransition>
                            <PublicDiary />
                        </PageTransition>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <PageTransition>
                                <AdminPanel />
                            </PageTransition>
                        </AdminRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </AnimatePresence>
    );
};

export default AnimatedRoutes;
