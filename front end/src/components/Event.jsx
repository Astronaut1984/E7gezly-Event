import { NavLink } from "react-router-dom";

export default function Event({ title, img, priceRange, venue, time }) {
  return (
    <div className="flex flex-col items-center h-max text-card-foreground bg-card w-100 rounded-3xl">
      <div
        className="w-90 h-50 bg-secondary mt-5 rounded-3xl bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${img})`,
        }}
      ></div>
      <div className="flex justify-start w-full px-5 pt-2">
        <h1 className="text-2xl">
          {title.length > 30 ? title.substring(0, 30) + "..." : title}
        </h1>
      </div>
      <div className="w-full flex justify-start px-5 pt-2">
        <h1 className="text-l">{`${time.startDate} ${
          time.endDate ? `- ${time.endDate}` : ""
        } | ${time.time}`}</h1>
      </div>
      <div className="w-full flex justify-start px-5 pt-2">
        <h1 className="text-l">{venue}</h1>
      </div>
      <div className="w-full flex justify-start  px-5 pt-2">
        <i className="mt-[7px] fa-solid fa-money-bill pt-px mr-2 text-primary"></i>
        <h1 className="text-xl">{`Price range: ${priceRange.currency} ${priceRange.minPrice} - ${priceRange.maxPrice}`}</h1>
      </div>
      <NavLink
        to="/Events"
        className="text-primary-foreground bg-primary-hover rounded-lg px-20 py-3 font-semibold my-4"
      >
        Book Now!
      </NavLink>
    </div>
  );
}
