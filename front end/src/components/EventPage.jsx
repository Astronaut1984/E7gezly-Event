import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { Clock, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { UserContext } from "@/UserContext";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { DialogClose } from "@radix-ui/react-dialog";
import { Label } from "./ui/label";
import { Spinner } from "./ui/spinner";
import AlertMessage from "./AlertMessage";

export default function EventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(
          `http://localhost:8000/event/geteventbyid/${parseInt(id)}/`
        );
        const data = await res.json();
        console.log(data["event"]);
        setEvent(data["event"]);
      } catch (err) {
        console.error("Failed to fetch event", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  const handleOrganizerClick = () => {
    // Determine the route based on user role
    if (user?.status === "Administrator") {
      navigate(`/admin/user/${event.owner_username}`);
    } else if (user?.status === "Organizer") {
      navigate(`/org/user/${event.owner_username}`);
    } else if (user?.status === "Attendee") {
      navigate(`/att/user/${event.owner_username}`);
    } else {
      // If not logged in, redirect to login or stay on page
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-screen">
        <Spinner />
      </div>
    );
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
        <button
          onClick={handleOrganizerClick}
          className="text-lg text-muted-foreground bg-card max-w-max py-3 px-5 rounded-3xl hover:bg-accent transition-colors cursor-pointer"
        >
          Organized by{" "}
          <span className="font-semibold">
            {event.owner_first_name} {event.owner_last_name}{" "}
          </span>
          <p className="text-foreground-muted">@ {event.owner_username}</p>
        </button>
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
                        <BuyDialog ticket={ticket}>
                          <div
                            disabled={ticket.quantity <= 0}
                            className="w-full hover:cursor-pointer bg-primary-hover text-primary-foreground rounded-full py-1 px-2"
                          >
                            {ticket.quantity <= 0 ? "Sold Out!" : "Buy Now"}
                          </div>
                        </BuyDialog>
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
                <div
                  key={i}
                  className="px-4 py-2 rounded-lg bg-primary text-secondary-foreground"
                >
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

function BuyDialog({ children, className, ticket }) {
  const [discountCode, setDiscountCode] = useState("");
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  async function buyTicket() {
    setLoading(true);
    setAlert(null);

    try {
      const res = await fetch("http://localhost:8000/event/buyticket/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ticket_type_id: ticket.ticket_type_id,
          quantity: 1,
          discount_code: discountCode,
        }),
      });

      const data = await res.json();

      if (data.invalid_code) {
        setAlert(data.invalid_code);
        return;
      }

      if (data.error) {
        setAlert(data.error);
        return;
      }

      if (data.success) {
        setAlert(
          `Success! Purchased ${data.purchase_details.quantity} ticket(s) for ${data.purchase_details.final_price} EGP. Remaining balance: ${data.purchase_details.remaining_wallet_balance} EGP`
        );
      }
    } catch (err) {
      setAlert("An error occurred while purchasing the ticket");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={className}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="caret-transparent">Buy Ticket!</DialogTitle>
        </DialogHeader>
        <p className="caret-transparent">
          {ticket.name} Ticket: EGP {ticket.price}
        </p>
        <Label htmlFor="discountCodeInput">Enter a Discount</Label>
        <Input
          id="discountCodeInput"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          placeholder="Enter Discount Code"
        />
        <AlertMessage alert={alert} onClose={() => setAlert(null)} />
        <DialogFooter>
          <Button className="select-none caret-transparent" onClick={buyTicket}>
            Buy
          </Button>
          <DialogClose asChild>
            <Button className="caret-transparent" variant={"outline"}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}