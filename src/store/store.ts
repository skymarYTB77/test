import { configureStore } from '@reduxjs/toolkit';
import restaurantReducer from './restaurantSlice';
import categoryReducer from './categorySlice';

export const store = configureStore({
  reducer: {
    restaurants: restaurantReducer,
    category: categoryReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;