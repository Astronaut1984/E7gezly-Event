import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

export default function AttendeeTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  async function getTickets() {
    setLoading(true);
    const request = await fetch(
      "http://localhost:8000/attendeeUtils/gettickets",
      {
        credentials: "include",
      }
    );

    const data = await request.json();
    setTickets(data["tickets"]);
    setLoading(false);
  }

  useEffect(() => {
    getTickets();
  }, []);

  if (loading) {
    return (
      <div className="bg-background w-full h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <main className="w-full flex justify-center items-center flex-col">
        <h1 className="text-3xl font-bold mt-5 mb-8">My Tickets</h1>

        {tickets.length === 0 ? (
          <p className="text-gray-500 text-lg">
            You haven't bought any tickets yet.
          </p>
        ) : (
          <div className="w-full max-w-4xl flex flex-col gap-4 px-6">
            {tickets.map((ticket, index) => (
              <Ticket
                key={index}
                ticket_name={ticket.ticket_name}
                ticket_desc={ticket.ticket_desc}
                ticket_quantity={ticket.ticket_quantity}
                event_name={ticket.event_name}
                event_id={ticket.event_id}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function Ticket({
  ticket_name,
  ticket_desc,
  ticket_quantity,
  event_name,
  event_id,
}) {
  return (
      <div className="w-full bg-card shadow rounded-xl p-5 flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">{event_name}</h2>

          <p className="text-sm text-foreground-muted">
            Ticket: <span className="font-medium">{ticket_name}</span>
          </p>

          <p className="text-sm text-foreground-muted">{ticket_desc}</p>

          <p className="text-sm text-foreground-muted">
            Quantity: {ticket_quantity}
          </p>
        </div>
        <NavLink to={`../../Events/${event_id}`} relative="route" className="py-2 px-5 bg-primary-hover rounded-full">
          Go to Event
        </NavLink>
      </div>
  );
}
