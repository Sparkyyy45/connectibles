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

    const allUsers = await ctx.db.query("users").collect();
    
    const existingConnections = currentUser.connections || [];
    
    const sentRequests = await ctx.db
      .query("connection_requests")
      .withIndex("by_sender", (q) => q.eq("senderId", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
    
    const pendingUserIds = sentRequests.map(req => req.receiverId);
    
    const matches = allUsers
      .filter(user => {
        if (user._id === userId) return false;
        if (!user.interests || user.interests.length === 0) return false;
        if (existingConnections.includes(user._id)) return false;
        if (pendingUserIds.includes(user._id)) return false;
        return true;
      })
      .map(user => {
        // Calculate different compatibility dimensions
        
        // 1. PERSONALITY MATCH (25% weight)
        let personalityScore = 0;
        if (currentUser.personalityType && user.personalityType) {
          personalityScore += currentUser.personalityType === user.personalityType ? 10 : 0;
        }
        if (currentUser.socialPreference && user.socialPreference) {
          personalityScore += currentUser.socialPreference === user.socialPreference ? 5 : 0;
        }
        if (currentUser.communicationStyle && user.communicationStyle) {
          personalityScore += currentUser.communicationStyle === user.communicationStyle ? 5 : 0;
        }
        const sharedLifestyleHabits = currentUser.lifestyleHabits && user.lifestyleHabits
          ? currentUser.lifestyleHabits.filter(h => user.lifestyleHabits!.includes(h)).length
          : 0;
        personalityScore += sharedLifestyleHabits * 2;
        
        // 2. SHARED INTERESTS & VALUES (20% weight)
        const sharedInterests = currentUser.interests!.filter(interest =>
          user.interests!.includes(interest)
        );
        const sharedValues = currentUser.topValues && user.topValues
          ? currentUser.topValues.filter(v => user.topValues!.includes(v))
          : [];
        const interestsScore = (sharedInterests.length * 3) + (sharedValues.length * 5);
        
        // 3. GOALS ALIGNMENT (20% weight)
        const sharedCareerGoals = currentUser.careerGoals && user.careerGoals
          ? currentUser.careerGoals.filter(g => user.careerGoals!.includes(g))
          : [];
        const sharedLearningGoals = currentUser.learningGoals && user.learningGoals
          ? currentUser.learningGoals.filter(g => user.learningGoals!.includes(g))
          : [];
        const sharedProjectInterests = currentUser.projectInterests && user.projectInterests
          ? currentUser.projectInterests.filter(p => user.projectInterests!.includes(p))
          : [];
        const goalsScore = (sharedCareerGoals.length * 4) + (sharedLearningGoals.length * 3) + (sharedProjectInterests.length * 3);
        
        // 4. ACADEMIC FIT (15% weight)
        let academicScore = 0;
        if (currentUser.yearOfStudy && user.yearOfStudy && currentUser.yearOfStudy === user.yearOfStudy) {
          academicScore += 3;
        }
        if (currentUser.department && user.department && currentUser.department.toLowerCase() === user.department.toLowerCase()) {
          academicScore += 5;
        }
        if (currentUser.major && user.major && currentUser.major.toLowerCase() === user.major.toLowerCase()) {
          academicScore += 7;
        }
        if (currentUser.studyStyle && user.studyStyle && currentUser.studyStyle === user.studyStyle) {
          academicScore += 2;
        }
        const sharedCourses = currentUser.favoriteCourses && user.favoriteCourses
          ? currentUser.favoriteCourses.filter(c => user.favoriteCourses!.includes(c))
          : [];
        academicScore += sharedCourses.length * 2;
        
        // 5. SKILLS & COMPLEMENTARY STRENGTHS (10% weight)
        const sharedSkills = currentUser.skills && user.skills
          ? currentUser.skills.filter(skill => user.skills!.includes(skill))
          : [];
        const complementaryMatch = currentUser.academicChallenges && user.academicStrengths
          ? currentUser.academicChallenges.filter(c => user.academicStrengths!.includes(c))
          : [];
        const skillsScore = (sharedSkills.length * 2) + (complementaryMatch.length * 3);
        
        // 6. LOCATION & AVAILABILITY (10% weight)
        let practicalScore = 0;
        if (currentUser.location && user.location && currentUser.location.toLowerCase() === user.location.toLowerCase()) {
          practicalScore += 5;
        }
        if (currentUser.availability && user.availability && currentUser.availability === user.availability) {
          practicalScore += 3;
        }
        const sharedLookingFor = currentUser.lookingFor && user.lookingFor
          ? currentUser.lookingFor.filter(item => user.lookingFor!.includes(item))
          : [];
        practicalScore += sharedLookingFor.length * 2;
        
        // Calculate weighted total score
        const totalScore = 
          (personalityScore * 0.25) +
          (interestsScore * 0.20) +
          (goalsScore * 0.20) +
          (academicScore * 0.15) +
          (skillsScore * 0.10) +
          (practicalScore * 0.10);
        
        // Calculate mutual connections
        const userConnections = user.connections || [];
        const mutualConnections = existingConnections.filter(connId => 
          userConnections.includes(connId)
        );
        
        return {
          user,
          score: Math.round(totalScore),
          sharedInterests,
          sharedSkills,
          sharedValues,
          sharedCareerGoals,
          sharedLearningGoals,
          sharedProjectInterests,
          complementaryMatch,
          sameLocation: currentUser.location && user.location && currentUser.location.toLowerCase() === user.location.toLowerCase(),
          mutualConnectionsCount: mutualConnections.length,
          personalityMatch: personalityScore > 0,
          academicMatch: academicScore > 0,
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