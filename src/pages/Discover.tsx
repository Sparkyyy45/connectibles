import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, UserPlus, Check } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import type { Id } from "@/convex/_generated/dataModel";

export default function Discover() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const matches = useQuery(api.matching.getMatches);
  const sendRequest = useMutation(api.connections.sendConnectionRequest);
  const sendWave = useMutation(api.connections.sendWave);
  const profileCompletion = useQuery(api.profiles.getProfileCompletion);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleConnect = async (userId: Id<"users">) => {
    try {
      await sendRequest({ receiverId: userId });
      toast.success("Connection request sent!");
    } catch (error) {
      toast.error("Failed to send request");
    }
  };

  const handleWave = async (userId: Id<"users">) => {
    try {
      await sendWave({ receiverId: userId });
      toast.success("Wave sent! 👋");
    } catch (error) {
      toast.error("Failed to send wave");
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const needsProfile = !user.interests || user.interests.length === 0;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold tracking-tight">Discover Matches</h1>
            {profileCompletion !== undefined && (
              <Badge variant={profileCompletion === 100 ? "default" : "secondary"} className="text-sm">
                Profile {profileCompletion}% Complete
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Connect with people who share your interests
          </p>
        </motion.div>

        {needsProfile ? (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Complete Your Profile First</CardTitle>
              <CardDescription>
                Add your interests to start discovering matches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/profile")}>
                Set Up Profile
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches?.map((match, index) => (
              <motion.div
                key={match.user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {match.user.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{match.user.name || "Anonymous"}</CardTitle>
                        <CardDescription>
                          {match.score} match score
                          {match.mutualConnectionsCount > 0 && (
                            <span className="ml-2">• {match.mutualConnectionsCount} mutual</span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {match.user.bio && (
                      <p className="text-sm text-muted-foreground">{match.user.bio}</p>
                    )}
                    {match.user.location && (
                      <p className="text-sm text-muted-foreground">📍 {match.user.location}</p>
                    )}
                    <div>
                      <p className="text-sm font-medium mb-2">Shared Interests:</p>
                      <div className="flex flex-wrap gap-2">
                        {match.sharedInterests.map((interest) => (
                          <Badge key={interest} variant="secondary">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {match.sharedSkills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Shared Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {match.sharedSkills.map((skill) => (
                            <Badge key={skill} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleWave(match.user._id)}
                      >
                        👋 Wave
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => handleConnect(match.user._id)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!needsProfile && matches?.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Matches Yet</CardTitle>
              <CardDescription>
                We couldn't find anyone with shared interests yet. Check back later!
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}