import Event from "@/components/Event";
import img from "@/assets/image.png";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../../../UserContext.jsx";

export default function OrganizerMyEvents() {
  const { user, loadingUser } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyEvents() {
      // Wait for user to load first
      if (loadingUser) return;
      
      // If no user is logged in, don't fetch
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
        console.log(data["organizer_events"]);
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

  // Add this handler to remove deleted event from state
  const handleEventDelete = (deletedEventId) => {
    setEvents(events.filter(event => event.event_id !== deletedEventId));
  };

  if (!loading) {
    console.log(events);
  }

  return (
    <div className="w-full flex justify-center flex-col">
      <h1 className="text-3xl font-bold my-10 flex justify-center">
        My Events
      </h1>
      <div className="flex justify-center w-full p-5 gap-10 flex-wrap">
        {!loading && events.length === 0 && (
          <h1 className="text-2xl font-semibold">No Events Found</h1>
        )}
        {!loading && events.map((event) => {
          return (
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
            />
          )
        })}
      </div>
    </div>
  );
}