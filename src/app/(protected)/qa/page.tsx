'use client'
import useProject from '@/hooks/use-project'
import React, { Fragment, useState } from 'react'
import { api } from '@/trpc/react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import Askquestioncard from '../dashboard/ask-question-card'
import MDEditor from "@uiw/react-md-editor";
import Codereferences from '../dashboard/code-references'

const QAPage = () => {
  const {projectId}=useProject()
  const {data:questions}=api.project.getQuestions.useQuery({projectId})
  const [questionIndex,setQuestionIndex]=useState(0);
  const question=questions?.[questionIndex]

  return (
    <Sheet>
      <Askquestioncard/>
      <div className="h-4"></div>
      <h1 className='text-xl font-semibold'>Saved Question</h1>
      <div className="h-2"></div>
      <div className='flex flex-col gap-2'>
        {questions?.map((question,index)=>{
          return <Fragment key={question.id}>
            <SheetTrigger onClick={()=>setQuestionIndex(index)}>
              
              <div className='flex items-center gap-4 bg-white rounded-lg p-4 shadow border'>
                <img className=' rounded-full' height={20} width={20} src={question.user.imageUrl?? ""}/>
                <div className='text-left flex flex-col'>
                  <div className='flex items-center gap-2'>
                    <p className='text-gray-700 line-clamp-1 text-lg font-medium'>
                      {question.question}
                    </p>
                    <span className='text-xs text-gray-400 whitespace-nowrap'>
                      {question.createdAt.toLocaleDateString()}
                    </span>

                  </div>
                  <p className='text-gray-500 line-clamp-1 text-sm'>
                    {question.answer}
                  </p>
                </div>

              </div>
              
            </SheetTrigger>
          </Fragment>
        })}
      </div>

      {question && (
        <SheetContent className='sm:max-w-[80vw]'>
          <SheetHeader>
            <SheetTitle>
              {question.question}
            </SheetTitle>
            <MDEditor.Markdown source={question.answer}/>
            <Codereferences filereferences={(question.filesReferences ?? []) as any}/>
          </SheetHeader>
        </SheetContent>
      )}
    </Sheet>
  )
}

export default QAPage