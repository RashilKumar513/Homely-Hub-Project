import { createSlice } from '@reduxjs/toolkit';

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    setWishlist(state, action) {
      state.items = action.payload || [];
    },
    toggleWishlistLocal(state, action) {
      const property = action.payload;
      const existsIndex = state.items.findIndex((item) => item._id === property._id);
      if (existsIndex >= 0) {
        state.items.splice(existsIndex, 1);
      } else {
        state.items.push(property);
      }
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const wishlistActions = wishlistSlice.actions;
export default wishlistSlice;
