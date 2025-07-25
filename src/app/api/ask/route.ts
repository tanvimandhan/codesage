// This is a Next.js Route Handler (runs on server)

import { NextResponse } from 'next/server'
import { generateEmbedding } from '@/lib/gemini'
import { db } from '@/lib/prisma'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText } from 'ai'


const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

export async function POST(req: Request) {
  const { question, projectId } = await req.json()
  if(!question || !projectId)return NextResponse.json({ error: 'Missing question or projectId' }, { status: 400 })
  const queryVector = await generateEmbedding(question)
 // const vectorQuery = `[${queryVector.join(',')}]`
 const vectorQuery=queryVector;

  console.log("queryVector",queryVector.length);

const result = await db.$queryRawUnsafe<{ fileName: string; sourceCode: string; summary: string; similarity: number }[]>(
  `
    SELECT "fileName", "sourceCode", "summary",
    1 - ("summaryEmbedding" <=> $1::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE "projectId" = $2 AND "summaryEmbedding" IS NOT NULL
    ORDER BY similarity DESC
    LIMIT 10
  `,
  vectorQuery, // pass as array, NOT string
  projectId
);


 // console.log('Generated embedding vector length', queryVector.length)
  let context = ''
  
  console.log(3);
  
  for (const doc of result) {
    console.log(doc);
    context += `source:${doc.fileName}\ncode content:${doc.sourceCode}\n summary of file:${doc.summary}\n\n`
  }
  console.log("result",result);
  console.log("context",context);
  //if(context==='')return NextResponse.json({ error: 'Missing context' }, { status: 400 })
  const { textStream } = await streamText({
    model: google('gemini-1.5-flash'),
    prompt: `You are a AI code assistant who answers questions about the codebase. Your target audience is a technical intern who is learning the codebase for the first time.

            The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
            AI is a well-behaved and well-mannered individual.
            AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
            AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in the codebase.
            If the question is asking about code or a specific file, AI will provide the detailed answer, giving step by step instructions and reasoning.

            START CONTEXT BLOCK
            ${context}
            END OF CONTEXT BLOCK


            START QUESTION
            ${question}
            END OF QUESTION

            AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
            If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but based on the provided context, I do not have the information to answer that."
            AI assistant will not apologize for previous responses, but instead will indicate new information.
            AI assistant will not invent anything that is not drawn directly from the context.
            Answer in markdown style, with code snippets if needed. Be as detailed as possible.`,
  })

  const chunks: string[] = []
  for await (const delta of textStream) {
    chunks.push(delta)
  }

  return NextResponse.json({ output: chunks.join(''), filesReferences: result })
}
