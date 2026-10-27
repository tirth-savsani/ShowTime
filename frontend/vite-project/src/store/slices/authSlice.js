import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authApi from '../../api/auth.api.js';

// Safe localStorage session helpers
const SESSION_KEY = 'showtime_user_session';

const getSavedSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveSession = (user) => {
  try {
    if (user && (user.id || user._id)) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
  } catch {
    // Ignore storage quota / incognito errors
  }
};

const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore
  }
};

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApi.getMe();
      const user = res?.user || res;
      saveSession(user);
      return user;
    } catch (err) {
      // If 401 or user not found, clear stale cached session
      if (err?.status === 401 || err?.status === 403 || err?.status === 404) {
        clearSession();
      }
      return rejectWithValue(err);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await authApi.login(credentials);
      const user = res?.user || res;
      saveSession(user);
      return user;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authApi.register(payload);
      const user = res?.user || res;
      saveSession(user);
      return user;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      clearSession();
      return null;
    } catch (err) {
      clearSession();
      return rejectWithValue(err);
    }
  }
);

const savedUser = getSavedSession();

const initialState = {
  user: savedUser,
  status: savedUser ? 'authenticated' : 'idle', // 'idle' | 'loading' | 'authenticated' | 'guest'
  error: null,
  authModal: {
    open: false,
    mode: 'login', // 'login' | 'register'
  },
  redirectTo: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    openAuthModal: (state, action) => {
      state.authModal.open = true;
      state.authModal.mode = action.payload || 'login';
      state.error = null;
    },
    closeAuthModal: (state) => {
      state.authModal.open = false;
      state.error = null;
    },
    setAuthModalMode: (state, action) => {
      state.authModal.mode = action.payload;
      state.error = null;
    },
    setRedirectTo: (state, action) => {
      state.redirectTo = action.payload;
    },
    clearRedirectTo: (state) => {
      state.redirectTo = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    // Triggered by axios 401 interceptor
    handleUnauthorized: (state) => {
      clearSession();
      state.user = null;
      state.status = 'guest';
      state.authModal.open = true;
      state.authModal.mode = 'login';
    },
  },
  extraReducers: (builder) => {
    // fetchMe
    builder
      .addCase(fetchMe.pending, (state) => {
        // Keep existing saved user while validating session in background
        if (!state.user) {
          state.status = 'loading';
        }
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'authenticated';
        state.error = null;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        // If 401 unauthorized, reset to guest
        if (action.payload?.status === 401 || action.payload?.status === 403 || action.payload?.status === 404) {
          state.user = null;
          state.status = 'guest';
        }
      });

    // login
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'authenticated';
        state.authModal.open = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'guest';
        state.error = action.payload?.message || 'Login failed.';
      });

    // register
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'authenticated';
        state.authModal.open = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'guest';
        state.error = action.payload?.message || 'Registration failed.';
      });

    // logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.status = 'guest';
      state.error = null;
      state.redirectTo = null;
    });
  },
});

export const {
  openAuthModal,
  closeAuthModal,
  setAuthModalMode,
  setRedirectTo,
  clearRedirectTo,
  clearAuthError,
  handleUnauthorized,
} = authSlice.actions;

export default authSlice.reducer;
