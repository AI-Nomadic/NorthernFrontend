import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { useAppDispatch } from '../state';
import { setAuth } from '../state/slices/userSlice';
import { register, login, googleLogin } from '../services/authService';

// Tell TypeScript about the Google Identity Services global
declare const google: any;

type Tab = 'login' | 'register';

const LoginPage: React.FC = () => {
    const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

    // Already logged in → send straight to gallery
    if (isAuthenticated) return <Navigate to="/gallery" replace />;

    const [tab, setTab] = useState<Tab>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // ─── Google Identity Services initialisation ───────────────
    const handleGoogleCredential = useCallback(async (credentialResponse: any) => {
        setError('');
        setLoading(true);
        try {
            const data = await googleLogin(credentialResponse.credential);
            dispatch(setAuth({ token: data.token, email: data.email, name: data.name }));
            navigate('/gallery');
        } catch (err: any) {
            setError(err.message || 'Google sign-in failed');
        } finally {
            setLoading(false);
        }
    }, [dispatch, navigate]);

    useEffect(() => {
        const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!googleClientId || typeof google === 'undefined') return;

        google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredential,
        });

        google.accounts.id.renderButton(
            document.getElementById('google-signin-btn'),
            {
                theme: 'filled_black',
                size: 'large',
                width: 400,          // must be a number in pixels, not a %
                text: 'continue_with',
                shape: 'rectangular',
            }
        );
    }, [handleGoogleCredential]);

    // ─── Email/password submit ─────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (tab === 'register') {
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }
            if (name.trim().length < 2) {
                setError('Name must be at least 2 characters');
                return;
            }
        }

        setLoading(true);
        try {
            const data = tab === 'login'
                ? await login(email, password)
                : await register(name, email, password);

            dispatch(setAuth({ token: data.token, email: data.email, name: data.name }));
            navigate('/gallery');
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const switchTab = (t: Tab) => {
        setTab(t);
        setError('');
        setName('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-neutral-100 px-4">
            <div className="w-full max-w-md">

                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-amber-500 tracking-tight">Northern</h1>
                    <p className="text-neutral-400 mt-1 text-sm">Your AI travel architect</p>
                </div>

                {/* Card */}
                <div className="bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-800 overflow-hidden">

                    {/* Tabs */}
                    <div className="flex border-b border-neutral-800">
                        <button
                            onClick={() => switchTab('login')}
                            className={`flex-1 py-3.5 text-sm font-semibold transition-colors duration-200 ${tab === 'login'
                                ? 'text-amber-500 border-b-2 border-amber-500 bg-neutral-900'
                                : 'text-neutral-400 hover:text-neutral-200 bg-neutral-950'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => switchTab('register')}
                            className={`flex-1 py-3.5 text-sm font-semibold transition-colors duration-200 ${tab === 'register'
                                ? 'text-amber-500 border-b-2 border-amber-500 bg-neutral-900'
                                : 'text-neutral-400 hover:text-neutral-200 bg-neutral-950'
                                }`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Name — register only */}
                            {tab === 'register' && (
                                <div>
                                    <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="auth-name"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-neutral-100 placeholder-neutral-500 transition"
                                        placeholder="Nazmul Hassan"
                                        required
                                    />
                                </div>
                            )}

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="auth-email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-neutral-100 placeholder-neutral-500 transition"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="auth-password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-neutral-100 placeholder-neutral-500 transition"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>

                            {/* Confirm Password — register only */}
                            {tab === 'register' && (
                                <div>
                                    <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        id="auth-confirm-password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-neutral-100 placeholder-neutral-500 transition"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            )}

                            {/* Error message */}
                            {error && (
                                <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-2.5">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 mt-2"
                            >
                                {loading
                                    ? 'Please wait...'
                                    : tab === 'login' ? 'Sign In' : 'Create Account'
                                }
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-6">
                            <div className="flex-1 h-px bg-neutral-700" />
                            <span className="text-neutral-500 text-xs font-medium">or</span>
                            <div className="flex-1 h-px bg-neutral-700" />
                        </div>

                        {/* Google Sign-In Button (rendered by Google SDK) */}
                        <div id="google-signin-btn" className="w-full flex justify-center" />
                    </div>
                </div>

                <p className="text-center text-neutral-600 text-xs mt-6">
                    By continuing, you agree to Northern's Terms of Service.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
