import { Ban, Trash } from "lucide-react";
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
import { Organizer } from "../org-dashboard/Organizer";

export default function AdminOrg() {
  const {
    items: organizers,
    loading,
    fetchItems: reloadOrganizers,
    remove: deleteOrg,
  } = useAdminResource({
    getUrl: "http://localhost:8000/adminUtils/getorganizers/",
    deleteUrl: "http://localhost:8000/adminUtils/deleteorganizer/",
    listKey: "organizers",
    deletePayloadKey: "username",
  });
  const [search, setSearch] = useState(""); // for the search input

  useEffect(() => {
    reloadOrganizers();
  }, [reloadOrganizers]);

  const filteredOrganizers =
    !loading &&
    organizers.filter((o) =>
      `${o.username} ${o.first_name} ${o.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase())
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
      <h1 className="text-3xl font-bold">Organizers</h1>
      <div className="flex w-100 justify-center items-center">
        <Input
          placeholder="Search..."
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="w-full flex justify-start flex-wrap gap-5 py-5">
        {filteredOrganizers.length === 0 ? (
          <p className="text-center w-full">No organizers found</p>
        ) : (
          filteredOrganizers.map((org) => {
            return (
              <OrgCard
                orgName={`${org["first_name"]} ${org["last_name"]}`}
                key={org["username"]}
                reportCount={org["report_count"]}
                username={org["username"]}
                onDelete={() => deleteOrg(org["username"])}
              />
            );
          })
        )}
      </div>
    </main>
  );
}

function OrgCard({ orgName, reportCount, username, onDelete }) {
  return (
    <>
      <div className="relative w-60 pl-3 pr-8 py-5 bg-card rounded-xl shadow mx-auto">
        <p>Organizer: {orgName}</p>
        <p>Report Cases: {reportCount}</p>
        <Alert orgName={orgName} username={username} onDelete={onDelete}>
          <div
            title="delete from database"
            className="absolute bottom-0 right-0 -mb-4 -mr-6
           w-12 h-12 rounded-full destructive-on-hover text-destructive-foreground flex justify-center items-center hover:cursor-pointer"
          >
            <Trash />
          </div>
        </Alert>
      </div>
    </>
  );
}

function Alert({ children, orgName, username, onDelete }) {
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
            {orgName}" and remove them from the database
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
