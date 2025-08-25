import {GithubRepoLoader} from '@langchain/community/document_loaders/web/github'
import {Document} from "@langchain/core/documents"
import { generateEmbedding, summariseCode } from './gemini'
import { db } from './prisma'
import { Octokit } from 'octokit'
import { string } from 'zod'

const getFileCount=async(path:string,octokit:Octokit,githubOwner:string,githubRepo:string,acc:number=0)=>{
    const {data}=await octokit.rest.repos.getContent({
        owner:githubOwner,
        repo:githubRepo,
        path
    })
    if(!Array.isArray(data) && data.type==='file'){
        return acc+1
        
    }
    if(Array.isArray(data)){
        let fileCount=0
        const directories:string[]=[]

        for(const item of data){
            if(item.type==='dir'){
                directories.push(item.path)
            }else{
                fileCount++
            }
        }
        if(directories.length>0){
            const directoriesCounts=await Promise.all(
                directories.map(dirPath=>getFileCount(dirPath,octokit,githubOwner,githubRepo,0))
            )
            fileCount+=directoriesCounts.reduce((acc,count)=>acc+count,0)
        }
        return acc+fileCount
    
    }return acc
}
export const checkCredits=async(githubUrl:string,githubToken?:string)=>{
   const octokit=new Octokit({auth:githubToken})
   const githubOwner=githubUrl.split('/')[3]
   const githubRepo=githubUrl.split('/')[4]
   if(!githubOwner || ! githubRepo){
    return 0
   }
   const fileCount=await getFileCount('',octokit,githubOwner,githubRepo,0)
   return fileCount

}
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

