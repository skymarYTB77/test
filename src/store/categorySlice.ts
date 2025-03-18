import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CategoryState {
  currentCategory: 'Restaurants' | 'Hôtels';
}

const initialState: CategoryState = {
  currentCategory: 'Restaurants'
};

export const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<'Restaurants' | 'Hôtels'>) => {
      state.currentCategory = action.payload;
    }
  }
});

export const { setCategory } = categorySlice.actions;
export default categorySlice.reducer;