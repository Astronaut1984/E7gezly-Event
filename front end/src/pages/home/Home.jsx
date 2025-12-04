import "../../index.css";
import HomePic from "../../assets/home-page-init.jpg";
import { Routes, Link } from "react-router-dom";
import NavBar from "../../components/Navbar";
import Event from "../../components/Event";
import Category from "../../components/Category";
import Footer from "../../components/Footer";

export default function Home() {
  let bgColor = "bg-background";
  return (
    <main id="homeBackground" className={`${bgColor} w-full min-h-screen`}>
      <NavBar />
      <section
        id="Home"
        className="relative w-full h-screen bg-cover bg-center bg-no-repeat"
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
            className="transform hover:scale-110 transition duration-700 ease-in-out text-white text-3xl bg-blue-400 px-10 py-6 rounded-4xl hover:bg-blue-600 transition"
          >
            View Events
          </Link>
        </div>
      </section>

      <section
        id="Events"
        className={`flex flex-col justify-center items-center w-full  bg-cover bg-center bg-no-repeat `}
      >
        <div className="w-full">
          <h1 className="flex justify-center items-center m-10 text-4xl font-bold text-foreground">
            Top Events
          </h1>
        </div>
        {/* Events*/}
        <div className="w-full p-10 flex flexbox gap-10 justify-center items-center flex-wrap">
          <Event
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
          <Event
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
        </div>
      </section>

      <section
        className={`pb-10 flex flex-col justify-center items-center w-full  bg-cover bg-center bg-no-repeat `}
      >
        <div className="w-full">
          <h1 className="flex justify-center items-center m-10 text-4xl font-bold text-foreground">
            Categories
          </h1>
        </div>
        <div className="w-full p-10 flex flexbox gap-10 justify-center items-center flex-wrap">
          <Category
            title="Concerts"
            img="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.4DkGUbOui9t5OI62K9aCtwHaEK%3Fpid%3DApi&f=1&ipt=655d029f755b2fca664704ff9156c6bcc84151e9c756e56e1d33aa6ec75b45f0&ipo=images"
          />
          <Category
            title="Comedy"
            img="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.4DkGUbOui9t5OI62K9aCtwHaEK%3Fpid%3DApi&f=1&ipt=655d029f755b2fca664704ff9156c6bcc84151e9c756e56e1d33aa6ec75b45f0&ipo=images"
          />
        </div>
      </section>
      <Footer />
    </main>
  );
}
