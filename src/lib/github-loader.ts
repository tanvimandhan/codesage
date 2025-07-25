import {GithubRepoLoader} from '@langchain/community/document_loaders/web/github'
import {Document} from "@langchain/core/documents"
import { generateEmbedding, summariseCode } from './gemini'
import { db } from './prisma'

export const loadGithubRepo=async(githubUrl:string,githubToken?:string)=>{
     const loader=new GithubRepoLoader(githubUrl,{
        accessToken:githubToken || '',
        branch:'main',
        ignoreFiles:['package-lock.json','yarn-lock','pnpm-lock.yml'],
        // headers: {
        // 'User-Agent': 'MyApp-TanviMandhan', // customize to your app name or GitHub username
        // },
        recursive:true,
        unknown:'warn',
        maxConcurrency:5
     })
      const docs=await loader.load()
      const limitedDocs = docs.slice(0, 8);
      console.log('Loaded docs:', docs.length);
      console.log(limitedDocs)

      return limitedDocs

}

export const indexGithubRepo=async(projectId:string,githubUrl:string,githubToken?:string)=>{
    const docs=await loadGithubRepo(githubUrl,githubToken)
    const allEmbeddings=await generateEmbeddings(docs)
    console.log("Embeddings generated:", allEmbeddings.length);
    console.log("Sample embedding:", allEmbeddings[0]);
    await Promise.allSettled(allEmbeddings.map(async (embedding,index)=>{
        console.log(`processing ${index} of ${allEmbeddings.length}`)

        if(!embedding)return
        console.log("Creating DB entry for:", embedding.fileName);
        let sourceCodeEmbedding;
        try {
        sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
            data: {
            summary: embedding.summary || "No summary",
            sourceCode: embedding.sourceCode || "No code",
            fileName: embedding.fileName || "unknown",
            projectId: projectId,
            
            },
        });
            console.log("Inserted DB Row:", sourceCodeEmbedding);
            console.log("DB Inserted ID:", sourceCodeEmbedding.id);
            await db.$executeRaw`
            UPDATE "SourceCodeEmbedding"
            SET "summaryEmbedding"=${embedding.embedding}::vector
            WHERE "id"=${sourceCodeEmbedding.id}`
        } catch (err) {
        console.error("DB Insert Error:", err);
        }

        
        
    }))
}

const generateEmbeddings=async(docs:Document[])=>{
   return await Promise.all(docs.map(async doc=>{
    const summary=await summariseCode(doc)
    const embedding=await generateEmbedding(summary)
    return {
        summary,
        embedding,
        sourceCode:JSON.parse(JSON.stringify(doc.pageContent)),
        fileName:doc.metadata.source
    }
   }))
}

