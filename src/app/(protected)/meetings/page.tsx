'use client'

import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import { Badge } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import MeetingCard from '../dashboard/meeting-card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Userefetch from '@/hooks/use-refetch'

const MeetingPage = () => {
    const {projectId}=useProject()
    const refetch=Userefetch()
    const {data:meetings,isLoading}=api.project.getMeetings.useQuery({projectId},{
        refetchInterval:4000
    })
    const deleteMeeting=api.project.deleteMeeting.useMutation()
  return (
    <>
      <MeetingCard/>
      <div className='h-6'></div>
      <h1 className='text-xl font-semibold'>Meetings</h1>
      {meetings && meetings.length===0 && <div>No meetings found</div>}
      {isLoading && <div>Loading...</div>}
      <ul className='divide-y divide-gray-200'>
        {meetings?.map(meeting=>(
            <li key={meeting.id} className='flex items-center justify-between py-5 gap-x-6'>
                <div>
                    <div className='min-w-6'>
                        <div className='flex items-center gap-2'>
                            <Link href={`/meetings/${meeting.id}`} className="text-sm font-semibold">
                            {meeting.name}
                            </Link>
                            {/* {meeting.status==='PROCESSING' && (
                                
                                
                            )} */}
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-sm">Processing...</span>
                        </div>
                    </div>
                    <div className='flex items-center text-xs text-gray-500 gap-x-2'>
                        <p className='whitespace-nowrap'>
                            {meeting.createdAt.toLocaleDateString()}
                        </p>
                        <p className='truncate'>{meeting.issues.length} issues</p>
                    </div>
                </div>
                <div className='flex items-center flex-nowrap gap-x-4'>
                    <Link href={`/meetings/${meeting.id}`}>
                      <Button variant='outline' size='sm'>
                        View
                      </Button>
                    </Link>
                    <Button disabled={deleteMeeting.isPending} variant='destructive' size='sm' onClick={()=>deleteMeeting.mutate({meetingId:meeting.id},{
                      onSuccess:()=>{
                        toast.success("Meeting deleted successfully")
                        refetch()
                      }
                    })}>Delete meeting</Button>
                </div>
            </li>
        ))}
      </ul>
    </>
    
  )
}

export default MeetingPage