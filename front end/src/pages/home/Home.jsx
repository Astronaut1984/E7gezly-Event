import "../../index.css";
import HomePic from "../../assets/home-page-init.jpg";
import { Link } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Event from "../../components/Event";
import Category from "../../components/Category";
import Footer from "../../components/Footer";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/UserContext";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const { user } = useContext(UserContext);

  /* =======================
     Fetch data
     ======================= */
  useEffect(() => {
    async function fetchMyEvents() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/event/getevents/", {
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

    async function fetchCategories() {
      setLoadingCategories(true);
      try {
        const res = await fetch(
          "http://localhost:8000/event/getcategorieswithbanners/",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await res.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    }

    fetchMyEvents();
    fetchCategories();
  }, []);

  /* =======================
     Date filter (upcoming only)
     ======================= */
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events.filter((event) => {
    const startDate = new Date(event.start_date);
    startDate.setHours(0, 0, 0, 0);
    return startDate >= today;
  });

  return (
    <main id="homeBackground" className="bg-background w-full min-h-screen caret-transparent">
      <NavBar />

      {/* HERO */}
      <section
        id="Home"
        className="relative w-full h-screen pt-16 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${HomePic})` }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-9 flex flex-col items-center justify-center h-full gap-8">
          <h1 className="text-white text-5xl font-bold caret-transparent">Events Made Simple</h1>
          <Link
            to="/Events"
            className="transform hover:scale-110 transition duration-700 ease-in-out text-primary-foreground text-3xl bg-primary-hover px-10 py-6 rounded-4xl"
          >
            View Events
          </Link>
        </div>
      </section>

      {/* EVENTS */}
      <section className="flex flex-col items-center w-full">
        <h1 className="m-10 text-4xl font-bold text-foreground">
          Recent Events
        </h1>

        <div className="w-full p-10 flex gap-10 justify-center flex-wrap">
          {loading && (
            <i className="fa-solid fa-spinner fa-spin text-4xl text-primary" />
          )}

          {!loading && upcomingEvents.length === 0 && (
            <h1 className="text-2xl font-semibold">No Events Available</h1>
          )}

          {!loading &&
            upcomingEvents.slice(0, 3).map((event) => (
              <Event
                key={event.event_id}
                eventId={event.event_id}
                title={event.name}
                img={event.banner}
                startDate={event.start_date}
                endDate={event.end_date}
                priceRange={{
                  minPrice: event.min_price,
                  maxPrice: event.max_price,
                  currency: "EGP",
                }}
                adminOrOrgMode={user?.status !== "Attendee"}
                allEventsMode
              />
            ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="pb-10 flex flex-col items-center w-full">
        <h1 className="m-10 text-4xl font-bold text-foreground">Categories</h1>

        <div className="w-full p-10 flex gap-10 justify-center flex-wrap">
          {loadingCategories && (
            <i className="fa-solid fa-spinner fa-spin text-4xl text-primary" />
          )}

          {!loadingCategories && categories.length === 0 && (
            <h1 className="text-2xl font-semibold">No Categories Available</h1>
          )}

          {!loadingCategories &&
            categories.map((category) => (
              <Category
                key={category.category_id}
                categoryId={category.category_id}
                title={category.category_name}
                eventBanners={category.event_banners}
              />
            ))}
        </div>
      </section>
            
      <Footer />
    </main>
  );
}
