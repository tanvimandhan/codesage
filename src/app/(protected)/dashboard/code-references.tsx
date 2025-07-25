'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { lucario } from 'react-syntax-highlighter/dist/esm/styles/prism'

type FileReference = {
  fileName: string
  sourceCode: string
  summary: string
}

type Props = {
  filereferences?: FileReference[] // Make prop optional
}

const Codereferences = ({ filereferences = [] }: Props) => {
  // Safely get first fileName or default to empty string
  const [tab, setTab] = useState(filereferences[0]?.fileName || '')

  if (!filereferences.length) return null

  return (
    <div className='max-w-[70vw]'>
      <Tabs value={tab} onValueChange={setTab}>
        <div className='overflow-scroll flex gap-2 bg-gray-200 p-1 rounded-md'>
          {filereferences.map((file) => (
            <button
              key={file.fileName}
              onClick={() => setTab(file.fileName)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
                { 'bg-primary text-primary-foreground': tab === file.fileName }
              )}
            >
              {file.fileName}
            </button>
          ))}
        </div>
        {filereferences.map((file) => (
          <TabsContent key={file.fileName} value={file.fileName} className='max-h-[40vh] overflow-scroll max-w-7xl rounded-md'>
            <SyntaxHighlighter language='typescript' style={lucario}>
              {file.sourceCode}
            </SyntaxHighlighter>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default Codereferences