import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuBadge,
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme, cycleColorThemes } from "@/store/themeSlice";
import { NavLink, useLocation } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "@/UserContext";
import { useOrgUnreadCount } from "@/pages/dashboards/org-dashboard/Organizer";
import { useAttUnreadCount } from "@/pages/dashboards/att-dashboard/Attendee";

import { Sun, Moon, Palette } from "lucide-react";

export function DashboardSideBar({ items }) {
  const dispatch = useDispatch();
  const { user } = useContext(UserContext);

  const { state } = useSidebar();

  const { dark, colorTheme } = useSelector((state) => state.theme);

  let location = useLocation();

  // Get unread count based on user type
  const orgUnreadCount = user?.status === "Organizer" ? useOrgUnreadCount() : 0;
  const attUnreadCount = user?.status === "Attendee" ? useAttUnreadCount() : 0;
  const unreadCount = orgUnreadCount || attUnreadCount;

  const isCollapsed = state === "collapsed";

  const welcomeMessage =
    user === null
      ? "Dashboard"
      : `Welcome, ${user.first_name} ${user.last_name}`;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div
          className={`flex justify-${
            isCollapsed ? "center" : "between"
          } items-center`}
        >
          {!isCollapsed && (
            <h1 className="truncate flex items-center">{welcomeMessage}</h1>
          )}
          <SidebarTrigger className="size-10 hover:text-primary cursor-pointer" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <NavLink to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                  {item.badge && unreadCount > 0 && (
                    <SidebarMenuBadge className="bg-primary text-primary-foreground">
                      {unreadCount}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex flex-col justify-center items-center mb-2 overflow-hidden whitespace-nowrap">
        <div
          className={
            isCollapsed ? "flex flex-col gap-2 mb-2" : "flex gap-2 mb-2"
          }
        >
          <button
            onClick={() => dispatch(toggleTheme())}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-sm bg-sidebar hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            {dark ? (
              <Sun className="text-primary" />
            ) : (
              <Moon className="text-primary" />
            )}
          </button>
          <button
            onClick={() => dispatch(cycleColorThemes())}
            aria-label="Cycle color themes"
            className="p-2 rounded-sm bg-sidebar hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <Palette className="text-primary" />
          </button>
        </div>
        <NavLink
          to="/"
          className={`bg-primary-hover py-2 px-5 rounded-xl text-sidebar-accent-foreground ${
            isCollapsed && "hidden"
          }`}
        >
          Back to Home
        </NavLink>
      </SidebarFooter>
    </Sidebar>
  );
}
