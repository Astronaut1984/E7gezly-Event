import { UserContext } from "@/UserContext";
import { useContext, useEffect, useState } from "react";
import Input from "./Input";
import InputEdit from "./InputEdit";

export default function EditInfoForm() {
  const { user, setUser } = useContext(UserContext);

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    country: user?.country || "",
    city: user?.city || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "phone") {
      newValue = value.replace(/\D/g, "");
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));
  };

  async function handleUpdateInfo(e) {
    e.preventDefault();
    console.log(formData);
    try {
      const res = fetch("http://localhost:8000/account/editaccountinfo/",
        {
          method: "PUT",
          body: formData,
        }
      );
      if(!res.ok){
        console.error(err)
      }
      
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flex flex-col w-250 flex-wrap px-32 shadow-2xl py-5 rounded-xl bg-card mt-3">
      <h1 className="text-xl mb-4">Change Account Info</h1>
      <div className="text-[20px] flex justify-between gap-20">
        <InputEdit
          title="First Name"
          type="text"
          name="firstName"
          placeholder=""
          value={formData.firstName}
          onChange={handleChange}
        />
        <Input
          title="Last Name"
          type="text"
          name="lastName"
          placeholder=""
          value={formData.lastName}
          onChange={handleChange}
        />
      </div>
      <div className="text-[20px] flex justify-between gap-20">
        <Input
          title="Username"
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
      <div className="text-[20px] flex justify-between gap-20">
        <Input
          title="Country"
          type="text"
          name="country"
          placeholder=""
          value={formData.country}
          onChange={handleChange}
        />
        <Input
          title="City"
          type="text"
          name="city"
          placeholder=""
          value={formData.city}
          onChange={handleChange}
        />
      </div>
      <div className="flex flex-wrap justify-center pt-7.5">
        <div className="w-50 block relative z-1 rounded-[25px] overflow-hidden">
          <button
            type="button"
            onClick={handleUpdateInfo}
            className={
              "bg-primary-hover select-none text-[16px] text-white flex justify-center items-center w-full h-[50px] border-0 cursor-pointer font-semibold "
            }
          >
            Update Info
          </button>
        </div>
      </div>
    </div>
  );
}
