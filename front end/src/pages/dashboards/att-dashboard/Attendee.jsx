import EditInfoForm from "@/components/EditInfoForm";
import { Home, Ticket, UsersRound, UserRound, Star } from "lucide-react";

export default function Attendee() {
  return (
    <main className="w-full flex justify-center">
      <EditInfoForm />
    </main>
  );
}

export const attItems = [
  {
    title: "Profile",
    url: "/att",
    icon: Home,
  },
  {
    title: "My Events",
    url: "/att/my-events",
    icon: Ticket,
  },
  {
    title: "Friends",
    url: "/att/friends",
    icon: UsersRound,
  },
  {
    title: "Followed Organizers",
    url: "/att/followed-org",
    icon: UserRound,
  },
  {
    title: "My Wishlist",
    url: "/att/wishlist",
    icon: Star,
  },
];
