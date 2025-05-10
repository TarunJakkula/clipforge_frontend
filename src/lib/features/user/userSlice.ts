import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  uid: string | null;
  email: string;
  is_admin: boolean;
}

const initialState: UserState = {
  uid: null,
  email: "",
  is_admin: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ uid: string; email: string; is_admin: boolean }>
    ) => {
      state.uid = action.payload.uid;
      state.email = action.payload.email;
      state.is_admin = action.payload.is_admin;
    },
  },
});

export const { setUser } = userSlice.actions;

export default userSlice.reducer;
