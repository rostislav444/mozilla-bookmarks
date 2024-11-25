import React, {useEffect, useState} from 'react';
import {UserCircle, X, Loader} from 'lucide-react';
import {useTheme} from "@/App/context/ThemeContext.jsx";

const UserProfile = () => {
    const {colors, classes} = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: ''
    });

    const checkAuth = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/user`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        const handleAuthMessage = (event) => {
            if (event.data.type === 'auth-success') {
                setUser(event.data.user);
                setIsAuthModalOpen(false);
                setIsMenuOpen(false);
                setError(null);
            }
        };

        window.addEventListener('message', handleAuthMessage);
        return () => window.removeEventListener('message', handleAuthMessage);
    }, []);

    const handleInputChange = (e) => {
        setError(null);
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Ошибка аутентификации');

            setUser(data.user);
            setIsAuthModalOpen(false);
            setIsMenuOpen(false);
            setFormData({email: '', password: '', firstName: '', lastName: ''});
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = () => {
        const isExtension = window.location.protocol === 'chrome-extension:' ||
            window.location.protocol === 'moz-extension:';

        if (isExtension) {
            const width = 500;
            const height = 600;
            const left = window.screenX + (window.outerWidth - width) / 2;
            const top = window.screenY + (window.outerHeight - height) / 2;

            window.open(
                `${import.meta.env.VITE_BACKEND_URL}/auth/google?source=extension`,
                'Google Auth',
                `width=${width},height=${height},left=${left},top=${top}`
            );
        } else {
            window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
        }
    };

    const handleLogout = async () => {
        try {
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            setUser(null);
            setIsMenuOpen(false);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-full hover:bg-color3 transition-colors relative`}
            >
                <UserCircle className={`w-6 h-6 ${user ? 'text-green-400' : classes.textSecondary}`}/>
                {user && (
                    <span
                        className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-color2"/>
                )}
            </button>

            {isMenuOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${classes.surface} ${classes.border}`}>
                    <div className="py-1">
                        {user ? (
                            <>
                                <div className={`px-4 py-2 text-sm ${classes.text} border-b ${classes.border}`}>
                                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                                    <div className={`${classes.textSecondary} text-xs mt-1`}>{user.email}</div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full px-4 py-2 text-sm text-red-400 hover:bg-color3 text-left"
                                >
                                    Выйти
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => {
                                    setIsAuthModalOpen(true);
                                    setAuthMode('login');
                                }}
                                className={`block w-full px-4 py-2 text-sm ${classes.text} hover:bg-color3 text-left`}
                            >
                                Войти
                            </button>
                        )}
                    </div>
                </div>
            )}

            {isAuthModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className={`${classes.surface} rounded-lg p-6 w-full max-w-md relative`}>
                        <button
                            onClick={() => setIsAuthModalOpen(false)}
                            className={`absolute right-4 top-4 ${classes.textSecondary} hover:${classes.text}`}
                        >
                            <X className="w-5 h-5"/>
                        </button>

                        <h2 className={`text-xl font-semibold ${classes.text} mb-6`}>
                            {authMode === 'login' ? 'Вход' : 'Регистрация'}
                        </h2>

                        {error && (
                            <div
                                className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {authMode === 'register' && (
                                <>
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="Имя"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className={`w-full p-2 rounded ${classes.background} ${classes.text} border ${classes.border} focus:border-accent focus:outline-none`}
                                        disabled={isLoading}
                                    />
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Фамилия"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className={`w-full p-2 rounded ${classes.background} ${classes.text} border ${classes.border} focus:border-accent focus:outline-none`}
                                        disabled={isLoading}
                                    />
                                </>
                            )}

                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full p-2 rounded ${classes.background} ${classes.text} border ${classes.border} focus:border-accent focus:outline-none`}
                                disabled={isLoading}
                            />

                            <input
                                type="password"
                                name="password"
                                placeholder="Пароль"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={`w-full p-2 rounded ${classes.background} ${classes.text} border ${classes.border} focus:border-accent focus:outline-none`}
                                disabled={isLoading}
                            />

                            <button
                                type="submit"
                                className={`w-full py-2 px-4 ${classes.accentBg} hover:bg-accent/90 text-white rounded transition-colors flex items-center justify-center gap-2`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin"/>
                                        Подождите...
                                    </>
                                ) : (
                                    authMode === 'login' ? 'Войти' : 'Зарегистрироваться'
                                )}
                            </button>
                        </form>

                        <div
                            className={`relative my-6 before:content-[''] before:block before:h-px before:w-full before:${classes.border} 
                            after:content-[''] after:block after:h-px after:w-full after:${classes.border}`}
                        >
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`px-2 ${classes.surface} ${classes.textSecondary}`}>или</span>
                            </div>
                        </div>

                        <button
                            onClick={handleGoogleAuth}
                            className="w-full py-2 px-4 bg-white text-gray-800 rounded flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                            disabled={isLoading}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4"
                                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853"
                                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05"
                                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335"
                                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Войти через Google
                        </button>

                        <div className={`mt-4 text-center text-sm ${classes.textSecondary}`}>
                            {authMode === 'login' ? (
                                <button
                                    onClick={() => setAuthMode('register')}
                                    className={`${classes.accentText} hover:text-accent/90`}
                                    disabled={isLoading}
                                >
                                    Создать аккаунт
                                </button>
                            ) : (
                                <button
                                    onClick={() => setAuthMode('login')}
                                    className={`${classes.accentText} hover:text-accent/90`}
                                    disabled={isLoading}
                                >
                                    Уже есть аккаунт? Войти
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;