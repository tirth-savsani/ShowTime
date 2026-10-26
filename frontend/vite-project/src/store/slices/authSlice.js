import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authApi from '../../api/auth.api.js';

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authApi.getMe();
      return user;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const user = await authApi.login(credentials);
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
      const user = await authApi.register(payload);
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
      return null;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  user: null,
  status: 'idle', // 'idle' | 'loading' | 'authenticated' | 'guest'
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
        state.status = 'loading';
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'authenticated';
        state.error = null;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.status = 'guest';
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
