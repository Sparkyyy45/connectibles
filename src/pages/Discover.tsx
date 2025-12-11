import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Shuffle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import type { Id } from "@/convex/_generated/dataModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MatchCard } from "@/components/discover/MatchCard";
import { UserActionDialog } from "@/components/discover/UserActionDialog";
import { ProfileSetupCard } from "@/components/discover/ProfileSetupCard";
import { EmptyStateCard } from "@/components/discover/EmptyStateCard";

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

  return (
    <DashboardLayout>
      <UserActionDialog
        selectedUser={selectedUser}
        onClose={() => setSelectedUser(null)}
        onWave={handleWave}
        onReport={() => setShowReportDialog(true)}
      />

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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3 md:space-y-5 px-3"
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4">
              <motion.div 
                className="p-2.5 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-purple-200/50 shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Sparkles className="h-6 w-6 md:h-9 md:w-9 text-purple-600" />
              </motion.div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 bg-clip-text text-transparent">
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
            <ProfileSetupCard onSetupProfile={() => navigate("/profile")} />
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full px-2 md:px-0">
              <TabsList className="grid w-full grid-cols-3 gap-1.5 md:gap-2 bg-white/90 backdrop-blur-md border-2 border-purple-200/60 p-1.5 md:p-2 rounded-xl md:rounded-2xl shadow-lg h-auto">
                <TabsTrigger 
                  value="matches" 
                  className="flex items-center justify-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-2 md:py-2.5 text-xs md:text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg md:rounded-xl min-h-[40px] md:min-h-[44px] touch-manipulation"
                >
                  <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="hidden sm:inline leading-tight">Best Matches</span>
                  <span className="sm:hidden leading-tight">Matches</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="explore" 
                  className="flex items-center justify-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-2 md:py-2.5 text-xs md:text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg md:rounded-xl min-h-[40px] md:min-h-[44px] touch-manipulation"
                >
                  <Shuffle className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="leading-tight">Explore</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="reverse" 
                  className="flex items-center justify-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-2 md:py-2.5 text-xs md:text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg md:rounded-xl min-h-[40px] md:min-h-[44px] touch-manipulation"
                >
                  <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="hidden sm:inline leading-tight">Interested in You</span>
                  <span className="sm:hidden leading-tight">For You</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="matches" className="mt-3 md:mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {matches?.map((match, index) => (
                    <MatchCard
                      key={match.user._id}
                      match={match}
                      index={index}
                      onConnect={handleConnect}
                      onAvatarClick={setSelectedUser}
                    />
                  ))}
                </div>
                {matches?.length === 0 && (
                  <EmptyStateCard
                    icon={Sparkles}
                    title="No Matches Yet"
                    description="We couldn't find anyone with shared interests yet. Try the Explore tab!"
                  />
                )}
              </TabsContent>

              <TabsContent value="explore" className="mt-3 md:mt-6">
                <div className="mb-3 md:mb-6 p-2.5 md:p-4 bg-blue-50/50 rounded-xl md:rounded-2xl border border-blue-200/40">
                  <p className="text-xs sm:text-sm text-slate-700 font-medium text-center">
                    🎲 Discover random users outside your typical matches. Refresh the page for new suggestions!
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {exploreMatches?.map((match, index) => (
                    <MatchCard
                      key={match.user._id}
                      match={match}
                      index={index}
                      onConnect={handleConnect}
                      onAvatarClick={setSelectedUser}
                    />
                  ))}
                </div>
                {exploreMatches?.length === 0 && (
                  <EmptyStateCard
                    icon={Shuffle}
                    title="No Users to Explore"
                    description="Check back later for more users to discover!"
                  />
                )}
              </TabsContent>

              <TabsContent value="reverse" className="mt-3 md:mt-6">
                <div className="mb-3 md:mb-6 p-2.5 md:p-4 bg-purple-50/50 rounded-xl md:rounded-2xl border border-purple-200/40">
                  <p className="text-xs sm:text-sm text-slate-700 font-medium text-center">
                    💫 These users share interests with you and might be interested in connecting!
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {reverseMatches?.map((match, index) => (
                    <MatchCard
                      key={match.user._id}
                      match={match}
                      index={index}
                      onConnect={handleConnect}
                      onAvatarClick={setSelectedUser}
                    />
                  ))}
                </div>
                {reverseMatches?.length === 0 && (
                  <EmptyStateCard
                    icon={TrendingUp}
                    title="No Reverse Matches Yet"
                    description="No one seems to match with your profile yet. Keep your profile updated!"
                  />
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}