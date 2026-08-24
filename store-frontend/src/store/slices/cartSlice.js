import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../../services/api';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await cartService.get();
    return data.items;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load cart');
  }
});

export const addToCart = createAsyncThunk('cart/add', async (gameId, { rejectWithValue }) => {
  try {
    const { data } = await cartService.add(gameId);
    return data.items;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add to cart');
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (gameId, { rejectWithValue }) => {
  try {
    const { data } = await cartService.remove(gameId);
    return data.items;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to remove from cart');
  }
});

export const checkout = createAsyncThunk('cart/checkout', async (_, { rejectWithValue }) => {
  try {
    await cartService.checkout();
    return [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Checkout failed');
  }
});

// Local-only add (no auth required, for demo)
export const addToCartLocal = (game) => ({ type: 'cart/addLocal', payload: game });
export const removeFromCartLocal = (gameId) => ({ type: 'cart/removeLocal', payload: gameId });

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    addLocal: (state, { payload }) => {
      if (!state.items.find((i) => i.id === payload.id)) state.items.push(payload);
    },
    removeLocal: (state, { payload }) => {
      state.items = state.items.filter((i) => i.id !== payload);
    },
    clearCart: (state) => { state.items = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, { payload }) => { state.loading = false; state.items = payload; })
      .addCase(fetchCart.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(addToCart.fulfilled, (state, { payload }) => { state.items = payload; })
      .addCase(removeFromCart.fulfilled, (state, { payload }) => { state.items = payload; })
      .addCase(checkout.fulfilled, (state) => { state.items = []; })
      // limpiar carrito cuando el usuario cierra sesión
      .addCase('auth/logout/fulfilled', (state) => { state.items = []; });
  },
});

export const { addLocal, removeLocal, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
