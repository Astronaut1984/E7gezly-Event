import { Routes, NavLink, useLocation } from "react-router-dom";

export default function NavBar() {
  const HOVER_COLOR = "hover:text-blue-950";
  const location = useLocation();

  return (
    <div className="z-10 fixed w-full bg-gray-50 text-primary items-center flex justify-between p-1">
      <div className="ml-5">
        <h1 className="text-2xl font-bold">E7gezly Event</h1>
      </div>
      <nav className="mx-auto max-w-5xl flex items-center gap-6 py-4">
        <NavBtn link="/" title="Home"/>
        <NavBtn link="/Events" title="Events"/>
      </nav>
      <nav className="mx-5 max-w-5xl flex items-center gap-6 py-4">
        <NavBtn link="/login" title="Login"/>
        <NavBtn link="/signup" title="Sign up"/>
      </nav>
    </div>
  );

  function NavBtn(props) {
    return (
      <NavLink
        to={props.link}
        className={({ isActive }) =>
          isActive ? "bg-primary px-4 pb-px rounded-md text-white" : HOVER_COLOR
        }
      >
        {props.title}
      </NavLink>
    );
  }
}
