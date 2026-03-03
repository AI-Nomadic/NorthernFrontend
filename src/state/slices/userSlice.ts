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

// Rehydrate from localStorage on app boot
const savedToken = localStorage.getItem(TOKEN_KEY);

const initialState: UserState = {
    token: savedToken,
    email: null,
    name: null,
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
