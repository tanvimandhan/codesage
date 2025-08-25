import { SignUp } from '@clerk/nextjs'
import React from 'react'

function page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <SignUp/>
    </div>
    
  )
}

export default page