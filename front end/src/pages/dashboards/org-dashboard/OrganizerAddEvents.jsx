import Input from "@/components/Input";
import SelectOnly from "@/components/SelectOnly";
import { useState, useEffect } from "react";

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
  performerId: null, // Change to store ID, not just name
  performerName: "",
};

const initialBus = {
  busCapacity: "",
  busProvider: "",
};

export default function OrganizerAddEvents() {
  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    category: null,
    start_date: "",
    end_date: "",
    location: "",
    banner: "",
    tickets: [{ ...initialTicket }], // Start with 1 ticket type
    discounts: [],
    performers: [],
    buses: [],
  });

  // State for fetched data lists
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [performersList, setPerformersList] = useState([]);

  // State for loading indicators
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingPerformers, setLoadingPerformers] = useState(true);

  // ----------------------------------------------------
  // 🎯 Consolidated Data Fetching Function
  // ----------------------------------------------------
  /**
   * Fetches data from a specific endpoint and updates the relevant state.
   * @param {string} url - The API endpoint URL.
   * @param {function} setter - The state setter function (e.g., setCategories).
   * @param {function} loadingSetter - The loading state setter (e.g., setLoadingCategories).
   * @param {string} dataKey - The key in the JSON response (e.g., "categories", "venues", "performers").
   */
  const fetchData = async (url, setter, loadingSetter, dataKey) => {
    loadingSetter(true);
    console.log(`Fetching ${dataKey} from API: ${url}`);
    try {
      // Simulate network delay for performers, if needed, otherwise remove this line
      if (dataKey === "performers")
        await new Promise((resolve) => setTimeout(resolve, 500));

      const res = await fetch(url);

      if (!res.ok) {
        console.error(`${dataKey} fetching failed with status:`, res.status);
        setter([]);
        return;
      }

      const data = await res.json();
      setter(data[dataKey] || []);
    } catch (err) {
      console.error(`Error fetching ${dataKey}:`, err);
      setter([]);
    } finally {
      loadingSetter(false);
    }
  };

  useEffect(() => {
    // Call the single fetch function for each data type
    fetchData(
      "http://localhost:8000/event/getcategories/",
      setCategories,
      setLoadingCategories,
      "categories"
    );

    fetchData(
      "http://localhost:8000/event/getvenues/",
      setVenues,
      setLoadingVenues,
      "venues"
    );

    fetchData(
      "http://localhost:8000/event/getperformers/",
      setPerformersList,
      setLoadingPerformers,
      "performers"
    );
  }, []); // Empty dependency array ensures this runs once on mount

  // --- General Change Handler for static fields (UNCHANGED) ---
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
  // Change Handler for Array Fields (UNCHANGED)
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
      // Ensure there is always at least one ticket
      if (arrayName === "tickets" && newArray.length === 0) {
        return {
          ...prevData,
          [arrayName]: [{ ...initialTicket }],
        };
      }
      return {
        ...prevData,
        [arrayName]: newArray,
      };
    });
  };

  // ----------------------------------------------------
  // Placeholder for Handle Submit
  // ----------------------------------------------------
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);
    // TODO: Add validation logic here
    // TODO: Add API call (e.g., POST) to submit formData
    alert("Form submitted! Check console for data structure.");
  };

  const minDate = getMinDateTime();
  return (
    <form onSubmit={handleSubmit}>
      {" "}
      {/* Use a form element and handleSubmit */}
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
              options={
                !loadingCategories &&
                categories.map((cat) => cat["category_name"])
              }
              placeholder="Select category"
              // Corrected value binding logic
              value={
                categories.find((c) => c.category_id === formData.category)
                  ?.category_name || ""
              }
              onSelect={(selectedName) => {
                const selectedCategory = categories.find(
                  (c) => c.category_name === selectedName
                );
                setFormData((prevData) => ({
                  ...prevData,
                  category: selectedCategory ? selectedCategory.id : null,
                }));
              }}
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
            />
            <Input
              title="End Date"
              type="datetime-local"
              name="end_date"
              min={formData.start_date}
              value={formData.end_date}
              onChange={handleChange}
            />
          </div>
          <SelectOnly
            title="Venue"
            options={
              !loadingVenues && venues.map((v) => v["name"]) // Use 'name' from venues
            }
            placeholder="Select location"
            // Corrected value binding logic
            value={
              venues.find((v) => v.location_id === formData.venue)?.name || ""
            }
            onSelect={(selectedName) => {
              const selectedVenue = venues.find((v) => v.name === selectedName);
              setFormData((prevData) => ({
                ...prevData,
                venue: selectedVenue ? selectedVenue.location_id : "",
              }));
            }}
          />
          {/* --- Ticket Types Section (Dynamic) --- */}
          <h1 className="mt-5 w-full">
            Ticket Types (Count: {formData.tickets.length})
          </h1>{" "}
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
                />
              </div>
              {formData.tickets.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemove("tickets", index)}
                  className="bg-red-500 hover:bg-red-600 text-[16px] text-white flex justify-center items-center w-40 h-10 border-0 cursor-pointer font-semibold rounded-lg self-end mt-2"
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
          {/* --- Discount Section (Dynamic) --- */}
          <h1 className="mt-5 w-full">
            Discounts (Count: {formData.discounts.length})
          </h1>{" "}
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
                />
              </div>
              <div className="flex justify-between w-full gap-30">
                <Input
                  title="Discount Percentage"
                  type="percentage"
                  name="DiscountPercentage"
                  value={discount.DiscountPercentage}
                  onChange={(e) => handleArrayChange("discounts", index, e)}
                  icon="fa-light fa-percent text-foreground top-[68px] fa-sm"
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
                />
                <Input
                  title="Discount End Date"
                  type="date"
                  name="DiscountEndDate"
                  min={discount.DiscountStartDate || minDate}
                  value={discount.DiscountEndDate}
                  onChange={(e) => handleArrayChange("discounts", index, e)}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove("discounts", index)}
                className="bg-red-500 hover:bg-red-600 text-[16px] text-white flex justify-center items-center w-40 h-10 border-0 cursor-pointer font-semibold rounded-lg self-end mt-2"
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
          {/* --- Performers Section (Dynamic) --- */}
          <h1 className="mt-5 w-full">
            Performers (Count: {formData.performers.length})
          </h1>{" "}
          {formData.performers.map((performer, index) => {
            // 🎯 FILTER LOGIC (1): Calculate available performers for this specific slot
            // Get IDs of all performers *already assigned* to other slots
            const assignedPerformerIds = formData.performers
              .filter((p, i) => i !== index) // Exclude the current performer slot
              .map((p) => p.performerId);

            // Filter the full list to get only available performers
            const availablePerformers = performersList.filter(
              (p) => !assignedPerformerIds.includes(p.performer_id)
            );

            // Map available performers to options (names)
            const performerOptions = availablePerformers.map((p) => p.name);

            return (
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
                    // Use the filtered options list
                    options={!loadingPerformers && performerOptions}
                    placeholder="Select Performer"
                    value={performer.performerName}
                    onSelect={(selectedName) => {
                      const selectedPerformer = performersList.find(
                        (p) => p.name === selectedName
                      );

                      if (!selectedPerformer) return;

                      // Update the array item with both ID and Name
                      setFormData((prevData) => {
                        const newArray = [...prevData.performers];
                        newArray[index] = {
                          ...newArray[index],
                          performerName: selectedName,
                          performerId: selectedPerformer.performer_id,
                        };
                        return {
                          ...prevData,
                          performers: newArray,
                        };
                      });
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove("performers", index)}
                  className="bg-red-500 hover:bg-red-600 text-[16px] text-white flex justify-center items-center w-40 h-10 border-0 cursor-pointer font-semibold rounded-lg self-end mt-2"
                >
                  Remove Performer
                </button>
              </div>
            );
          })}
          {/* 👇 DISABLE BUTTON LOGIC (2) 👇 */}
          {(() => {
            const canAddPerformer =
              formData.performers.length < performersList.length;
            const buttonClass = canAddPerformer
              ? "bg-primary-hover text-[16px] text-white"
              : "bg-gray-400 text-[16px] text-gray-700 cursor-not-allowed";

            return (
              <button
                type="button"
                onClick={() => handleAdd("performers", initialPerformer)}
                disabled={!canAddPerformer}
                className={`${buttonClass} flex justify-center items-center w-full h-[50px] border-0 font-semibold ml-120 rounded-lg`}
              >
                {canAddPerformer ? "Add Performer" : "All Performers Assigned"}
              </button>
            );
          })()}
          {/* --- Buses Section (Dynamic) --- */}
          <h1 className="mt-5 w-full">
            Buses (Count: {formData.buses.length})
          </h1>{" "}
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
                className="bg-red-500 hover:bg-red-600 text-[16px] text-white flex justify-center items-center w-40 h-10 border-0 cursor-pointer font-semibold rounded-lg self-end mt-2"
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
            type="submit" // Changed to type="submit"
            className={
              "bg-primary-hover text-[16px] text-white flex justify-center items-center w-full h-[50px] border-0 cursor-pointer font-semibold mr-20 ml-20 mt-30 rounded-lg"
            }
          >
            Add Event Data
          </button>
        </div>
      </div>
    </form>
  );
}
