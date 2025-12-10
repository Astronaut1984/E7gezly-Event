import Input from "@/components/Input";
import { UserContext } from "@/UserContext";
import { MapPin, Home, Ticket, UserRound, Flag, MicVocal} from "lucide-react";
import { useContext } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  {
    title: "Performers",
    url: "/admin/performers",
    icon: MicVocal,
  }
];

export function Admin() {
  // User can change their account info
  // if the username context is null, redirect to home page

  const { user, loadingUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loadingUser) {
      if (!user || user.status !== "Administrator") {
        navigate("/"); // Redirect to home page
      } else {
        setFormData({
          username: user.username,
        });
      }
    }
  }, [loadingUser, user]);

  const [formData, setFormData] = useState({
    username: "",
    oldPassword: "",
    newPassword: "",
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

  async function handleUpdateInfo(e) {
    e.preventDefault();
  }

  return (
    <div className="flex flex-col justify-center items-center w-full px-32 text-[30px] font-bold">
      <h1>Admin Main Page</h1>
      <div className="flex flex-col flex-wrap w-full px-32 shadow-2xl py-5 rounded-xl bg-card mt-3">
        <h1 className="text-xl">Change Account Info</h1>
        <div className="text-[20px] flex justify-between gap-20">
          <Input
            title="User Name"
            type="text"
            name="username"
            placeholder=""
            value={formData.username}
            onChange={handleChange}
          />
        </div>
        <div className="text-[20px] flex justify-between gap-20">
          <Input
            title="Email"
            type="email"
            name="email"
            placeholder=""
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            title="Phone"
            type="text"
            name="phone"
            placeholder=""
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-wrap justify-center pt-7.5">
          <div className="w-50 block relative z-1 rounded-[25px] overflow-hidden">
            <button
              type="button"
              onClick={handleUpdateInfo}
              className={
                "bg-primary-hover text-[16px] text-white flex justify-center items-center w-full h-[50px] border-0 cursor-pointer font-semibold "
              }
            >
              Update Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
