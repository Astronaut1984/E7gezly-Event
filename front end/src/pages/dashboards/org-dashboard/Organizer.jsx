import { Home, Ticket, UserRoundCheck, MessageCircle } from "lucide-react";
import EditInfoForm from "@/components/EditInfoForm";

export const orgItems = [
  {
    title: "Home",
    url: "/org",
    icon: Home,
  },
  {
    title: "Add Event",
    url: "/org/add-events",
    icon: Ticket,
  },
  {
    title: "Followers",
    url: "/org/followers",
    icon: UserRoundCheck,
  },
  {
    title: "My Events",
    url: "/org/my-events",
    icon: Ticket,
  },
  {
    title: "Chat",
    url: "/org/chat",
    icon: MessageCircle,
  },
];

export function Organizer() {
  return (
    <main className="w-full flex justify-center">
      <EditInfoForm />
    </main>
  );
}
