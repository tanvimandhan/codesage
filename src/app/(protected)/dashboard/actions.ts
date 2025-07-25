'use server'

import { streamText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateEmbedding } from '@/lib/gemini'
import { db } from '@/lib/prisma'
import useProject from '@/hooks/use-project'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

export async function* askQuestion(question: string, id: string) {
  const { projectId } = useProject()

  const queryVector = await generateEmbedding(question)
  const vectorQuery = `[${queryVector.join(',')}]`

  const result = await db.$queryRaw`
    SELECT "filename","sourceCode","summary",
    1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "sourceCodeEmbedding"
    WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 10
  ` as { fileName: string; sourceCode: string; summary: string; similarity: number }[]

  let context = ''

  for (const doc of result) {
    context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\nsummary of file: ${doc.summary}\n\n`
  }

  const { textStream } = await streamText({
    model: google('gemini-1.5-flash'),
    prompt: `
           You are a AI code assistant who answers questions about the codebase. Your target audience is a technical intern who is learning the codebase for the first time.

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
            Answer in markdown style, with code snippets if needed. Be as detailed as possible.
    `,
  })

  for await (const delta of textStream) {
    yield delta
  }

  // optional: yield file references at the end in a custom format
  // yield `\n\n**Referenced Files:**\n${result.map(f => f.fileName).join(', ')}`
}
