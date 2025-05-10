import axiosInstance from "@/util/axiosInstance";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { setActiveSpace } from "../spaces/spaceSlice";

export type Folder = {
  name: string;
  parent: string;
  id: string;
  owner_id: string;
};

export type File = {
  name: string;
  parent: string;
  id: string;
  link?: string;
  tags?: string[];
  owner_id: string;
};

type BreadCrumbsProp = {
  name: string;
  id: string;
};

type MusicState = {
  folders: { [key: string]: Folder[] };
  folderOwners: { [key: string]: string };
  loadingFolders: boolean;
  errorFolders: string | null;
  files: { [key: string]: File[] };
  loadingFiles: boolean;
  errorFiles: string | null;
  breadcrumbs: BreadCrumbsProp[];
  loadingBreadCrumbs: boolean;
  errorBreadCrumbs: string | null;
  moveFolder: Folder | null;
  moveFile: File | null;
};

const initialState: MusicState = {
  folders: {},
  folderOwners: {},
  loadingFolders: false,
  errorFolders: null,
  files: {},
  loadingFiles: false,
  errorFiles: null,
  breadcrumbs: [{ name: "Music", id: "root" }],
  loadingBreadCrumbs: false,
  errorBreadCrumbs: null,
  moveFile: null,
  moveFolder: null,
};

export const fetchFolder = createAsyncThunk(
  "music/fetchFolder",
  async (
    { parent_id, space_id }: { parent_id: string; space_id: string },
    { rejectWithValue }
  ) => {
    try {
      const category = "music";
      const response = await axiosInstance.get("/fetch_folders", {
        params: { parent_id, category, space_id },
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || "An error occurred"
        );
      }
      return rejectWithValue("Something went wrong.");
    }
  }
);

export const fetchMusic = createAsyncThunk(
  "brolls/fetchMusic",
  async (
    { parent_id, space_id }: { parent_id: string; space_id: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get("/fetch_music", {
        params: { parent_id, space_id },
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || "An error occurred"
        );
      }
      return rejectWithValue("Something went wrong.");
    }
  }
);

export const fetchBreadCrumbs = createAsyncThunk(
  "music/fetchBreadCrumbs",
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/get_breadcrumbs", {
        params: { id },
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || "An error occurred"
        );
      }
      return rejectWithValue("Something went wrong.");
    }
  }
);

const musicSlice = createSlice({
  name: "music",
  initialState,
  reducers: {
    handleMoveFolder: (
      state,
      action: PayloadAction<{ folder: Folder | null }>
    ) => {
      state.moveFolder = action.payload.folder;
    },
    handleMoveFile: (state, action: PayloadAction<{ file: File | null }>) => {
      state.moveFile = action.payload.file;
    },
    pushFolder: (
      state,
      action: PayloadAction<{ folder: Folder; parent_id: string }>
    ) => {
      state.folders[action.payload.parent_id].push(action.payload.folder);
    },
    popFolder: (
      state,
      action: PayloadAction<{ id: string; parent_id: string }>
    ) => {
      state.folders[action.payload.parent_id] = state.folders[
        action.payload.parent_id
      ].filter((obj) => obj.id !== action.payload.id);
    },
    renameFolder: (
      state,
      action: PayloadAction<{ id: string; name: string; parent_id: string }>
    ) => {
      const { id, name, parent_id } = action.payload;
      const parentFolder = state.folders[parent_id];
      if (!parentFolder) {
        console.error(`Parent folder with ID "${parent_id}" not found.`);
        return;
      }
      const folder = parentFolder.find((obj) => obj.id === id);
      if (folder) {
        folder.name = name;
      } else {
        console.error(
          `Folder with ID "${id}" not found in parent "${parent_id}".`
        );
      }
    },
    pushFile: (
      state,
      action: PayloadAction<{ file: File; parent_id: string }>
    ) => {
      state.files[action.payload.parent_id].push(action.payload.file);
    },
    popFile: (
      state,
      action: PayloadAction<{ id: string; parent_id: string }>
    ) => {
      state.files[action.payload.parent_id] = state.files[
        action.payload.parent_id
      ].filter((obj) => obj.id !== action.payload.id);
    },
    renameFile: (
      state,
      action: PayloadAction<{ id: string; name: string; parent_id: string }>
    ) => {
      const { id, name, parent_id } = action.payload;
      const parentFolder = state.files[parent_id];
      if (!parentFolder) {
        console.error(`Parent file with ID "${parent_id}" not found.`);
        return;
      }
      const file = parentFolder.find((obj) => obj.id === id);
      if (file) {
        file.name = name;
      } else {
        console.error(
          `File with ID "${id}" not found in parent "${parent_id}".`
        );
      }
    },
    changeTags: (
      state,
      action: PayloadAction<{ file: File; tags: string[] }>
    ) => {
      const temp = state.files[action.payload.file.parent];
      const file = temp.find((ele) => ele.id === action.payload.file.id);
      if (file) file.tags = action.payload.tags;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFolder.pending, (state, action) => {
        if (!state.folders[action.meta.arg.parent_id])
          state.loadingFolders = true;
        state.errorFolders = null;
      })
      .addCase(
        fetchFolder.fulfilled,
        (
          state,
          action: PayloadAction<{
            folders: Folder[];
            parent_id: string;
            owner_id: string;
          }>
        ) => {
          state.loadingFolders = false;
          state.folders[action.payload.parent_id] = action.payload.folders;
          state.folderOwners[action.payload.parent_id] =
            action.payload.owner_id;
          state.errorFolders = null;
        }
      )
      .addCase(fetchFolder.rejected, (state, action) => {
        state.loadingFolders = false;
        state.errorFolders =
          (action.payload as string) || "Failed to fetch folders.";
      })
      .addCase(fetchMusic.pending, (state, action) => {
        if (!state.files[action.meta.arg.parent_id]) state.loadingFiles = true;
        state.errorFiles = null;
      })
      .addCase(
        fetchMusic.fulfilled,
        (
          state,
          action: PayloadAction<{ music: File[]; parent_id: string }>
        ) => {
          state.loadingFiles = false;
          state.files[action.payload.parent_id] = action.payload.music;
        }
      )
      .addCase(fetchMusic.rejected, (state, action) => {
        state.loadingFiles = false;
        state.errorFiles =
          (action.payload as string) || "Failed to fetch files.";
      })
      .addCase(fetchBreadCrumbs.pending, (state, action) => {
        state.loadingBreadCrumbs = true;
        state.errorBreadCrumbs = null;
      })
      .addCase(
        fetchBreadCrumbs.fulfilled,
        (state, action: PayloadAction<{ breadcrumbs: BreadCrumbsProp[] }>) => {
          state.loadingBreadCrumbs = false;
          state.breadcrumbs = [
            { name: "Music", id: "root" },
            ...action.payload.breadcrumbs,
          ];
        }
      )
      .addCase(fetchBreadCrumbs.rejected, (state, action) => {
        state.loadingBreadCrumbs = false;
        state.errorBreadCrumbs =
          (action.payload as string) || "Failed to fetch breadcrumbs.";
      })
      .addCase(setActiveSpace, () => {
        return initialState;
      });
  },
});

export const {
  pushFolder,
  popFolder,
  renameFolder,
  popFile,
  pushFile,
  renameFile,
  handleMoveFolder,
  handleMoveFile,
  changeTags,
} = musicSlice.actions;

export default musicSlice.reducer;
