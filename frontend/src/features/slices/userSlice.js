import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginUser, checkUser, signupUser, logoutUser } from "../api/userApi";

const initialState = {
  userDetails: "",
  status: "idle",
  newNotification: {},
  error: null,
};

export const signupUserAsync = createAsyncThunk(
  "users/signupUserAsync",
  async (userData) => {
    const response = await signupUser(userData);
    console.log(response.data);
    return response.data;
  }
);
export const loginUserAsync = createAsyncThunk(
  "users/loginUserAsync",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await loginUser(userData);
      console.log(response.data);
      return response.data;
    } catch (err) {
      console.log(err);
      return rejectWithValue(err);
    }
  }
);

export const checkUserAsync = createAsyncThunk(
  "users/checkUserAsync",
  async () => {
    const response = await checkUser();
    console.log(response.data);
    return response.data;
  }
);

export const logoutUserAsync = createAsyncThunk(
  "users/signOutUserAsync",
  async () => {
    const response = await logoutUser();
    console.log(response.data);
    return response.data;
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addNotification(state, action) {
      console.log(action);
      if (state.newNotification[action.payload]) {
        state.newNotification[action.payload] =
          state.newNotification[action.payload] + 1;
      } else {
        state.newNotification[action.payload] = 1;
      }
    },
    resetNotification(state, action) {
      if (state.newNotification[action.payload]) {
        delete state.newNotification[action.payload];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupUserAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(signupUserAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.userDetails = action.payload;
      })
      .addCase(loginUserAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUserAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.userDetails = action.payload;
      })
      .addCase(loginUserAsync.rejected, (state, action) => {
        state.status = "idle";
        state.error = "Not Found";
      })
      .addCase(checkUserAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(checkUserAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.userDetails = action.payload;
      })
      .addCase(logoutUserAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(logoutUserAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.userDetails = "";
      });
  },
});

export const selectUserDetails = (state) => state.user.userDetails;
export const { addNotification, resetNotification } = userSlice.actions;
export const selectNotification = (state) => state.user.newNotification;
export const selectError = (state) => state.user.error;
export default userSlice.reducer;
