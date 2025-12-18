import Event from "@/components/Event";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../../../UserContext.jsx";

export default function OrganizerMyEvents() {
  const { user, loadingUser } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming"); // "upcoming" or "ended"

  // Fetch organizer events
  useEffect(() => {
    async function fetchMyEvents() {
      if (loadingUser) return;
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:8000/event/getevents/?owner_username=${user.username}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await res.json();
        setEvents(data["organizer_events"] || []);
      } catch (error) {
        console.error("Error fetching organizer events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMyEvents();
  }, [user, loadingUser]);

  // Remove deleted event from state
  const handleEventDelete = (deletedEventId) => {
    setEvents(events.filter((event) => event.event_id !== deletedEventId));
  };

  // Split events into upcoming and ended
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events.filter((event) => {
    const start = new Date(event.start_date);
    start.setHours(0, 0, 0, 0);
    return start >= today;
  });

  const endedEvents = events.filter((event) => {
    const start = new Date(event.start_date);
    start.setHours(0, 0, 0, 0);

    if (event.end_date) {
      const end = new Date(event.end_date);
      end.setHours(0, 0, 0, 0);
      return end <= today;
    } else {
      // One-day event: ended if start date is in the past
      return start < today;
    }
  });

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="text-3xl font-bold my-10">My Events</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-5 py-2 rounded-2xl font-semibold ${
            activeTab === "upcoming"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`px-5 py-2 rounded-2xl font-semibold ${
            activeTab === "ended"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("ended")}
        >
          Ended
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-6 w-full px-5">
        {loading && (
          <div className="w-full flex justify-center py-20">
            <i className="fa-solid fa-spinner fa-spin text-4xl text-primary"></i>
          </div>
        )}

        {!loading &&
          activeTab === "upcoming" &&
          upcomingEvents.length === 0 && (
            <h1 className="text-2xl font-semibold">No Upcoming Events</h1>
          )}

        {!loading &&
          activeTab === "ended" &&
          endedEvents.length === 0 && (
            <h1 className="text-2xl font-semibold">No Ended Events</h1>
          )}

        {!loading &&
          (activeTab === "upcoming" ? upcomingEvents : endedEvents).map(
            (event) => (
              <Event
                key={event.event_id}
                title={event.name}
                eventId={event.event_id}
                adminOrOrgMode={true}
                img={event.banner}
                priceRange={{
                  minPrice: event.min_price,
                  maxPrice: event.max_price,
                  currency: "EGP",
                }}
                startDate={event.start_date}
                endDate={event.end_date}
                onDelete={handleEventDelete}
                ended={activeTab === "ended"}
              />
            )
          )}
      </div>
    </div>
  );
}
