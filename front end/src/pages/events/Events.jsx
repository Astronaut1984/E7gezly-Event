import Event from "../../components/Event";
import NavBar from "../../components/NavBar";
import HomePic from "../../assets/home-page-init.jpg";
import Footer from "../../components/Footer";
import Modal from "../../components/ModalComponents/Modal";
import { useState, useEffect } from "react";

export default function Events() {
    const [showModalCategories, setShowModalCategories] = useState(false);
    const [showModalVenues, setShowModalVenues] = useState(false);

    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedVenues, setSelectedVenues] = useState([]);

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEvents() {
            setLoading(true);
            try {
                const res = await fetch("http://localhost:8000/event/getevents/", {
                    method: "GET",
                    credentials: "include",
                });
                
                const data = await res.json();
                console.log("Fetched events:", data);
                
                // API returns { "Events": [...] } with capital E
                setEvents(data["Events"] || []);
            } catch (error) {
                console.error("Error fetching events:", error);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        }
        
        fetchEvents();
    }, []);

    function showModalHandler(modal){
        if(modal === "Categories"){
            setShowModalCategories(true);
        } else {
            setShowModalVenues(true)
        }
    }

    return (
        <>
            <Modal 
                open={showModalCategories} 
                onClose={(appliedCategories) => {
                    setShowModalCategories(false);
                    setSelectedCategories(appliedCategories)
                }} 
                title="Select Category" 
                appliedItems={selectedCategories}
            />
            <Modal 
                open={showModalVenues} 
                onClose={(appliedVenues) => {
                    setShowModalVenues(false);
                    setSelectedVenues(appliedVenues)
                }} 
                title="Select Venue" 
            />
            <NavBar />
            <div className="bg-background w-full h-max text-foreground translate-y-20">
                <div className="w-full flex justify-center p-5 space-x-2">
                    <button 
                        onClick={() => showModalHandler("Categories")} 
                        className="border-primary cursor-pointer border-3 rounded-2xl p-2"
                    >
                        All Categories
                    </button>
                    <button 
                        onClick={() => showModalHandler("Venues")} 
                        className="border-primary cursor-pointer border-3 rounded-2xl p-2"
                    >
                        Venues
                    </button>
                </div>

                <div className="w-full h-full flex justify-center flex-wrap space-x-5 space-y-5 pb-5">
                    {loading && (
                        <div className="w-full flex justify-center py-20">
                            <i className="fa-solid fa-spinner fa-spin text-4xl text-primary"></i>
                        </div>
                    )}

                    {!loading && events.length === 0 && (
                        <div className="w-full flex justify-center py-20">
                            <h1 className="text-2xl font-semibold">No Events Available</h1>
                        </div>
                    )}

                    {!loading && events.map((event) => (
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
                            adminOrOrgMode={false}
                        />
                    ))}
                </div>
                <Footer />
            </div>
        </>
    );
}