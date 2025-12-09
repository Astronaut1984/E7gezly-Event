import Layout from "@/components/Layout";
import { Calendar, Home, Ticket, Search, Settings } from "lucide-react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenu,
  SidebarMenuButton,
  Sidebar,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme, setTheme } from "@/store/themeSlice";
import { NavLink } from "react-router-dom";

export function Admin() {
  return <h1>Admin Page Main</h1>;
}

const items = [
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

export function AdminSideBar() {
  const dispatch = useDispatch();
  dispatch(setTheme(useSelector((state) => state.theme.dark)));
  const dark = useSelector((state) => state.theme.dark);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex justify-between">
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <button
            onClick={() => dispatch(toggleTheme())}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <i
              className={`fa-solid ${dark ? "fa-sun" : "fa-moon"} text-base`}
            ></i>
          </button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
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
