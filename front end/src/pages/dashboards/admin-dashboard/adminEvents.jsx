import { Ban, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import useAdminResource from "@/hooks/useAdminResource";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
// Removed Organizer import as it's not relevant for events

export default function AdminEvents() {
  const [eventCount, setEventCount] = useState(0);
  const {
    items: events,
    loading,
    fetchItems: reloadEvents,
    remove: deleteEvent,
  } = useAdminResource({
    getUrl: "http://localhost:8000/adminUtils/getevents/",
    deleteUrl: "http://localhost:8000/adminUtils/deleteevents/",
    listKey: "events",
    deletePayloadKey: "event_id", // Changed from username to event_id
  });
  const [search, setSearch] = useState(""); // for the search input

  useEffect(() => {
    reloadEvents();
    fetch("http://localhost:8000/Record/eventsindb/")
      .then((res) => res.json())
      .then((data) => setEventCount(data.count))
      .catch((err) => console.error(err));
  }, [reloadEvents]);

  const filteredevents =
    !loading &&
    events.filter(
      (
        event // Renamed 'o' to 'event'
      ) =>
        `${event.name} ${event.owner_name}` // Filter by event name and owner name
          .toLowerCase()
          .includes(search.toLowerCase())
    );

  if (loading) {
    return (
      <div className="w-full flex justify-center flex-wrap gap-5 pb-5">
        <Spinner />
      </div>
    );
  }

  return (
    <main className="flex justify-center items-center flex-col gap-5 w-full">
      <h1 className="text-3xl font-bold">Events</h1> {/* Updated heading */}
      <div className="text-center mb-4 text-primary">
        <i> Number of Events: {eventCount}</i>
      </div>
      <div className="flex w-100 justify-center items-center">
        <Input
          placeholder="Search events..." // Updated placeholder
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="w-full flex justify-start flex-wrap gap-5 py-5">
        {filteredevents.length === 0 ? (
          <p className="text-center w-full">No events found</p>
        ) : (
          filteredevents.map((event) => {
            // Renamed 'org' to 'event'
            return (
              <EventCard // Changed to EventCard
                eventName={event["name"]}
                ownerName={event["owner_name"]}
                key={event["event_id"]}
                eventId={event["event_id"]}
                onDelete={() => deleteEvent(event["event_id"])} // Pass event_id
              />
            );
          })
        )}
      </div>
    </main>
  );
}

function EventCard({ eventName, ownerName, eventId, onDelete }) {
  // New EventCard component
  return (
    <>
      <div className="relative w-90 pl-3 pr-8 py-5 bg-card rounded-xl shadow mx-auto">
        <p className="text-2xl font-bold mr-2">{eventName}</p>
        <p>Owned by {ownerName}</p>
        <Alert eventName={eventName} eventId={eventId} onDelete={onDelete}>
          <div
            title="delete from database"
            className="absolute bottom-0 right-0 -mb-4 -mr-6
           w-12 h-12 rounded-full destructive-on-hover text-destructive-foreground flex justify-center items-center hover:cursor-pointer"
          >
            <Trash />
          </div>
        </Alert>
      </div>
    </>
  );
}

function Alert({ children, eventName, eventId, onDelete }) {
  // Updated Alert props
  async function handleDelete() {
    try {
      if (onDelete) await onDelete();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete "
            {eventName}" (ID: {eventId}) and remove it from the database
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="hover:cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction className="hover:cursor-pointer">
            <div className="hover:cursor-pointer" onClick={handleDelete}>
              Continue
            </div>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
