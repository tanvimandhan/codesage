'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import useProject from '@/hooks/use-project'
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import MDEditor from "@uiw/react-md-editor"
import Codereferences from './code-references'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import Userefetch from '@/hooks/use-refetch'

const Askquestioncard = () => {
  const { project } = useProject()
  const [question, setQuestion] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filesReferences, setfilesReferences] = useState<{ fileName: string; sourceCode: string; summary: string }[]>([])
  const [answer, setAnswer] = useState('')
  const saveAnswer = api.project.saveAnswer.useMutation()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setAnswer('')
    setfilesReferences([])

    if (!project?.id) return
    setLoading(true)

    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, projectId: project.id }),
    })

    if (!res.ok) {
      toast.error("Failed to get answer")
      setLoading(false)
      return
    }

    const reader = res.body?.getReader()
    if (!reader) {
      setLoading(false)
      return
    }

    let responseText = ''
    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      responseText += chunk
      setAnswer(prev => prev + chunk)
    }

    const finalData = JSON.parse(responseText)
    setfilesReferences(finalData.filesReferences)
    setAnswer(finalData.output)
    setOpen(true)
    setLoading(false)
  }

  const refetch = Userefetch()

  const handleSaveAnswer = () => {
    let finalAnswer = answer

    try {
      const parsed = JSON.parse(answer)
      if (parsed.output) finalAnswer = parsed.output
    } catch {}

    let filesRefs = filesReferences
    if (!Array.isArray(filesReferences)) {
      try {
        filesRefs = JSON.parse(filesReferences as unknown as string)
      } catch {}
    }

    saveAnswer.mutate(
      {
        projectId: project!.id,
        question,
        answer: finalAnswer,
        filesReferences: filesRefs,
      },
      {
        onSuccess: () => {
          toast.success("Answer saved!")
          refetch()
        },
        onError: () => toast.error("Failed to save answer"),
      }
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[80vw] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>codesage</DialogTitle>
              <Button
                disabled={saveAnswer.isPending}
                variant="outline"
                onClick={handleSaveAnswer}
              >
                Save Answer
              </Button>
            </div>
          </DialogHeader>

          {/* Scrollable content */}
          <div className="flex-1 overflow-auto pr-2">
            <MDEditor.Markdown
              source={answer}
              className="w-full !h-auto max-h-[40vh] overflow-auto"
            />
            <div className="h-4"></div>
            <Codereferences filereferences={filesReferences} />
          </div>

          {/* Fixed footer */}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="rel col-span-3">
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="which file should i edit to change home page"
              value={question}
              onChange={e => setQuestion(e.target.value)}
            />
            <div className="h-4"></div>
            <Button type="submit" disabled={loading}>
              Ask codesage
            </Button>
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