import { Ban, Trash, Pencil, Plus, SquareStack } from "lucide-react"; // Import Pencil, Plus and SquareStack icon
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
import { useEffect, useState } from "react";
import useAdminResource from "@/hooks/useAdminResource";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Import Button component
import MessageAlertDialog from "@/components/MessageAlertDialog"; // Import MessageAlertDialog
// import { Organizer } from "../org-dashboard/Organizer"; // Removed unused import
export default function AdminCategory() {
  const [categoryCount, setCategoryCount] = useState(0);
  const {
    items: categories,
    loading,
    fetchItems: reloadCategories,
    remove: deleteCategory,
  } = useAdminResource({
    getUrl: "http://localhost:8000/adminUtils/getcategories/",
    deleteUrl: "http://localhost:8000/adminUtils/deletecategories/",
    listKey: "categories",
    deletePayloadKey: "category_id",
  });
  const [search, setSearch] = useState(""); // for the search input
  const [newCategoryName, setNewCategoryName] = useState(""); // for new category input

  // State for generic message alert dialog
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlertMessage = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  };

  useEffect(() => {
    reloadCategories();
    fetch("http://localhost:8000/Record/categoryindb/")
      .then((res) => res.json())
      .then((data) => setCategoryCount(data.count))
      .catch((err) => console.error(err));
  }, [reloadCategories]);

  const addCategory = async () => {
    if (!newCategoryName) {
      showAlertMessage("Error", "Category name cannot be empty.");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:8000/adminUtils/addcategories/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category_name: newCategoryName }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        showAlertMessage("Success", data.message);
        setNewCategoryName(""); // Clear input
        reloadCategories(); // Refresh the list
      } else {
        showAlertMessage("Error", data.error || "Failed to add category.");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      showAlertMessage("Error", "Error adding category.");
    }
  };

  const filteredCategories =
    !loading &&
    categories.filter((category) =>
      `${category.category_name}`.toLowerCase().includes(search.toLowerCase())
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
        <SquareStack /> Categories
      </h1>
      <div className="flex flex-wrap justify-center gap-4 max-w-4xl mb-8">
        <div className="flex-1 min-w-[200px] bg-card rounded-lg p-6 border border-border shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">
            Number of Categories
          </div>
          <div className="text-3xl font-bold text-primary">{categoryCount}</div>
        </div>
      </div>
      {/* Add Category Section */}
      <div className="flex w-100 justify-center items-center gap-2">
        <Input
          placeholder="New Category Name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <Button onClick={addCategory} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>
      {/* Search Section */}
      <div className="flex w-100 justify-center items-center mt-10">
        <Input
          placeholder="Search..."
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="w-full flex justify-center flex-wrap gap-10 py-5 px-10">
        {filteredCategories.length === 0 ? (
          <p className="text-center w-full">No categories found</p>
        ) : (
          filteredCategories.map((category) => {
            return (
              <CategoryCard
                categoryName={category["category_name"]}
                key={category["category_id"]}
                categoryId={category["category_id"]}
                onDelete={() => deleteCategory(category["category_id"])}
                reloadCategories={reloadCategories} // Pass reloadCategories to CategoryCard
                showAlertMessage={showAlertMessage} // Pass showAlertMessage to CategoryCard
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

function CategoryCard({
  categoryName,
  categoryId,
  onDelete,
  reloadCategories,
  showAlertMessage,
}) {
  const [editMode, setEditMode] = useState(false);
  const [editedCategoryName, setEditedCategoryName] = useState(categoryName);

  const handleUpdate = async () => {
    if (!editedCategoryName) {
      showAlertMessage("Error", "Category name cannot be empty.");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:8000/adminUtils/updatecategories/",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category_id: categoryId,
            category_name: editedCategoryName,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        showAlertMessage("Success", data.message);
        setEditMode(false);
        reloadCategories(); // Refresh the list
      } else {
        showAlertMessage("Error", data.error || "Failed to update category.");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      showAlertMessage("Error", "Error updating category.");
    }
  };

  return (
    <>
      <div className="relative w-70 h-24 p-5 bg-card rounded-xl shadow mx-auto flex flex-col justify-center">
        <div className="flex flex-col items-center justify-center">
          {" "}
          {/* New wrapper for centering */}
          {editMode ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedCategoryName}
                onChange={(e) => setEditedCategoryName(e.target.value)}
              />
              <Button onClick={handleUpdate}>Save</Button>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <p className="text-lg font-bold">{categoryName}</p>
          )}
        </div>
        <div
          className="absolute bottom-0 right-0 -mb-4 -mr-6
           flex justify-end items-center gap-2" // Combined positioning and flex for buttons
        >
          <Button
            title="Edit Category"
            onClick={() => {
              setEditMode(true);
              setEditedCategoryName(categoryName); // Initialize with current category name
            }}
            className="w-12 h-12 rounded-full bg-primary-hover text-white flex justify-center items-center hover:cursor-pointer"
          >
            <Pencil />
          </Button>
          <Alert
            categoryName={categoryName}
            categoryId={categoryId}
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

function Alert({ children, categoryName, categoryId, onDelete }) {
  async function handleDelete() {
    try {
      if (onDelete) await onDelete();
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
            {categoryName}" and remove it from the database
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
