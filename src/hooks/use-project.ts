import { api } from '@/trpc/react'
import { useLocalStorage } from 'usehooks-ts'

function useProject() {
  const { data: projects } = api.project.getProjects.useQuery()

  const isClient = typeof window !== "undefined"
  const [projectId, setProjectId] = isClient ? useLocalStorage('codesage', '') : [null, () => {}]

  const project = projects?.find((project) => project.id === projectId)

  return {
    projects,
    project,
    setProjectId,
    projectId,
  }
}

export default useProject
