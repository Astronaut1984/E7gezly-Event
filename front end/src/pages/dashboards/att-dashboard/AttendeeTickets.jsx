import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

export default function AttendeeTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming"); // "upcoming" or "ended"

  async function getTickets() {
    setLoading(true);
    try {
      const request = await fetch(
        "http://localhost:8000/attendeeUtils/gettickets",
        {
          credentials: "include",
        }
      );

      const data = await request.json();
      setTickets(data["tickets"] || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
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

  // Today (midnight)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Split tickets
  const upcomingTickets = tickets.filter((ticket) => {
    const start = new Date(ticket.start_date);
    const end = ticket.end_date ? new Date(ticket.end_date) : new Date(ticket.start_date);
    end.setHours(23, 59, 59, 999); // End of day
    return end >= today; // Event still ongoing or upcoming
  });

  const endedTickets = tickets.filter((ticket) => {
    const start = new Date(ticket.start_date);
    const end = ticket.end_date ? new Date(ticket.end_date) : new Date(ticket.start_date);
    end.setHours(23, 59, 59, 999);
    return end < today;
  });

  return (
    <main className="w-full flex justify-center items-center flex-col">
      <h1 className="text-3xl font-bold mt-5 mb-8">My Tickets</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-xl font-semibold ${
            activeTab === "upcoming"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming Tickets ({upcomingTickets.length})
        </button>
        <button
          className={`px-4 py-2 rounded-xl font-semibold ${
            activeTab === "ended"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("ended")}
        >
          Ended Tickets ({endedTickets.length})
        </button>
      </div>

      {/* Ticket List */}
      <div className="w-full max-w-4xl flex flex-col gap-4 px-6">
        {(activeTab === "upcoming" ? upcomingTickets : endedTickets).length === 0 && (
          <p className="text-gray-500 text-lg">
            {activeTab === "upcoming" ? "No upcoming tickets." : "No ended tickets."}
          </p>
        )}

        {(activeTab === "upcoming" ? upcomingTickets : endedTickets).map(
          (ticket, index) => (
            <Ticket
              key={index}
              ticket={ticket}
              ended={activeTab === "ended"}
            />
          )
        )}
      </div>
    </main>
  );
}

function Ticket({ ticket, ended }) {
  const {
    ticket_name,
    ticket_desc,
    ticket_quantity,
    event_name,
    event_id,
  } = ticket;

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

      <div className="flex flex-col gap-2">
        <NavLink
          to={`../../Events/${event_id}`}
          relative="route"
          className="py-2 px-5 bg-primary-hover rounded-full text-center"
        >
          Go to Event
        </NavLink>

        {ended && (
          <>
            <NavLink
              to={`../../Events/${event_id}/feedbacks`}
              relative="route"
              className="py-2 px-5 bg-green-600 hover:bg-green-700 text-white rounded-full text-center"
            >
              Feedbacks
            </NavLink>
            <NavLink
              to={`../../Events/${event_id}/lost-items`}
              relative="route"
              className="py-2 px-5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full text-center"
            >
              Lost Items
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
}
