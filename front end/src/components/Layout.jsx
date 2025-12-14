import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { Outlet } from "react-router-dom";

export default function Layout({ sidebar }) {
  return (
    <SidebarProvider>
      <div>{sidebar}</div>
      <main className="w-full h-screen">
        {sidebar && (
          <SidebarTrigger
            className="fixed"
            onClick={() => {
              console.log("sidebar toggled");
            }}
          />
        )}
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
