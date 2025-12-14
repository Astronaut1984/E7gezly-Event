import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function Event({ 
  title, 
  img, 
  priceRange, 
  venue, 
  startDate, 
  endDate, 
  adminOrOrgMode, 
  eventId,
  onDelete 
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      // Get CSRF token from cookies
      const csrftoken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];

      const res = await fetch("http://localhost:8000/event/deleteevent/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({
          event_id: eventId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("Event deleted successfully!");
        // Call the onDelete callback to update parent state
        if (onDelete) {
          onDelete(eventId);
        }
      } else {
        alert(data.error || "Failed to delete event");
      }
    } catch (error) {
      alert("An error occurred while deleting the event");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-center h-max text-card-foreground bg-card w-100 shadow-2xl rounded-3xl">
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
        <h1 className="text-l">{`${startDate} ${
          endDate ? `/ ${endDate}` : ""
        }`}</h1>
      </div>
      <div className="w-full flex justify-start px-5 pt-2">
        <h1 className="text-l">{venue}</h1>
      </div>
      <div className="w-full flex justify-start px-5 pt-2">
        <i className="mt-[7px] fa-solid fa-money-bill pt-px mr-2 text-primary"></i>
        {priceRange.minPrice != priceRange.maxPrice && (
          <h1 className="text-xl">
            Price range: {priceRange.currency} {priceRange.minPrice} -{" "}
            {priceRange.maxPrice}
          </h1>
        )}
        {priceRange.minPrice == priceRange.maxPrice && (
          <h1 className="text-xl">
            Price: {priceRange.currency} {priceRange.maxPrice}
          </h1>
        )}
      </div>

      {!adminOrOrgMode && (
        <NavLink
          to="/Events"
          className="text-primary-foreground bg-primary-hover rounded-lg px-20 py-3 font-semibold my-4"
        >
          Book Now!
        </NavLink>
      )}

      {adminOrOrgMode && (
        <div className="flex gap-3 my-4">
          <NavLink
            to={`/Events/${eventId}`}
            className="text-primary-foreground bg-primary hover:bg-primary-hover rounded-lg px-8 py-3 font-semibold transition-colors"
          >
            Go to
          </NavLink>

          <button
            onClick={() => alert("Edit functionality coming soon!")}
            className="text-primary-foreground bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-3 font-semibold transition-colors"
            title="Edit Event"
          >
            <i className="fa-solid fa-pen-to-square"></i>
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-primary-foreground bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg px-4 py-3 font-semibold transition-colors"
            title="Delete Event"
          >
            {isDeleting ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <i className="fa-solid fa-trash"></i>
            )}
          </button>
        </div>
      )}
    </div>
  );
}