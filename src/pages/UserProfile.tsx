import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ArrowLeft, MessageCircle, UserPlus, Hand, Flag } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import type { Id } from "@/convex/_generated/dataModel";

export default function UserProfile() {
  const { isLoading: authLoading, isAuthenticated, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  
  const profile = useQuery(api.profiles.getProfile, userId ? { userId: userId as Id<"users"> } : "skip");
  const connectionStatus = useQuery(api.connections.getConnectionStatus, userId ? { userId: userId as Id<"users"> } : "skip");
  const hasReported = useQuery(api.reports.hasReported, userId ? { reportedUserId: userId as Id<"users"> } : "skip");
  const sendWave = useMutation(api.connections.sendWave);
  const sendConnectionRequest = useMutation(api.connections.sendConnectionRequest);
  const reportUser = useMutation(api.reports.reportUser);
  
  const [actionLoading, setActionLoading] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (currentUser && userId && currentUser._id === userId) {
      navigate("/profile");
    }
  }, [currentUser, userId, navigate]);

  const handleWave = async () => {
    if (!userId) return;
    setActionLoading(true);
    try {
      await sendWave({ receiverId: userId as Id<"users"> });
      toast.success("Wave sent! 👋");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to send wave";
      if (errorMessage.includes("ALREADY_WAVED")) {
        toast.error("You've already waved to this user");
      } else if (errorMessage.includes("SELF_WAVE")) {
        toast.error("You cannot wave to yourself");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!userId) return;
    setActionLoading(true);
    try {
      await sendConnectionRequest({ receiverId: userId as Id<"users"> });
      toast.success("Connection request sent! 🤝");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to send connection request";
      if (errorMessage.includes("ALREADY_CONNECTED")) {
        toast.error("You're already connected with this user");
      } else if (errorMessage.includes("REQUEST_PENDING")) {
        toast.error("Connection request already sent");
      } else if (errorMessage.includes("SELF_CONNECT")) {
        toast.error("You cannot connect with yourself");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessage = () => {
    navigate("/messages");
  };

  const handleReport = async () => {
    if (!userId) return;
    setActionLoading(true);
    try {
      const result = await reportUser({ reportedUserId: userId as Id<"users"> });
      toast.success(`User reported. Total reports: ${result.reportCount}`);
      setShowReportDialog(false);
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to report user";
      if (errorMessage.includes("ALREADY_REPORTED")) {
        toast.error("You have already reported this user");
      } else if (errorMessage.includes("SELF_REPORT")) {
        toast.error("You cannot report yourself");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout>
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
            <AlertDialogAction onClick={handleReport} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Report"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-3xl mx-auto p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarImage src={profile.image} alt={profile.name || "User"} />
                  <AvatarFallback className="text-4xl">
                    {profile.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-3xl">{profile.name || "Anonymous User"}</CardTitle>
              {profile.bio && (
                <CardDescription className="text-base mt-2">{profile.bio}</CardDescription>
              )}
              
              <div className="flex gap-3 justify-center mt-6 flex-wrap">
                <Button 
                  onClick={handleWave} 
                  disabled={actionLoading || connectionStatus === "waved"} 
                  size="lg" 
                  variant="outline" 
                  className="gap-2"
                >
                  {actionLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Hand className="h-5 w-5" />
                      {connectionStatus === "waved" ? "Waved" : "Wave"}
                    </>
                  )}
                </Button>

                {connectionStatus === "connected" ? (
                  <Button onClick={handleMessage} size="lg" className="gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Send Message
                  </Button>
                ) : (
                  <Button onClick={handleConnect} disabled={actionLoading} size="lg" className="gap-2">
                    {actionLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="h-5 w-5" />
                        {connectionStatus === "pending" ? "Request Pending" : "Connect"}
                      </>
                    )}
                  </Button>
                )}

                <Button 
                  onClick={() => setShowReportDialog(true)} 
                  disabled={hasReported || actionLoading}
                  size="lg" 
                  variant="destructive" 
                  className="gap-2"
                >
                  <Flag className="h-5 w-5" />
                  {hasReported ? "Reported" : "Report"}
                </Button>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {profile.location && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{profile.location}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {profile.interests && profile.interests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {profile.skills && profile.skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {(profile.yearOfStudy || profile.department || profile.major) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.yearOfStudy && (
                  <div>
                    <span className="text-sm font-medium">Year of Study: </span>
                    <span className="text-muted-foreground">{profile.yearOfStudy}</span>
                  </div>
                )}
                {profile.department && (
                  <div>
                    <span className="text-sm font-medium">Department: </span>
                    <span className="text-muted-foreground">{profile.department}</span>
                  </div>
                )}
                {profile.major && (
                  <div>
                    <span className="text-sm font-medium">Major: </span>
                    <span className="text-muted-foreground">{profile.major}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {profile.lookingFor && profile.lookingFor.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Looking For</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.lookingFor.map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {profile.availability && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{profile.availability}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
