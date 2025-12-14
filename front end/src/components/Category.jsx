import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Category({ categoryId, title, eventBanners }) {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!eventBanners?.length) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % eventBanners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [eventBanners]);

  const handleViewAll = () => {
    navigate(`/Events?category_id=${categoryId}`);
  };

  return (
    <div className="flex flex-col items-center h-max text-card-foreground bg-card w-100 rounded-3xl">
      <div className="relative w-90 h-50 mt-5 rounded-3xl overflow-hidden">
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${index * 100}%)`,
          }}
        >
          {eventBanners?.map((img, i) => (
            <div
              key={i}
              className="w-full h-full shrink-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
        </div>
      </div>

      <div className="w-full flex justify-center p-2 pt-3">
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>

      <button
        onClick={handleViewAll}
        className="text-primary-foreground bg-primary-hover rounded-lg px-20 py-3 font-semibold my-4"
      >
        View all
      </button>
    </div>
  );
}
