'use client'
import React from 'react'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader,SidebarMenuItem,SidebarMenuButton, SidebarMenu, useSidebar } from '@/components/ui/sidebar'
import { LayoutDashboard,Bot,Presentation,CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Image from 'next/image'
import useProject from '@/hooks/use-project'

const items=[
    {
       title:"Dashboard",
       url:"/dashboard",
       icon:<LayoutDashboard />,
    }
    ,
    {
       title:"Q&A",
       url:"/qa",
       icon:<Bot />,
    },
    {
       title:"Meetings",
       url:"/meetings",
       icon:<Presentation />,
    },
    {
       title:"Billing",
       url:"/billing",
       icon:<CreditCard />,
    }
    
]

// const projects=[
//     {
//         title:"Project 1",
        
//     },{
//         title:"Project 2"
//     },{
//         title:"Project 3"
//     },{
//         title:"Project 4"
//     },
// ]
function Appsidebar() {
    const pathname=usePathname()
    const {open}=useSidebar()
    const {projects,projectId,setProjectId}=useProject()
  return (
    <Sidebar collapsible='icon' variant='floating'>
        <SidebarHeader>
            <div className='flex items-center gap-2'>
                {/* <Image src={} alt='logo' width={40} height={40}/> */}
                Logo
                {open && (
                    <h1 className='text-xl font-bold text-primary/80'>codesage</h1>
                )}
                
            </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel>
                    Application
                </SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {items.map(item=>{
                        return(
                             <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild>
                                    <Link href={item.url} className={cn({
                                        '!bg-primary !text-white':pathname===item.url
                                    },'list-none')}>
                                        {item.icon}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                             </SidebarMenuItem>
                        )
                    })}
                    </SidebarMenu>
                    
                </SidebarGroupContent>

            </SidebarGroup>

            <SidebarGroup>
                <SidebarGroupLabel>
                    Your projects
                </SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        
                        {projects?.map(project=>{
                            return(
                                <SidebarMenuItem key={project.name}>
                                   <SidebarMenuButton asChild>
                                    <div onClick={()=>{
                                        setProjectId(project.id)
                                    }}>
                                        <div
                                        className={cn(
                                            'rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary',
                                            {
                                            'bg-primary text-white': project.id ===projectId, // or your real condition
                                            }
                                        )}
                                        >
                                        {project.name[0]}
                                      </div>
                                      <span>{project.name}</span>
                                    </div>
                                      
                                   </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                    <div className='h-2'></div>
                    {open && (
                         <SidebarMenuItem>
                        <Link href='/create'>
                           <Button  size='sm' variant={'outline'} className='w-fit'>
                            <Plus/>
                            Create a project
                           </Button>
                        </Link>
                        
                    </SidebarMenuItem>
                    )}
                    
                    
                    
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>
    </Sidebar>
  )
}

export default Appsidebar