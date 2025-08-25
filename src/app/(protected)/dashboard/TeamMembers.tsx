'use client'
import React from 'react'
import { api } from '@/trpc/react'
import useProject from '@/hooks/use-project'

const TeamMembers = () => {
    const {projectId}=useProject()
    const {data:members}=api.project.getTeamMembers.useQuery({projectId})


  return (
    <div className='flex items-center gap-2'>
        {members?.map(member => {
          const imageUrl = member?.user?.imageUrl || '/default-avatar.png'; // fallback image
          const altText = member?.user?.firstName || 'Team member';

          return (
            <img
              key={member.id}
              src={imageUrl}
              alt={altText}
              height={30}
              width={30}
              className='rounded-full'
            />
          );
        })}

    </div>
  )
}

export default TeamMembers