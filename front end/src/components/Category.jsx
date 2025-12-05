import { NavLink } from "react-router-dom";

export default function Category({ title, img }) {
  return (
    <div className="flex flex-col items-center h-max text-card-foreground bg-card w-100 rounded-3xl">
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
        className="text-primary-foreground bg-primary-hover rounded-lg px-20 py-3 font-semibold my-4"
      >
        View all
      </NavLink>
    </div>
  );
}
