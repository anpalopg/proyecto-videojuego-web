import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/api';

// ── Mock users (frontend-only, works without backend) ─────────────────────────
const MOCK_USERS = {
  'admin123': { username: 'admin123', email: 'admin@gamestore.com', role: 'admin', token: 'mock-token-admin' },
};
const MOCK_PASSWORDS = {
  'admin123': 'contraseña123',
};

function mockLogin(identifier, password) {
  // match by username or email
  const user = MOCK_USERS[identifier]
    || Object.values(MOCK_USERS).find(u => u.email === identifier);
  if (!user) return null;
  const key = user.username;
  if (MOCK_PASSWORDS[key] !== password) return null;
  return user;
}

const storedUser = (() => {
  try { return JSON.parse(localStorage.getItem('store_user') || 'null'); } catch { return null; }
})();

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  // Try mock users first
  const mock = mockLogin(credentials.email, credentials.password);
  if (mock) {
    const { token, ...user } = mock;
    localStorage.setItem('store_token', token);
    localStorage.setItem('store_user', JSON.stringify(user));
    return user;
  }
  // Fall through to real API
  try {
    const { data } = await authService.login(credentials);
    const token = data.accessToken || data.token;
    localStorage.setItem('store_token', token);
    localStorage.setItem('store_user', JSON.stringify(data.user));
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || err.response?.data?.message || 'Usuario o contraseña incorrectos');
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  // Block registering a mock username
  if (MOCK_USERS[payload.username]) {
    return rejectWithValue('Ese nombre de usuario ya está en uso');
  }
  try {
    const { data } = await authService.register(payload);
    const token = data.accessToken || data.token;
    localStorage.setItem('store_token', token);
    localStorage.setItem('store_user', JSON.stringify(data.user));
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || err.response?.data?.message || 'Error al registrar');
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try { await authService.logout(); } catch (_) {}
  localStorage.removeItem('store_token');
  localStorage.removeItem('store_user');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending,     (state)          => { state.loading = true;  state.error = null; })
      .addCase(login.fulfilled,   (state, { payload }) => { state.loading = false; state.user = payload; })
      .addCase(login.rejected,    (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(register.pending,  (state)          => { state.loading = true;  state.error = null; })
      .addCase(register.fulfilled,(state, { payload }) => { state.loading = false; state.user = payload; })
      .addCase(register.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(logout.fulfilled,  (state)          => { state.user = null; });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
