import EditInfoForm from "@/components/EditInfoForm";
import EditPasswordForm from "@/components/EditPasswordForm";
import { UserContext } from "@/UserContext";
import {
  MapPin,
  Home,
  Ticket,
  UserRound,
  Flag,
  MicVocal,
  BusFront,
  SquareStack,
  UserPlus,
  Bot,
} from "lucide-react";
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
    url: "/admin/category",
    icon: SquareStack,
  },
  {
    title: "Bus",
    url: "/admin/bus",
    icon: BusFront,
  },
  {
    title: "Create",
    url: "/admin/create",
    icon: UserPlus,
  },
  {
    title: "AI Assistant",
    url: "/admin/ai-chat",
    icon: Bot,
  },
];

export function Admin() {
  // Admin check is now handled universally by ProtectedAdminRoute wrapper
  // All /admin/* routes are protected

  const { user } = useContext(UserContext);

  return (
    <main className="w-full flex flex-col items-center justify-center">
      <EditInfoForm />
      <EditPasswordForm />
    </main>
  );
}
