import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
    const { login, error } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);

    const handleLogin = async () => {
        try {
            setLoading(true);
            await login();
            navigate('/');
        } catch (error) {
            console.error("Failed to login", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LogIn size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                    <p className="text-gray-500 mt-2">Sign in to manage waste records</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r">
                        <div className="flex items-center">
                            <AlertCircle className="text-red-500 mr-2" size={20} />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm group"
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="w-6 h-6"
                    />
                    <span className="font-medium group-hover:text-gray-900">
                        {loading ? 'Signing in...' : 'Sign in with Google (@nr.ac.th)'}
                    </span>
                </button>

                <div className="mt-8 text-center text-xs text-gray-400">
                    <p>Restricted access for authorized personnel only.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
