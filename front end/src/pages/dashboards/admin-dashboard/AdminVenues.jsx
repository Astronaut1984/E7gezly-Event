import { useState, useEffect, useCallback } from "react";
import { Trash, Pencil, Check } from "lucide-react";

import Input from "@/components/Input";
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
import { Button } from "@/components/ui/button";
import MessageAlertDialog from "@/components/MessageAlertDialog";

export default function AdminVenues() {
  const FIELD_CONTAINER_CLASSNAME =
    "text-[20px] flex justify-between gap-20 items-center";
  let [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    country: "",
    city: "",
    type: "",
    details: "",
    capacity: "",
  });

  const {
    items: venues,
    loading,
    fetchItems: reloadVenues,
    remove: deleteVenue,
  } = useAdminResource({
    getUrl: "http://localhost:8000/adminUtils/getvenues/",
    deleteUrl: "http://localhost:8000/adminUtils/deletevenue/",
    listKey: "venues",
    deletePayloadKey: "location_id",
  });

  const [search, setSearch] = useState("");
  const [editingVenueId, setEditingVenueId] = useState(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlertMessage = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    let formErrors = validateAddVenue(formData);
    if (Object.keys(formErrors).length !== 0) {
      setErrors(formErrors);
      return;
    }

    const payload = {
      name: formData.name,
      country: formData.country,
      city: formData.city,
      type: formData.type,
      details: formData.details,
      capacity: Number(formData.capacity),
    };

    try {
      const res = await fetch("http://localhost:8000/adminUtils/addvenues/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add venue");
      }

      showAlertMessage("Success", "Venue added successfully!");
      setErrors({});
      setFormData({
        name: "",
        country: "",
        city: "",
        type: "",
        details: "",
        capacity: "",
      });

      try {
        await reloadVenues();
      } catch (e) {}
    } catch (err) {
      console.error(err);
      showAlertMessage("Error", err.message || "Error adding venue");
    }
  };

  useEffect(() => {
    reloadVenues();
  }, [reloadVenues]);

  const handleEditToggle = useCallback((id) => {
    setEditingVenueId(id);
  }, []);

  const filteredVenues =
    !loading &&
    venues.filter((v) =>
      `${v.name || ""} ${v.city || ""} ${v.country || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  const editedVenue = editingVenueId
    ? filteredVenues.find((venue) => venue.location_id === editingVenueId)
    : null;

  const otherVenues = editingVenueId
    ? filteredVenues.filter((venue) => venue.location_id !== editingVenueId)
    : filteredVenues;

  return (
    <div className="flex flex-col justify-center items-center w-full px-32 text-[30px] font-bold">
      <h1>Venues</h1>
      <div className="flex flex-col flex-wrap w-full px-10 shadow-2xl py-5 rounded-xl bg-card mt-3">
        <h1 className="text-xl">Add a Venue</h1>
        <div className={FIELD_CONTAINER_CLASSNAME}>
          <Input
            title="Venue Name"
            name="name"
            type="text"
            placeholder="Ex: Arkan Plaza"
            onChange={handleChange}
            value={formData.name}
            error={errors.name}
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
        <div className={FIELD_CONTAINER_CLASSNAME}>
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
            name="type"
            value={formData.type}
            onChange={handleChange}
            error={errors.type}
          />
        </div>
        <div className={FIELD_CONTAINER_CLASSNAME}>
          <Input
            title="Description"
            type="text"
            placeholder={`Arkan is one of West Cairo's primary commercial and social destination. It is a pedestria...`}
            onChange={handleChange}
            value={formData.details}
            name="details"
            error={errors.details}
          />
        </div>
        <div className={FIELD_CONTAINER_CLASSNAME}>
          <Input
            title="Capacity"
            type="text"
            placeholder={`300`}
            classNameVar="w-70"
            name="capacity"
            value={formData.capacity}
            error={errors.capacity}
            onChange={(e) => {
              const newValue = e.target.value.replace(/[^0-9]/g, "");
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

        {loading && (
          <div className="w-full flex justify-center flex-wrap gap-5 pb-5">
            <Spinner />
          </div>
        )}

        {!loading && filteredVenues.length === 0 && (
          <p className="text-center w-full">No Venues found</p>
        )}

        {editedVenue && (
          <div className="w-full flex justify-center py-5">
            <VenueCard
              venue={editedVenue}
              key={editedVenue.location_id}
              onDelete={() => deleteVenue(editedVenue.location_id)}
              onUpdate={reloadVenues}
              showAlertMessage={showAlertMessage}
              onEditToggle={handleEditToggle}
              isBeingEditedByParent={true}
            />
          </div>
        )}

        <div
          className={`w-full flex justify-start flex-wrap gap-5 py-5 ${
            editingVenueId ? "mt-10 border-t-2 border-accent pt-10" : ""
          }`}
        >
          {!loading &&
            otherVenues.map((venue) => {
              const id = venue.location_id ?? venue.id ?? venue._id;
              return (
                <VenueCard
                  key={id || venue.name}
                  venue={venue}
                  onDelete={() => deleteVenue(id)}
                  onUpdate={reloadVenues}
                  showAlertMessage={showAlertMessage}
                  onEditToggle={handleEditToggle}
                  isBeingEditedByParent={false}
                />
              );
            })}
        </div>
      </main>

      <MessageAlertDialog
        title={alertTitle}
        message={alertMessage}
        open={showAlert}
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
}

function VenueCard({
  venue,
  onDelete,
  onUpdate,
  showAlertMessage,
  onEditToggle,
  isBeingEditedByParent,
}) {
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState(venue.name ?? "");
  const [editedCountry, setEditedCountry] = useState(venue.country ?? "");
  const [editedCity, setEditedCity] = useState(venue.city ?? "");
  const [editedType, setEditedType] = useState(venue.type ?? "");
  const [editedDetails, setEditedDetails] = useState(venue.details ?? "");
  const [editedCapacity, setEditedCapacity] = useState(venue.capacity ?? "");

  useEffect(() => {
    if (!isBeingEditedByParent && editMode) {
      setEditMode(false);
      setEditedName(venue.name ?? "");
      setEditedCountry(venue.country ?? "");
      setEditedCity(venue.city ?? "");
      setEditedType(venue.type ?? "");
      setEditedDetails(venue.details ?? "");
      setEditedCapacity(venue.capacity ?? "");
    } else if (isBeingEditedByParent && !editMode) {
      setEditMode(true);
      setEditedName(venue.name ?? "");
      setEditedCountry(venue.country ?? "");
      setEditedCity(venue.city ?? "");
      setEditedType(venue.type ?? "");
      setEditedDetails(venue.details ?? "");
      setEditedCapacity(venue.capacity ?? "");
    }
  }, [isBeingEditedByParent, editMode, venue]);

  const handleUpdate = async () => {
    if (!editedName || !editedCountry || !editedCity || !editedCapacity) {
      showAlertMessage(
        "Error",
        "Venue Name, Country, City, and Capacity cannot be empty."
      );
      return;
    }
    if (isNaN(editedCapacity) || Number(editedCapacity) <= 0) {
      showAlertMessage("Error", "Capacity must be a positive number.");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:8000/adminUtils/updatevenues/",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            location_id: venue.location_id,
            name: editedName,
            country: editedCountry,
            city: editedCity,
            type: editedType,
            details: editedDetails,
            capacity: Number(editedCapacity),
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        showAlertMessage("Success", data.message);
        setEditMode(false);
        onEditToggle(null);
        onUpdate();
      } else {
        showAlertMessage("Error", data.error || "Failed to update venue.");
      }
    } catch (error) {
      console.error("Error updating venue:", error);
      showAlertMessage("Error", "Error updating venue.");
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    onEditToggle(null);
    setEditedName(venue.name ?? "");
    setEditedCountry(venue.country ?? "");
    setEditedCity(venue.city ?? "");
    setEditedType(venue.type ?? "");
    setEditedDetails(venue.details ?? "");
    setEditedCapacity(venue.capacity ?? "");
  };

  const name = venue.name ?? "Unnamed Venue";

  return (
    <div
      className={`relative w-85 px-10 py-5 text-[20px] bg-card rounded-xl shadow mx-auto ${
        isBeingEditedByParent ? "w-full" : ""
      }`}
    >
      <div className="flex-grow flex flex-col items-center justify-center">
        {editMode ? (
          <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-1 gap-3">
              <Input
                title="Venue Name"
                name="name"
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
              />

              <Input
                title="Venue Type"
                name="type"
                type="text"
                value={editedType}
                onChange={(e) => setEditedType(e.target.value)}
              />
              <Input
                title="Capacity"
                name="capacity"
                type="text"
                value={editedCapacity}
                onChange={(e) => {
                  const newValue = e.target.value.replace(/[^0-9]/g, "");
                  setEditedCapacity(newValue);
                }}
              />
            </div>
            <div className="flex flex-1 gap-3">
              <Input
                title="Country"
                name="country"
                type="text"
                value={editedCountry}
                onChange={(e) => setEditedCountry(e.target.value)}
              />
              <Input
                title="City"
                name="city"
                type="text"
                value={editedCity}
                onChange={(e) => setEditedCity(e.target.value)}
              />
            </div>
            <Input
              title="Description"
              name="details"
              type="text"
              value={editedDetails}
              onChange={(e) => setEditedDetails(e.target.value)}
            />

            <div className="flex gap-2 justify-end mt-2">
              <Button
                onClick={handleUpdate}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" /> Save
              </Button>
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="font-semibold">{name}</p>
          </>
        )}
      </div>
      <div
        className="absolute bottom-0 right-0 -mb-4 -mr-6
                     flex justify-end items-center gap-2"
      >
        {!editMode && (
          <Button
            title="Edit Venue"
            onClick={() => {
              setEditMode(true);
              onEditToggle(venue.location_id);
              setEditedName(venue.name ?? "");
              setEditedCountry(venue.country ?? "");
              setEditedCity(venue.city ?? "");
              setEditedType(venue.type ?? "");
              setEditedDetails(venue.details ?? "");
              setEditedCapacity(venue.capacity ?? "");
            }}
            className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex justify-center items-center hover:cursor-pointer"
          >
            <Pencil />
          </Button>
        )}
        <AlertVenue venueName={name} onDelete={onDelete} onUpdate={onUpdate}>
          <Button
            title="delete from database"
            className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex justify-center items-center hover:cursor-pointer"
          >
            <Trash />
          </Button>
        </AlertVenue>
      </div>
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
