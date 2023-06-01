import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

import { DefaultUser } from "next-auth"

const BaseUser = z.object({ id: z.string() })
const AdditionalUser = z.object({ 
    name: z.string().optional().nullable(), 
    email: z.string().optional().nullable(), 
    image: z.string().optional().nullable() 
})
const User = BaseUser.and(AdditionalUser);

export const connectRouter = createTRPCRouter({ 
    // ensure caller is authenticated
    createToken: protectedProcedure
        .input(User.optional())
        .query(() => {
            return { message: "You can now connect!" }
        })
});
