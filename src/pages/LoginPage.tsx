import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { useAppDispatch } from '../state';
import { setAuth } from '../state/slices/userSlice';
import { register, login, googleLogin } from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import './login.css';
import loginBg from '../assets/login-bg-purple.png';

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
                theme: 'outline',
                size: 'large',
                width: 330,          // Perfectly optimized for the 380px compact card
                text: 'continue_with',
                shape: 'pill',
                logo_alignment: 'left',
            }
        );
    }, [handleGoogleCredential, tab]); // Re-render button if tab changes to ensure it finds the element

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
        <div className="login-container">
            {/* Immersive Background */}
            <img src={loginBg} alt="Northern Background" className="login-bg-image" />
            <div className="login-overlay" />

            {/* Glassmorphic Content Card */}
            <motion.div 
                className="glass-card"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <header>
                    <h1 className="brand-name">Northern</h1>
                    <p className="brand-tagline">Your AI travel architect</p>
                </header>

                {/* Tab Switcher */}
                <div className="tab-container">
                    <button
                        onClick={() => switchTab('login')}
                        className={`tab-btn ${tab === 'login' ? 'active' : ''}`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => switchTab('register')}
                        className={`tab-btn ${tab === 'register' ? 'active' : ''}`}
                    >
                        Create Account
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={tab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Full Name — register only */}
                            {tab === 'register' && (
                                <div className="input-group">
                                    <label htmlFor="auth-name" className="input-label">Full Name</label>
                                    <input
                                        type="text"
                                        id="auth-name"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="styled-input"
                                        placeholder="Nazmul Hassan"
                                        required
                                    />
                                </div>
                            )}

                            {/* Email */}
                            <div className="input-group">
                                <label htmlFor="auth-email" className="input-label">Email Address</label>
                                <input
                                    type="email"
                                    id="auth-email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="styled-input"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="input-group">
                                <label htmlFor="auth-password" className="input-label">Password</label>
                                <input
                                    type="password"
                                    id="auth-password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="styled-input"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>

                            {/* Confirm Password — register only */}
                            {tab === 'register' && (
                                <div className="input-group">
                                    <label htmlFor="auth-confirm-password" className="input-label">Confirm Password</label>
                                    <input
                                        type="password"
                                        id="auth-confirm-password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="styled-input"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Error message */}
                    {error && (
                        <div className="error-alert">
                            <p className="error-text">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="primary-btn"
                    >
                        {loading
                            ? 'Processing...'
                            : tab === 'login' ? 'Sign In' : 'Create Account'
                        }
                    </button>
                </form>

                {/* Divider */}
                <div className="divider">
                    <div className="divider-line" />
                    <span className="divider-text">or</span>
                    <div className="divider-line" />
                </div>

                {/* Google Sign-In */}
                <div id="google-signin-btn" className="google-btn-wrapper w-full flex justify-center" />

                <p className="footer-text">
                    By continuing, you agree to Northern's Terms of Service.
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
