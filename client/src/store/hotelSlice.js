import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_URL = `${import.meta.env.VITE_API_URL || ""}/api/hotels`;

export const fetchHotels = createAsyncThunk(
  "hotels/fetchHotels",
  async ({ title, minPrice, maxPrice, limit, offset }, thunkAPI) => {
    try {
      const params = new URLSearchParams();

      if (title) params.set("title", title);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);

      params.set("limit", limit);
      params.set("offset", offset);

      const response = await fetch(`${API_URL}?${params.toString()}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to fetch hotels.");
      }

      return await response.json();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const hotelSlice = createSlice({
  name: "hotels",
  initialState: {
    items: [],
    total: 0,
    loading: false,
    error: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.hotels;
        state.total = action.payload.total;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch hotels.";
      });
  },
});

export default hotelSlice.reducer;
