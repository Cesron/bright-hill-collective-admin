import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

interface Props {
  children: React.ReactNode
}

export default function MainLayout({ children }: Props) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="@container px-4 md:px-6 lg:px-8">
          <div className="mx-auto w-full">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
