import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export const fetchProducts = createAsyncThunk('product/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchProductById = createAsyncThunk('product/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data.product;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const productSlice = createSlice({
  name: 'product',
  initialState: {
    products: [], product: null, total: 0, pages: 1,
    loading: false, error: null, filters: {},
  },
  reducers: {
    setFilters: (state, { payload }) => { state.filters = { ...state.filters, ...payload }; },
    clearFilters: state => { state.filters = {}; },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProducts.pending,     state => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.rejected,    (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(fetchProducts.fulfilled,   (state, { payload }) => {
        state.loading  = false;
        state.products = payload.products;
        state.total    = payload.total;
        state.pages    = payload.pages;
      })
      .addCase(fetchProductById.pending,  state => { state.loading = true; state.product = null; })
      .addCase(fetchProductById.fulfilled,(state, { payload }) => { state.loading = false; state.product = payload; })
      .addCase(fetchProductById.rejected, (state, { payload }) => { state.loading = false; state.error = payload; });
  },
});

export const { setFilters, clearFilters } = productSlice.actions;
export default productSlice.reducer;
