import {initTRPC} from "@trpc/server"
import superjson from "superjson"
import { ZodError} from "zod"
import { auth } from "@clerk/nextjs/server"
import { TRPCError } from "@trpc/server"
import { db } from "@/lib/prisma"
// import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
// import { inferAsyncReturnType } from '@trpc/server';
// import { fetchRequestHandler } from '@trpc/server/adapters/fetch';


export const createTRPCContext = async (opts: { req: Request }) => {
  return {
    db,
    headers: Object.fromEntries(opts.req.headers),
  };
};
const t=initTRPC.context<typeof createTRPCContext>().create({
   transformer:superjson,
   errorFormatter({shape,error}){
    return {
        ...shape,
        data:{
            ...shape.data,
            zodError:
            error.cause instanceof ZodError ?error.cause.flatten():null
        },
        
    };
   },
});
export const createCallerFactory=t.createCallerFactory;

export const createTRPCRouter=t.router;

const isAuthenticated=t.middleware(async({next,ctx})=>{
    const user=await auth()
    if(!user){
        throw new TRPCError({
            code:'UNAUTHORIZED',
            message:"You must be logged in to access this resource"
        })
    }
    return next({
        ctx:{
            ...ctx,
            user
        }
    })
})

const timingMiddleware=t.middleware(async({next,path})=>{
    const start=Date.now();

    if(t._config.isDev){
        const waitMs=Math.floor(Math.random()*400)+100;
        await new Promise((resolve)=>setTimeout(resolve,waitMs));
    }
    const result =await next()

    const end=Date.now()
    console.log(`[TRPC] ${path} took ${end-start}ms to execute`);

    return result;
})

export const publicProcedure=t.procedure.use(timingMiddleware)
export const protectedProcedure=t.procedure.use(isAuthenticated)