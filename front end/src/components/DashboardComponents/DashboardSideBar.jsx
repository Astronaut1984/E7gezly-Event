import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenu,
  SidebarMenuButton,
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useDispatch, useSelector } from "react-redux";
import { setTheme, toggleTheme } from "@/store/themeSlice";
import { NavLink, useLocation } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "@/UserContext";

import { Sun, Moon } from "lucide-react";

export function DashboardSideBar({ items }) {
  const dispatch = useDispatch();

  const {state} = useSidebar();
  dispatch(setTheme(useSelector((state) => state.theme.dark)));

  const dark = useSelector((state) => state.theme.dark);

  let location = useLocation();

  const { user } = useContext(UserContext);


  const isCollapsed = state === "collapsed";

  const welcomeMessage =
    user === null
      ? "Dashboard"
      : `Welcome, ${user.first_name} ${user.last_name}`;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex justify-between">
          {!isCollapsed && <h1 className="truncate flex items-center [data-collaped=true]:hidden">
            {welcomeMessage}
          </h1>}
          <button
            onClick={() => dispatch(toggleTheme())}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-sm bg-sidebar hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 -translate-x-[2.5px]"
          >
            {dark ? <Sun className="text-primary"/> : <Moon className="text-primary"/>}
          </button>
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
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex justify-center items-center mb-2 overflow-hidden whitespace-nowrap">
        <NavLink
          to="/"
          className={`bg-primary-hover py-2 px-5 rounded-xl text-sidebar-accent-foreground ${isCollapsed && "hidden"}`}
        >
          Back to Home
        </NavLink>
      </SidebarFooter>
    </Sidebar>
  );
}