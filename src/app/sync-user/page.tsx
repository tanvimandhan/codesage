import React from 'react'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { db } from '@/lib/prisma'

const page = async() => {
    const {userId}=await auth()
    if(!userId){
        throw new Error('User not found')
    }
    const ClerkClient=await clerkClient()
    const user=await ClerkClient.users.getUser(userId)
    if(!user.emailAddresses[0]?.emailAddress){
        return notFound()
    }
    await db.user.upsert({
        where:{
            emailAddress:user.emailAddresses[0]?.emailAddress??""
        },
        update:{
            imageUrl:user.imageUrl,
            firstName:user.firstName,
            lastName:user.lastName,
        },
        create:{
            id:userId,
            emailAddress:user.emailAddresses[0]?.emailAddress??"",
            imageUrl:user.imageUrl,
            firstName:user.firstName,
            lastName:user.lastName,
        }
    })

  return redirect('/dashboard')
  
}

export default page