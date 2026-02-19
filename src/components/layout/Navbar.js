import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, BookOpen, LayoutDashboard, Info, Shield, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

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

    const isViewer = user?.role === 'Viewer';

    const navLinks = [
        { name: 'About', path: '/about', icon: Info },
        { name: 'Public Diary', path: '/diary/public', icon: BookOpen },
        ...(user ? [
            { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            ...(isViewer ? [] : [{ name: 'Diary', path: '/diary', icon: BookOpen }])
        ] : [])
    ];

    const isActivePath = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }

        if (path === '/diary' || path === '/diary/public') {
            return location.pathname === path;
        }

        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'bg-dark-900/80 backdrop-blur-xl shadow-lg'
                    : 'bg-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-12 md:h-14">
                        {/* Left side - Logo and Navigation */}
                        <div className="flex items-center gap-6">
                            {/* Logo */}
                            <Link
                                to="/"
                                className="flex items-center gap-2 md:gap-3 group"
                            >
                                <div className="relative">
                                    <img
                                        src="/favicon.svg"
                                        alt="TeleTable"
                                        className="w-7 md:w-8 h-7 md:h-8"
                                        loading="eager"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base md:text-lg font-bold text-white tracking-tight">
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
                                            <div
                                                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors duration-200 ${isActive
                                                        ? 'text-primary'
                                                        : 'text-gray-400 hover:text-white'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span className="text-sm font-medium">{link.name}</span>
                                            </div>

                                            {/* Active indicator */}
                                            {isActive && (
                                                <div className="absolute inset-0 bg-primary/10 rounded-lg border border-primary/20" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                        {/* Desktop User Menu / Auth Buttons */}
                        <div className="hidden lg:flex items-center gap-3">
                            <button
                                onClick={toggleTheme}
                                className="flex items-center justify-center w-8 md:w-9 h-8 md:h-9 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-200"
                                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                                title={theme === 'light' ? 'Dark mode' : 'Light mode'}
                            >
                                {theme === 'light' ? (
                                    <Moon className="w-3.5 md:w-4 h-3.5 md:h-4 text-gray-300" />
                                ) : (
                                    <Sun className="w-3.5 md:w-4 h-3.5 md:h-4 text-gray-300" />
                                )}
                            </button>
                            {user ? (
                                <div className="relative">
                                    <button
                                        onMouseDown={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            setIsUserMenuOpen((open) => !open);
                                        }}
                                        className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-200"
                                    >
                                        <div className="w-6 md:w-7 h-6 md:h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                            <User className="w-3 md:w-3.5 h-3 md:h-3.5 text-dark-900" />
                                        </div>
                                        <div className="text-left hidden sm:block">
                                            <div className="text-xs font-medium text-white">{user.name}</div>
                                            <div className="text-[10px] text-gray-500 capitalize">{user.role}</div>
                                        </div>
                                    </button>

                                    {/* User Dropdown Menu */}
                                    {isUserMenuOpen && (
                                        <div
                                            className="absolute right-0 mt-2 w-64 glass-panel rounded-xl border border-white/10 shadow-xl overflow-hidden"
                                            onMouseDown={(event) => event.stopPropagation()}
                                        >
                                            <div className="p-2">
                                                {user.role === 'Admin' && (
                                                    <>
                                                        <Link
                                                            to="/admin"
                                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 text-gray-300 hover:text-primary transition-all group"
                                                        >
                                                            <Shield className="w-4 h-4 group-hover:text-primary transition-colors" />
                                                            <span className="font-medium">Admin</span>
                                                        </Link>

                                                        <a
                                                            href="/admin/dozzle/"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="mt-2 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white transition-all"
                                                        >
                                                            <img src="/dozzle.svg" alt="Dozzle" className="w-5 h-5" />
                                                            <span className="font-medium">Dozzle</span>
                                                        </a>

                                                        <a
                                                            href="http://10.10.31.13:8080/dashboard"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="mt-2 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white transition-all"
                                                        >
                                                            <img src="/uptime.svg" alt="Uptime Kuma" className="w-5 h-5" />
                                                            <span className="font-medium">Uptime Kuma</span>
                                                        </a>
                                                    </>
                                                )}
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-danger/10 text-gray-300 hover:text-danger transition-all group"
                                                >
                                                    <LogOut className="w-4 h-4 group-hover:text-danger transition-colors" />
                                                    <span className="font-medium">Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
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
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-1.5 md:p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-200"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-5 md:w-6 h-5 md:h-6 text-white" />
                            ) : (
                                <Menu className="w-5 md:w-6 h-5 md:h-6 text-white" />
                            )}
                        </button>
                    </div>
                </div >

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden border-t border-white/10 bg-dark-900/95 backdrop-blur-xl">
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

                                <button
                                    onClick={toggleTheme}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all bg-white/5 border border-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                                >
                                    {theme === 'light' ? (
                                        <Moon className="w-5 h-5" />
                                    ) : (
                                        <Sun className="w-5 h-5" />
                                    )}
                                    <span className="font-medium">
                                        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                                    </span>
                                </button>

                                {/* Mobile User Section */}
                                {user ? (
                                    <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
                                        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                                <User className="w-5 h-5 text-dark-900" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white">{user.name}</div>
                                                <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                                            </div>
                                        </div>
                                        {user.role === 'Admin' && (
                                            <Link
                                                to="/admin"
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all"
                                            >
                                                <Shield className="w-5 h-5" />
                                                <span className="font-medium">Admin</span>
                                            </Link>
                                        )}
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
                    </div>
                )}
            </nav>

            {/* Click outside to close user menu */}
            {
                isUserMenuOpen && (
                    <div
                        className="fixed inset-0 z-40"
                        onMouseDown={() => setIsUserMenuOpen(false)}
                    />
                )
            }
        </>
    );
};

export default Navbar;
