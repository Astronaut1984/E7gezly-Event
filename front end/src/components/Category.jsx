import { NavLink } from "react-router-dom";

export default function Category({ title, img }) {
  return (
    <div className="flex flex-col items-center h-max bg-white w-100 rounded-3xl">
      <div
        className="w-90 h-50 bg-black mt-5 rounded-3xl bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${img})`,
        }}
      ></div>
      <div className="w-full flex justify-center p-2 pt-3">
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <NavLink
        to="/Events"
        className="text-white bg-blue-500 rounded-lg px-20 py-3 hover:text-blue-700 font-semibold my-4"
      >
        View all
      </NavLink>
    </div>
  );
}
