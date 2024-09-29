import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the User interface
// interface User {
//   address: string;
//   email: string;
//   name: string;
//   phone_number: string;
//   _id: string;
// }

// Initialize the initial state as User or null
// const initialState: User | null = null;
const initialState= null;

// Create the user slice with reducers
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addUser:(state, action) => {
      return action.payload;
    },
    removeUser: () => {
      return null; // Return null to reset the state
    },
  },
});

// Export the actions
export const { addUser, removeUser } = userSlice.actions;

// Export the reducer
export default userSlice.reducer;
