import Input from "@/components/Input";
import { useState } from "react";
import { validateAddVenue } from "@/pages/sign up/validations";

export default function AdminVenues() {
  const FIELD_CONATIANER_CLASSNAME =
    "text-[20px] flex justify-between gap-20 items-center";
  let [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    venueName: "",
    country: "",
    city: "",
    venueType: "",
    description: "",
    capacity: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    // validation: check empty fields
    let formErrors = validateAddVenue(formData);
    if (Object.keys(formErrors).length !== 0) {
      setErrors(formErrors);
      return;
    }

    const payload = {
      ...formData,
      capacity: Number(formData.capacity),
    };

    try {
      const res = await fetch("http://localhost:8000/event/addvenue/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add venue");

      alert("Venue added successfully!");
      setErrors({});
      setFormData({
        venueName: "",
        country: "",
        city: "",
        venueType: "",
        description: "",
        capacity: "",
      });
    } catch (err) {
      console.error(err);
      alert("Error adding venue");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full px-32 text-[30px] font-bold">
      <h1>Admin Main Page</h1>
      <div className="flex flex-col flex-wrap w-full px-10 shadow-2xl py-5 rounded-xl bg-card mt-3">
        <h1 className="text-xl">Add a Venue</h1>
        <div className={FIELD_CONATIANER_CLASSNAME}>
          <Input
            title="Venue Name"
            name="venueName"
            type="text"
            placeholder="Ex: Arkan Plaza"
            onChange={handleChange}
            value={formData.venueName}
            error={errors.venueName}
          />
          <Input
            title="Country"
            type="text"
            name="country"
            placeholder="Ex: Egypt"
            onChange={handleChange}
            value={formData.country}
            error={errors.country}
          />
        </div>
        <div className={FIELD_CONATIANER_CLASSNAME}>
          <Input
            title="City"
            name="city"
            type="text"
            placeholder="Ex: Giza"
            onChange={handleChange}
            value={formData.city}
            error={errors.city}
          />
          <Input
            title="Venue Type"
            type="text"
            placeholder="Ex: Outdoors/Indoors ...etc."
            name="venueType"
            value={formData.venueType}
            onChange={handleChange}
            error={errors.venueType}
          />
        </div>
        <div className={FIELD_CONATIANER_CLASSNAME}>
          <Input
            title="Description"
            type="text"
            placeholder={`Arkan is one of West Cairo's primary commercial and social destination. It is a pedestria...`}
            onChange={handleChange}
            value={formData.description}
            name="description"
            error={errors.description}
          />
        </div>
        <div className={FIELD_CONATIANER_CLASSNAME}>
          <Input
            title="Capacity"
            type="text"
            placeholder={`300`}
            classNameVar="w-70"
            name="capacity"
            value={formData.capacity}
            error={errors.capacity}
            onChange={(e) => {
              const newValue = e.target.value.replace(/[^0-9]/g, ""); // keep only digits
              setFormData({ ...formData, capacity: newValue });
            }}
          />
          <div className="w-70 flex jusify-center">
            <button
              type="button"
              className={
                "bg-primary-hover rounded-2xl text-[16px] text-white flex justify-center items-center w-full h-[50px] border-0 cursor-pointer font-semibold "
              }
              onClick={handleSubmit}
            >
              Add Venue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
