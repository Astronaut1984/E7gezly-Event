import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { Clock, MapPin } from "lucide-react";
import { Button } from "./ui/button";

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
        <div className="w-full flex justify-center">
          <img
            className="h-[400px] w-[711px] rounded-3xl bg-cover bg-center"
            style={{ backgroundImage: `url(${event.banner})` }}
            src={event.banner}
          />
        </div>
        {/* EVENT NAME */}
        <h1 className="text-4xl font-bold">{event.name}</h1>
        {/* ORGANIZER */}
        <p className="text-lg text-muted-foreground">
          Organized by{" "}
          <span className="font-semibold">
            {event.owner_first_name} {event.owner_last_name}
          </span>
        </p>
        {/* TIME */}
        <div className="text-lg flex gap-3 items-center">
          <Clock className="text-primary" />
          {event.start_date}
          {event.end_date && ` → ${event.end_date}`}
        </div>
        {/* VENUE */}
        <div className="text-lg flex gap-3 items-center">
          <MapPin className="text-primary" />
          {event.location_name}
        </div>
        {/* DESCRIPTION */}
        <div>
          <h2 className="text-2xl font-semibold mb-2">About this event</h2>
          <p className="text-muted-foreground leading-relaxed">
            {event.description}
          </p>
        </div>
        {/* TICKETS */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Tickets</h2>
          <div className="flex flex-col w-full gap-4">
            {
              <div>
                <div className="flex w-full gap-4">
                  {event.tickets.map((ticket) => (
                    <div
                      key={ticket.ticket_type_id}
                      className="relative flex h-30 w-100 overflow-hidden rounded-xl bg-card"
                    >
                      {/* Left cut-out */}
                      <div className="absolute left-0 top-1/2 h-6 w-6 -translate-y-1/2 -translate-x-1/2 rounded-full bg-background inset-shadow-sm" />

                      {/* Right cut-out */}
                      <div className="absolute right-0 top-1/2 h-6 w-6 -translate-y-1/2 translate-x-1/2 rounded-full bg-background inset-shadow-sm" />

                      {/* Left section */}
                      <div className="flex items-center justify-center flex-col h-full w-2/3 p-4">
                        <h3 className="text-xl font-semibold">{ticket.name}</h3>
                        <p className="mt-1 text-sm">
                          Price: {ticket.price} EGP
                        </p>
                      </div>

                      {/* Divider */}
                      <div className="flex items-center">
                        <div className="h-full border-l border-dashed border-muted-foreground/40" />
                      </div>

                      {/* Right section */}
                      <div className="flex w-32 items-center justify-center p-4">
                        <Button
                          disabled={ticket.quantity <= 0}
                          className="w-full hover:cursor-pointer"
                        >
                          {ticket.quantity <= 0 ? "Sold Out!" : "Buy Now"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }
          </div>
        </div>
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
                  {perf}
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
