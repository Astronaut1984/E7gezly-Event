import Input from "@/components/Input";
import { validateAddPerformer } from "@/pages/sign up/validations";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import {Input as Search} from "@/components/ui/input"


export default function AdminPerformers() {
  const FIELD_CONATIANER_CLASSNAME =
    "text-[20px] flex justify-between gap-20 items-center";

  let [errors, setErrors] = useState({});
  const [performers, setPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(""); // for the search input

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
  });

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
      const res = await fetch("http://localhost:8000/event/addperformer/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to add performer");

      alert("Performer added successfully!");
      setErrors({});
      setFormData({ name: "", bio: "" });
    } catch (err) {
      console.error(err);
      alert("Error adding performer");
    }
  };

  async function getPerformers() {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8000/adminutils/getperformers/",
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch performers: ${response.status}`);
      }

      const data = await response.json();

      // Ensure organizers is an array
      const performersArray = Array.isArray(data.performers)
        ? data.performers
        : [];

      setPerformers(performersArray);
      console.log(performersArray);
      return performersArray;
    } catch (err) {
      console.error("Error fetching performers:", err);
      alert(`Error fetching performers: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPerformers(getPerformers());
  }, []);

  const filteredPerformers =
    !loading &&
    performers.filter((o) =>
      `${o.first_name} ${o.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  return (
    <div className="flex flex-col justify-center items-center w-full px-32 text-[30px] font-bold">
      <h1>Admin Main Page</h1>
      <div className="flex flex-col flex-wrap w-full px-10 shadow-2xl py-5 rounded-xl bg-card mt-3">
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

      <main className="flex justify-center items-center flex-col gap-5 w-full my-10">
      <div className="flex w-60 justify-center items-center">
        <Search
          placeholder="Search..."
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="w-full flex justify-start flex-wrap gap-5 py-5">
        {!loading && filteredPerformers.length === 0  && 
          <p className="text-center w-full">No Performers found</p>}
        {!loading &&
          filteredPerformers.map((per) => {
            return (
              <PerformerCard
                performerName={`sdfsdf`}
                key={``}
                reportCount={0}
              />
            );
          })
         }
         {loading && <Spinner />}
      </div>
    </main>
    </div>
  );
}


function PerformerCard({ performerName, id, onUpdate }) {
  return (
    <div className="relative max-w-max pl-3 pr-8 py-5 bg-card rounded-xl shadow mx-5">
      <p>Performer Name: {performerName}</p>
      <Alert performerName={performerName} onUpdate={onUpdate}>
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