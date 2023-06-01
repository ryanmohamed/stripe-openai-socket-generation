import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

type BalanceType = {
  balance: number
}

export const controllerRouter = createTRPCRouter({
  getBalance: protectedProcedure // must be signed in
    .query<BalanceType | null>(async ({ ctx }) => {
      // use user id from session information to query for an user account
      const userId = ctx.session.user.id;
      return await ctx.prisma.user.findUniqueOrThrow({ // allows us to find by unique attr or id
        select: { balance: true },
        where: { id: userId }
      });
  }),
});
