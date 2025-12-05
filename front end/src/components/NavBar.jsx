import { Routes, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

export default function NavBar() {
  const HOVER_COLOR = "hover:text-blue-950";
    const [isDark, setIsDark] = useState(() => {
      try {
        const saved = localStorage.getItem("theme");
        if (saved) return saved === "dark";
      } catch (e) {}
      return (
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    });
  const [darkMode, toggleDarkMode] = useState(false);
  const location = useLocation();

  function toggleDark() {
    setIsDark((v) => !v);
    document.documentElement.classList.toggle("dark");
  }
  return (
    <div className="z-10 fixed w-full bg-card text-primary items-center flex justify-between p-1">
      <div className="ml-5">
        <h1 className="text-2xl font-bold">E7gezly Event</h1>
        {/* dark mode toggle icon */}
      </div>
      <nav className="mx-auto max-w-5xl flex items-center gap-6 py-4">
        <NavBtn link="/" title="Home" />
        <NavBtn link="/Events" title="Events" />
      </nav>
      <nav className="mx-5 max-w-5xl flex items-center gap-6 py-4">
        <NavBtn link="/login" title="Login" />
        <NavBtn link="/signup" title="Sign up" />
          <button
            onClick={toggleDark}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <i className={`fa-solid ${isDark ? "fa-sun" : "fa-moon"} text-base`}></i>
          </button>
      </nav>
    </div>
  );

  function NavBtn(props) {
    return (
      <NavLink
        to={props.link}
        className={({ isActive }) =>
          isActive ? "bg-primary px-4 pb-px rounded-md text-white" : "text-primary-hover"
        }
      >
        {props.title}
      </NavLink>
    );
  }
}
