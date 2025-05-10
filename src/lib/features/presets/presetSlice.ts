import type { OptionsProp } from "./PresetTypes";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/util/axiosInstance";
import { setActiveSpace } from "../spaces/spaceSlice";

interface MediaIdsProps {
  insta: string | null;
  youtube: string | null;
  tiktok: string | null;
  x: string | null;
}

export interface PresetProps {
  preset_id: string;
  name: string;
  color: string;
  options: OptionsProp;
  media_ids: MediaIdsProps;
  isOwner: boolean;
}

export interface PresetState {
  presets: PresetProps[] | null;
  loading: boolean;
  error: string | null;
}

export const fetchPresets = createAsyncThunk(
  "preset/fetchPresets",
  async (space_id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/get_presets`, {
        params: {
          space_id,
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

const initialState: PresetState = {
  presets: null,
  loading: false,
  error: null,
};

const presetSlice = createSlice({
  name: "preset",
  initialState,
  reducers: {
    setPresetState: (
      state,
      action: PayloadAction<{
        presetId: string;
        preset: {
          name: string;
          color: string;
          options: OptionsProp;
          mediaIds: MediaIdsProps;
        };
      }>
    ) => {
      const { presetId, preset } = action.payload;
      if (state.presets) {
        const targetSpace = state.presets.find(
          (preset) => preset.preset_id === presetId
        );
        if (targetSpace) {
          targetSpace.color = preset.color as any;
          targetSpace.name = preset.name;
          targetSpace.options = preset.options;
          targetSpace.media_ids = preset.mediaIds;
        }
      }
    },
    deletePresetState: (
      state,
      action: PayloadAction<{
        presetId: string;
      }>
    ) => {
      const { presetId } = action.payload;
      if (state.presets)
        state.presets = state.presets.filter(
          (preset) => preset.preset_id !== presetId
        );
    },
    addNewPreset: (
      state,
      action: PayloadAction<{
        presetId: string;
        preset: {
          name: string;
          color: string;
          options: OptionsProp;
          mediaIds: MediaIdsProps;
          isOwner: boolean;
        };
      }>
    ) => {
      const temp: PresetProps = {
        preset_id: action.payload.presetId,
        name: action.payload.preset.name,
        color: action.payload.preset.color,
        options: action.payload.preset.options as any,
        media_ids: action.payload.preset.mediaIds,
        isOwner: action.payload.preset.isOwner,
      };
      state.presets?.push(temp);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchPresets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPresets.fulfilled,
        (state, action: PayloadAction<{ presets: PresetProps[] }>) => {
          state.loading = false;
          state.presets = action.payload.presets;
        }
      )
      .addCase(fetchPresets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(setActiveSpace, () => {
        return initialState;
      });
  },
});

export const { setPresetState, deletePresetState, addNewPreset } =
  presetSlice.actions;
export default presetSlice.reducer;
