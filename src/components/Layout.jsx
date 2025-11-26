import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, PlusCircle, Users, Menu, X } from 'lucide-react';

const Layout = ({ children }) => {
    const { currentUser, userRole, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const isActive = (path) => location.pathname === path;

    const NavItem = ({ to, icon: Icon, label }) => (
        <Link
            to={to}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isActive(to)
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                }`}
            onClick={() => setIsMobileMenuOpen(false)}
        >
            <Icon size={20} />
            <span>{label}</span>
        </Link>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar */}
            <nav className="bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
                                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">W</span>
                                </div>
                                <span className="text-xl font-bold text-gray-800 hidden sm:block">
                                    Waste Stats @NR
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-4">
                            <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />

                            {currentUser && (
                                <NavItem to="/entry" icon={PlusCircle} label="บันทึกข้อมูล" />
                            )}

                            {userRole === 'admin' && (
                                <NavItem to="/users" icon={Users} label="จัดการผู้ใช้" />
                            )}

                            {currentUser ? (
                                <div className="flex items-center space-x-4 ml-4 border-l pl-4 border-gray-200">
                                    <div className="text-sm text-right hidden lg:block">
                                        <p className="font-medium text-gray-900">{currentUser.displayName}</p>
                                        <p className="text-xs text-gray-500">{currentUser.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors"
                                    >
                                        <LogOut size={20} />
                                        <span className="hidden lg:inline">Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                                >
                                    Login
                                </Link>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="text-gray-600 hover:text-gray-900 focus:outline-none"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 py-2 px-4 space-y-2 shadow-lg">
                        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                        {currentUser && (
                            <NavItem to="/entry" icon={PlusCircle} label="บันทึกข้อมูล" />
                        )}
                        {userRole === 'admin' && (
                            <NavItem to="/users" icon={Users} label="จัดการผู้ใช้" />
                        )}
                        <div className="border-t border-gray-100 pt-2 mt-2">
                            {currentUser ? (
                                <div className="space-y-2">
                                    <div className="px-4 py-2 bg-gray-50 rounded-lg">
                                        <p className="font-medium text-gray-900">{currentUser.displayName}</p>
                                        <p className="text-xs text-gray-500">{currentUser.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        <LogOut size={20} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="block w-full text-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} Waste Management System @NR.ac.th</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
