import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { Outlet } from "react-router-dom";

export default function Layout({ children, sidebar }) {
  return (
    <SidebarProvider>
      <div>{sidebar}</div>
      <main>
        {sidebar && <SidebarTrigger />}
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
