import { createSlice } from "@reduxjs/toolkit";

interface Seller {
  address: string;
  email: string;
  name: string;
  phone_number: string;
  _id: string;
  gst_number: string;
}

// Initialize the initial state as Seller or null
const initialState: Seller | null = null;

// Create the user slice with reducers
const userSlice = createSlice({
  name: 'seller',
  initialState,
  reducers: {
    addSeller: (_state, action) => {
      return action.payload;
    },
    removeSeller: () => {
      return null;
    }
  },
});

// Export the actions
export const { addSeller, removeSeller } = userSlice.actions;

// Export the reducer
export default userSlice.reducer;
