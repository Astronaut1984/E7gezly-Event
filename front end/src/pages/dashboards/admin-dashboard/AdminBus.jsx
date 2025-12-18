import { Ban, Trash, Pencil, Plus, BusFront } from "lucide-react"; // Import Pencil, Plus and BusFront icon
import { useEffect, useState } from "react";
import useAdminResource from "@/hooks/useAdminResource";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Import Button component
import MessageAlertDialog from "@/components/MessageAlertDialog"; // Import MessageAlertDialog
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
// import { Organizer } from "../org-dashboard/Organizer"; // Removed unused import
export default function AdminBus() {
  const [busCount, setBusCount] = useState(0);
  const [maxBusCap, setMaxBusCap] = useState(0);
  const [minBusCap, setMinBusCap] = useState(0);
  const [avgBusCap, setAvgBusCap] = useState(0);
  const {
    items: vehicles,
    loading,
    fetchItems: reloadVehicles,
    remove: deleteVehicle,
  } = useAdminResource({
    getUrl: "http://localhost:8000/adminUtils/getvehicle/",
    deleteUrl: "http://localhost:8000/adminUtils/deletevehicle/",
    listKey: "Vehicles",
    deletePayloadKey: "transportation_id",
  });
  const [search, setSearch] = useState("");
  const [newVehicleName, setNewVehicleName] = useState("");
  const [newVehicleCapacity, setNewVehicleCapacity] = useState("");

  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlertMessage = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  };

  useEffect(() => {
    reloadVehicles();
    fetch("http://localhost:8000/Record/busesindb/")
      .then((res) => res.json())
      .then((data) => setBusCount(data.count))
      .catch((err) => console.error(err));
    fetch("http://localhost:8000/Record/maxcapbuses/")
      .then((res) => res.json())
      .then((data) => setMaxBusCap(data.count))
      .catch((err) => console.error(err));
    fetch("http://localhost:8000/Record/mincapbuses/")
      .then((res) => res.json())
      .then((data) => setMinBusCap(data.count))
      .catch((err) => console.error(err));
    fetch("http://localhost:8000/Record/avgcapbuses/")
      .then((res) => res.json())
      .then((data) => setAvgBusCap(data.count))
      .catch((err) => console.error(err));
  }, [reloadVehicles]);

  const addVehicle = async () => {
    if (!newVehicleName) {
      showAlertMessage("Error", "Vehicle name cannot be empty.");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:8000/adminUtils/addvehicle/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newVehicleName,
            capacity: newVehicleCapacity,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        showAlertMessage("Success", data.message);
        setNewVehicleName("");
        setNewVehicleCapacity("");
        reloadVehicles();
      } else {
        showAlertMessage("Error", data.error || "Failed to add vehicle.");
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);
      showAlertMessage(
        "Error",
        "Error adding vehicle (check that capacity is entered greater than 0)."
      );
    }
  };

  const filteredVehicles =
    !loading &&
    vehicles.filter((vehicle) =>
      `${vehicle.name}`.toLowerCase().includes(search.toLowerCase())
    );

  if (loading) {
    return (
      <div className="w-full flex justify-center flex-wrap gap-5 pb-5">
        <Spinner />
      </div>
    );
  }

  return (
    <main className="flex justify-center items-center flex-col gap-5 w-full">
      <h1 className="text-3xl font-bold mt-10 flex items-center gap-2">
        <BusFront /> Vehicles
      </h1>
      <div className="text-center mb-4 text-primary">
        <i> Number of Buses: {busCount}</i>
        <i> Max Capacity: {maxBusCap}</i>
        <i> Min Capacity: {minBusCap}</i>
        <i> Average Capacity: {avgBusCap}</i>
      </div>
      {/* Add Vehicle Section */}
      <div className="flex flex-col flex-wrap w-200 px-10 shadow-2xl text-[30px] font-bold py-5 rounded-xl bg-card mt-3 mb-5">
        <h1 className="text-xl font-bold mb-5 flex items-center gap-2">
          <Plus /> Add Vehicles
        </h1>
        <div>
          <div className="mb-4">
            <Input
              placeholder="New Vehicle Name"
              value={newVehicleName}
              onChange={(e) => setNewVehicleName(e.target.value)}
            />
          </div>
          <div className="flex justify-center items-center gap-30">
            <Input
              placeholder="Capacity"
              value={newVehicleCapacity}
              onChange={(e) => setNewVehicleCapacity(e.target.value)}
              type="number"
            />
            <Button onClick={addVehicle} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Vehicle
            </Button>
          </div>
        </div>
      </div>
      {/* Search Section */}
      <div className="flex w-200 justify-center items-center mt-10">
        <Input
          placeholder="Search..."
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="w-full flex justify-start flex-wrap gap-5 py-5">
        {filteredVehicles.length === 0 ? (
          <p className="text-center w-full">No vehicles found</p>
        ) : (
          filteredVehicles.map((vehicle) => {
            return (
              <VehicleCard
                vehicleName={vehicle["name"]}
                vehicleCapacity={vehicle["capacity"]}
                key={vehicle["transportation_id"]}
                transportationId={vehicle["transportation_id"]}
                onDelete={() => deleteVehicle(vehicle["transportation_id"])}
                reloadVehicles={reloadVehicles}
                showAlertMessage={showAlertMessage}
              />
            );
          })
        )}
      </div>
      {/* Generic Message Alert Dialog */}
      <MessageAlertDialog
        title={alertTitle}
        message={alertMessage}
        open={showAlert}
        onClose={() => setShowAlert(false)}
      />
    </main>
  );
}

