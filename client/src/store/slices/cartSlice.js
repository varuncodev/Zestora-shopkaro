import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], shippingAddress: null },
  reducers: {
    addToCart: (state, { payload }) => {
      const existing = state.items.find(i => i.product === payload.product);
      if (existing) {
        existing.qty = Math.min(existing.qty + (payload.qty || 1), payload.stock);
      } else {
        state.items.push({ ...payload, qty: payload.qty || 1 });
      }
    },
    removeFromCart: (state, { payload }) => {
      state.items = state.items.filter(i => i.product !== payload);
    },
    updateQty: (state, { payload: { product, qty } }) => {
      const item = state.items.find(i => i.product === product);
      if (item) item.qty = qty;
    },
    clearCart:            state => { state.items = []; },
    saveShippingAddress:  (state, { payload }) => { state.shippingAddress = payload; },
  },
});

// Selectors
export const selectCartCount    = state => state.cart.items.reduce((sum, i) => sum + i.qty, 0);
export const selectCartSubtotal = state =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);

export const { addToCart, removeFromCart, updateQty, clearCart, saveShippingAddress } = cartSlice.actions;
export default cartSlice.reducer;
