import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMatches = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const currentUser = await ctx.db.get(userId);
    if (!currentUser || !currentUser.interests) return [];

    // Get all users
    const allUsers = await ctx.db.query("users").collect();
    
    // Get existing connections to exclude them
    const existingConnections = currentUser.connections || [];
    
    // Get pending connection requests to exclude them
    const sentRequests = await ctx.db
      .query("connection_requests")
      .withIndex("by_sender", (q) => q.eq("senderId", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
    
    const pendingUserIds = sentRequests.map(req => req.receiverId);
    
    const matches = allUsers
      .filter(user => {
        // Exclude self
        if (user._id === userId) return false;
        // Exclude users without interests
        if (!user.interests || user.interests.length === 0) return false;
        // Exclude existing connections
        if (existingConnections.includes(user._id)) return false;
        // Exclude pending requests
        if (pendingUserIds.includes(user._id)) return false;
        return true;
      })
      .map(user => {
        // Calculate shared interests
        const sharedInterests = currentUser.interests!.filter(interest =>
          user.interests!.includes(interest)
        );
        
        // Calculate shared skills
        const sharedSkills = currentUser.skills && user.skills
          ? currentUser.skills.filter(skill => user.skills!.includes(skill))
          : [];
        
        // Calculate location bonus
        const locationBonus = currentUser.location && user.location && 
          currentUser.location.toLowerCase() === user.location.toLowerCase() 
          ? 2 : 0;
        
        // Total score: interests (1 point each) + skills (0.5 points each) + location bonus
        const score = sharedInterests.length + (sharedSkills.length * 0.5) + locationBonus;
        
        return {
          user,
          score,
          sharedInterests,
          sharedSkills,
          sameLocation: locationBonus > 0,
        };
      })
      .filter(match => match.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return matches;
  },
});
