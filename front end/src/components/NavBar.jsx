import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme, setTheme } from "@/store/themeSlice";
import { UserContext } from "@/UserContext";
import { useEffect } from "react";

export default function NavBar() {
  const dark = useSelector((state) => state.theme.dark);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setTheme(dark));
  }, [dark, dispatch]);

  const { user, setUser, loadingUser } = useContext(UserContext);

  async function handleLogout() {
    try {
      await fetch("http://localhost:8000/account/logout/", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  return (
    <div className="z-10 fixed w-full bg-card text-primary items-center flex justify-between p-1">
      <div className="ml-5">
        <h1 className="text-2xl font-bold">E7gezly Event</h1>
      </div>
      <nav className="mx-auto max-w-5xl flex items-center gap-6 py-4">
        <NavBtn link="/" title="Home" />
        <NavBtn link="/Events" title="Events" />
      </nav>
      <nav className="mx-5 max-w-5xl flex items-center gap-6 py-4">
        {!user && <NavBtn link="/login" title="Login" />}
        {!user && <NavBtn link="/signup" title="Sign up" />}
        {user && (
          <NavLink
            to="/login"
            onClick={handleLogout}
            className="text-primary-hover"
          >
            Log out
          </NavLink>
        )}
        {user && (
          <NavLink
            to={user.status == "Organiser" ? "/org" : "/admin"}
            className="bg-primary flex items-center justify-center pt-0.5 text-2xl h-10 w-10 rounded-full text-white hover:bg-primary-hover"
          >
            {`${user?.first_name.charAt(0).toUpperCase()}`}
          </NavLink>
        )}
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
