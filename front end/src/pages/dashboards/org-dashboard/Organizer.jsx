import { Home, Ticket, UserRoundCheck, MessageCircle } from "lucide-react";

export function Organizer() {
  return <h1>Organizer Page Main</h1>;
}

export const orgItems = [
  {
    title: "Home",
    url: "/org",
    icon: Home,
  },
  {
    title: "Add Events",
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
