import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { Clock } from "lucide-react";

export default function EventPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(
          `http://localhost:8000/event/geteventbyid/${parseInt(id)}/`
        );
        const data = await res.json();
        console.log(data);
        setEvent(data["event"]);
      } catch (err) {
        console.error("Failed to fetch event", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  if (loading) {
    return <p className="text-center mt-10">Loading event...</p>;
  }

  if (!event) {
    return <p className="text-center mt-10">Event not found</p>;
  }

  return (
    <>
      <NavBar />
      <div className="max-w-6xl mx-auto px-6 py-10 translate-y-20 space-y-8">
        {/* BANNER */}
        <img
          className="w-full h-[400px] rounded-3xl bg-cover bg-center"
          style={{ backgroundImage: `url(${event.banner})` }}
          src={event.banner}
        />
        {/* EVENT NAME */}
        <h1 className="text-4xl font-bold">{event.name}</h1>
        {/* ORGANIZER */}
        <p className="text-lg text-muted-foreground">
          Organized by <span className="font-semibold">{event.owner_first_name} {event.owner_last_name}</span>
        </p>
        {/* TIME */}
        <div className="text-lg flex gap-3 items-center">
          <Clock className="text-primary" />
          {event.start_date}
          {event.end_date && ` → ${event.end_date}`}
        </div>
        {/* VENUE */}
        <div className="text-lg">📍 {event.location_name}</div>
        {/* DESCRIPTION */}
        <div>
          <h2 className="text-2xl font-semibold mb-2">About this event</h2>
          <p className="text-muted-foreground leading-relaxed">
            {event.description}
          </p>
        </div>
        {/* TICKETS */}
        {/* <div>
          <h2 className="text-2xl font-semibold mb-4">Tickets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.tickets.map((ticket) => (
              <div key={ticket.id} className="p-4 rounded-xl bg-card shadow">
                <h3 className="text-xl font-semibold">{ticket.type}</h3>
                <p>Price: {ticket.price} EGP</p>
                <p>Available: {ticket.quantity}</p>
              </div>
            ))}
          </div>
        </div> */}
        {/* BUSES (OPTIONAL) */}
        {event.buses?.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Available Buses</h2>
            <ul className="list-disc ml-6">
              {event.buses.map((bus, i) => (
                <li key={i}>
                  From {bus.from} → {bus.to} ({bus.price} EGP)
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* PERFORMERS (OPTIONAL) */}
        {event.performers?.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Performers</h2>
            <div className="flex flex-wrap gap-4">
              {event.performers.map((perf, i) => (
                <div key={i} className="px-4 py-2 rounded-lg bg-secondary">
                  {perf.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer className="translate-y-20" />
    </>
  );
}
