import Input from "@/components/Input";
import { validateAddPerformer } from "@/pages/sign up/validations";
import { useEffect, useState } from "react";
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
import { Trash } from "lucide-react";

export default function AdminCategories() {
  const FIELD_CONTAINER_CLASSNAME =
    "text-[20px] flex justify-between gap-20 items-center";

  let [errors, setErrors] = useState({});
  const {
    items: categories,
    loading,
    fetchItems: reloadCategories,
    remove: deleteCat,
  } = useAdminResource({
    getUrl: "http://localhost:8000/adminUtils/getcategories/",
    deleteUrl: "http://localhost:8000/adminUtils/deletecategory/",
    listKey: "categories",
    deletePayloadKey: "id",
  });
  const [search, setSearch] = useState(""); // for the search input

  const [formData, setFormData] = useState({
    name: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    // validation
    if (!formData.name.trim()) {
      setErrors({ name: "Category name is required" });
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/adminUtils/addcategory/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name }),
      });

      if (!res.ok) throw new Error("Failed to add category");

      alert("Category added successfully!");
      setErrors({});
      setFormData({ name: "" });
      await reloadCategories();
    } catch (err) {
      console.error(err);
      alert("Error adding category");
    }
  };

  useEffect(() => {
    reloadCategories();
  }, [reloadCategories]);

  const filteredCategories =
    !loading &&
    categories.filter((cat) =>
      `${cat.category_name}`.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="flex flex-col justify-center items-center text-[30px] font-bold w-full px-32">
      <h1>Categories</h1>
      <div className="flex flex-col flex-wrap w-full px-10 shadow-2xl text-[30px] font-bold py-5 rounded-xl bg-card mt-3 mb-5">
        <h1 className="text-xl mb-3">Add a Category</h1>

        <div className={FIELD_CONTAINER_CLASSNAME}>
          <Input
            title="Category Name"
            name="name"
            type="text"
            placeholder="Ex: Rock, Jazz, Pop..."
            onChange={handleChange}
            value={formData.name}
            error={errors.name}
          />
        </div>

        <div className={`flex justify-end p-5 ${FIELD_CONTAINER_CLASSNAME}`}>
          <div className="w-70 flex jusify-center">
            <button
              type="button"
              className="bg-primary-hover rounded-2xl text-[16px] text-white flex justify-center items-center w-full h-[50px] border-0 cursor-pointer font-semibold"
              onClick={handleSubmit}
            >
              Add Category
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
        <div className="w-full flex justify-start flex-wrap gap-5 py-5">
          {!loading && filteredCategories.length === 0 && (
            <p className="text-center w-full">No Categories found</p>
          )}
          {!loading &&
            filteredCategories.map((cat) => {
              return (
                <CategoryCard
                  categoryName={cat.category_name}
                  key={cat.category_id}
                  id={cat.category_id}
                  onUpdate={() => reloadCategories()}
                  onDelete={() => deleteCat(cat.category_id)}
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

function CategoryCard({ categoryName, id, onUpdate, onDelete }) {
  return (
    <div className="relative max-w-max pl-3 pr-8 py-5 bg-card rounded-xl shadow mx-5 text">
      <p>Category: {categoryName}</p>
      <Alert
        categoryName={categoryName}
        onUpdate={onUpdate}
        id={id}
        onDelete={onDelete}
      >
        <div
          title="delete from database"
          className="absolute bottom-0 right-0 -mb-4 -mr-6
                     w-12 h-12 rounded-full destructive-on-hover text-destructive-foreground flex justify-center items-center hover:cursor-pointer"
        >
          <Trash />
        </div>
      </Alert>
    </div>
  );
}

function Alert({ children, categoryName, onUpdate, onDelete }) {
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
