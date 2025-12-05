import Event from "../../components/Event";
import NavBar from "../../components/NavBar";
import HomePic from "../../assets/home-page-init.jpg";
import Footer from "../../components/Footer";
import Modal from "../../components/ModalComponents/Modal";
import { useState } from "react";

export default function Events() {
    const [showModalCategories, setShowModalCategories] = useState(false);
    const [showModalVenues, setShowModalVenues] = useState(false);

    function showModalHandler(modal){
        if(modal === "Categories"){
            setShowModalCategories(true);
        }else {
            setShowModalVenues(true)
        }
    }
    return (
    <>
      <Modal open={showModalCategories} onClose={() => setShowModalCategories(false)} title="Select Category" />
      <Modal open={showModalVenues} onClose={() => setShowModalVenues(false)} title="Select Venue" />
      <NavBar />
      <div className="bg-background w-full h-max text-foreground translate-y-20">
        <div className="w-full flex justify-center p-5 space-x-2">
          <button onClick={() => showModalHandler("Categories")} className="border-primary cursor-pointer border-3 rounded-2xl p-2">
            All Categories
          </button>
          <button onClick={() => showModalHandler("Venues")} className="border-primary cursor-pointer border-3 rounded-2xl p-2 ">
            Venues
          </button>
        </div>
        <div className="w-full h-full flex justify-center flex-wrap space-x-5 space-y-5 pb-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <Event
              key={i}
              img={HomePic}
              title="Tamer Hosny & AL Shami"
              time={{
                startDate: "May 31",
                endDate: undefined,
                time: "8:00 pm",
              }}
              venue="COCA-COLA ARENA, DUBAI"
              priceRange={{
                currency: "AED",
                minPrice: 300,
                maxPrice: 1000,
              }}
            />
          ))}
        </div>
        <Footer />
      </div>
    </>
  );
}
