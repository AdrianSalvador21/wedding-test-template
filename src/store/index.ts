import { configureStore } from '@reduxjs/toolkit';
import weddingReducer from './slices/weddingSlice';

// Configuración del store
export const store = configureStore({
  reducer: {
    wedding: weddingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar estas action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Tipos para TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hook tipados para usar en componentes
export type AppStore = typeof store;
