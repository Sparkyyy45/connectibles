import { internalMutation } from "./_generated/server";

export const cleanupOrphanedAuthAccounts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db.query("authAccounts").collect();
    let deletedCount = 0;

    for (const account of accounts) {
      const user = await ctx.db.get(account.userId);
      if (!user) {
        console.log(`Deleting orphaned auth account ${account._id} for missing user ${account.userId}`);
        await ctx.db.delete(account._id);
        deletedCount++;
      }
    }

    return { deletedCount };
  },
});
