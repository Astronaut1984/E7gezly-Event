import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { Outlet } from "react-router-dom";

export default function Layout({ children, sidebar }) {
  return (
    <SidebarProvider>
      <div>{sidebar}</div>
      <main className="w-full h-screen">
        {sidebar && <SidebarTrigger onClick={() => {
          console.log("sidebar toggled")
        }} />}
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
