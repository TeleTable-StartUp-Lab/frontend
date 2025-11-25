import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Truck, User, LogOut, Settings, BookOpen, LayoutDashboard, Info, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinks = [
        { name: 'Home', path: '/', icon: Truck },
        { name: 'About', path: '/about', icon: Info },
        ...(user ? [
            { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            { name: 'Diary', path: '/diary', icon: BookOpen },
            ...(user.role === 'admin' ? [{ name: 'Admin', path: '/admin', icon: Shield }] : [])
        ] : [])
    ];

    const isActivePath = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'bg-dark-900/80 backdrop-blur-xl border-b border-white/10 shadow-lg'
                    : 'bg-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14">
                        {/* Left side - Logo and Navigation */}
                        <div className="flex items-center gap-6">
                            {/* Logo */}
                            <Link
                                to="/"
                                className="flex items-center gap-3 group"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    className="relative"
                                >
                                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/40 transition-all" />
                                    <div className="relative p-1.5 bg-gradient-to-br from-primary to-secondary rounded-lg">
                                        <Truck className="w-5 h-5 text-dark-900" />
                                    </div>
                                </motion.div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-white tracking-tight">
                                        Tele<span className="text-primary">Table</span>
                                    </span>
                                </div>
                            </Link>

                            {/* Desktop Navigation */}
                            <div className="hidden lg:flex items-center gap-2">
                                {navLinks.map((link) => {
                                    const isActive = isActivePath(link.path);
                                    const Icon = link.icon;

                                    return (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            className="relative px-2 py-1 group"
                                        >
                                            <motion.div
                                                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-all ${isActive
                                                        ? 'text-primary'
                                                        : 'text-gray-400 hover:text-white'
                                                    }`}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span className="text-sm font-medium">{link.name}</span>
                                            </motion.div>

                                            {/* Active indicator */}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="navbar-active-pill"
                                                    className="absolute inset-0 bg-primary/10 rounded-lg border border-primary/20"
                                                    initial={false}
                                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                                />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                        {/* Desktop User Menu / Auth Buttons */}
                        <div className="hidden lg:flex items-center gap-3">
                            {user ? (
                                <div className="relative">
                                    <motion.button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                            <User className="w-3.5 h-3.5 text-dark-900" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xs font-medium text-white">{user.username}</div>
                                            <div className="text-[10px] text-gray-500 capitalize">{user.role}</div>
                                        </div>
                                    </motion.button>

                                    {/* User Dropdown Menu */}
                                    <AnimatePresence>
                                        {isUserMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute right-0 mt-2 w-48 glass-panel rounded-xl border border-white/10 shadow-xl overflow-hidden"
                                            >
                                                <div className="p-2">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-danger/10 text-gray-300 hover:text-danger transition-all group"
                                                    >
                                                        <LogOut className="w-4 h-4 group-hover:text-danger transition-colors" />
                                                        <span className="font-medium">Logout</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        to="/login"
                                        className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="relative group px-4 py-1.5 bg-gradient-to-r from-primary to-secondary text-dark-900 text-sm font-bold rounded-lg overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]"
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        <span className="relative">Get Started</span>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <motion.button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6 text-white" />
                            ) : (
                                <Menu className="w-6 h-6 text-white" />
                            )}
                        </motion.button>
                    </div>
                </div >

                {/* Mobile Menu */}
                < AnimatePresence >
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="lg:hidden border-t border-white/10 bg-dark-900/95 backdrop-blur-xl"
                        >
                            <div className="px-4 py-6 space-y-3 max-h-[calc(100vh-5rem)] overflow-y-auto">
                                {/* Mobile Navigation Links */}
                                {navLinks.map((link) => {
                                    const isActive = isActivePath(link.path);
                                    const Icon = link.icon;

                                    return (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                                ? 'bg-primary/10 border border-primary/20 text-primary'
                                                : 'bg-white/5 border border-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="font-medium">{link.name}</span>
                                        </Link>
                                    );
                                })}

                                {/* Mobile User Section */}
                                {user ? (
                                    <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
                                        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                                <User className="w-5 h-5 text-dark-900" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white">{user.username}</div>
                                                <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger hover:bg-danger/20 transition-all"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            <span className="font-medium">Logout</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
                                        <Link
                                            to="/login"
                                            className="block w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-center font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="block w-full px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-center font-bold text-dark-900 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all"
                                        >
                                            Get Started
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )
                    }
                </AnimatePresence >
            </motion.nav >

            {/* Click outside to close user menu */}
            {
                isUserMenuOpen && (
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsUserMenuOpen(false)}
                    />
                )
            }
        </>
    );
};

export default Navbar;
