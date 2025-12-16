import { createSlice } from "@reduxjs/toolkit";

const colorThemes = ['blue', 'rose'];

const getInitialState = () => {
  const dark = localStorage.getItem("dark") === "true" || false;
  const colorTheme = localStorage.getItem("colorTheme");
  const initialColorTheme = colorThemes.includes(colorTheme) ? colorTheme : 'blue';

  // Set classes on root element
  document.documentElement.classList.toggle("dark", dark);
  colorThemes.forEach(theme => {
    document.documentElement.classList.remove(theme);
  });
  if (initialColorTheme !== 'blue') {
    document.documentElement.classList.add(initialColorTheme);
  }

  return {
    dark,
    colorTheme: initialColorTheme,
  };
};

const themeSlice = createSlice({
  name: "theme",
  initialState: getInitialState(),
  reducers: {
    toggleTheme(state) {
      state.dark = !state.dark;
      localStorage.setItem("dark", state.dark.toString());
      document.documentElement.classList.toggle("dark", state.dark);
    },
    cycleColorThemes(state) {
      const currentIndex = colorThemes.indexOf(state.colorTheme);
      const nextIndex = (currentIndex + 1) % colorThemes.length;
      state.colorTheme = colorThemes[nextIndex];
      localStorage.setItem("colorTheme", state.colorTheme);

      colorThemes.forEach(theme => {
        document.documentElement.classList.remove(theme);
      });
      if (state.colorTheme !== 'blue') {
        document.documentElement.classList.add(state.colorTheme);
      }
    },
    setColorTheme(state, action) {
      if (colorThemes.includes(action.payload)) {
        state.colorTheme = action.payload;
        localStorage.setItem("colorTheme", state.colorTheme);
        
        colorThemes.forEach(theme => {
            document.documentElement.classList.remove(theme);
        });
        if (state.colorTheme !== 'blue') {
            document.documentElement.classList.add(state.colorTheme);
        }
      }
    },
  },
});

export const { toggleTheme, cycleColorThemes, setColorTheme } = themeSlice.actions;
export default themeSlice.reducer;
