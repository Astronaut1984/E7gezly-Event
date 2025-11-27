import "./Home.css";
import HomePic from "../../assets/home-page-init.jpg";
import { Routes, Link } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Event from "../../components/Event";

export default function Home() {
  let bgColor = "bg-gradient-to-tr from-blue-300 via-blue-400 to-blue-600";
  return (
    <main id="homeBackground" className={`bg-blue-400 w-full min-h-screen`}>
      <NavBar />
      <section
        id="Home"
        className=" relative w-full h-screen bg-cover bg-center bg-no-repeat"
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
        className={`flex flex-col justify-center items-center w-full  bg-red-50 bg-cover bg-center bg-no-repeat ${bgColor}`}
      >
        <div className="w-full">
            <h1 className="flex justify-center items-center m-10 text-4xl font-bold text-white">Top Events</h1>
        </div>
        {/* Events*/ }
        <div className="w-full">
            <Event/>
        </div>

      </section>
    </main>
  );
}
