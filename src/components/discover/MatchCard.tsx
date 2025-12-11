import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, Heart, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";
import type { Id } from "@/convex/_generated/dataModel";

interface MatchCardProps {
  match: any;
  index: number;
  onConnect: (userId: Id<"users">) => void;
  onAvatarClick: (user: { id: Id<"users">, name: string, image?: string }) => void;
}

export function MatchCard({ match, index, onConnect, onAvatarClick }: MatchCardProps) {
  return (
    <motion.div
      key={match.user._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      <Card className="border-2 border-purple-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-transparent to-blue-50/30 pointer-events-none" />
        <CardHeader className="relative">
          <div className="flex items-start gap-4">
            <Avatar 
              className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              onClick={() => onAvatarClick({ 
                id: match.user._id, 
                name: match.user.name || "Anonymous",
                image: match.user.image 
              })}
            >
              <AvatarImage src={match.user.image} alt={match.user.name || "User"} />
              <AvatarFallback>
                {match.user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-slate-900">{match.user.name || "Anonymous"}</CardTitle>
              {match.mutualConnectionsCount > 0 && (
                <CardDescription className="text-sm text-slate-600 font-medium mt-1">
                  <span className="inline-flex items-center gap-1 text-purple-600">
                    <Users className="h-3.5 w-3.5" />
                    {match.mutualConnectionsCount} mutual connection{match.mutualConnectionsCount > 1 ? 's' : ''}
                  </span>
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          {match.user.bio && (
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-200/50">{match.user.bio}</p>
          )}
          {match.user.location && (
            <p className="text-sm text-slate-600 font-medium flex items-center gap-2">
              <span className="text-lg">📍</span>
              {match.user.location}
            </p>
          )}
          {match.sharedInterests && Array.isArray(match.sharedInterests) && match.sharedInterests.length > 0 && (
            <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-200/40">
              <p className="text-sm font-bold mb-3 text-purple-900 flex items-center gap-2">
                <Heart className="h-4 w-4 text-purple-600" />
                Shared Interests
              </p>
              <div className="flex flex-wrap gap-2">
                {match.sharedInterests.map((interest: string) => (
                  <Badge key={interest} className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200/50 hover:from-purple-200 hover:to-blue-200 transition-all">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {match.sharedSkills && Array.isArray(match.sharedSkills) && match.sharedSkills.length > 0 && (
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200/40">
              <p className="text-sm font-bold mb-3 text-blue-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Shared Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {match.sharedSkills.map((skill: string) => (
                  <Badge key={skill} className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200/50 hover:from-blue-200 hover:to-cyan-200 transition-all">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {match.user.interests && Array.isArray(match.user.interests) && match.user.interests.length > 0 && !match.sharedInterests && (
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/40">
              <p className="text-sm font-bold mb-3 text-slate-900">Interests</p>
              <div className="flex flex-wrap gap-2">
                {match.user.interests.slice(0, 5).map((interest: string) => (
                  <Badge key={interest} variant="secondary" className="bg-slate-100 text-slate-700 border border-slate-200/50">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <Button
            className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all h-12 text-base font-semibold rounded-xl"
            onClick={() => onConnect(match.user._id)}
          >
            <UserPlus className="h-5 w-5" />
            Connect
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
