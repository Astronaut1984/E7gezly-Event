import { Home, Ticket, UserRoundCheck, MessageCircle, Bot } from "lucide-react";
import EditInfoForm from "@/components/EditInfoForm";
import { useState, useEffect } from "react";

export function useOrgUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnreadCount() {
      try {
        const res = await fetch("http://localhost:8000/messages/getorgmessages", {
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
    badge: true, // Flag to show this item has a badge
  },
  {
    title: "AI Assistant",
    url: "/ai-chat",
    icon: Bot,
  },
];

export function Organizer() {
  return (
    <main className="w-full flex justify-center">
      <EditInfoForm />
    </main>
  );
}