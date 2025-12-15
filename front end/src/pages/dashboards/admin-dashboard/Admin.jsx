import EditInfoForm from "@/components/EditInfoForm";
import { UserContext } from "@/UserContext";
import { MapPin, Home, Ticket, UserRound, Flag, MicVocal } from "lucide-react";
import { useContext } from "react";

export const adminItems = [
  {
    title: "Home",
    url: "/admin",
    icon: Home,
  },
  {
    title: "Events",
    url: "/admin/events",
    icon: Ticket,
  },
  {
    title: "Venues",
    url: "/admin/venues",
    icon: MapPin,
  },
  {
    title: "Organizers",
    url: "/admin/org",
    icon: UserRound,
  },
  {
    title: "Report Case",
    url: "/admin/reportCase",
    icon: Flag,
  },
  {
    title: "Performers",
    url: "/admin/performers",
    icon: MicVocal,
  },
  {
    title: "Category",
    url: "/admin/categories",
    icon: MicVocal,
  },
  {
    title: "Create",
    url: "/admin/create",
    icon: MicVocal,
  },
];

export function Admin() {
  // Admin check is now handled universally by ProtectedAdminRoute wrapper
  // All /admin/* routes are protected

  const { user } = useContext(UserContext);

  return (
    <main className="w-full flex justify-center">
      <EditInfoForm />
    </main>
  );
}
