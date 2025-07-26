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
// import { askQuestion } from './actions'



const Askquestioncard = () => {
    const {project}=useProject()
    const [question,setQuestion]=useState('')
    const[open,setOpen]=useState(false)
    const[loading,setLoading]=useState(false)
    const [filesReferences,setfilesReferences]=useState<{fileName:string;sourceCode:string;summary:string}[]>([])
    const[answer,setAnswer]=useState('')
    const saveAnswer=api.project.saveAnswer.useMutation()

   const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAnswer('');
    setfilesReferences([]);

    if (!project?.id) return;
    setLoading(true);

    // Call the API route
    const res = await fetch('/api/ask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, projectId: project.id }),
    });

    if (!res.ok) {
        toast.error("Failed to get answer");
        setLoading(false);
        return;
    }

    // Read the response
    const reader = res.body?.getReader();
    if (!reader) {
        setLoading(false);
        return;
    }

    let responseText = '';
    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        responseText += chunk;
        setAnswer((prev) => prev + chunk);
    }

    // Parse filesReferences from the final response JSON
    const finalData = JSON.parse(responseText);
    setfilesReferences(finalData.filesReferences);
    setAnswer(finalData.output); 
    setOpen(true);
    setLoading(false);
};

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
                    <Button
                    disabled={saveAnswer.isPending}
                    variant="outline"
                    onClick={() => {
                        console.log("Preparing to save answer...");
                        
                        let finalAnswer = answer;

                        // Ensure finalAnswer is plain text
                        try {
                        const parsed = JSON.parse(answer);
                        if (parsed.output) {
                            finalAnswer = parsed.output;
                        }
                        } catch (e) {
                        console.log("Answer is not JSON, saving as plain string.");
                        }

                        // Ensure filesReferences is valid JSON if DB column expects a string
                        let filesRefs = filesReferences;
                        if (!Array.isArray(filesReferences)) {
                        try {
                            filesRefs = JSON.parse(filesReferences);
                        } catch {
                            console.log("filesReferences is not JSON, keeping as-is.");
                        }
                        }

                        console.log("Saving answer:", { question, finalAnswer, filesRefs });

                        saveAnswer.mutate(
                        {
                            projectId: project!.id,
                            question,
                            answer: finalAnswer,
                            filesReferences: filesRefs, // Change to JSON.stringify(filesRefs) if DB column is text
                        },
                        {
                            onSuccess: () => {
                            toast.success("Answer saved!");
                            refetch();
                            },
                            onError: (err) => {
                            console.error("Save error:", err);
                            toast.error("Failed to save answer");
                            },
                        }
                        );
                    }}
                    >
                    Save Answer
                    </Button>

                </div>
                
            </DialogHeader>
            
            {/* {answer}
            <div className="h-4"></div> 
             <h1>files references</h1>
            {filesReferences?.map(file => (
               <span key={file.fileName}>{file.fileName}</span>
            ))} */}
            <MDEditor.Markdown source={answer} className='max-w-[70vw] !h-full max-h-[10vh] overflow-scroll'/>
            <div className="h-4"></div>
            <Codereferences filereferences={filesReferences} />
            <Button type='submit' onClick={()=>{setOpen(false)}}>Close</Button>
          </DialogContent>
       </Dialog>
       <Card className='rel col-span-3'>
            <CardHeader>
                <CardTitle>Ask a question</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit}>
                    <Textarea placeholder='which file should i edit to change home page' value={question} onChange={e=>setQuestion(e.target.value)}/>
                    <div className="h-4"></div>
                        <Button type='submit' disabled={loading}>Ask codesage</Button>
                </form>
            </CardContent>
       </Card>
     
     </>
  )
}

export default Askquestioncard




//     const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//         setAnswer('')
//         setfilesReferences([])
//         e.preventDefault()
//         if(!project?.id)return
//         setLoading(true)
//         const {output,filesReferences}=await askQuestion(question,project.id)

//         // const res = await fetch('/api/ask', {
//         //     method: 'POST',
//         //     headers: {
//         //         'Content-Type': 'application/json',  // ✅ required
//         //     },
//         //     body: JSON.stringify({ question: question, projectId: project?.id }),
//         // })

//         // const data = await res.json()
//         // setAnswer(data.output)
//         // 
//         setOpen(true)
//         setfilesReferences(filesReferences)
//         for await (const delta of readStreamableValue(output)){
//             if(delta){
//                 setAnswer(ans=>ans+delta)
//             }
//         }

//         setLoading(false)
//    }