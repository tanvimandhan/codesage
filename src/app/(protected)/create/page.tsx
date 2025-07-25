'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React from 'react'
import { useForm } from 'react-hook-form'
import {api} from "@/trpc/react"
import { toast } from 'sonner'
import Userefetch from '@/hooks/use-refetch'


type FormInput={
    repoUrl:string 
    projectName:string
    githubToken:string
}
const Createpage = () => {
    const {register,handleSubmit,reset}=useForm<FormInput>()
    const createProject=api.project.createProject.useMutation()
    const refetch=Userefetch()

    function onSubmit(data:FormInput){
       // window.alert(JSON.stringify(data,null,2))
      // console.log(data);
        createProject.mutate({
            githubUrl:data.repoUrl,
            name:data.projectName,
            githubToken:data.githubToken
        },{
            onSuccess:()=>{
                toast.success("Project created succesfully")
                refetch()
                reset()
            },
            onError:(error)=>{
                console.error("error is",error)
                toast.error("Failed to create Project")
            }
        }
       )
        return true
    }
  return (
    <div className='flex items-center gap-12 h-full justify-center'>
        {/* <img src='/logo.svg' className='h-56 w-auto' /> */}
        <p>image</p>
        <div>
            <div>
                <h1 className='font-semibold text-2xl'>Link your github repo</h1>
                <p className='text-sm text-muted-foreground'>Enter the url of your repo to link it to codesage</p>
            </div>
            <div className='h-4'></div>
            <div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Input  {...register('projectName',{required:true})} placeholder='projectname'/>
                    <div className="h-2"></div>
                    <Input  {...register('repoUrl',{required:true})} placeholder='github url' type='url'/>
                    <div className="h-2"></div>
                    <Input  {...register('githubToken')} placeholder='Github token(optional)'/>
                    <div className="h-2"></div>
                    <Button type='submit' disabled={createProject.isPending} onClick={() => console.log("Clicked submit button")}>Create project</Button>

                </form>
            </div>
        </div>

    </div>
  )
}

export default Createpage