import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    image: v.optional(v.string()),
    yearOfStudy: v.optional(v.string()),
    department: v.optional(v.string()),
    major: v.optional(v.string()),
    lookingFor: v.optional(v.array(v.string())),
    availability: v.optional(v.string()),
    
    // NEW: Personality & Values
    personalityType: v.optional(v.string()),
    topValues: v.optional(v.array(v.string())),
    communicationStyle: v.optional(v.string()),
    socialPreference: v.optional(v.string()),
    lifestyleHabits: v.optional(v.array(v.string())),
    
    // NEW: Goals & Aspirations
    careerGoals: v.optional(v.array(v.string())),
    learningGoals: v.optional(v.array(v.string())),
    projectInterests: v.optional(v.array(v.string())),
    timeCommitment: v.optional(v.string()),
    
    // NEW: Enhanced Academic
    gpaRange: v.optional(v.string()),
    favoriteCourses: v.optional(v.array(v.string())),
    studyStyle: v.optional(v.string()),
    academicStrengths: v.optional(v.array(v.string())),
    academicChallenges: v.optional(v.array(v.string())),
    
    // NEW: Preferences
    mustHaves: v.optional(v.array(v.string())),
    niceToHaves: v.optional(v.array(v.string())),
    distancePreference: v.optional(v.string()),
    connectionTypePriority: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(userId, {
      name: args.name,
      bio: args.bio,
      interests: args.interests,
      skills: args.skills,
      location: args.location,
      image: args.image,
      yearOfStudy: args.yearOfStudy,
      department: args.department,
      major: args.major,
      lookingFor: args.lookingFor,
      availability: args.availability,
      
      // NEW fields
      personalityType: args.personalityType,
      topValues: args.topValues,
      communicationStyle: args.communicationStyle,
      socialPreference: args.socialPreference,
      lifestyleHabits: args.lifestyleHabits,
      careerGoals: args.careerGoals,
      learningGoals: args.learningGoals,
      projectInterests: args.projectInterests,
      timeCommitment: args.timeCommitment,
      gpaRange: args.gpaRange,
      favoriteCourses: args.favoriteCourses,
      studyStyle: args.studyStyle,
      academicStrengths: args.academicStrengths,
      academicChallenges: args.academicChallenges,
      mustHaves: args.mustHaves,
      niceToHaves: args.niceToHaves,
      distancePreference: args.distancePreference,
      connectionTypePriority: args.connectionTypePriority,
    });

    return userId;
  },
});

export const getProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

export const getProfileCompletion = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const user = await ctx.db.get(userId);
    if (!user) return 0;

    let completed = 0;
    const total = 25; // Increased from 11 to account for new fields

    // Basic fields (6)
    if (user.name) completed++;
    if (user.image) completed++;
    if (user.bio) completed++;
    if (user.interests && user.interests.length > 0) completed++;
    if (user.skills && user.skills.length > 0) completed++;
    if (user.location) completed++;
    
    // Academic fields (5)
    if (user.yearOfStudy) completed++;
    if (user.department) completed++;
    if (user.major) completed++;
    if (user.lookingFor && user.lookingFor.length > 0) completed++;
    if (user.availability) completed++;
    
    // Personality & Values (5)
    if (user.personalityType) completed++;
    if (user.topValues && user.topValues.length > 0) completed++;
    if (user.communicationStyle) completed++;
    if (user.socialPreference) completed++;
    if (user.lifestyleHabits && user.lifestyleHabits.length > 0) completed++;
    
    // Goals (4)
    if (user.careerGoals && user.careerGoals.length > 0) completed++;
    if (user.learningGoals && user.learningGoals.length > 0) completed++;
    if (user.projectInterests && user.projectInterests.length > 0) completed++;
    if (user.timeCommitment) completed++;
    
    // Enhanced Academic (3)
    if (user.favoriteCourses && user.favoriteCourses.length > 0) completed++;
    if (user.studyStyle) completed++;
    if (user.academicStrengths && user.academicStrengths.length > 0) completed++;
    
    // Preferences (2)
    if (user.distancePreference) completed++;
    if (user.connectionTypePriority && user.connectionTypePriority.length > 0) completed++;

    return Math.round((completed / total) * 100);
  },
});