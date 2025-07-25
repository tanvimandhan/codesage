import {postRouter} from "@/server/api/routers/post"
import { createCallerFactory,createTRPCRouter } from "./trpc"
import {projectRouter} from "./routers/project"


export const appRouter=createTRPCRouter({
    post:postRouter,
    project:projectRouter
})

export type AppRouter =typeof appRouter;

export const createCaller=createCallerFactory(appRouter)