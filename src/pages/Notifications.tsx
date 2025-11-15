import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Bell, Check, Trash2, UserPlus, Sparkles, Flag } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import type { Id } from "@/convex/_generated/dataModel";

export default function Notifications() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const notifications = useQuery(api.notifications.getNotifications);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);
  const deleteAllNotifications = useMutation(api.notifications.deleteAllNotifications);
  const sendRequest = useMutation(api.connections.sendConnectionRequest);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleMarkAsRead = async (notificationId: Id<"notifications">) => {
    try {
      await markAsRead({ notificationId });
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const count = await markAllAsRead();
      if (count > 0) {
        toast.success(`Marked ${count} notification${count > 1 ? "s" : ""} as read`);
      }
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (notificationId: Id<"notifications">) => {
    try {
      await deleteNotification({ notificationId });
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleConnect = async (userId: Id<"users">, notificationId: Id<"notifications">) => {
    try {
      await sendRequest({ receiverId: userId });
      await markAsRead({ notificationId });
      toast.success("Connection request sent!");
    } catch (error) {
      toast.error("Failed to send request");
    }
  };

  const handleClearAll = async () => {
    try {
      const count = await deleteAllNotifications();
      if (count > 0) {
        toast.success(`Cleared ${count} notification${count > 1 ? "s" : ""}`);
      }
    } catch (error) {
      toast.error("Failed to clear notifications");
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const unreadNotifications = notifications?.filter((n) => !n.read) || [];
  const readNotifications = notifications?.filter((n) => n.read) || [];

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-4xl mx-auto p-6 space-y-8 min-h-[calc(100vh-180px)]">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="h-8 w-8 text-primary" />
                  <motion.div
                    className="absolute inset-0 bg-primary/20 rounded-full blur-md"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  Notifications
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Stay updated with new connections and activity
              </p>
            </div>
            <div className="flex gap-2">
              {unreadNotifications.length > 0 && (
                <Button 
                  onClick={handleMarkAllAsRead} 
                  variant="outline" 
                  size="lg"
                  className="shadow-sm hover:shadow-md transition-all hover:border-primary"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
              {notifications && notifications.length > 0 && (
                <Button 
                  onClick={handleClearAll} 
                  variant="outline" 
                  size="lg"
                  className="shadow-sm hover:shadow-md transition-all hover:border-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </motion.div>

          {/* Unread Notifications Section */}
          <AnimatePresence mode="popLayout">
            {unreadNotifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">New Notifications</h2>
                  <Badge variant="default" className="ml-auto">
                    {unreadNotifications.length}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {unreadNotifications.map((notification, index) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                    >
                      <Card className={`border-primary/50 overflow-hidden group ${
                        notification.type === "report_warning" || notification.type === "account_banned"
                          ? "border-destructive bg-gradient-to-br from-destructive/10 to-destructive/5"
                          : "bg-gradient-to-br from-primary/5 to-transparent"
                      } hover:shadow-xl transition-all duration-300 hover:border-primary`}>
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                          notification.type === "report_warning" || notification.type === "account_banned"
                            ? "bg-gradient-to-r from-destructive/10 via-orange-500/10 to-transparent"
                            : "bg-gradient-to-r from-primary/10 via-purple-500/10 to-transparent"
                        }`} />
                        <CardContent className="p-6 relative">
                          <div className="flex items-start gap-4">
                            {notification.relatedUser && !(notification.type === "report_warning" || notification.type === "account_banned") && (
                              <Avatar className="h-12 w-12 border-2 border-primary shadow-lg">
                                <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-primary-foreground font-semibold text-lg">
                                  {notification.relatedUser.name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            {(notification.type === "report_warning" || notification.type === "account_banned") && (
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-destructive to-orange-500 flex items-center justify-center shadow-lg">
                                <Flag className="h-6 w-6 text-white" />
                              </div>
                            )}
                            <div className="flex-1 space-y-3">
                              <p className={`leading-relaxed font-medium ${
                                notification.type === "report_warning" || notification.type === "account_banned"
                                  ? "text-destructive"
                                  : "text-foreground"
                              }`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className={`inline-block w-1.5 h-1.5 rounded-full animate-pulse ${
                                  notification.type === "report_warning" || notification.type === "account_banned"
                                    ? "bg-destructive"
                                    : "bg-primary"
                                }`} />
                                {new Date(notification._creationTime).toLocaleString()}
                              </p>
                              <div className="flex flex-wrap gap-2 pt-2">
                                {notification.relatedUserId && notification.type !== "report_warning" && notification.type !== "account_banned" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleConnect(notification.relatedUserId!, notification._id)}
                                    className="shadow-sm hover:shadow-md transition-all"
                                  >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Connect
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMarkAsRead(notification._id)}
                                  className="hover:border-primary transition-colors"
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Mark Read
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(notification._id)}
                                  className="hover:text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Read Notifications Section */}
          {readNotifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold text-muted-foreground">Earlier</h2>
              <div className="space-y-3">
                {readNotifications.map((notification, index) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="hover:shadow-md transition-all opacity-60 hover:opacity-80 border-dashed">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          {notification.relatedUser && (
                            <Avatar className="h-10 w-10 opacity-75">
                              <AvatarFallback className="bg-muted text-muted-foreground">
                                {notification.relatedUser.name?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex-1 space-y-2">
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                              {new Date(notification._creationTime).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(notification._id)}
                            className="hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {notifications?.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-dashed border-2 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
                <CardHeader className="text-center py-16 relative">
                  <motion.div 
                    className="flex justify-center mb-6"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center backdrop-blur-sm">
                      <Bell className="h-10 w-10 text-primary" />
                    </div>
                  </motion.div>
                  <CardTitle className="text-3xl mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    No Notifications Yet
                  </CardTitle>
                  <CardDescription className="text-base max-w-md mx-auto">
                    You'll be notified when someone with shared interests joins or when you receive connection requests!
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}