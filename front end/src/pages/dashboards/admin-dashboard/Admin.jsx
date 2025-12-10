import Input from "@/components/Input";
import { UserContext } from "@/UserContext";
import { MapPin, Home, Ticket, UserRound, Flag } from "lucide-react";
import { useContext } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Admin() {
  // User can change their account info
  // if the username context is null, redirect to home page

  const { user, loadingUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loadingUser) {
      if (!user || user.status !== "Administrator\nAdministrator") {
        navigate("/"); // Redirect to home page
      }
    }
  }, [loadingUser, user]);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="flex flex-col justify-center items-center w-full px-32 text-[30px] font-bold">
      <h1>Admin Main Page</h1>
      <div className="flex flex-wrap w-full px-32 shadow-2xl py-5 rounded-xl bg-card mt-3">
        <h1 className="text-xl">Change Account Info</h1>
        <div>
          <Input
            title="User Name"
            type="text"
            name="username"
            placeholder=""
            value={formData.eventName}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}

export const adminItems = [
  {
    title: "Home",
    url: "/admin",
    icon: Home,
  },
  {
    title: "Events",
    url: "/admin/events",
    icon: Ticket,
  },
  {
    title: "Venues",
    url: "/admin/venues",
    icon: MapPin,
  },
  {
    title: "Organizers",
    url: "/admin/org",
    icon: UserRound,
  },
  {
    title: "Report Case",
    url: "/admin/reportCase",
    icon: Flag,
  },
];
