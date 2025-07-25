// src/server/api/routers/post.ts

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(() => {
    // Replace this with actual DB fetch logic
    return [
      { id: 1, title: "Hello world" },
      { id: 2, title: "Another post" },
    ];
  }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
      })
    )
    .mutation(({ input }) => {
      // Replace this with actual DB write logic
      return {
        success: true,
        post: { id: Date.now(), title: input.title },
      };
    }),
});
