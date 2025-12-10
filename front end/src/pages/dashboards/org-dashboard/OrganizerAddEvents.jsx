import Input from "@/components/Input";
import SelectOnly from "@/components/SelectOnly";
import { useState } from "react";
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
  const isoString = now.toISOString();
  const offset = now.getTimezoneOffset() * 60000;
  const localISOTime = new Date(now.getTime() - offset)
    .toISOString()
    .slice(0, 16);
  return isoString.substring(0, 16);
};

export default function OrganizerAddEvents() {
  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    category: "",
    start_date: "",
    end_date: "",
    location: "",
    banner: "",
    TicketTypeName: "",
    TicketDescription: "",
    TicketPrice: "",
    TicketQuantity: "",
    DiscountID: "",
    DiscountPercentage: "",
    DiscountStartDate: "",
    DiscountEndDate: "",
    DiscountQuantity: "",
    DiscountMaximumValue: "",
    Performers: [],
    buses: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "DiscountMaximumValue" || name === "DiscountPercentage" || name === "TicketPrice" || name === "TicketQuantity" || name === "DiscountQuantity") {
      newValue = value.replace(/[^0-9]/g, "")
    }
    if (name === "eventName" || name === "TicketTypeName" || name === "DiscountID") {
      newValue = value.replace(/[^a-zA-Z0-9 ]/g, "")
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

    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));
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
                setFormData({ ...formData, accountType: option })
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
              setFormData({ ...formData, accountType: option })
            }
          />

          <h1>Add Ticket Type</h1>
          <div className="flex justify-between w-full gap-30">
            <Input
              title="Ticket Type Name"
              type="text"
              name="TicketTypeName"
              placeholder="gold, silver, bronze"
              value={formData.TicketTypeName}
              onChange={handleChange}
            />
            <Input
            title="Ticket Description"
            type="text"
            name="TicketDescription"
            placeholder="front seats in amr diab concert"
            value={formData.TicketDescription}
            onChange={handleChange}
          />
          </div>
          <div className="flex justify-between w-full gap-30">
            <Input
              title="Price"
              type="Integer"
              name="TicketPrice"
              value={formData.TicketPrice}
              onChange={handleChange}
            />
            <Input
              title="Quantity"
              type="Integer"
              name="TicketQuantity"
              value={formData.TicketQuantity}
              onChange={handleChange}
              selectOnly={true}
            />
          </div>
          <h1 className="mt-25">Add Discount</h1>
          <div className="flex justify-between w-full gap-30">
            <Input
              title="Discount ID"
              type="text"
              name="DiscountID"
              placeholder="NEWYEAR2026"
              value={formData.DiscountID}
              onChange={handleChange}
            />
            <Input
              title="Discount Quantity"
              type="Integer"
              name="DiscountQuantity"
              value={formData.DiscountQuantity}
              onChange={handleChange}
              selectOnly={true}
            />
          </div>
          <div className="flex justify-between w-full gap-30">
            <Input
              title="Discount Percentage"
              type="percentage"
              name="DiscountPercentage"
              value={formData.DiscountPercentage}
              onChange={handleChange}
              icon="fa-light fa-percent text-black top-[68px] fa-sm"
              
            />
            <Input
              title="Discount maximum value"
              type="Integer"
              name="DiscountMaximumValue"
              value={formData.DiscountMaximumValue}
              onChange={handleChange}
            />
          </div>
          <div className="flex justify-between w-full gap-30">
            <Input
              title="Discount Start Date"
              type="date"
              name="DiscountStartDate"
              min={minDate}
              value={formData.DiscountStartDate}
              onChange={handleChange}
              selectOnly={true}
            />
            <Input
              title="Discount End Date"
              type="date"
              name="DiscountEndDate"
              min={formData.DiscountStartDate}
              value={formData.DiscountEndDate}
              onChange={handleChange}
              selectOnly={true}
            />
          </div>


        <h1 className="mt-25">Add Performer</h1>
        <div className="flex flex-wrap w-full px-32 py-5 rounded-xl mt-3">
          <div className="flex justify-between w-full gap-30">
            <SelectOnly
              title="Performer"
              options={["Amr Diab", "Hany Shaker", "Mohamed Mounir", "Sherine", "Tamer Hosny"]}
              type="text"
              name="TicketTypeName"
              placeholder="Amr Diab"
              value={formData.Performers}
              onChange={handleChange}
            />
          </div>
        </div>
        <h1 className="mt-25">Add Buses</h1>
        <div className="flex flex-wrap w-full px-32 py-5 rounded-xl mt-3">
          <div className="flex justify-between w-full gap-30">
            <SelectOnly
              title="BusCapacity"
              options={["20", "30", "40", "50", "60"]}
              type="text"
              name="TicketTypeName"
              placeholder="Amr Diab"
              value={formData.Performers}
              onChange={handleChange}
            />
            <SelectOnly
              title="Performer"
              options={["Bus 1", "Bus 2", "Bus 3", "Bus 4", "Bus 5"]}
              type="text"
              name="TicketTypeName"
              placeholder="Amr Diab"
              value={formData.Performers}
              onChange={handleChange}
            />
          </div>

        </div>
        </div>



      </div>
      
    </>
  );
}
