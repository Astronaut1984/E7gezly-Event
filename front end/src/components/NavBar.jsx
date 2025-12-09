import { Routes, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme,setTheme } from "@/store/themeSlice";

export default function NavBar() {
  const dispatch = useDispatch();
  dispatch(setTheme(useSelector((state) => state.theme.dark)))
  const dark = useSelector((state) => state.theme.dark);

  const location = useLocation();

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
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <i
            className={`fa-solid ${dark ? "fa-sun" : "fa-moon"} text-base`}
          ></i>
        </button>
      </nav>
    </div>
  );

  function NavBtn(props) {
    return (
      <NavLink
        to={props.link}
        className={({ isActive }) =>
          isActive
            ? "bg-primary px-4 pb-px rounded-md text-white"
            : "text-primary-hover"
        }
      >
        {props.title}
      </NavLink>
    );
  }
}
