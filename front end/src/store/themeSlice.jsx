import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  dark: localStorage.getItem("dark") === "true" || false,
};

const themeSlice = createSlice({
  name: "theme",
  initialState :initialState ,
  reducers: {
    toggleTheme(state) {
      state.dark = !state.dark;
      localStorage.setItem("dark", state.dark.toString());
      // optionally toggle <html> class immediately
      document.documentElement.classList.toggle("dark", state.dark);
    },
    setTheme(state, action) {
      state.dark = action.payload;
      localStorage.setItem("dark", state.dark.toString());
      document.documentElement.classList.toggle("dark", state.dark);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
