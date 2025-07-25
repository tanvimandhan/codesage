'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import useProject from '@/hooks/use-project'
import { Car } from 'lucide-react'
import React, { useState } from 'react'
import { Dialog,DialogContent,DialogHeader,DialogTitle } from '@/components/ui/dialog'
import Image from 'next/image'

import { readStreamableValue, StreamableValue } from 'ai/rsc'
import MDEditor from "@uiw/react-md-editor";
import Codereferences from './code-references'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import Userefetch from '@/hooks/use-refetch'



const Askquestioncard = () => {
    const {project}=useProject()
    const [question,setQuestion]=useState('')
    const[open,setOpen]=useState(false)
    const[loading,setLoading]=useState(false)
    const [filesReferences,setfilesReferences]=useState<{fileName:string;sourceCode:string;summary:string}[]>([])
    const[answer,setAnswer]=useState('')
    const saveAnswer=api.project.saveAnswer.useMutation()

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setAnswer('')
        setfilesReferences([])

        const res = await fetch('/api/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',  // ✅ required
            },
            body: JSON.stringify({ question: question, projectId: project?.id }),
        })

        const data = await res.json()
        setAnswer(data.output)
        setfilesReferences(data.filesReferences)
        setOpen(true)
        setLoading(false)
   }
   const refetch=Userefetch()
  return (
     <>
       <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-[80vw]'>
          <DialogHeader>
                <div className="flex items-center gap-2">
                    <DialogTitle>
                        {/* <Image src='/logo.png' alt='codesage' width={40} height={40}/> */}
                        <p>codesage</p>
                    </DialogTitle>
                    <Button disabled={saveAnswer.isPending} variant={'outline'} onClick={()=>{
                        saveAnswer.mutate({
                            projectId: project!.id,
                            question,
                            answer,
                            filesReferences
                        },{
                            onSuccess:()=>{
                                toast.success("Answer saved!")
                                refetch()
                            },
                            onError:()=>{
                                toast.error("Failed to save answer")
                            }
                        })
                    }}>Save Answer</Button>
                </div>
                
            </DialogHeader>
            <MDEditor.Markdown source={answer} className='max-w-[70vw] !h-full max-h-[40vh] overflow-scroll'/>
            <Codereferences filereferences={filesReferences} />
            <Button type='submit' onClick={()=>{setOpen(false)}}>Close</Button>
            {answer}
            <div className="h-4"></div>
            <h1>files references</h1>
            {filesReferences?.map(file => (
               <span key={file.fileName}>{file.fileName}</span>
            ))}
          
            
          </DialogContent>
       </Dialog>
       <Card className='rel col-span-2'>
        <CardHeader>
            <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
            <form onSubmit={onSubmit}>
                <Textarea placeholder='which file should i edit to change home page' value={question} onChange={e=>setQuestion(e.target.value)}/>
                <div className="h-4"></div>
                <div className='h-4'>
                    <Button type='submit' disabled={loading}>
                        Ask codesage
                    </Button>
                    
                </div>
            </form>
        </CardContent>
       </Card>
     
     </>
  )
}

export default Askquestioncard