'use client'
import React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenu,
  useSidebar
} from '@/components/ui/sidebar'
import { LayoutDashboard, Bot, Presentation, CreditCard, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import useProject from '@/hooks/use-project'

const items = [
  { title: "Dashboard", url: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { title: "Q&A", url: "/qa", icon: <Bot className="w-5 h-5" /> },
  { title: "Meetings", url: "/meetings", icon: <Presentation className="w-5 h-5" /> },
  { title: "Billing", url: "/billing", icon: <CreditCard className="w-5 h-5" /> }
]

function Appsidebar() {
  const pathname = usePathname()
  const { open } = useSidebar()
  const { projects, projectId, setProjectId } = useProject()

  return (
    <Sidebar collapsible="icon" variant="floating" className="border-r bg-gradient-to-b from-white to-gray-50">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="size-8 bg-primary text-white flex items-center justify-center font-bold rounded-lg">
            C
          </div>
          {open && (
            <h1 className="text-xl font-bold text-primary">CodeSage</h1>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Application Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 text-xs tracking-wider">APPLICATION</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 hover:bg-primary/10',
                        { '!bg-primary !text-white hover:!bg-primary': pathname === item.url }
                      )}
                    >
                      {item.icon}
                      {open && <span className="font-medium">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="">
        <SidebarGroupLabel className="text-gray-500 text-xs tracking-wider">YOUR PROJECTS</SidebarGroupLabel>
        <SidebarGroupContent>
            <SidebarMenu>
            {/* Create Project Button ABOVE the list */}
            {open && (
                <div className="mb-3">
                <Link href="/create">
                    <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start gap-2 border-primary text-primary hover:bg-primary hover:text-white transition"
                    >
                    <Plus className="w-4 h-4" />
                    Create Project
                    </Button>
                </Link>
                </div>
            )}

            {/* Project List */}
            {projects?.map(project => (
                <SidebarMenuItem key={project.id}>
                <SidebarMenuButton asChild>
                    <div
                    onClick={() => setProjectId(project.id)}
                    className="flex items-center gap-2 cursor-pointer group"
                    >
                    <div
                        className={cn(
                        'rounded-md border size-7 flex items-center justify-center text-sm font-semibold transition-all',
                        {
                            'bg-primary text-white border-primary': project.id === projectId,
                            'bg-white text-primary group-hover:bg-primary/10': project.id !== projectId
                        }
                        )}
                    >
                        {project.name[0]}
                    </div>
                    {open && <span className="font-medium">{project.name}</span>}
                    </div>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  )
}

export default Appsidebar
