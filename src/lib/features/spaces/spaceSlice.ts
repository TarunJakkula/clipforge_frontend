import axiosInstance from "@/util/axiosInstance";
import { appEvents } from "@/util/Emitter";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SpaceProps {
  space_id: string;
  color: string;
  name: string;
}

export interface SpaceState {
  spaces: SpaceProps[] | null;
  loading: boolean;
  error: string | null;
  activeSpace: SpaceProps | null;
  showModal: boolean;
}

const initialState: SpaceState = {
  spaces: null,
  loading: false,
  error: null,
  activeSpace: null,
  showModal: true,
};

export const fetchSpaces = createAsyncThunk(
  "space/fetchSpaces",
  async (uid: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/get_spaces`, {
        params: {
          user_id: uid,
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("Something went wrong.");
    }
  }
);

const spaceSlice = createSlice({
  name: "space",
  initialState,
  reducers: {
    setActiveSpace: (state, action) => {
      state.activeSpace = action.payload;
      state.showModal = false;
      appEvents.emit("activeSpaceChanged");
    },
    setModalState: (state, action) => {
      state.showModal = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSpaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSpaces.fulfilled,
        (state, action: PayloadAction<{ spaces: SpaceProps[] }>) => {
          state.loading = false;
          state.spaces = action.payload.spaces;
        }
      )
      .addCase(fetchSpaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActiveSpace, setModalState } = spaceSlice.actions;
export default spaceSlice.reducer;
