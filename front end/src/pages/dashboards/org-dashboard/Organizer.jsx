import { Home, Ticket, UserRoundCheck, MessageCircle, MapPin, UserRound, Flag, MicVocal } from "lucide-react";
import Input from "@/components/Input";
import { UserContext } from "@/UserContext";
import { useContext } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// export function Organizer() {
//   return <h1>Organizer Page Main</h1>;
// }

export const orgItems = [
  {
    title: "Home",
    url: "/org",
    icon: Home,
  },
  {
    title: "Add Events",
    url: "/org/add-events",
    icon: Ticket,
  },
  {
    title: "Followers",
    url: "/org/followers",
    icon: UserRoundCheck,
  },
  {
    title: "My Events",
    url: "/org/my-events",
    icon: Ticket,
  },
  {
    title: "Chat",
    url: "/org/chat",
    icon: MessageCircle,
  },
];


export function Organizer() {
  // User can change their account info
  // if the username context is null, redirect to home page

  const { user, loadingUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loadingUser) {
      if (!user || user.status !== "Organizer") {
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
    let newValue = value;
    if (name === "phone") {
      newValue = value.replace(/\D/g, "");
    }
    if (name === "email") {
      newValue = value.toLowerCase();
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));
  };
  // // Email
  // if (!formData.email) {
  //   errors.email = { isError: true, message: "Enter your email" };
  // } else {
  //   const input = document.querySelector('input[type="email"]');
  //   if (input && !input.validity.valid) {
  //     errors.email = { isError: true, message: "Invalid email format" };
  //   } else {
  //     try {
  //       const response = await fetch(
  //         "http://localhost:8000/account/checkemail/",
  //         {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({ email: formData.email }),
  //         }
  //       );
        
  //       const data = await response.json();
  //       if (data.emailExists) {
  //         errors.email = {
  //           isError: true,
  //           message: "This email is already registered",
  //         };
  //       } else {
  //         delete errors.email;
  //       }
  //     } catch (err) {
  //       console.error("Error checking email:", err);
  //       errors.email = {
  //         isError: true,
  //         message: "Unable to verify email",
  //       };
  //     }
  //   }
  // }
  async function handleUpdateInfo(e) {
    e.preventDefault();
  }

  return (
    <div className="flex flex-col justify-center items-center w-full px-32 text-[30px] font-bold">
      <h1>Organizer Main Page</h1>
      <div className="flex flex-col flex-wrap w-full px-32 shadow-2xl py-5 rounded-xl bg-card mt-3">
        <h1 className="text-xl">Change Account Info</h1>
        <div className="text-[20px] flex justify-between gap-20">
          <Input
            title="Username"
            type="text"
            name="username"
            placeholder=""
            value={formData.username}
            onChange={handleChange}
            readOnly={true}
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