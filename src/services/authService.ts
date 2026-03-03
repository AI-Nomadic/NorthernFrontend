const AUTH_BASE = import.meta.env.VITE_AUTH_API_BASE || 'http://localhost:8090';

interface AuthResponse {
    token: string;
    id: string;
    email: string;
    name: string;
}

/**
 * Register with email + password + name.
 */
export const register = async (
    name: string,
    email: string,
    password: string
): Promise<AuthResponse> => {
    const res = await fetch(`${AUTH_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(err.message || 'Registration failed');
    }

    return res.json();
};

/**
 * Login with email + password.
 */
export const login = async (
    email: string,
    password: string
): Promise<AuthResponse> => {
    const res = await fetch(`${AUTH_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(err.message || 'Invalid email or password');
    }

    return res.json();
};

/**
 * Exchange a Google ID token (from Google Identity Services) for our JWT.
 * @param idToken - the credential string from Google's CredentialResponse
 */
export const googleLogin = async (idToken: string): Promise<AuthResponse> => {
    const res = await fetch(`${AUTH_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Google login failed' }));
        throw new Error(err.message || 'Google login failed');
    }

    return res.json();
};
