"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import useProject from "@/hooks/use-project"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"

const InviteButton = () => {
  const { projectId } = useProject()
  const [open, setOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState("")

  // ✅ Runs only in browser
  useEffect(() => {
    if (typeof window !== "undefined" && projectId) {
      setInviteLink(`${window.location.origin}/join/${projectId}`)
    }
  }, [projectId])

  const handleCopy = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      toast.success("Copied to clipboard")
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Ask them to copy and post this link
          </p>
          <Input
            className="mt-4"
            readOnly
            onClick={handleCopy}
            value={inviteLink}
          />
        </DialogContent>
      </Dialog>
      <Button onClick={() => setOpen(true)} size="sm">
        Invite member
      </Button>
    </>
  )
}

export default InviteButton
