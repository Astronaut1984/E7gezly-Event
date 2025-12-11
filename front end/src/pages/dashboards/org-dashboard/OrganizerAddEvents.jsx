import Input from "@/components/Input";
import SelectOnly from "@/components/SelectOnly";
import { useState } from "react";

// --- Options (Unchanged) ---
const optionsCategory = [
  "Concert",
  "Comedy",
  "Art & Theatre",
  "Disco",
  "Week Trip",
];
const optionsLocation = [
  "Mall of Egypt",
  "Arabia Mall",
  "Tiba Mall",
  "Marasi",
  "Cairo University",
];

const getMinDateTime = () => {
  const now = new Date();
  // Simplified logic to get ISO string slice for datetime-local min attribute
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

// --- Initial Data Structures for Dynamic Fields ---
const initialTicket = {
  TicketTypeName: "",
  TicketDescription: "",
  TicketPrice: "",
  TicketQuantity: "",
};

const initialDiscount = {
  DiscountID: "",
  DiscountPercentage: "",
  DiscountStartDate: "",
  DiscountEndDate: "",
  DiscountQuantity: "",
  DiscountMaximumValue: "",
};

const initialPerformer = {
  performerName: "", // Using performerName for a distinct name
};

const initialBus = {
  busCapacity: "",
  busProvider: "",
};

export default function OrganizerAddEvents() {
  // ----------------------------------------------------
  // Task 3: Updated formData Structure
  // ----------------------------------------------------
  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    category: "",
    start_date: "",
    end_date: "",
    location: "",
    banner: "",
    tickets: [{ ...initialTicket }], // Start with 1 ticket type
    discounts: [],
    performers: [],
    buses: [],
  });

  // --- General Change Handler for static fields ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    // ... (Your existing validation logic)
    if (
      name === "DiscountMaximumValue" ||
      name === "DiscountPercentage" ||
      name === "TicketPrice" ||
      name === "TicketQuantity" ||
      name === "DiscountQuantity"
    ) {
      newValue = value.replace(/[^0-9]/g, "");
      if (name === "DiscountPercentage") {
        if (newValue.length > 2) {
          newValue = newValue.slice(0, 2);
        }
      }
    }
    if (
      name === "eventName" ||
      name === "TicketTypeName" ||
      name === "DiscountID"
    ) {
      newValue = value.replace(/[^a-zA-Z0-9 ]/g, "");
      if (name === "DiscountID") {
        newValue = newValue.toUpperCase();
        if (newValue.length > 25) {
          newValue = newValue.slice(0, 25);
        }
      }
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));
  };

  // ----------------------------------------------------
  // Task 4: New Change Handler for Array Fields
  // ----------------------------------------------------
  const handleArrayChange = (arrayName, index, e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Apply the necessary validation, just like in handleChange
    if (
      name === "DiscountMaximumValue" ||
      name === "DiscountPercentage" ||
      name === "TicketPrice" ||
      name === "TicketQuantity" ||
      name === "DiscountQuantity"
    ) {
      newValue = value.replace(/[^0-9]/g, "");
    }
    if (name === "TicketTypeName" || name === "DiscountID") {
      newValue = value.replace(/[^a-zA-Z0-9 ]/g, "");
    }
    if (name === "DiscountID") {
      newValue = newValue.toUpperCase();
      if (newValue.length > 25) {
        newValue = newValue.slice(0, 25);
      }
    }
    if (name === "DiscountPercentage") {
      if (newValue.length > 2) {
        newValue = newValue.slice(0, 2);
      }
    }

    setFormData((prevData) => {
      const newArray = [...prevData[arrayName]];
      newArray[index] = {
        ...newArray[index],
        [name]: newValue,
      };
      return {
        ...prevData,
        [arrayName]: newArray,
      };
    });
  };

  const handleAdd = (arrayName, initialItem) => {
    setFormData((prevData) => ({
      ...prevData,
      [arrayName]: [...prevData[arrayName], { ...initialItem }],
    }));
  };

  const handleRemove = (arrayName, index) => {
    setFormData((prevData) => {
      const newArray = prevData[arrayName].filter((_, i) => i !== index);
      return {
        ...prevData,
        [arrayName]: newArray,
      };
    });
  };

  const minDate = getMinDateTime();
  return (
    <>
      <div className="flex flex-col justify-center items-center w-full px-32 text-[30px] font-bold">
        <h1>Add Event</h1>
        <div className="flex flex-wrap w-full px-32 shadow-2xl py-5 rounded-xl bg-card mt-3">
          <h1>Event Data</h1>
          <div className="flex justify-between w-full gap-30">
            <Input
              title="Event Name"
              type="text"
              name="eventName"
              placeholder="Amr Diab concert"
              value={formData.eventName}
              onChange={handleChange}
            />
            <SelectOnly
              title="Category"
              options={optionsCategory}
              placeholder="Select category"
              value={formData.category}
              onSelect={(option) =>
                setFormData({ ...formData, category: option })
              }
            />
          </div>
          <Input
            title="Description"
            type="text"
            name="description"
            placeholder="Amr diab concert (to be hold in el ein el sokhna from 20:00 31/12/2025 to 1:00 1/1/2026"
            value={formData.description}
            onChange={handleChange}
          />
          <div className="flex justify-between w-full gap-30">
            <Input
              title="Start Date"
              type="datetime-local"
              name="start_date"
              min={minDate}
              value={formData.start_date}
              onChange={handleChange}
              selectOnly={true}
            />
            <Input
              title="End Date"
              type="datetime-local"
              name="end_date"
              min={formData.start_date}
              value={formData.end_date}
              onChange={handleChange}
              selectOnly={true}
            />
          </div>
          <SelectOnly
            title="Venue"
            options={optionsLocation}
            placeholder="Select location"
            value={formData.location}
            onSelect={(option) =>
              setFormData({ ...formData, location: option })
            }
          />
          {/* ---------------------------------------------------- */}
          {/* --- Ticket Types Section (Dynamic) --- */}
          {/* ---------------------------------------------------- */}
          <h1 className="mt-5 w-full">
            Ticket Types (Count: {formData.tickets.length})
          </h1>{" "}
          {/* Task 2: Counter */}
          {formData.tickets.map((ticket, index) => (
            <div
              key={index}
              className="flex flex-col w-full border-2 border-dashed border-gray-300 p-4 mb-4 rounded-lg"
            >
              <h2 className="text-[20px] font-semibold">Ticket #{index + 1}</h2>
              <div className="flex justify-between w-full gap-30">
                <Input
                  title="Ticket Type Name"
                  type="text"
                  name="TicketTypeName"
                  placeholder="Gold, Silver, Bronze"
                  value={ticket.TicketTypeName}
                  onChange={(e) => handleArrayChange("tickets", index, e)}
                />
                <Input
                  title="Ticket Description"
                  type="text"
                  name="TicketDescription"
                  placeholder="Front seats with VIP access"
                  value={ticket.TicketDescription}
                  onChange={(e) => handleArrayChange("tickets", index, e)}
                />
              </div>
              <div className="flex justify-between w-full gap-30">
                <Input
                  title="Price"
                  type="Integer"
                  name="TicketPrice"
                  value={ticket.TicketPrice}
                  onChange={(e) => handleArrayChange("tickets", index, e)}
                />
                <Input
                  title="Quantity"
                  type="Integer"
                  name="TicketQuantity"
                  value={ticket.TicketQuantity}
                  onChange={(e) => handleArrayChange("tickets", index, e)}
                  selectOnly={true}
                />
              </div>
              {formData.tickets.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemove("tickets", index)}
                  className="bg-red-500 hover:bg-red-600 text-[16px] text-white flex justify-center items-center w-40 h-[40px] border-0 cursor-pointer font-semibold rounded-lg self-end mt-2"
                >
                  Remove Ticket
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAdd("tickets", initialTicket)}
            className={
              "bg-primary-hover text-[16px] text-white flex justify-center items-center w-full h-[50px] border-0 cursor-pointer font-semibold ml-120 rounded-lg"
            }
          >
            Add Ticket Type
          </button>
          {/* ---------------------------------------------------- */}
          {/* --- Discount Section (Dynamic) --- */}
          {/* ---------------------------------------------------- */}
          <h1 className="mt-5 w-full">
            Discounts (Count: {formData.discounts.length})
          </h1>{" "}
          {/* Task 2: Counter */}
          {formData.discounts.map((discount, index) => (
            <div
              key={index}
              className="flex flex-col w-full border-2 border-dashed border-gray-300 p-4 mb-4 rounded-lg"
            >
              <h2 className="text-[20px] font-semibold">
                Discount #{index + 1}
              </h2>
              <div className="flex justify-between w-full gap-30">
                <Input
                  title="Discount ID"
                  type="text"
                  name="DiscountID"
                  placeholder="NEWYEAR2026"
                  value={discount.DiscountID}
                  onChange={(e) => handleArrayChange("discounts", index, e)}
                />
                <Input
                  title="Discount Quantity"
                  type="Integer"
                  name="DiscountQuantity"
                  value={discount.DiscountQuantity}
                  onChange={(e) => handleArrayChange("discounts", index, e)}
                  selectOnly={true}
                />
              </div>
              <div className="flex justify-between w-full gap-30">
                <Input
                  title="Discount Percentage"
                  type="percentage"
                  name="DiscountPercentage"
                  value={discount.DiscountPercentage}
                  onChange={(e) => handleArrayChange("discounts", index, e)}
                  icon="fa-light fa-percent text-black top-[68px] fa-sm"
                />
                <Input
                  title="Discount maximum value"
                  type="Integer"
                  name="DiscountMaximumValue"
                  value={discount.DiscountMaximumValue}
                  onChange={(e) => handleArrayChange("discounts", index, e)}
                />
              </div>
              <div className="flex justify-between w-full gap-30">
                <Input
                  title="Discount Start Date"
                  type="date"
                  name="DiscountStartDate"
                  min={minDate}
                  value={discount.DiscountStartDate}
                  onChange={(e) => handleArrayChange("discounts", index, e)}
                  selectOnly={true}
                />
                <Input
                  title="Discount End Date"
                  type="date"
                  name="DiscountEndDate"
                  min={discount.DiscountStartDate || minDate}
                  value={discount.DiscountEndDate}
                  onChange={(e) => handleArrayChange("discounts", index, e)}
                  selectOnly={true}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove("discounts", index)}
                className="bg-red-500 hover:bg-red-600 text-[16px] text-white flex justify-center items-center w-40 h-[40px] border-0 cursor-pointer font-semibold rounded-lg self-end mt-2"
              >
                Remove Discount
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAdd("discounts", initialDiscount)}
            className={
              "bg-primary-hover text-[16px] text-white flex justify-center items-center w-full h-[50px] border-0 cursor-pointer font-semibold ml-120 rounded-lg"
            }
          >
            Add Discount
          </button>
          {/* ---------------------------------------------------- */}
          {/* --- Performers Section (Dynamic) --- */}
          {/* ---------------------------------------------------- */}
          <h1 className="mt-5 w-full">
            Performers (Count: {formData.performers.length})
          </h1>{" "}
          {/* Task 2: Counter */}
          {formData.performers.map((performer, index) => (
            <div
              key={index}
              className="flex flex-col w-full border-2 border-dashed border-gray-300 p-4 mb-4 rounded-lg"
            >
              <h2 className="text-[20px] font-semibold">
                Performer #{index + 1}
              </h2>
              <div className="flex justify-between w-full gap-30">
                <SelectOnly
                  title="Performer Name"
                  options={[
                    "Amr Diab",
                    "Hany Shaker",
                    "Mohamed Mounir",
                    "Sherine",
                    "Tamer Hosny",
                  ]}
                  placeholder="Select Performer"
                  value={performer.performerName}
                  onSelect={(option) =>
                    handleArrayChange("performers", index, {
                      target: { name: "performerName", value: option },
                    })
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove("performers", index)}
                className="bg-red-500 hover:bg-red-600 text-[16px] text-white flex justify-center items-center w-40 h-[40px] border-0 cursor-pointer font-semibold rounded-lg self-end mt-2"
              >
                Remove Performer
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAdd("performers", initialPerformer)}
            className={
              "bg-primary-hover text-[16px] text-white flex justify-center items-center w-full h-[50px] border-0 cursor-pointer font-semibold ml-120 rounded-lg"
            }
          >
            Add Performer
          </button>
          {/* ---------------------------------------------------- */}
          {/* --- Buses Section (Dynamic) --- */}
          {/* ---------------------------------------------------- */}
          <h1 className="mt-5 w-full">
            Buses (Count: {formData.buses.length})
          </h1>{" "}
          {/* Task 2: Counter */}
          {formData.buses.map((bus, index) => (
            <div
              key={index}
              className="flex flex-col w-full border-2 border-dashed border-gray-300 p-4 mb-4 rounded-lg"
            >
              <h2 className="text-[20px] font-semibold">Bus #{index + 1}</h2>
              <div className="flex justify-between w-full gap-30">
                <SelectOnly
                  title="Bus Capacity"
                  options={["20", "30", "40", "50", "60"]}
                  placeholder="Select Capacity"
                  value={bus.busCapacity}
                  onSelect={(option) =>
                    handleArrayChange("buses", index, {
                      target: { name: "busCapacity", value: option },
                    })
                  }
                />
                <SelectOnly
                  title="Bus Provider"
                  options={["Bus 1", "Bus 2", "Bus 3", "Bus 4", "Bus 5"]}
                  placeholder="Select Provider"
                  value={bus.busProvider}
                  onSelect={(option) =>
                    handleArrayChange("buses", index, {
                      target: { name: "busProvider", value: option },
                    })
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove("buses", index)}
                className="bg-red-500 hover:bg-red-600 text-[16px] text-white flex justify-center items-center w-40 h-[40px] border-0 cursor-pointer font-semibold rounded-lg self-end mt-2"
              >
                Remove Bus
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAdd("buses", initialBus)}
            className={
              "bg-primary-hover text-[16px] text-white flex justify-center items-center w-full h-[50px] border-0 cursor-pointer font-semibold ml-120 rounded-lg"
            }
          >
            Add Bus
          </button>
          <button
            type="button"
            onClick={() => handleAdd("buses", initialBus)}
            className={
              "bg-primary-hover text-[16px] text-white flex justify-center items-center w-full h-[50px] border-0 cursor-pointer font-semibold mr-20 ml-20 mt-30 rounded-lg"
            }
          >
            Add Event Data
          </button>
        </div>
      </div>
    </>
  );
}
