import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export const loginUser = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', creds);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:         null,
    accessToken:  null,
    refreshToken: null,
    loading:      false,
    error:        null,
  },
  reducers: {
    logout: state => {
      state.user         = null;
      state.accessToken  = null;
      state.refreshToken = null;
      api.post('/auth/logout').catch(() => {});
    },
    setCredentials: (state, action) => {
      state.accessToken  = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    clearError: state => { state.error = null; },
  },
  extraReducers: builder => {
    const pending  = state => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(loginUser.pending,    pending)
      .addCase(loginUser.rejected,   rejected)
      .addCase(loginUser.fulfilled,  (state, { payload }) => {
        state.loading      = false;
        state.user         = payload.user;
        state.accessToken  = payload.accessToken;
        state.refreshToken = payload.refreshToken;
      })
      .addCase(registerUser.pending,   pending)
      .addCase(registerUser.rejected,  rejected)
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        state.loading      = false;
        state.user         = payload.user;
        state.accessToken  = payload.accessToken;
        state.refreshToken = payload.refreshToken;
      })
      .addCase(fetchMe.fulfilled, (state, { payload }) => { state.user = payload; });
  },
});

export const { logout, setCredentials, clearError } = authSlice.actions;
export default authSlice.reducer;
