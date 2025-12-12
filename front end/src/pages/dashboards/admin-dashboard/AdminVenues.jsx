import Input from "@/components/Input";
import { useState, useEffect } from "react";
import { Trash } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { validateAddVenue } from "@/pages/sign up/validations";
import useAdminResource from "@/hooks/useAdminResource";
import { Input as Search } from "@/components/ui/input";

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

  const {
    items: venues,
    loading,
    fetchItems: reloadVenues,
    remove: deleteVenue,
  } = useAdminResource({
    getUrl: "http://localhost:8000/adminutils/getvenues/",
    deleteUrl: "http://localhost:8000/adminutils/deletevenue/",
    listKey: "venues",
    deletePayloadKey: "location_id",
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
      // refresh list if available
      try {
        await reloadVenues();
      } catch (e) {}
    } catch (err) {
      console.error(err);
      alert("Error adding venue");
    }
  };

  useEffect(() => {
    reloadVenues();
  }, [reloadVenues]);

  const [search, setSearch] = useState("");

  const filteredVenues =
    !loading &&
    venues.filter((v) =>
      `${v.venueName || v.name || ""} ${v.city || ""} ${v.country || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  return (
    <div className="flex flex-col justify-center items-center w-full px-32 text-[30px] font-bold">
      <h1>Venues</h1>
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
      <div className="w-full border-b-2 border-accent mt-6"></div>

      <main className="flex justify-center items-center flex-col gap-5 w-full text-[15px] my-10">
        <div className="flex w-100 justify-center items-center">
          <Search
            placeholder="Search..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-full flex justify-start flex-wrap gap-5 py-5">
          {!loading && filteredVenues.length === 0 && (
            <p className="text-center w-full">No Venues found</p>
          )}

          {!loading &&
            filteredVenues.map((venue) => {
              const id = venue.location_id ?? venue.id ?? venue._id;
              return (
                <VenueCard
                  key={id || venue.venueName}
                  venue={venue}
                  onDelete={() => deleteVenue(id)}
                  onUpdate={() => reloadVenues()}
                />
              );
            })}

          {loading && (
            <div className="w-full flex justify-center flex-wrap gap-5 pb-5">
              <Spinner />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function VenueCard({ venue, onDelete, onUpdate }) {
  const name = venue.venueName ?? venue.name ?? "Unnamed Venue";
  const city = venue.city ?? "";
  const country = venue.country ?? "";
  const capacity = venue.capacity ?? "";
  return (
    <div className="relative max-w-max px-10 py-5 text-[20px] bg-card rounded-xl shadow mx-5">
      <p className="font-semibold">{name}</p>
      <p className="text-sm">
        {city} - {country}
      </p>
      <p className="text-sm">Capacity: {capacity}</p>
      <AlertVenue venueName={name} onDelete={onDelete} onUpdate={onUpdate}>
        <div
          title="delete from database"
          className="absolute bottom-0 right-0 -mb-4 -mr-6 w-12 h-12 rounded-full destructive-on-hover text-destructive-foreground flex justify-center items-center hover:cursor-pointer"
        >
          <Trash />
        </div>
      </AlertVenue>
    </div>
  );
}

function AlertVenue({ children, venueName, onDelete, onUpdate }) {
  async function handleDelete() {
    try {
      if (onDelete) await onDelete();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete "
            {venueName}" and remove it from the database
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="hover:cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction className="hover:cursor-pointer">
            <div className="hover:cursor-pointer" onClick={handleDelete}>
              Continue
            </div>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
