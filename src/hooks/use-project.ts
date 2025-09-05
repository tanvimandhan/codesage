"use client"

import { api } from "@/trpc/react"
import { useEffect, useState } from "react"

function useProject() {
  const { data: projects } = api.project.getProjects.useQuery()

  // 🚀 manage projectId manually instead of useLocalStorage
  const [projectId, setProjectId] = useState<string>("")

  // Load from localStorage only on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("codesage")
      if (stored) setProjectId(stored)
    }
  }, [])

  // Persist to localStorage when it changes
  useEffect(() => {
    if (projectId && typeof window !== "undefined") {
      localStorage.setItem("codesage", projectId)
    }
  }, [projectId])

  const project = projects?.find((p) => p.id === projectId)

  return {
    projects,
    project,
    setProjectId,
    projectId,
  }
}

export default useProject
