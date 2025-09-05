"use client"
import { SidebarProvider } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react'
import Appsidebar from './dashboard/app-sidebar'

type Props = {
  children: React.ReactNode
}

const SidebarLayout = ({ children }: Props) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <div>
      <SidebarProvider>
        <Appsidebar />
        <main className="w-full m-2">
          <div className="flex items-center gap-2 border-sidebar-border bg-sidebar border shadow rounded-md p-2 px-4">
            <div className="ml-auto"></div>
            {mounted ? <UserButton /> : null}
          </div>

          <div className="h-4"></div>
          <div className="border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll h-[calc(100vh-6rem)] p-4">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </div>
  )
}

export default SidebarLayout

