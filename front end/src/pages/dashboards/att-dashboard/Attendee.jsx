import EditInfoForm from "@/components/EditInfoForm";
import { Home, Ticket, UsersRound, UserRound, Star, MessageCircle, Bot } from "lucide-react";
import { useState, useEffect } from "react";

export function useAttUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnreadCount() {
      try {
        const res = await fetch("http://localhost:8000/messages/getattendeemessages", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setUnreadCount(data.total_unread || 0);
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    }

    fetchUnreadCount();
    const intervalId = setInterval(fetchUnreadCount, 30000); // Update every 30s

    return () => clearInterval(intervalId);
  }, []);

  return unreadCount;
}

export default function Attendee() {
  return (
    <main className="w-full flex flex-col items-center justify-center">
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
    title: "My Tickets",
    url: "/att/my-tickets",
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
  {
    title: "Chat",
    url: "/att/chat",
    icon: MessageCircle,
    badge: true, // Flag to show this item has a badge
  },
  {
    title: "AI Assistant",
    url: "/ai-chat",
    icon: Bot,
  }
];