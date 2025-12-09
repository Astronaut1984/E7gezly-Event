import { Calendar, Home, Ticket, Search, Settings } from "lucide-react";

export function Admin() {
  return <h1>Admin Page Main</h1>;
}

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
    icon: Calendar,
  },
  {
    title: "Organizers",
    url: "/admin/org",
    icon: Search,
  },
];
