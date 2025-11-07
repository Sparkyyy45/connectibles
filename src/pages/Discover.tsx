import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, UserPlus, Sparkles, Shuffle, TrendingUp, Hand, Flag, Heart } from "lucide-react";
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
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      <Card className="border-2 border-purple-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-transparent to-blue-50/30 pointer-events-none" />
        <CardHeader className="relative">
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
              <CardTitle className="text-xl font-bold text-slate-900">{match.user.name || "Anonymous"}</CardTitle>
              <CardDescription className="text-sm text-slate-600 font-medium mt-1">
                {match.score !== undefined && (
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                    {match.score}% match
                  </span>
                )}
                {match.mutualConnectionsCount > 0 && (
                  <span className="ml-2 text-purple-600">• {match.mutualConnectionsCount} mutual</span>
                )}
              </CardDescription>
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
          {match.sharedInterests && match.sharedInterests.length > 0 && (
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
          {match.sharedSkills && match.sharedSkills.length > 0 && (
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
          {match.user.interests && match.user.interests.length > 0 && !match.sharedInterests && (
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
            onClick={() => handleConnect(match.user._id)}
          >
            <UserPlus className="h-5 w-5" />
            Connect
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <DashboardLayout>
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-md overflow-hidden border-2 border-primary/20 mx-4">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent pointer-events-none" />
          <DialogHeader className="relative">
            <div className="flex flex-col items-center gap-4 py-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Avatar className="h-24 w-24 border-4 border-primary/30 shadow-2xl ring-4 ring-primary/10">
                  <AvatarImage src={selectedUser?.image} alt={selectedUser?.name} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-purple-600 text-white font-bold">
                    {selectedUser?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {selectedUser?.name}
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                Connect with <span className="font-semibold text-primary">{selectedUser?.name}</span>
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2 mb-4 relative">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => selectedUser && handleWave(selectedUser.id)}
                className="w-full gap-3 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                size="lg"
              >
                <Hand className="h-6 w-6" />
                Send a Wave
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => setShowReportDialog(true)}
                variant="outline"
                className="w-full gap-3 h-12 text-base font-medium border-2 hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-all"
                size="lg"
              >
                <Flag className="h-5 w-5" />
                Report User
              </Button>
            </motion.div>
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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 md:space-y-5 px-2"
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <motion.div 
                className="p-3 md:p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-purple-200/50 shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Sparkles className="h-7 w-7 md:h-9 md:w-9 text-purple-600" />
              </motion.div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 bg-clip-text text-transparent">
                Discover Matches
              </h1>
            </div>
            <p className="text-slate-600 text-base sm:text-lg md:text-xl font-medium px-4 md:px-0 max-w-2xl mx-auto">
              Connect with people who share your interests ✨
            </p>
            {profileCompletion !== undefined && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Badge 
                  variant={profileCompletion === 100 ? "default" : "secondary"} 
                  className="text-sm px-5 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-2 border-purple-200/50 shadow-md font-semibold"
                >
                  Profile {profileCompletion}% Complete
                </Badge>
              </motion.div>
            )}
          </motion.div>

          {needsProfile ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-2 border-purple-200/60 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden mx-2 md:mx-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-blue-50/50 pointer-events-none" />
                <CardHeader className="text-center space-y-4 pb-6 px-4 md:px-6 relative">
                  <motion.div 
                    className="flex justify-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-purple-200/50 shadow-lg">
                      <UserPlus className="h-12 w-12 md:h-14 md:w-14 text-purple-600" />
                    </div>
                  </motion.div>
                  <CardTitle className="text-2xl md:text-3xl font-bold text-slate-900">Complete Your Profile First</CardTitle>
                  <CardDescription className="text-base md:text-lg text-slate-600 max-w-md mx-auto">
                    Add your interests to start discovering amazing matches
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-8 md:pb-10 px-4 md:px-6 relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto"
                  >
                    <Button 
                      onClick={() => navigate("/profile")}
                      size="lg"
                      className="gap-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transition-all px-8 md:px-10 py-6 md:py-7 text-base md:text-lg font-semibold w-full sm:w-auto rounded-2xl"
                    >
                      <Sparkles className="h-5 w-5 md:h-6 md:w-6" />
                      Set Up Profile
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full px-2 md:px-0">
            <TabsList className="grid w-full grid-cols-3 bg-white/90 backdrop-blur-md border-2 border-purple-200/60 p-1.5 md:p-2 rounded-2xl shadow-lg">
              <TabsTrigger 
                value="matches" 
                className="gap-2 text-xs sm:text-sm md:text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl"
              >
                <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">Best Matches</span>
                <span className="sm:hidden">Matches</span>
              </TabsTrigger>
              <TabsTrigger 
                value="explore" 
                className="gap-2 text-xs sm:text-sm md:text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl"
              >
                <Shuffle className="h-4 w-4 md:h-5 md:w-5" />
                <span>Explore</span>
              </TabsTrigger>
              <TabsTrigger 
                value="reverse" 
                className="gap-2 text-xs sm:text-sm md:text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl"
              >
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">Interested in You</span>
                <span className="sm:hidden">For You</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="matches" className="mt-4 md:mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-2 md:px-0">
                {matches?.map((match, index) => renderMatchCard(match, index))}
              </div>
              {matches?.length === 0 && (
                <Card className="border-2 border-purple-200/50 shadow-xl bg-white/95 backdrop-blur-sm rounded-3xl">
                  <CardHeader className="text-center py-16">
                    <div className="flex justify-center mb-4">
                      <div className="p-6 rounded-full bg-purple-100/50">
                        <Sparkles className="h-16 w-16 text-purple-400" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900 mb-2">No Matches Yet</CardTitle>
                    <CardDescription className="text-base text-slate-600">
                      We couldn't find anyone with shared interests yet. Try the Explore tab!
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="explore" className="mt-4 md:mt-6">
              <div className="mb-4 md:mb-6 p-3 md:p-4 bg-blue-50/50 rounded-2xl border border-blue-200/40 mx-2 md:mx-0">
                <p className="text-xs sm:text-sm text-slate-700 font-medium text-center">
                  🎲 Discover random users outside your typical matches. Refresh the page for new suggestions!
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-2 md:px-0">
                {exploreMatches?.map((match, index) => renderMatchCard(match, index))}
              </div>
              {exploreMatches?.length === 0 && (
                <Card className="border-2 border-purple-200/50 shadow-xl bg-white/95 backdrop-blur-sm rounded-3xl">
                  <CardHeader className="text-center py-16">
                    <div className="flex justify-center mb-4">
                      <div className="p-6 rounded-full bg-blue-100/50">
                        <Shuffle className="h-16 w-16 text-blue-400" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900 mb-2">No Users to Explore</CardTitle>
                    <CardDescription className="text-base text-slate-600">
                      Check back later for more users to discover!
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reverse" className="mt-4 md:mt-6">
              <div className="mb-4 md:mb-6 p-3 md:p-4 bg-purple-50/50 rounded-2xl border border-purple-200/40 mx-2 md:mx-0">
                <p className="text-xs sm:text-sm text-slate-700 font-medium text-center">
                  💫 These users share interests with you and might be interested in connecting!
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-2 md:px-0">
                {reverseMatches?.map((match, index) => renderMatchCard(match, index))}
              </div>
              {reverseMatches?.length === 0 && (
                <Card className="border-2 border-purple-200/50 shadow-xl bg-white/95 backdrop-blur-sm rounded-3xl">
                  <CardHeader className="text-center py-16">
                    <div className="flex justify-center mb-4">
                      <div className="p-6 rounded-full bg-purple-100/50">
                        <TrendingUp className="h-16 w-16 text-purple-400" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900 mb-2">No Reverse Matches Yet</CardTitle>
                    <CardDescription className="text-base text-slate-600">
                      No one seems to match with your profile yet. Keep your profile updated!
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
        </div>
      </div>
    </DashboardLayout>
  );
}