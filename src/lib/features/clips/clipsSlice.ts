import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/util/axiosInstance";
import { setActiveSpace } from "../spaces/spaceSlice";

export interface clipProps {
  clip_id: string;
  clip_name: string;
  clip_storage_link?: string;
  clip_transcript?: string;
  aspect_ratio: "shortform" | "longform";
}

export interface ClipsProps {
  clips: clipProps[] | null;
  loading: boolean;
  error: string | null;
  longformCount?: number;
  shortformCount?: number;
}

export interface ClipsState {
  noTranscript: ClipsProps;
  noSubClips: ClipsProps;
  allClips: ClipsProps;
  activeTab: 1 | 2 | 3;
}

export const fetchNoTranscriptClips = createAsyncThunk(
  "clips/fetchNoTranscriptClips",
  async (space_id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/get_clips_without_transcript`,
        {
          params: {
            space_id,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("Something went wrong.");
    }
  }
);

export const fetchNoSubClips = createAsyncThunk(
  "clips/fetchNoSubClips",
  async (space_id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/get_clips_with_transcript_without_subclips`,
        {
          params: {
            space_id,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("Something went wrong.");
    }
  }
);

export const fetchAllClips = createAsyncThunk(
  "clips/fetchAllClips",
  async (space_id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/get_all_clips`, {
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

const initialState: ClipsState = {
  noTranscript: {
    clips: null,
    loading: false,
    error: null,
    longformCount: 0,
    shortformCount: 0,
  },
  noSubClips: {
    clips: null,
    loading: false,
    error: null,
    longformCount: 0,
    shortformCount: 0,
  },
  allClips: {
    clips: null,
    loading: false,
    error: null,
  },
  activeTab: 1,
};

const clipsSlice = createSlice({
  name: "clips",
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<{ tab: 1 | 2 | 3 }>) => {
      state.activeTab = action.payload.tab;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNoTranscriptClips.pending, (state) => {
        state.noTranscript.loading = true;
        state.noTranscript.error = null;
      })
      .addCase(
        fetchNoTranscriptClips.fulfilled,
        (state, action: PayloadAction<{ data: clipProps[] }>) => {
          let lfcount = 0,
            sfcount = 0;
          action.payload.data.forEach((obj) => {
            if (obj.aspect_ratio === "longform") lfcount++;
            if (obj.aspect_ratio === "shortform") sfcount++;
          });
          state.noTranscript.longformCount = lfcount;
          state.noTranscript.shortformCount = sfcount;
          state.noTranscript.loading = false;
          state.noTranscript.clips = action.payload.data;
        }
      )
      .addCase(fetchNoTranscriptClips.rejected, (state, action) => {
        state.noTranscript.loading = false;
        state.noTranscript.error = action.payload as string;
      })
      .addCase(fetchNoSubClips.pending, (state) => {
        state.noSubClips.loading = true;
        state.noSubClips.error = null;
      })
      .addCase(
        fetchNoSubClips.fulfilled,
        (state, action: PayloadAction<{ data: clipProps[] }>) => {
          let lfcount = 0,
            sfcount = 0;
          action.payload.data.forEach((obj) => {
            if (obj.aspect_ratio === "longform") lfcount++;
            if (obj.aspect_ratio === "shortform") sfcount++;
          });
          state.noSubClips.longformCount = lfcount;
          state.noSubClips.shortformCount = sfcount;
          state.noSubClips.loading = false;
          state.noSubClips.clips = action.payload.data;
        }
      )
      .addCase(fetchNoSubClips.rejected, (state, action) => {
        state.noSubClips.loading = false;
        state.noSubClips.error = action.payload as string;
      })
      .addCase(fetchAllClips.pending, (state) => {
        state.allClips.loading = true;
        state.allClips.error = null;
      })
      .addCase(
        fetchAllClips.fulfilled,
        (state, action: PayloadAction<{ clips_info: clipProps[] }>) => {
          state.allClips.loading = false;
          state.allClips.clips = action.payload.clips_info;
        }
      )
      .addCase(fetchAllClips.rejected, (state, action) => {
        state.allClips.loading = false;
        state.allClips.error = action.payload as string;
      })
      .addCase(setActiveSpace, () => {
        return initialState;
      });
  },
});

export const { setActiveTab } = clipsSlice.actions;
export default clipsSlice.reducer;
