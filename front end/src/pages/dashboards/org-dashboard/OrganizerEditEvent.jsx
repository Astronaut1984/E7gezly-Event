import Input from "@/components/Input";
import SelectOnly from "@/components/SelectOnly";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ImagePicker from "@/components/ImagePicker";
import { Spinner } from "@/components/ui/spinner";

const getMinDateTime = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

const initialTicket = {
  ticket_type_id: null, // null means new ticket
  TicketTypeName: "",
  TicketDescription: "",
  TicketPrice: "",
  TicketQuantity: "",
};

const initialPerformer = { performerId: null, performerName: "" };

export default function OrganizerEditEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    category: null,
    start_date: "",
    end_date: "",
    location: "",
    tickets: [{ ...initialTicket }],
    performers: [],
    buses: [],
    discounts: [],
  });

  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [performersList, setPerformersList] = useState([]);
  const [availableBuses, setAvailableBuses] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingPerformers, setLoadingPerformers] = useState(true);
  const [loadingCapacities, setLoadingCapacities] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [currentBanner, setCurrentBanner] = useState(null);

  // Fetch event data
  useEffect(() => {
    fetchEventData();
  }, [eventId]);

  // Fetch dropdown data
  useEffect(() => {
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
  }, []);

  // Fetch available bus capacities when dates change
  useEffect(() => {
    const { start_date, end_date } = formData;
    if (start_date) {
      fetchData(
        "http://localhost:8000/event/getavailablebuscapacities/",
        setAvailableBuses,
        setLoadingCapacities,
        "availableBuses",
        "POST",
        { start_date, end_date, event_id: eventId } // ← Add event_id
      );
    } else {
      setAvailableBuses([]);
      setLoadingCapacities(false);
    }
  }, [formData.start_date, formData.end_date]);

  const fetchEventData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/event/geteventbyid/${eventId}/`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();
      const event = data.event;

      // Map tickets with their IDs for editing
      const ticketsData = event.tickets.map((ticket) => ({
        ticket_type_id: ticket.ticket_type_id,
        TicketTypeName: ticket.name,
        TicketDescription: ticket.description || "",
        TicketPrice: ticket.price.toString(),
        TicketQuantity: ticket.quantity?.toString() || "",
      }));

      // Map performers with their IDs
      const performersData = event.performers.map((performer) => ({
        performerId: performer.performer_id,
        performerName: performer.name,
      }));

      // Map buses with their data
      const busesData = event.buses.map((bus) => ({
        busTransportationId: bus.transportation_id,
        busName: bus.name || `Bus ${bus.transportation_id}`,
        busCapacity: bus.capacity,
        busDepartureLocation: bus.departure_loc || "",
      }));

      setFormData({
        eventName: event.name || "",
        description: event.description || "",
        category: event.category || null,
        start_date: event.start_date || "",
        end_date: event.end_date || "",
        location: event.location_id || "",
        tickets: ticketsData.length > 0 ? ticketsData : [{ ...initialTicket }],
        performers: performersData,
        buses: busesData,
      });

      setCurrentBanner(event.banner);
    } catch (error) {
      console.error("Error fetching event:", error);
      alert("Failed to load event data");
      navigate("/org/my-events");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (
    url,
    setter,
    loadingSetter,
    dataKey,
    method = "GET",
    bodyData = null
  ) => {
    loadingSetter(true);
    try {
      const options = {
        method: method,
        headers: {},
      };

      if (bodyData) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(bodyData);
      }

      const res = await fetch(url, options);
      if (!res.ok) {
        console.error(`${dataKey} fetching failed with status:`, res.status);
        setter([]);
        return;
      }

      const data = await res.json();
      console.log(data);
      setter(data[dataKey] || []);
    } catch (err) {
      console.error(`Error fetching ${dataKey}:`, err);
      setter([]);
    } finally {
      loadingSetter(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "eventName") {
      newValue = value.replace(/[^a-zA-Z0-9 ]/g, "");
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));
  };

  const handleArrayChange = (arrayName, index, e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "TicketPrice" || name === "TicketQuantity") {
      newValue = value.replace(/[^0-9]/g, "");
    }
    if (name === "TicketTypeName") {
      newValue = value.replace(/[^a-zA-Z0-9 ]/g, "");
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

  const handleArraySelect = async (
    arrayName,
    index,
    fieldName,
    selectedValue
  ) => {
    setFormData((prevData) => {
      const newArray = [...prevData[arrayName]];

      if (arrayName === "buses" && fieldName === "busCapacity") {
        newArray[index] = {
          ...newArray[index],
          [fieldName]: selectedValue,
        };
      } else if (arrayName === "performers" && fieldName === "performerName") {
        const selectedPerformer = performersList.find(
          (p) => p.name === selectedValue
        );
        newArray[index] = {
          ...newArray[index],
          performerName: selectedValue,
          performerId: selectedPerformer
            ? selectedPerformer.performer_id
            : null,
        };
      }

      return {
        ...prevData,
        [arrayName]: newArray,
      };
    });
  };

  const handleAdd = (arrayName, initialItem) => {
    setFormData((prevData) => {
      if (arrayName === "buses" && !prevData.start_date && !prevData.end_date) {
        alert("Please set the Event Start Date before adding a bus.");
        return prevData;
      }

      return {
        ...prevData,
        [arrayName]: [...prevData[arrayName], { ...initialItem }],
      };
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("event_id", eventId);

      if (imageFile) {
        formDataToSend.append("banner", imageFile);
      }

      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "performers" && key !== "buses" && key !== "tickets") {
          formDataToSend.append(key, value);
        }
      });

      formDataToSend.append(
        "performers",
        JSON.stringify(
          formData.performers.map((p) => p.performerId).filter(Boolean)
        )
      );

      formDataToSend.append(
        "buses",
        JSON.stringify(
          formData.buses.map((b) => ({
            transportation_id: parseInt(b.busTransportationId),
            departure_loc: b.busDepartureLocation,
          }))
        )
      );

      const eventRes = await fetch("http://localhost:8000/event/editevent/", {
        method: "POST",
        body: formDataToSend,
        credentials: "include",
      });

      const eventData = await eventRes.json();

      if (!eventRes.ok) {
        alert(eventData.error || "Failed to update event");
        setSubmitting(false);
        return;
      }

      // Handle tickets - edit existing, add new, delete removed
      for (let ticket of formData.tickets) {
        const ticketContent = {
          event: eventId,
          name: ticket.TicketTypeName,
          description: ticket.TicketDescription,
          price: parseInt(ticket.TicketPrice),
          quantity: parseInt(ticket.TicketQuantity),
        };

        if (ticket.ticket_type_id) {
          // Edit existing ticket
          await fetch("http://localhost:8000/event/edittickettype/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ticket_type_id: ticket.ticket_type_id,
              ...ticketContent,
            }),
          });
        } else {
          // Add new ticket
          await fetch("http://localhost:8000/event/addtickettype/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ticketContent),
          });
        }
      }

      alert("Event updated successfully!");
      navigate("/org/my-events");
    } catch (error) {
      console.error("Error updating event:", error);
      alert("An error occurred while updating the event");
      setSubmitting(false);
    }
  };

  const minDate = getMinDateTime();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col justify-center items-center w-full px-32 text-[30px] font-bold">
        <h1>Edit Event</h1>
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
                  category: selectedCategory
                    ? selectedCategory.category_id
                    : null,
                }));
              }}
            />
          </div>
          <Input
            title="Description"
            type="text"
            name="description"
            placeholder="Event description"
            value={formData.description}
            onChange={handleChange}
          />
          <div className="flex justify-between w-full gap-30">
            <Input
              title="Start Date"
              type="date"
              name="start_date"
              min={minDate}
              value={formData.start_date}
              onChange={handleChange}
            />
            <Input
              title="End Date (optional)"
              type="date"
              name="end_date"
              min={formData.start_date}
              value={formData.end_date}
              onChange={handleChange}
            />
          </div>
          <SelectOnly
            title="Venue"
            options={!loadingVenues && venues.map((v) => v["name"])}
            placeholder="Select location"
            value={
              venues.find((v) => v.location_id === formData.location)?.name ||
              ""
            }
            onSelect={(selectedName) => {
              const selectedVenue = venues.find((v) => v.name === selectedName);
              setFormData((prevData) => ({
                ...prevData,
                location: selectedVenue ? selectedVenue.location_id : "",
              }));
            }}
          />

          {/* Current Banner Preview */}
          {currentBanner && !imageFile && (
            <div className="w-full mb-4">
              <h2 className="text-[20px] font-semibold mb-2">Current Banner</h2>
              <img
                src={currentBanner}
                alt="Current banner"
                className="w-full max-w-md rounded-lg"
              />
            </div>
          )}

          <ImagePicker onChange={setImageFile} />

          {/* ---------------------------------------------------- */}
          {/* --- Ticket Types Section --- */}
          {/* ---------------------------------------------------- */}
          <h1 className="mt-5 w-full">
            Ticket Types (Count: {formData.tickets.length})
          </h1>
          {formData.tickets.map((ticket, index) => (
            <div
              key={index}
              className="flex flex-col w-full border-2 border-dashed border-gray-300 p-4 mb-4 rounded-lg"
            >
              <h2 className="text-[20px] font-semibold">
                Ticket #{index + 1}
                {ticket.ticket_type_id && (
                  <span className="text-sm text-gray-500 ml-2">(Existing)</span>
                )}
              </h2>
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
                  type="text"
                  name="TicketPrice"
                  value={ticket.TicketPrice}
                  onChange={(e) => handleArrayChange("tickets", index, e)}
                />
                <Input
                  title="Quantity"
                  type="text"
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
            className="bg-primary-hover text-[16px] text-white flex justify-center items-center w-full h-[50px] border-0 cursor-pointer font-semibold rounded-lg"
          >
            Add Ticket Type
          </button>

          {/* Discounts section */}

          {formData.discounts?.map((discount, index) => (
            <div
              key={index}
              className="flex flex-col w-full border-2 border-dashed border-gray-300 p-4 mb-4 rounded-lg"
            >
              <h2 className="text-[20px] font-semibold">
                Discount #{index + 1}
                {discount.discount_id && (
                  <span className="text-sm text-gray-500 ml-2">
                    (Code: {discount.discount_id})
                  </span>
                )}
              </h2>

              {/* Discount Code */}
              <div className="flex justify-between w-full gap-6">
                <Input
                  title="Discount Code"
                  type="text"
                  name="discount_id"
                  placeholder="e.g. Summer25"
                  value={discount.discount_id}
                  onChange={(e) => handleArrayChange("discounts", index, e)}
                />
              </div>

              {/* Percentage + Quantity */}
              <div className="flex justify-between w-full gap-6">
                <Input
                  title="Discount Percentage (%)"
                  type="number"
                  name="percentage"
                  placeholder="e.g. 20"
                  value={discount.percentage}
                  onChange={(e) => handleArrayChange("discounts", index, e)}
                />

                <Input
                  title="Quantity"
                  type="number"
                  name="quantity"
                  placeholder="e.g. 100"
                  value={discount.quantity}
                  onChange={(e) => handleArrayChange("discounts", index, e)}
                />
              </div>

              {/* Max Value */}
              <div className="flex justify-between w-full gap-6">
                <Input
                  title="Max Discount Value (Optional)"
                  type="number"
                  name="max_value"
                  placeholder="Leave empty for no limit"
                  value={discount.max_value || ""}
                  onChange={(e) => handleArrayChange("discounts", index, e)}
                />
              </div>

              {/* Start Date + End Date */}
              <div className="flex justify-between w-full gap-6">
                <Input
                  title="Start Date"
                  type="date"
                  name="start_date"
                  value={discount.start_date}
                  onChange={(e) => handleArrayChange("discounts", index, e)}
                />

                <Input
                  title="End Date"
                  type="date"
                  name="end_date"
                  value={discount.end_date}
                  onChange={(e) => handleArrayChange("discounts", index, e)}
                />
              </div>

              {/* Remove Discount */}
              {formData.discounts.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemove("discounts", index)}
                  className="bg-red-500 hover:bg-red-600 text-[16px] text-white flex justify-center items-center w-44 h-10 border-0 cursor-pointer font-semibold rounded-lg self-end mt-3"
                >
                  Remove Discount
                </button>
              )}
            </div>
          ))}

          {/* ---------------------------------------------------- */}
          {/* --- Performers Section --- */}
          {/* ---------------------------------------------------- */}
          <h1 className="mt-5 w-full">
            Performers (Count: {formData.performers.length})
          </h1>
          {formData.performers.map((performer, index) => {
            const assignedPerformerIds = formData.performers
              .filter((p, i) => i !== index)
              .map((p) => p.performerId);

            const availablePerformers = performersList.filter(
              (p) => !assignedPerformerIds.includes(p.performer_id)
            );

            const performerOptions = availablePerformers.map((p) => p.name);

            return (
              <div
                key={index}
                className="flex flex-col w-full border-2 border-dashed border-gray-300 p-4 mb-4 rounded-lg"
              >
                <h2 className="text-[20px] font-semibold">
                  Performer #{index + 1}
                </h2>
                <SelectOnly
                  title="Performer Name"
                  options={!loadingPerformers && performerOptions}
                  placeholder="Select Performer"
                  value={performer.performerName}
                  onSelect={(selectedName) =>
                    handleArraySelect(
                      "performers",
                      index,
                      "performerName",
                      selectedName
                    )
                  }
                />
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
          <button
            type="button"
            onClick={() => handleAdd("performers", initialPerformer)}
            disabled={formData.performers.length >= performersList.length}
            className={`${
              formData.performers.length >= performersList.length
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary-hover cursor-pointer"
            } text-[16px] text-white flex justify-center items-center w-full h-[50px] border-0 font-semibold rounded-lg`}
          >
            {formData.performers.length >= performersList.length
              ? "All Performers Assigned"
              : "Add Performer"}
          </button>

          {/* ---------------------------------------------------- */}
          {/* --- Buses Section --- */}
          {/* ---------------------------------------------------- */}
          <h1 className="mt-5 w-full">
            Buses (Count: {formData.buses.length})
          </h1>
          {formData.buses.map((bus, index) => {
            // Filter out already selected buses
            const selectedBusIds = formData.buses
              .filter((b, i) => i !== index && b.busTransportationId)
              .map((b) => b.busTransportationId);

            const availableForThisSlot = availableBuses.filter(
              (b) => !selectedBusIds.includes(b.transportation_id)
            );

            return (
              <div
                key={index}
                className="flex flex-col w-full border-2 border-dashed border-gray-300 p-4 mb-4 rounded-lg"
              >
                <h2 className="text-[20px] font-semibold">Bus #{index + 1}</h2>
                <div className="flex justify-between w-full gap-30">
                  <SelectOnly
                    title="Select Bus"
                    options={
                      formData.start_date && loadingCapacities
                        ? ["Loading..."]
                        : availableForThisSlot.map(
                            (b) => `${b.name} (Capacity: ${b.capacity})`
                          )
                    }
                    placeholder={
                      !formData.start_date
                        ? "Set event date first"
                        : availableForThisSlot.length === 0
                        ? "No buses available"
                        : "Select Bus"
                    }
                    value={
                      bus.busTransportationId
                        ? `${bus.busName} (Capacity: ${bus.busCapacity})`
                        : ""
                    }
                    onSelect={(selectedDisplay) => {
                      const selectedBus = availableForThisSlot.find(
                        (b) =>
                          `${b.name} (Capacity: ${b.capacity})` ===
                          selectedDisplay
                      );
                      if (selectedBus) {
                        setFormData((prevData) => {
                          const newBuses = [...prevData.buses];
                          newBuses[index] = {
                            ...newBuses[index],
                            busTransportationId: selectedBus.transportation_id,
                            busName: selectedBus.name,
                            busCapacity: selectedBus.capacity,
                          };
                          return { ...prevData, buses: newBuses };
                        });
                      }
                    }}
                    disabled={
                      !formData.start_date ||
                      loadingCapacities ||
                      availableForThisSlot.length === 0
                    }
                  />
                  <Input
                    title="Departure Location"
                    type="text"
                    name="busDepartureLocation"
                    placeholder="Cairo Stadium, Gate 3"
                    value={bus.busDepartureLocation}
                    onChange={(e) => handleArrayChange("buses", index, e)}
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
            );
          })}

          <button
            type="button"
            onClick={() => handleAdd("buses", initialBus)}
            disabled={!formData.start_date}
            className={`${
              !formData.start_date
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary-hover cursor-pointer"
            } text-[16px] text-white flex justify-center items-center w-full h-[50px] border-0 font-semibold rounded-lg`}
          >
            Add Bus (Requires Event Dates)
          </button>

          <button
            type="submit"
            disabled={submitting}
            className={`${
              submitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary-hover cursor-pointer"
            } text-[16px] text-white flex justify-center items-center w-full h-[50px] border-0 font-semibold mr-20 ml-20 mt-30 rounded-lg`}
          >
            {submitting ? (
              <div className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Updating...
              </div>
            ) : (
              "Update Event"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
