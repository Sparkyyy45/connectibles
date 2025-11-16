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
        
        // Calculate year of study match
        const yearMatch = currentUser.yearOfStudy && user.yearOfStudy &&
          currentUser.yearOfStudy === user.yearOfStudy ? 1 : 0;
        
        // Calculate department match
        const departmentMatch = currentUser.department && user.department &&
          currentUser.department.toLowerCase() === user.department.toLowerCase() ? 1.5 : 0;
        
        // Calculate matchIntent match
        const matchIntentBonus = currentUser.matchIntent && user.matchIntent &&
          currentUser.matchIntent === user.matchIntent ? 1.5 : 0;
        
        // Calculate preferred activities match
        const sharedActivities = currentUser.preferredActivities && user.preferredActivities
          ? currentUser.preferredActivities.filter(activity => user.preferredActivities!.includes(activity))
          : [];
        const activitiesBonus = sharedActivities.length * 0.5;
        
        // Calculate personality type compatibility (closer values = better match)
        const personalityCompatibility = currentUser.personalityType && user.personalityType
          ? Math.max(0, 2 - Math.abs(currentUser.personalityType - user.personalityType) * 0.5)
          : 0;
        
        // Calculate mutual connections
        const userConnections = user.connections || [];
        const mutualConnections = existingConnections.filter(connId => 
          userConnections.includes(connId)
        );
        
        // Total score: interests (1 point each) + skills (0.5 points each) + location bonus + 
        // academic matches + matchIntent bonus + activities bonus + personality compatibility
        const score = sharedInterests.length + (sharedSkills.length * 0.5) + locationBonus + 
                     yearMatch + departmentMatch + matchIntentBonus + activitiesBonus + personalityCompatibility;
        
        return {
          user,
          score,
          sharedInterests,
          sharedSkills,
          sharedActivities,
          sameLocation: locationBonus > 0,
          mutualConnectionsCount: mutualConnections.length,
          personalityCompatibility,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    return matches;
  },
});

export const getExploreMatches = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const currentUser = await ctx.db.get(userId);
    if (!currentUser) return [];

    // Get all users
    const allUsers = await ctx.db.query("users").collect();
    
    // Get existing connections to exclude them
    const existingConnections = currentUser.connections || [];
    
    // Get pending connection requests to exclude them
    const sentRequests = await ctx.db
      .query("connection_requests")
      .withIndex("by_sender", (q) => q.eq("senderId", userId))
      .collect();
    
    const pendingUserIds = sentRequests.map(req => req.receiverId);
    
    // Filter and randomize
    const eligibleUsers = allUsers
      .filter(user => {
        if (user._id === userId) return false;
        if (existingConnections.includes(user._id)) return false;
        if (pendingUserIds.includes(user._id)) return false;
        return true;
      })
      .sort(() => Math.random() - 0.5) // Randomize
      .slice(0, 10);

    return eligibleUsers.map(user => {
      const userConnections = user.connections || [];
      const mutualConnections = existingConnections.filter(connId => 
        userConnections.includes(connId)
      );

      return {
        user,
        mutualConnectionsCount: mutualConnections.length,
      };
    });
  },
});

export const getReverseMatches = query({
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
      .collect();
    
    const pendingUserIds = sentRequests.map(req => req.receiverId);
    
    // Find users who would match with current user based on THEIR interests
    const reverseMatches = allUsers
      .filter(user => {
        if (user._id === userId) return false;
        if (!user.interests || user.interests.length === 0) return false;
        if (existingConnections.includes(user._id)) return false;
        if (pendingUserIds.includes(user._id)) return false;
        return true;
      })
      .map(user => {
        // Calculate how much the OTHER user would be interested in YOU
        const theirInterestsInYou = user.interests!.filter(interest =>
          currentUser.interests!.includes(interest)
        );
        
        const theirSkillsInYou = user.skills && currentUser.skills
          ? user.skills.filter(skill => currentUser.skills!.includes(skill))
          : [];
        
        const locationMatch = currentUser.location && user.location && 
          currentUser.location.toLowerCase() === user.location.toLowerCase();
        
        const userConnections = user.connections || [];
        const mutualConnections = existingConnections.filter(connId => 
          userConnections.includes(connId)
        );
        
        const score = theirInterestsInYou.length + (theirSkillsInYou.length * 0.5) + (locationMatch ? 2 : 0);
        
        return {
          user,
          score,
          sharedInterests: theirInterestsInYou,
          sharedSkills: theirSkillsInYou,
          sameLocation: locationMatch,
          mutualConnectionsCount: mutualConnections.length,
        };
      })
      .filter(match => match.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    return reverseMatches;
  },
});