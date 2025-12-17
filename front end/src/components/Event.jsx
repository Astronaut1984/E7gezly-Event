import { NavLink } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import { Spinner } from "./ui/spinner";

export default function Event({
  title,
  img,
  priceRange,
  startDate,
  endDate,
  allEventsMode,
  adminOrOrgMode,
  eventId,
  onDelete,
  onWishlistRemove,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  useEffect(() => {
    // Only fetch wishlist status for non-admin/org users
    if (!adminOrOrgMode) {
      checkWishlistStatus();
    }
  }, [eventId, adminOrOrgMode]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const checkWishlistStatus = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/attendeeUtils/getwishlistedevents",
        {
          credentials: "include",
        }
      );
      const data = await res.json();

      if (data.success) {
        // Check if this event is in the wishlisted events
        const isInWishlist = data.wishlisted_events.some(
          (event) => event.event_id === eventId
        );
        setIsWishlisted(isInWishlist);
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault(); // Prevent navigation if clicked inside NavLink
    e.stopPropagation();

    setIsTogglingWishlist(true);

    try {
      const res = await fetch(
        "http://localhost:8000/attendeeUtils/togglewishlist",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ event_id: eventId }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setIsWishlisted(data.in_wishlist);

        // If removed and we have the callback, notify parent
        if (!data.in_wishlist && onWishlistRemove) {
          onWishlistRemove(eventId);
        }
      } else {
        alert(data.error || "Failed to update wishlist");
      }
    } catch (error) {
      console.error("Wishlist toggle error:", error);
      alert("An error occurred while updating wishlist");
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const csrftoken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrftoken="))
        ?.split("=")[1];

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
    <div className="flex flex-col items-center h-max text-card-foreground bg-card w-100 shadow-2xl rounded-3xl pb-2">
      <div
        className="w-90 h-50 bg-secondary mt-5 rounded-3xl bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${img})`,
        }}
      ></div>
      <div className="flex justify-between items-center w-full px-5 pt-2">
        <h1 className="text-2xl" title={title}>
          {title.length > 25 ? title.substring(0, 25) + "..." : title}
        </h1>

        {/* Wishlist icon - only show for attendees */}
        {!adminOrOrgMode && (
          <button
            onClick={toggleWishlist}
            disabled={isTogglingWishlist}
            className="ml-2 text-primary-hover transition-colors disabled:opacity-50"
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isTogglingWishlist ? (
              <Spinner />
            ) : (
              <i
                className={`fa-${
                  isWishlisted ? "solid" : "regular"
                } fa-star text-xl`}
              ></i>
            )}
          </button>
        )}
      </div>
      <div className="w-full flex justify-start px-5 pt-2">
        <h1 className="text-l">{`${formatDate(startDate)} ${
          endDate ? `/ ${formatDate(endDate)}` : ""
        }`}</h1>
      </div>
      <div className="w-full flex justify-start px-5 pt-2"></div>
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
          to={`/Events/${eventId}`}
          className="text-primary-foreground bg-primary hover:bg-primary-hover rounded-lg px-20 py-3 font-semibold my-4"
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
          {!allEventsMode && (
            <>
              <NavLink
                to={`/org/editevent/${eventId}`}
                className="text-primary-foreground bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-3 font-semibold transition-colors"
                title="Edit Event"
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </NavLink>

              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-primary-foreground bg-destructive-hover rounded-lg px-4 py-3 font-semibold transition-colors"
                title="Delete Event"
              >
                {isDeleting ? (
                  <i className="fa-solid fa-spinner fa-spin"></i>
                ) : (
                  <i className="fa-solid fa-trash"></i>
                )}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
