import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Category({ categoryId, title, eventBanners }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  // Rotate images every 4 seconds
  useEffect(() => {
    if (!eventBanners || eventBanners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % eventBanners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [eventBanners]);

  const handleViewAll = () => {
    navigate(`/Events?category_id=${categoryId}`);
  };

  const currentImage = eventBanners && eventBanners.length > 0 
    ? eventBanners[currentImageIndex] 
    : null;

  return (
    <div className="flex flex-col items-center h-max text-card-foreground bg-card w-100 rounded-3xl">
      <div
        className="w-90 h-50 bg-black mt-5 rounded-3xl bg-cover bg-center bg-no-repeat transition-all duration-500"
        style={{
          backgroundImage: currentImage ? `url(${currentImage})` : 'none',
        }}
      ></div>
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
