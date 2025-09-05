import {Octokit} from "octokit"
import { db } from "./prisma"
import axios from 'axios'
import {aisummariseCommit} from './gemini'


export const octokit=new Octokit({
    auth:process.env.GITHUB_TOKEN,
})

//const githubUrl="https://github.com/docker/genai-stack"

type Response={
    commitMessage:  string
    commitHash  :   string
    commitAuthorName: string
    commitAuthorAvtar: string
    commitDate:      string
}

export const getCommitHashes=async(githubUrl:string):Promise<Response[]>=>{
    const[owner,repo]=githubUrl.split('/').slice(-2)
    if(!owner || !repo){
        throw new Error("Invalid github url")
    }
 const {data}=await octokit.rest.repos.listCommits({
    owner,
    repo
 })
// console.log(data)

 const sortedCommits=data.sort((a:any,b:any)=>new Date(b.commit.author.date).getTime()-new Date(a.commit.author.date).getTime()) as any[]

 return sortedCommits.slice(0,10).map((commit:any)=>({
     commitHash:commit.sha as string,
     commitMessage:commit.commit.message??"",
     commitAuthorName:commit.commit?.author?.name??"",
     commitAuthorAvtar: commit.author?.avatar_url ?? commit.committer?.avatar_url ?? "",
     commitDate: commit.commit?.author?.date ??  ""
 }))
} 

//getCommitHashes(githubUrl)
export const pollCommits=async(projectId:string)=>{
    const {project,githubUrl}=await fetchProjectGithubUrl(projectId)
    const commitHashes=await getCommitHashes(githubUrl)
    const unprocessedCommits=await filterUnprocessedCommits(projectId,commitHashes)
    const summaryResponses=await Promise.allSettled(unprocessedCommits.map(commit=>{
        return summariseCommit(githubUrl,commit.commitHash)
    }))
    // console.log(2);
    // console.log(unprocessedCommits)
    const summaries=summaryResponses.map((response)=>{
        if(response.status==='fulfilled'){
            return response.value as string
        }return ""
    })
    const commit=await db.commit.createMany({
        data:summaries.map((summary,index)=>{
            console.log(`processing commit,${index}`)
            return {
                projectId:projectId,
                commitHash:unprocessedCommits[index]!.commitHash,
                commitMessage:unprocessedCommits[index]!.commitMessage,
                commitAuthorName:unprocessedCommits[index]!.commitAuthorName,
                commitAuthorAvtar:unprocessedCommits[index]!.commitAuthorAvtar,
                commitDate:unprocessedCommits[index]!.commitDate,
                summary
            }
        })
    })
    return commit
}

async function summariseCommit(githubUrl:string,commitHash:string){
  const {data}=await axios.get(`${githubUrl}/commit/${commitHash}.diff`,{
    headers:{
        Accept:'application/vnd.github.v3.diff'
    }
  })
  
  return await aisummariseCommit(data)||""
}

async function fetchProjectGithubUrl(projectId:string){
    const project=await db.project.findUnique({
        where:{id:projectId},
        select:{
            githubUrl:true
        }
    })
    console.log(project?.githubUrl);
    if(!project?.githubUrl){
        throw new Error("project has no github url")
    }
    return {project,githubUrl:project?.githubUrl}
}

async function filterUnprocessedCommits(projectId:string,commitHashes:Response[]){
    const processedCommits=await db.commit.findMany({
        where:{projectId}
    })
    const unprocessedCommits=commitHashes.filter((commit)=>!processedCommits.some((processedCommit)=>processedCommit.commitHash===commit.commitHash))
    
    return unprocessedCommits
}

