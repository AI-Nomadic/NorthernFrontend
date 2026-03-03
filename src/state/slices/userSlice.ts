import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const TOKEN_KEY = 'northern_auth_token';

interface UserState {
    token: string | null;
    email: string | null;
    name: string | null;
    isAuthenticated: boolean;
}

interface AuthPayload {
    token: string;
    email: string;
    name: string;
}

// Rehydrate from localStorage on app boot.
// Decode the JWT payload (middle segment, base64) to recover email + name
// without needing an extra library — the payload is plain JSON.
const savedToken = localStorage.getItem(TOKEN_KEY);

function decodeJwtPayload(token: string): { email?: string; name?: string } {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return {};
    }
}

const savedPayload = savedToken ? decodeJwtPayload(savedToken) : {};

const initialState: UserState = {
    token: savedToken,
    email: savedPayload.email ?? null,
    name: savedPayload.name ?? null,
    isAuthenticated: !!savedToken,
};


const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setAuth: (state, action: PayloadAction<AuthPayload>) => {
            state.token = action.payload.token;
            state.email = action.payload.email;
            state.name = action.payload.name;
            state.isAuthenticated = true;
            localStorage.setItem(TOKEN_KEY, action.payload.token);
        },
        // Legacy shim — kept so existing code calling setUser still compiles
        setUser: (state, action: PayloadAction<string>) => {
            state.email = action.payload;
        },
        logout: (state) => {
            state.token = null;
            state.email = null;
            state.name = null;
            state.isAuthenticated = false;
            localStorage.removeItem(TOKEN_KEY);
        },
        // Kept for backward compat
        clearUser: (state) => {
            state.email = null;
        },
    },
});

export const { setAuth, setUser, logout, clearUser } = userSlice.actions;
export default userSlice.reducer;
