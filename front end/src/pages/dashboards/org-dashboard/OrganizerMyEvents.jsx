import Event from "@/components/Event";
import img from "@/assets/image.png";
import { useEffect, useState } from "react";

export default function OrganizerMyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyEvents() {
      setLoading(true);

      const res = await fetch(
        "http://localhost:8000/event/getorganizerevents/",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await res.json();
      console.log(data["organizer_events"]);

      setEvents(data["organizer_events"]);
      setLoading(false);
    }

    fetchMyEvents();
  }, []);

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
              id={event.event_id} 
              adminOrOrgMode={true}
              img={event.banner}
              priceRange={{
                minPrice: event.min_price,
                maxPrice: event.max_price,
                currency: "EGP",
              }}
              startDate={event.start_date}
              endDate={event.end_date}
              />
          )
        })}
      </div>
    </div>
  );
}
