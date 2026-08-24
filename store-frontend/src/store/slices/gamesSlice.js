import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { gamesService } from '../../services/api';

export const fetchTrending = createAsyncThunk('games/trending', async (_, { rejectWithValue }) => {
  try { const { data } = await gamesService.getTrending(); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchCategories = createAsyncThunk('games/categories', async (_, { rejectWithValue }) => {
  try { const { data } = await gamesService.getCategories(); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchGameById = createAsyncThunk('games/byId', async (id, { rejectWithValue }) => {
  try { const { data } = await gamesService.getById(id); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const gamesSlice = createSlice({
  name: 'games',
  initialState: { trending: [], categories: [], currentGame: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrending.pending, (state) => { state.loading = true; })
      .addCase(fetchTrending.fulfilled, (state, { payload }) => { state.loading = false; state.trending = payload; })
      .addCase(fetchTrending.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(fetchCategories.fulfilled, (state, { payload }) => { state.categories = payload; })
      .addCase(fetchGameById.pending, (state) => { state.loading = true; state.currentGame = null; })
      .addCase(fetchGameById.fulfilled, (state, { payload }) => { state.loading = false; state.currentGame = payload; })
      .addCase(fetchGameById.rejected, (state, { payload }) => { state.loading = false; state.error = payload; });
  },
});

export default gamesSlice.reducer;
