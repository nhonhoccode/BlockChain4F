import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
// Import other reducers as they are implemented
// import documentReducer from './slices/documentSlice';
// import requestReducer from './slices/requestSlice';

// Configuration for redux-persist
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only auth will be persisted
};

const rootReducer = combineReducers({
  auth: authReducer,
  // Add other reducers as they are implemented
  // documents: documentReducer,
  // requests: requestReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
});

export const persistor = persistStore(store);
