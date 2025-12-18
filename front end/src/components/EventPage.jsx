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
  const { user, setUser } = useContext(UserContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("feedbacks");

  const [feedbacks, setFeedbacks] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [Buses, setBuses] = useState([]);

  const [myFeedback, setMyFeedback] = useState("");
  const [myRating, setMyRating] = useState(0);
  const [feedbackAlert, setFeedbackAlert] = useState(null);

  const [newLostItem, setNewLostItem] = useState("");
  const [lostItemAlert, setLostItemAlert] = useState(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(
          `http://localhost:8000/event/geteventbyid/${parseInt(id)}/`
        );
        const data = await res.json();
        console.log(data["event"]);
        setEvent(data["event"]);
        setFeedbacks(data["event"].feedbacks || []);
        setLostItems(data["event"].lost_items || []);
        setBuses(data["event"].buses || []);
      } catch (err) {
        console.error("Failed to fetch event", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  const handleOrganizerClick = () => {
    if (user?.status === "Administrator") {
      navigate(`/admin/user/${event.owner_username}`);
    } else if (user?.status === "Organizer") {
      navigate(`/org/user/${event.owner_username}`);
    } else if (user?.status === "Attendee") {
      navigate(`/att/user/${event.owner_username}`);
    } else {
      navigate("/login");
    }
  };

  const isEventEnded = () => {
    if (!event) return false;
    const today = new Date();
    const end = event.end_date
      ? new Date(event.end_date)
      : new Date(event.start_date);
    end.setHours(23, 59, 59, 999);
    return end < today;
  };

  const submitFeedback = async () => {
    if (!myFeedback || myRating === 0) {
      setFeedbackAlert("Please provide both feedback and rating.");
      return;
    }
    try {
      const res = await fetch("http://localhost:8000/event/addfeedback/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          event_id: event.event_id,
          feedback: myFeedback,
          rating: myRating,
        }),
      });
      const data = await res.json();
      if (data.message) {
        setFeedbackAlert("Feedback submitted successfully!");
        setFeedbacks([
          ...feedbacks,
          { content: myFeedback, rating: myRating, attendee: user.username },
        ]);
        setMyFeedback("");
        setMyRating(0);
      } else {
        setFeedbackAlert(data.error || "Failed to submit feedback.");
      }
    } catch (err) {
      console.error(err);
      setFeedbackAlert("An error occurred while submitting the feedback.");
    }
  };

  const markItemFound = async (itemId) => {
    try {
      const res = await fetch("http://localhost:8000/event/updatelostitem/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lost_id: itemId }),
      });
      const data = await res.json();
      if (data.message) {
        setLostItems(
          lostItems.map((item) =>
            item.lost_id === itemId ? { ...item, status: "Found" } : item
          )
        );
      } else {
        setLostItemAlert(data.error || "Failed to mark item as found.");
      }
    } catch (err) {
      console.error(err);
      setLostItemAlert("An error occurred while marking item as found.");
    }
  };

  const addLostItem = async () => {
    if (!newLostItem) {
      setLostItemAlert("Please enter a description.");
      return;
    }
    try {
      const res = await fetch("http://localhost:8000/event/addlostitem/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          event_id: event.event_id,
          description: newLostItem,
        }),
      });

      const data = await res.json();
      if (data.message) {
        console.log(data);
        setLostItems([...lostItems, data["lostitem"]]);
        setNewLostItem("");
        setLostItemAlert("Lost item added successfully!");
      } else {
        setLostItemAlert(data.error || "Failed to add lost item.");
      }
    } catch (err) {
      console.error(err);
      setLostItemAlert("An error occurred while adding the lost item.");
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
      <div className="max-w-6xl mx-auto px-6 py-10 caret-transparent translate-y-20 space-y-8">
        {/* BANNER */}
        <div className="w-full flex justify-center">
          <img
            className="h-[400px] caret-transparent w-[711px] rounded-3xl bg-cover bg-center"
            style={{ backgroundImage: `url(${event.banner})` }}
            src={event.banner}
          />
        </div>

        {/* EVENT NAME */}
        <h1 className="text-4xl font-bold">{event.name}</h1>

        {/* ORGANIZER */}
        <div className="flex gap-5">
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
          {user.status == "Attendee" && (
            <ReportDialog owner_username={event.owner_username}>
              <div className="bg-destructive hover:bg-destructive-hover text-primary-foreground rounded-2xl px-4 py-1">
                Report
              </div>
            </ReportDialog>
          )}
        </div>

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

        {/* Conditional Booking Sections */}
        {!isEventEnded() && user && user.status == "Attendee" && (
          <>
            {/* TICKETS */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Tickets</h2>
              <div className="flex w-full gap-4 flex-col">
                <>
                  <div className="flex w-full gap-4 flex-wrap justify-center">
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
                          <h3 className="text-xl font-semibold">
                            {ticket.name}
                          </h3>
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
                          <BuyDialog ticket={ticket} onPurchase={setUser}>
                            <div
                              disabled={ticket.quantity <= 0}
                              className="w-full hover:cursor-pointer bg-primary text-primary-foreground rounded-lg py-1 px-2"
                            >
                              {ticket.quantity <= 0 ? "Sold Out!" : "Buy Now"}
                            </div>
                          </BuyDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              </div>
            </div>

            {/* BUSES */}
            {Buses?.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Available Buses</h2>
                <ul className="list-disc ml-6">
                  {Buses.map((bus, i) => (
                    <li key={i}>
                      Departs From: {bus.departure_loc}, Available Seats:{" "}
                      {bus.capacity - bus.number_assigned}
                      <BookBusDialog
                        bus={bus}
                        event_id={event.event_id}
                        event_loc={event.location_name}
                        onUpdate={setBuses}
                      >
                        <button
                          disabled={bus.capacity === bus.number_assigned}
                          className="ml-5 px-3 py-1 rounded-2xl bg-primary"
                        >
                          Book Now
                        </button>
                      </BookBusDialog>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* PERFORMERS */}
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
          </>
        )}

        {/* Feedbacks / Lost Items Tabs */}
        {isEventEnded() && (
          <div className="mt-10">
            <div className="flex gap-4 mb-6">
              <button
                className={`px-4 py-2 rounded-xl font-semibold ${
                  activeTab === "feedbacks"
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setActiveTab("feedbacks")}
              >
                Feedback ({feedbacks.length})
              </button>
              <button
                className={`px-4 py-2 rounded-xl font-semibold ${
                  activeTab === "lostItems"
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setActiveTab("lostItems")}
              >
                Lost Items ({lostItems.length})
              </button>
            </div>

            {/* Tab content */}
            {activeTab === "feedbacks" && (
              <div className="flex flex-col gap-4">
                {feedbacks.length === 0 && <p>No feedbacks yet.</p>}
                {feedbacks.map((f) => (
                  <div key={f.feedback_id} className="p-3 bg-card rounded-lg">
                    <p className="font-semibold">{f.attendee}</p>
                    <p>{f.content}</p>
                    <p>
                      Rating:{" "}
                      <span className="text-yellow-400">
                        {"★".repeat(f.rating)}
                        {"☆".repeat(5 - f.rating)}
                      </span>
                    </p>
                  </div>
                ))}

                {user?.status === "Attendee" && (
                  <div className="mt-4 p-4 bg-card rounded-lg flex flex-col gap-3">
                    <Label htmlFor="myFeedback">Write your feedback</Label>
                    <Input
                      id="myFeedback"
                      value={myFeedback}
                      onChange={(e) => setMyFeedback(e.target.value)}
                      placeholder="Your feedback"
                    />
                    <div className="flex gap-2 items-center">
                      <span>Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`cursor-pointer text-xl ${
                            myRating >= star
                              ? "text-yellow-400"
                              : "text-gray-400"
                          }`}
                          onClick={() => setMyRating(star)}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <Button onClick={submitFeedback}>Submit Feedback</Button>
                    {feedbackAlert && (
                      <AlertMessage
                        alert={feedbackAlert}
                        onClose={() => setFeedbackAlert(null)}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "lostItems" && (
              <div className="flex flex-wrap gap-4">
                {lostItems.length === 0 && (
                  <p className="w-full text-sm text-gray-500">
                    No lost items reported.
                  </p>
                )}

                {lostItems.map((item) => {
                  const isFound = item?.status === "Found";

                  return (
                    <div
                      key={item?.lost_id}
                      className={`flex flex-col justify-between p-3 rounded-lg text-sm max-w-xs w-full
            ${
              isFound
                ? "bg-muted border border-green-400/40 opacity-80"
                : "bg-card shadow-sm"
            }`}
                    >
                      <div className="flex flex-col gap-1">
                        <p
                          className={`font-medium ${
                            isFound ? "line-through text-gray-500" : ""
                          }`}
                        >
                          {item?.description}
                        </p>

                        {isFound ? (
                          <span className="text-xs text-green-600 font-semibold">
                            ✔ Item Found
                          </span>
                        ) : (
                          user?.status !== "Organizer" && (
                            <p className="text-xs text-gray-500">
                              If this is your item, please contact the organizer
                              via chat.
                            </p>
                          )
                        )}
                      </div>

                      {!isFound && user?.status === "Organizer" && (
                        <Button
                          className="bg-green-500 hover:bg-green-600 px-2 py-1 text-xs mt-2"
                          onClick={() => markItemFound(item.lost_id)}
                        >
                          Mark Found
                        </Button>
                      )}
                    </div>
                  );
                })}

                {/* Organizer Add Lost Item */}
                {user?.status === "Organizer" && (
                  <div className="w-full flex gap-2 items-center mt-4">
                    <Input
                      value={newLostItem}
                      onChange={(e) => setNewLostItem(e.target.value)}
                      placeholder="Add a lost item description"
                      className="flex-1 p-2 text-sm"
                    />
                    <Button className="px-4 py-2 text-sm" onClick={addLostItem}>
                      Add
                    </Button>
                  </div>
                )}

                {/* Alert for adding lost item */}
                {lostItemAlert && (
                  <AlertMessage
                    alert={lostItemAlert}
                    onClose={() => setLostItemAlert(null)}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer className="translate-y-20" />
    </>
  );
}

function BuyDialog({ children, className, ticket, onPurchase }) {
  const [discountCode, setDiscountCode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
          quantity: quantity,
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
        if (data.error == "Not authenticated") {
          navigate("../../login");
        }
        return;
      }

      if (data.success) {
        setAlert(
          `Success! Purchased ${data.purchase_details.quantity} ticket(s) for ${data.purchase_details.final_price} EGP. Remaining balance: ${data.purchase_details.remaining_wallet_balance} EGP`
        );
        onPurchase((prevUser) => ({
          ...prevUser,
          wallet: data.purchase_details.remaining_wallet_balance,
        }));
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
        <div className="flex flex-col gap-5">
          <Label htmlFor="discountCodeInput">Enter a Discount</Label>
          <Input
            id="discountCodeInput"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder="Enter Discount Code"
          />
          <Label htmlFor="quantityInput">How Many Tickets ?</Label>
          <Input
            id="quantityInput"
            value={quantity}
            type="number"
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter Quantity"
          />
        </div>
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

function ReportDialog({ className, children, owner_username }) {
  const [open, setOpen] = useState(false);
  const [reportVal, setReportVal] = useState("");
  const [alert, setAlert] = useState(null);

  async function reportOrg() {
    try {
      const request = await fetch(
        "http://localhost:8000/attendeeUtils/reportorg",
        {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({
            organizer: owner_username,
            report_content: reportVal,
          }),
        }
      );

      const data = await request.json();
      if (data.error) {
        setAlert(data.error);
        return;
      }
      if (data.success) {
        setAlert(data.success);
        return;
      }
    } catch (err) {
      setAlert(err);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={className}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="caret-transparent">
            Report {owner_username}?
          </DialogTitle>
        </DialogHeader>
        <p className="caret-transparent"></p>
        <div className="flex flex-col gap-5">
          <Label htmlFor="reportInput">Enter Your Reason</Label>
          <Input
            id="reportInput"
            value={reportVal}
            onChange={(e) => setReportVal(e.target.value)}
            placeholder="Justify your reason"
          />
        </div>
        <DialogFooter>
          <Button
            className="select-none caret-transparent bg-destructive hover:bg-destructive-hover cursor-pointer"
            onClick={reportOrg}
          >
            Report
          </Button>
          <DialogClose asChild>
            <Button
              className="caret-transparent cursor-pointer"
              variant={"outline"}
            >
              Close
            </Button>
          </DialogClose>
          <AlertMessage alert={alert} onClose={() => setAlert(null)} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BookBusDialog({ children, bus, event_loc, onUpdate, event_id }) {
  const [quantity, setQuantity] = useState(1);
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function bookBus() {
    setLoading(true);
    setAlert(null);

    console.log("Booking bus:", bus.transportation_id, "for event:", event_id);
    if (quantity < 1) {
      setAlert("Please enter a valid number of seats.");
      setLoading(false);
      return;
    }
    if (quantity > bus.capacity - bus.number_assigned) {
      setAlert("Requested number of seats exceeds available seats.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/event/bookbus/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          bus_id: bus.transportation_id,
          quantity: quantity,
          event_id: event_id,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setAlert(data.error);
        if (data.error === "Not authenticated") {
          navigate("/login");
        }
        return;
      }

      if (data.message) {
        setAlert(`Success! Booked ${quantity} seat(s).`);
        onUpdate((prevBuses) =>
          prevBuses.map((b) =>
            b.bus_id === bus.bus_id
              ? { ...b, number_assigned: b.number_assigned + quantity }
              : b
          )
        );
      }
    } catch (err) {
      console.error(err);
      setAlert("An error occurred while booking the bus.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="caret-transparent">Book Bus</DialogTitle>
        </DialogHeader>

        <p className="caret-transparent">
          From: {bus.departure_loc} → To: {event_loc}
        </p>

        <div className="flex flex-col gap-4 mt-2">
          <Label htmlFor="busQuantity">Number of seats</Label>
          <Input
            id="busQuantity"
            type="number"
            min={1}
            max={bus.capacity - bus.number_assigned}
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setQuantity(isNaN(val) ? 1 : val); // fallback to 1
            }}
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="Enter quantity"
          />
        </div>

        {alert && <AlertMessage alert={alert} onClose={() => setAlert(null)} />}

        <DialogFooter>
          <Button onClick={bookBus} disabled={loading}>
            {loading ? "Booking..." : "Book"}
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
