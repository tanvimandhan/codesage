import { SignIn } from '@clerk/nextjs'
import React from 'react'

function page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <SignIn forceRedirectUrl="/dashboard"/>
    </div>
    
  )
}

export default page