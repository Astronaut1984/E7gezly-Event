import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";

export default function Layout({ children, sidebar }) {
  return (
    <SidebarProvider>
      {sidebar}
      <main>
        {sidebar && <SidebarTrigger />}
        {children}
      </main>
    </SidebarProvider>
  );
}
