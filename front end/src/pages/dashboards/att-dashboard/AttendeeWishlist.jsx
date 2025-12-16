import { useState, useEffect } from "react";
import Event from "@/components/Event";
import { Spinner } from "@/components/ui/spinner";

export default function AttendeeWishlist() {
  const [wishlistedEvents, setWishlistedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlistedEvents();
  }, []);

  const fetchWishlistedEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/attendeeUtils/getwishlistedevents", {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setWishlistedEvents(data.wishlisted_events);
      } else {
        console.error("Failed to fetch wishlisted events:", data.error);
      }
    } catch (error) {
      console.error("Error fetching wishlisted events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistRemove = (eventId) => {
    // Remove the event from the list immediately
    setWishlistedEvents((prev) =>
      prev.filter((event) => event.event_id !== eventId)
    );
  };

  const getPriceRange = (event) => {
    // You'll need to fetch ticket types to get actual prices
    // For now, returning placeholder - you may want to add this to your backend response
    return {
      currency: "EGP",
      minPrice: 0,
      maxPrice: 0,
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <main className="w-full flex justify-center items-center flex-col min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Spinner />
        </div>
      </main>
    );
  }

  return (
    <main className="w-full flex justify-center items-center flex-col">
      <h1 className="text-3xl font-bold mt-5">Wishlisted Events</h1>

      <div className="bg-background w-full h-max text-foreground px-8 py-10">
        {wishlistedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <i className="fa-regular fa-star text-6xl text-muted-foreground mb-4"></i>
            <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
              No wishlisted events yet
            </h2>
            <p className="text-muted-foreground">
              Start adding events to your wishlist to see them here!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistedEvents.map((event) => (
              <Event
                key={event.event_id}
                eventId={event.event_id}
                title={event.name}
                img={event.banner || "/fallback.png"}
                priceRange={getPriceRange(event)}
                startDate={formatDate(event.start_date)}
                endDate={formatDate(event.end_date)}
                adminOrOrgMode={false}
                onWishlistRemove={handleWishlistRemove}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
