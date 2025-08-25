'use client'

import React from 'react'
import { api} from '@/trpc/react'
import useProject from '@/hooks/use-project'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import Userefetch from '@/hooks/use-refetch'

const ArchiveButton = () => {
    const archiveProject=api.project.archiveProject.useMutation()
    const refetch=Userefetch()
    const{projectId}=useProject()

  return (
    <Button disabled={archiveProject.isPending} size='sm' variant='destructive'
    onClick={() => {
        const confirmArchive = window.confirm("Are you sure you want to archive this project?");
        if (confirmArchive) {
        archiveProject.mutate(
            { projectId },
            {
            onSuccess: () => {
                toast.success("Project archived");
                refetch()
            },
            onError:()=>{
                toast.error("failed to archive project")
            }
            }
        );
    }
  }}
>
  Archive
</Button>

  )
}

export default ArchiveButton