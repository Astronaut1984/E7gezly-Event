import Input from "@/components/Input";
import { validateAddPerformer } from "@/pages/sign up/validations";
import { useEffect, useState, useCallback } from "react"; // Added useCallback
import useAdminResource from "@/hooks/useAdminResource";
import { Spinner } from "@/components/ui/spinner";
import { Input as Search } from "@/components/ui/input";
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
import { Trash, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import MessageAlertDialog from "@/components/MessageAlertDialog";
export default function AdminPerformers() {
  const [performerCount, setPerformerCount] = useState(0);
  const FIELD_CONATIANER_CLASSNAME =
    "text-[20px] flex justify-between gap-20 items-center";

  let [errors, setErrors] = useState({});
  const {
    items: performers,
    loading,
    fetchItems: reloadPerformers,
    remove: deletePer,
  } = useAdminResource({
    getUrl: "http://localhost:8000/adminUtils/getperformers/",
    deleteUrl: "http://localhost:8000/adminUtils/deleteperformer/",
    listKey: "performers",
    deletePayloadKey: "id",
  });
  const [search, setSearch] = useState("");
  const [editingPerformerId, setEditingPerformerId] = useState(null); // New state for tracking editing performer

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
  });

  // State for generic message alert dialog
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
    // validation
    let formErrors = validateAddPerformer(formData);
    if (Object.keys(formErrors).length !== 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:8000/adminUtils/addperformer/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) throw new Error("Failed to add performer");

      showAlertMessage("Success", "Performer added successfully!");
      setErrors({});
      setFormData({ name: "", bio: "" });
      await reloadPerformers();
    } catch (err) {
      console.error(err);
      showAlertMessage("Error", "Error adding performer");
    }
  };

  useEffect(() => {
    reloadPerformers();
    fetch("http://localhost:8000/Record/performersindb/")
      .then((res) => res.json())
      .then((data) => setPerformerCount(data.count))
      .catch((err) => console.error(err));
  }, [reloadPerformers]);

  const handleEditToggle = useCallback((id) => {
    setEditingPerformerId(id);
  }, []);

  const filteredPerformers =
    !loading &&
    performers.filter((per) =>
      `${per.name} ${per.bio}`.toLowerCase().includes(search.toLowerCase())
    );

  const editedPerformer = editingPerformerId
    ? filteredPerformers.find((per) => per.performer_id === editingPerformerId)
    : null;

  const otherPerformers = editingPerformerId
    ? filteredPerformers.filter(
        (per) => per.performer_id !== editingPerformerId
      )
    : filteredPerformers;

  return (
    <div className="flex flex-col justify-center items-center text-[30px] font-bold w-full px-32">
      <h1>Performers</h1>
      <div className="flex flex-wrap justify-center gap-4 max-w-4xl mb-8">
        <div className="flex-1 min-w-[200px] bg-card rounded-lg p-6 border border-border shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">
            Number of Performers
          </div>
          <div className="text-3xl font-bold text-primary">
            {performerCount}
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-wrap w-full px-10 shadow-2xl text-[30px] font-bold py-5 rounded-xl bg-card mt-3 mb-5">
        <h1 className="text-xl mb-3">Add a Performer</h1>

        <div className={FIELD_CONATIANER_CLASSNAME}>
          <Input
            title="Performer Name"
            name="name"
            type="text"
            placeholder="Ex: Amr Diab"
            onChange={handleChange}
            value={formData.name}
            error={errors.name}
          />
        </div>

        <div className={FIELD_CONATIANER_CLASSNAME}>
          <Input
            title="Bio"
            name="bio"
            type="text"
            placeholder="Short performer biography..."
            onChange={handleChange}
            value={formData.bio}
            error={errors.bio}
          />
        </div>

        <div className={`flex justify-end p-5 ${FIELD_CONATIANER_CLASSNAME}`}>
          <div className="w-70 flex jusify-center">
            <button
              type="button"
              className="bg-primary-hover rounded-2xl text-[16px] text-white flex justify-center items-center w-full h-[50px] border-0 cursor-pointer font-semibold"
              onClick={handleSubmit}
            >
              Add Performer
            </button>
          </div>
        </div>
      </div>
      <div className="w-full border-b-2 border-accent"></div>
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

        {!loading && filteredPerformers.length === 0 && (
          <p className="text-center w-full">No Performers found</p>
        )}

        {/* Render the currently edited performer first, if any */}
        {editedPerformer && (
          <div className="w-full flex justify-center py-5">
            <PerformerCard
              performerName={editedPerformer.name}
              performerBio={editedPerformer.bio}
              key={editedPerformer.performer_id}
              id={editedPerformer.performer_id}
              onUpdate={reloadPerformers}
              onDelete={() => deletePer(editedPerformer.performer_id)}
              showAlertMessage={showAlertMessage}
              onEditToggle={handleEditToggle} // Pass the toggle function
              isBeingEditedByParent={true} // Indicate it's the main edited item
            />
          </div>
        )}

        {/* Render other performers */}
        <div
          className={`w-full flex justify-center flex-wrap gap-10 py-5 ${
            editingPerformerId ? "mt-10 border-t-2 border-accent pt-10" : ""
          }`}
        >
          {!loading &&
            otherPerformers.map((per) => (
              <PerformerCard
                performerName={per.name}
                performerBio={per.bio}
                key={per.performer_id}
                id={per.performer_id}
                onUpdate={reloadPerformers}
                onDelete={() => deletePer(per.performer_id)}
                showAlertMessage={showAlertMessage}
                onEditToggle={handleEditToggle} // Pass the toggle function
                isBeingEditedByParent={false} // Indicate it's not the main edited item
              />
            ))}
        </div>
      </main>
      {/* Generic Message Alert Dialog */}
      <MessageAlertDialog
        title={alertTitle}
        message={alertMessage}
        open={showAlert}
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
}

