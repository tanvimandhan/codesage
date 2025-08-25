'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React from 'react'
import { useForm } from 'react-hook-form'
import { api } from "@/trpc/react"
import { toast } from 'sonner'
import Userefetch from '@/hooks/use-refetch'
import { Info } from 'lucide-react'

type FormInput = {
  repoUrl: string
  projectName: string
  githubToken: string
}

const Createpage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>()
  const createProject = api.project.createProject.useMutation()
  const refetch = Userefetch()
  const checkCredits = api.project.checkCredits.useMutation()

  function onSubmit(data: FormInput) {
    if (!checkCredits.data) {
      createProject.mutate({
        githubUrl: data.repoUrl,
        name: data.projectName,
        githubToken: data.githubToken
      }, {
        onSuccess: () => {
          toast.success("Project created successfully 🎉")
          refetch()
          reset()
        },
        onError: (error) => {
          console.error("error is", error)
          toast.error("Failed to create Project ❌")
        }
      })
    } else {
      checkCredits.mutate({
        githubUrl: data.repoUrl,
        githubToken: data.githubToken
      })
    }
  }

  return (
  <div className="mt-20 bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
    <div className="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-6xl w-full px-10">

      {/* Left Image Section */}
      <div className="flex justify-center">
        <img
          src="/image _codesage.jpg"
          alt="Code Collaboration"
          className="max-h-[400px] object-cover"
        />
      </div>

      {/* Right Form Section */}
      <div className="flex justify-center w-full max-w-md">
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 w-full">
          <h1 className="font-bold text-3xl text-gray-800 text-center">Link Your GitHub Repo</h1>
          <p className="mt-1 text-gray-500 text-sm text-center">
            Enter your repository details to link it to{" "}
            <span className="font-medium text-blue-600">CodeSage</span>.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <Input
              {...register("projectName", { required: true })}
              placeholder="Project Name"
              className="focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <Input
              {...register("repoUrl", { required: true })}
              placeholder="GitHub URL"
              type="url"
              className="focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <Input
              {...register("githubToken")}
              placeholder="GitHub Token (optional)"
              className="focus:ring-2 focus:ring-blue-500 transition-all"
            />

            {/* Credits Warning */}
            {!checkCredits.data && (
              <div className="mt-4 bg-orange-50 px-4 py-3 rounded-lg border border-orange-200 text-orange-700">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="w-4 h-4" />
                  <p className="text-sm">
                    You will be charged <strong>10</strong> credits for this repository.
                  </p>
                </div>
                <p className="text-sm text-blue-600 ml-6">
                  You have <strong>400</strong> credits available.
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={createProject.isPending}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {createProject.isPending ? "Creating..." : "Create Project"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  </div>
);

}

export default Createpage
