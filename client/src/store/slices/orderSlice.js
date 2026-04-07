import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export const createOrder = createAsyncThunk('order/create', async (orderData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/orders', orderData);
    return data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchMyOrders = createAsyncThunk('order/fetchMy', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/orders/my');
    return data.orders;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchOrderById = createAsyncThunk('order/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/orders/${id}`);
    return data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [], order: null, loading: false, error: null, success: false,
  },
  reducers: {
    resetOrderState: state => { state.success = false; state.error = null; state.order = null; },
  },
  extraReducers: builder => {
    builder
      .addCase(createOrder.pending,      state => { state.loading = true; state.error = null; })
      .addCase(createOrder.rejected,     (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(createOrder.fulfilled,    (state, { payload }) => { state.loading = false; state.order = payload; state.success = true; })
      .addCase(fetchMyOrders.fulfilled,  (state, { payload }) => { state.orders = payload; })
      .addCase(fetchOrderById.fulfilled, (state, { payload }) => { state.order = payload; });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
