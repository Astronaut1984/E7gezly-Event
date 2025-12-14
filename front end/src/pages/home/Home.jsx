import "../../index.css";
import HomePic from "../../assets/home-page-init.jpg";
import { Link } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Event from "../../components/Event";
import Category from "../../components/Category";
import Footer from "../../components/Footer";
import { useEffect, useState } from "react";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    async function fetchMyEvents() {
      setLoading(true);

      try {
        const res = await fetch("http://localhost:8000/event/getevents/", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        console.log(data["Events"]);
        setEvents(data["Events"] || []);
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
        const res = await fetch("http://localhost:8000/event/getcategorieswithbanners/", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        console.log("Categories with banners:", data["categories"]);
        setCategories(data["categories"] || []);
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

  return (
    <main id="homeBackground" className="bg-background w-full min-h-screen">
      <NavBar />
      <section
        id="Home"
        className="relative w-full h-screen pt-16 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${HomePic})`,
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/70"></div>

        {/* Content above overlay */}
        <div className="relative z-9 flex flex-col items-center justify-center h-full gap-8">
          <h1 className="text-white text-5xl font-bold">Events Made Simple</h1>
          <Link
            to="/Events"
            className="transform hover:scale-110 transition duration-700 ease-in-out text-white text-3xl bg-blue-400 px-10 py-6 rounded-4xl hover:bg-blue-600"
          >
            View Events
          </Link>
        </div>
      </section>

      <section
        id="Events"
        className="flex flex-col justify-center items-center w-full bg-cover bg-center bg-no-repeat"
      >
        <div className="w-full">
          <h1 className="flex justify-center items-center m-10 text-4xl font-bold text-foreground">
            Recent Events
          </h1>
        </div>
        {/* Events */}
        <div className="w-full p-10 flex flexbox gap-10 justify-center items-center flex-wrap">
          {loading && (
            <div className="w-full flex justify-center py-10">
              <i className="fa-solid fa-spinner fa-spin text-4xl text-primary"></i>
            </div>
          )}

          {!loading && events.length === 0 && (
            <div className="w-full flex justify-center py-10">
              <h1 className="text-2xl font-semibold">No Events Available</h1>
            </div>
          )}

          {!loading &&
            events.slice(0, 3).map((event) => {
              return (
                <Event
                  key={event.event_id}
                  title={event.name}
                  eventId={event.event_id}
                  img={event.banner}
                  priceRange={{
                    minPrice: event.min_price,
                    maxPrice: event.max_price,
                    currency: "EGP",
                  }}
                  startDate={event.start_date}
                  endDate={event.end_date}
                />
              );
            })}
        </div>
      </section>

      <section className="pb-10 flex flex-col justify-center items-center w-full bg-cover bg-center bg-no-repeat">
        <div className="w-full">
          <h1 className="flex justify-center items-center m-10 text-4xl font-bold text-foreground">
            Categories
          </h1>
        </div>
        <div className="w-full p-10 flex flexbox gap-10 justify-center items-center flex-wrap">
          {loadingCategories && (
            <div className="w-full flex justify-center py-10">
              <i className="fa-solid fa-spinner fa-spin text-4xl text-primary"></i>
            </div>
          )}

          {!loadingCategories && categories.length === 0 && (
            <div className="w-full flex justify-center py-10">
              <h1 className="text-2xl font-semibold">No Categories Available</h1>
            </div>
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