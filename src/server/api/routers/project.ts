import { createTRPCRouter, protectedProcedure } from "../trpc";
import {z} from 'zod'
import { db } from "@/lib/prisma";
import { pollCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";

export const projectRouter=createTRPCRouter({
  

createProject:protectedProcedure.input(
    z.object({
        name:z.string(),
        githubUrl:z.string(),
        githubToken:z.string().optional()
        
    })
   ).mutation(async ({ ctx, input }) => {
    try {
      const project = await ctx.db.project.create({
        data: {
          githubUrl: input.githubUrl,
         // githubToken: input.githubToken ?? "",
          name: input.name,
          userToProjects: {
            create: {
              userId: ctx.user.userId!,
            },
          },
        },
      });
   // console.log("GitHub token being used:", githubToken?.slice(0, 6) + "...(hidden)");
    await indexGithubRepo(project.id,input.githubUrl,input.githubToken)
    await pollCommits(project.id)
    return project;
  } catch (err) {
    console.error("Project creation failed:", err);
    throw new Error("Project creation failed");
  }
}),
getProjects:protectedProcedure.query(async({ctx})=>{
    return await ctx.db.project.findMany({
        where:{
          userToProjects:{
            some:{
              userId:ctx.user.userId!
            }
          },
          deleteAt: null
        }
    })
}),
   getCommits:protectedProcedure.input(z.object({
    projectId:z.string()
   })).query(async({ctx,input})=>{
    pollCommits(input.projectId).then().catch(console.error)
    return await ctx.db.commit.findMany({where:{projectId:input.projectId}})
   }),
   saveAnswer:protectedProcedure.input(z.object({
    projectId: z.string(),
    question: z.string(),
    answer: z.string(),      
    filesReferences: z.any()
   })).mutation(async({ctx,input})=>{
    console.log("Incoming saveAnswer data:", input);
    try {
      return await ctx.db.question.create({
        data: {
          answer: input.answer,
          filesReferences: input.filesReferences, // <-- might need JSON.stringify()
          projectId: input.projectId,
          question: input.question,
          userId: ctx.user.userId!,
          
        },
      });
    } catch (err) {
      console.error("DB save error:", err);
      throw new Error("Failed to save answer: " + (err as Error).message);
    }
   }),
  getQuestions:protectedProcedure.input(z.object({projectId:z.string()})).query(async({ctx,input})=>{
    return await ctx.db.question.findMany({
      where:{
        projectId:input.projectId
      },include:{
        user:true
      },orderBy:{
        createdAt:'desc'
      }
    })
  })


})