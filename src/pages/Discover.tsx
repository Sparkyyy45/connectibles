import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, UserPlus, Sparkles, Shuffle, TrendingUp, Hand, Flag } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import type { Id } from "@/convex/_generated/dataModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Discover() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const matches = useQuery(api.matching.getMatches);
  const exploreMatches = useQuery(api.matching.getExploreMatches);
  const reverseMatches = useQuery(api.matching.getReverseMatches);
  const sendRequest = useMutation(api.connections.sendConnectionRequest);
  const sendWave = useMutation(api.connections.sendWave);
  const reportUser = useMutation(api.reports.reportUser);
  const profileCompletion = useQuery(api.profiles.getProfileCompletion);

  const [activeTab, setActiveTab] = useState("matches");
  const [selectedUser, setSelectedUser] = useState<{ id: Id<"users">, name: string, image?: string } | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleConnect = async (userId: Id<"users">) => {
    try {
      await sendRequest({ receiverId: userId });
      toast.success("Connection request sent!");
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      
      if (errorMessage.includes("ALREADY_CONNECTED")) {
        toast.error("You're already connected with this user");
      } else if (errorMessage.includes("REQUEST_PENDING")) {
        toast.error("Connection request already sent");
      } else if (errorMessage.includes("SELF_CONNECT")) {
        toast.error("You cannot connect with yourself");
      } else if (errorMessage.includes("AUTH_REQUIRED")) {
        toast.error("Please sign in to send connection requests");
      } else {
        toast.error("Failed to send connection request");
      }
    }
  };

  const handleWave = async (userId: Id<"users">) => {
    try {
      await sendWave({ receiverId: userId });
      toast.success("Wave sent! 👋");
      setSelectedUser(null);
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      
      if (errorMessage.includes("ALREADY_WAVED")) {
        toast.error("You've already waved to this user");
      } else if (errorMessage.includes("REQUEST_EXISTS")) {
        toast.error("You've already sent a connection request");
      } else if (errorMessage.includes("SELF_WAVE")) {
        toast.error("You cannot wave to yourself");
      } else if (errorMessage.includes("AUTH_REQUIRED")) {
        toast.error("Please sign in to send waves");
      } else {
        toast.error("Failed to send wave");
      }
    }
  };

  const handleReport = async (userId: Id<"users">) => {
    try {
      const result = await reportUser({ reportedUserId: userId });
      toast.success(`User reported. Total reports: ${result.reportCount}`);
      setShowReportDialog(false);
      setSelectedUser(null);
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes("ALREADY_REPORTED")) {
        toast.error("You have already reported this user");
      } else if (errorMessage.includes("SELF_REPORT")) {
        toast.error("You cannot report yourself");
      } else {
        toast.error("Failed to report user");
      }
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

  const renderMatchCard = (match: any, index: number) => (
    <motion.div
      key={match.user._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar 
              className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              onClick={() => setSelectedUser({ 
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
              <CardTitle className="text-lg">{match.user.name || "Anonymous"}</CardTitle>
              <CardDescription>
                {match.score !== undefined && `${match.score} match score`}
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
          {match.sharedInterests && match.sharedInterests.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Shared Interests:</p>
              <div className="flex flex-wrap gap-2">
                {match.sharedInterests.map((interest: string) => (
                  <Badge key={interest} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {match.sharedSkills && match.sharedSkills.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Shared Skills:</p>
              <div className="flex flex-wrap gap-2">
                {match.sharedSkills.map((skill: string) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {match.user.interests && match.user.interests.length > 0 && !match.sharedInterests && (
            <div>
              <p className="text-sm font-medium mb-2">Interests:</p>
              <div className="flex flex-wrap gap-2">
                {match.user.interests.slice(0, 5).map((interest: string) => (
                  <Badge key={interest} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <Button
            className="w-full"
            onClick={() => handleConnect(match.user._id)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Connect
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <DashboardLayout>
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedUser?.image} alt={selectedUser?.name} />
                <AvatarFallback>
                  {selectedUser?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>
              Choose an action
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={() => selectedUser && handleWave(selectedUser.id)}
              className="w-full gap-2"
              size="lg"
            >
              <Hand className="h-5 w-5" />
              Wave
            </Button>
            <Button
              onClick={() => setShowReportDialog(true)}
              variant="destructive"
              className="w-full gap-2"
              size="lg"
            >
              <Flag className="h-5 w-5" />
              Report User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to report this user? This action will be reviewed by moderators. 
              Users with 10 or more reports will be automatically banned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedUser && handleReport(selectedUser.id)}>
              Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="matches" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Best Matches
              </TabsTrigger>
              <TabsTrigger value="explore" className="gap-2">
                <Shuffle className="h-4 w-4" />
                Explore
              </TabsTrigger>
              <TabsTrigger value="reverse" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Interested in You
              </TabsTrigger>
            </TabsList>

            <TabsContent value="matches" className="mt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches?.map((match, index) => renderMatchCard(match, index))}
              </div>
              {matches?.length === 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>No Matches Yet</CardTitle>
                    <CardDescription>
                      We couldn't find anyone with shared interests yet. Try the Explore tab!
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="explore" className="mt-6">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Discover random users outside your typical matches. Refresh the page for new suggestions!
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exploreMatches?.map((match, index) => renderMatchCard(match, index))}
              </div>
              {exploreMatches?.length === 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>No Users to Explore</CardTitle>
                    <CardDescription>
                      Check back later for more users to discover!
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reverse" className="mt-6">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  These users share interests with you and might be interested in connecting!
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reverseMatches?.map((match, index) => renderMatchCard(match, index))}
              </div>
              {reverseMatches?.length === 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>No Reverse Matches Yet</CardTitle>
                    <CardDescription>
                      No one seems to match with your profile yet. Keep your profile updated!
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}