function PerformerCard({
  performerName,
  performerBio,
  id,
  onUpdate,
  onDelete,
  showAlertMessage,
  onEditToggle, // New prop
  isBeingEditedByParent, // New prop
}) {
  const [editMode, setEditMode] = useState(false);
  const [editedPerformerName, setEditedPerformerName] = useState(performerName);
  const [editedBio, setEditedBio] = useState(performerBio);

  useEffect(() => {
    // If this card is *not* the one being edited by the parent, but it's in its own local edit mode,
    // it means another card was put into edit mode or editing was cancelled for this card.
    // So, this card should revert to view mode.
    if (!isBeingEditedByParent && editMode) {
      setEditMode(false);
      setEditedPerformerName(performerName); // Reset to original values
      setEditedBio(performerBio);
    }
    // If this card *is* the one being edited by the parent, ensure its local edit mode is on.
    // This handles cases where the parent's editingPerformerId is set to this card's ID.
    else if (isBeingEditedByParent && !editMode) {
      setEditMode(true);
      setEditedPerformerName(performerName); // Initialize with current values
      setEditedBio(performerBio);
    }
  }, [isBeingEditedByParent, editMode, performerName, performerBio]);

  const handleUpdate = async () => {
    if (!editedPerformerName) {
      showAlertMessage("Error", "Performer name cannot be empty.");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:8000/adminUtils/updateperformer/",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            performer_id: id,
            name: editedPerformerName,
            bio: editedBio,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        showAlertMessage("Success", data.message);
        setEditMode(false);
        onEditToggle(null); // Clear editing state in parent
        onUpdate();
      } else {
        showAlertMessage("Error", data.error || "Failed to update performer.");
      }
    } catch (error) {
      console.error("Error updating performer:", error);
      showAlertMessage("Error", "Error updating performer.");
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    onEditToggle(null); // Clear editing state in parent
    setEditedPerformerName(performerName); // Reset to original values
    setEditedBio(performerBio);
  };

  return (
    <div
      className={`relative w-60 pl-3 pr-8 py-5 bg-card rounded-xl shadow mx-auto text ${
        isBeingEditedByParent ? "w-full" : ""
      }`}
    >
      <div className="flex-grow flex flex-col items-center justify-center">
        {editMode ? (
          <div className="flex flex-col gap-2 w-full">
            <Input
              title="Performer Name"
              name="name"
              type="text"
              value={editedPerformerName}
              onChange={(e) => setEditedPerformerName(e.target.value)}
            />
            <Input
              title="Bio"
              name="bio"
              type="text"
              value={editedBio}
              onChange={(e) => setEditedBio(e.target.value)}
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
            <p className="text-lg font-bold">{performerName}</p>
          </>
        )}
      </div>
      <div
        className="absolute bottom-0 right-0 -mb-4 -mr-6
                     flex justify-end items-center gap-2"
      >
        {!editMode && (
          <Button
            title="Edit Performer"
            onClick={() => {
              setEditMode(true);
              onEditToggle(id); // Inform parent about editing
              setEditedPerformerName(performerName);
              setEditedBio(performerBio);
            }}
            className="w-12 h-12 rounded-full bg-primary-hover text-white flex justify-center items-center hover:cursor-pointer"
          >
            <Pencil />
          </Button>
        )}
        <Alert
          performerName={performerName}
          id={id}
          onUpdate={onUpdate}
          onDelete={onDelete}
        >
          <Button
            title="delete from database"
            className="w-12 h-12 rounded-full bg-destructive hover:bg-destructive-hover text-white flex justify-center items-center hover:cursor-pointer"
          >
            <Trash />
          </Button>
        </Alert>
      </div>
    </div>
  );
}

function Alert({ children, id, performerName, onUpdate, onDelete }) {
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
            {performerName}" and remove them from the database
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
