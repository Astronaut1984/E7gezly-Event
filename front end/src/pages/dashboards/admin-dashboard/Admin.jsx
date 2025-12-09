import Layout from "@/components/Layout";
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenu,
  SidebarMenuButton,
  Sidebar,
} from "@/components/ui/sidebar";
import NavBar from "@/components/NavBar";
import { useState } from "react";

export default function Admin() {
  const [isDark, toggleDarkMode] = useState(true);

  function toggleDark() {
    toggleDarkMode((prev) => !prev);
    document.documentElement.classList.toggle("dark");
  }

  return (
    <Layout sidebar={<AdminSideBar />}>
      <h1>Hello World</h1>{" "}
      <button
        onClick={toggleDark}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <i
          className={`fa-solid ${isDark ? "fa-sun" : "fa-moon"} text-base`}
        ></i>
      </button>
    </Layout>
  );
}

const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function AdminSideBar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
