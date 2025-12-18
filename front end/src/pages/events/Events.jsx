import Event from "../../components/Event";
import NavBar from "../../components/NavBar";
import HomePic from "../../assets/home-page-init.jpg";
import Footer from "../../components/Footer";
import Modal from "../../components/ModalComponents/Modal";
import { useState, useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { UserContext } from "@/UserContext";

export default function Events() {
  const { user } = useContext(UserContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category_id");

  const [showModalCategories, setShowModalCategories] = useState(false);
  const [showModalVenues, setShowModalVenues] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState(categoryParam ? [parseInt(categoryParam)] : []);
  const [selectedVenues, setSelectedVenues] = useState([]);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);

  /* =======================
     Fetch categories & venues
     ======================= */
  useEffect(() => {
    async function fetchFilters() {
      try {
        const [categoriesRes, venuesRes] = await Promise.all([
          fetch("http://localhost:8000/event/getcategories/", {
            method: "GET",
            credentials: "include",
          }),
          fetch("http://localhost:8000/event/getvenues/", {
            method: "GET",
            credentials: "include",
          }),
        ]);

        const categoriesData = await categoriesRes.json();
        const venuesData = await venuesRes.json();

        setCategories(
          (categoriesData.categories || []).map((cat) => ({
            id: cat.category_id,
            name: cat.category_name,
          }))
        );

        setVenues(
          (venuesData.venues || []).map((venue) => ({
            id: venue.location_id,
            name: venue.name,
          }))
        );
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    }

    fetchFilters();
  }, []);

  /* =======================
     Read URL params
     ======================= */
  useEffect(() => {
    const categoryParam = searchParams.get("category_id");
    if (categoryParam) {
      setSelectedCategories([parseInt(categoryParam)]);
    }
  }, []);

  /* =======================
     Fetch events on filter change
     ======================= */
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        if (selectedCategories.length > 0) {
          params.append("category_id", selectedCategories.join(","));
        }

        if (selectedVenues.length > 0) {
          params.append("venue_id", selectedVenues.join(","));
        }

        const queryString = params.toString();
        const url = `http://localhost:8000/event/getevents/${
          queryString ? "?" + queryString : ""
        }`;

        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        setEvents(data.Events || []);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [selectedCategories, selectedVenues]);

  /* =======================
     Filter upcoming events
     ======================= */
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events.filter((event) => {
    const eventStart = new Date(event.start_date);
    eventStart.setHours(0, 0, 0, 0);
    return eventStart >= today;
  });

  function showModalHandler(modal) {
    modal === "Categories"
      ? setShowModalCategories(true)
      : setShowModalVenues(true);
  }

  return (
    <>
      <Modal
        open={showModalCategories}
        onClose={(appliedCategories) => {
          setShowModalCategories(false);
          setSelectedCategories(appliedCategories);
        }}
        title="Select Category"
        appliedItems={selectedCategories}
        items={categories}
      />

      <Modal
        open={showModalVenues}
        onClose={(appliedVenues) => {
          setShowModalVenues(false);
          setSelectedVenues(appliedVenues);
        }}
        title="Select Venue"
        appliedItems={selectedVenues}
        items={venues}
      />

      <NavBar />

      <div className="caret-transparent bg-background w-full h-max text-foreground translate-y-20">
        <div className="w-full flex justify-center p-5 space-x-2">
          <button
            onClick={() => showModalHandler("Categories")}
            className="border-primary cursor-pointer border-3 rounded-2xl p-2"
          >
            All Categories{" "}
            {selectedCategories.length > 0 &&
              `(${selectedCategories.length})`}
          </button>

          <button
            onClick={() => showModalHandler("Venues")}
            className="border-primary cursor-pointer border-3 rounded-2xl p-2"
          >
            Venues {selectedVenues.length > 0 && `(${selectedVenues.length})`}
          </button>

          {(selectedCategories.length > 0 || selectedVenues.length > 0) && (
            <button
              onClick={() => {
                setSelectedCategories([]);
                setSelectedVenues([]);
                setSearchParams({});
              }}
              className="border-red-500 text-red-500 cursor-pointer border-3 rounded-2xl p-2"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="w-full h-full flex justify-center flex-wrap gap-5 pb-5 px-5">
          {loading && (
            <div className="w-full flex justify-center h-67.5 py-20">
              <i className="fa-solid fa-spinner fa-spin text-4xl text-primary"></i>
            </div>
          )}

          {!loading && upcomingEvents.length === 0 && (
            <div className="w-full flex justify-center h-67.5 py-20">
              <h1 className="text-2xl font-semibold">No Events Available</h1>
            </div>
          )}

          {!loading &&
            upcomingEvents.map((event) => (
              <Event
                key={event.event_id}
                eventId={event.event_id}
                img={event.banner || HomePic}
                title={event.name}
                venue={event.location?.name || event.venue || "Venue TBA"}
                startDate={event.start_date}
                endDate={event.end_date}
                priceRange={{
                  currency: "EGP",
                  minPrice: event.min_price,
                  maxPrice: event.max_price,
                }}
                adminOrOrgMode={user ? user.status != "Attendee" : false}
                allEventsMode={true}
              />
            ))}
        </div>

        <Footer />
      </div>
    </>
  );
}
