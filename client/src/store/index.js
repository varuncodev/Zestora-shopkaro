import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

import authReducer    from './slices/authSlice';
import cartReducer    from './slices/cartSlice';
import productReducer from './slices/productSlice';
import orderReducer   from './slices/orderSlice';

const rootReducer = combineReducers({
  auth:    authReducer,
  cart:    cartReducer,
  product: productReducer,
  order:   orderReducer,
});

const persistConfig = {
  key:       'ecommerce',
  storage,
  whitelist: ['auth', 'cart'], // persist auth tokens + cart only
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    }),
});

export const persistor = persistStore(store);