function VehicleCard({
  vehicleName,
  vehicleCapacity,
  transportationId,
  onDelete,
  reloadVehicles,
  showAlertMessage,
}) {
  const [editMode, setEditMode] = useState(false);
  const [editedVehicleName, setEditedVehicleName] = useState(vehicleName);
  const [editedVehicleCapacity, setEditedVehicleCapacity] =
    useState(vehicleCapacity);

  const handleUpdate = async () => {
    if (!editedVehicleName) {
      showAlertMessage("Error", "Vehicle name cannot be empty.");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:8000/adminUtils/updatevehicle/",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transportation_id: transportationId,
            name: editedVehicleName,
            capacity: editedVehicleCapacity,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        showAlertMessage("Success", data.message);
        setEditMode(false);
        reloadVehicles(); // Refresh the list
      } else {
        showAlertMessage("Error", data.error || "Failed to update vehicle.");
      }
    } catch (error) {
      console.error("Error updating vehicle:", error);
      showAlertMessage("Error", "Error updating vehicle.");
    }
  };

  return (
    <>
      <div className="relative w-90 h-24 p-5 bg-card rounded-xl shadow mx-auto flex flex-col justify-center">
        <div className="flex-grow flex flex-col items-center justify-center">
          {editMode ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedVehicleName}
                onChange={(e) => setEditedVehicleName(e.target.value)}
              />
              <Input
                value={editedVehicleCapacity}
                onChange={(e) => setEditedVehicleCapacity(e.target.value)}
                type="number"
              />
              <Button onClick={handleUpdate}>Save</Button>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <p className="text-lg font-bold">{vehicleName}</p>
              <p className="text-md">Capacity: {vehicleCapacity}</p>
            </>
          )}
        </div>
        <div
          className="absolute bottom-0 right-0 -mb-4 -mr-6
           flex justify-end items-center gap-2"
        >
          <Button
            title="Edit Vehicle"
            onClick={() => {
              setEditMode(true);
              setEditedVehicleName(vehicleName);
              setEditedVehicleCapacity(vehicleCapacity);
            }}
            className="w-12 h-12 rounded-full bg-primary-hover text-white flex justify-center items-center hover:cursor-pointer"
          >
            <Pencil />
          </Button>
          <Alert
            vehicleName={vehicleName}
            transportationId={transportationId}
            onDelete={onDelete}
          >
            <Button
              title="Delete from database"
              className="w-12 h-12 rounded-full bg-destructive hover:bg-destructive-hover text-white flex justify-center items-center hover:cursor-pointer"
            >
              <Trash />
            </Button>
          </Alert>
        </div>
      </div>
    </>
  );
}

function Alert({ children, vehicleName, transportationId, onDelete }) {
  async function handleDelete() {
    try {
      if (onDelete) await onDelete(transportationId);
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
            {vehicleName}" and remove it from the database
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
