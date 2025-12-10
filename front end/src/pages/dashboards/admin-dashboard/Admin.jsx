import { MapPin, Home, Ticket, UserRound, Flag } from "lucide-react";

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
];
