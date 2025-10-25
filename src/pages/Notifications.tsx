import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Bell, Check, Trash2, UserPlus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import type { Id } from "@/convex/_generated/dataModel";

export default function Notifications() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const notifications = useQuery(api.notifications.getNotifications);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);
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

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const unreadNotifications = notifications?.filter((n) => !n.read) || [];
  const readNotifications = notifications?.filter((n) => n.read) || [];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Bell className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight">Notifications</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Stay updated with new connections and activity
            </p>
          </div>
          {unreadNotifications.length > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline" size="lg">
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </motion.div>

        {unreadNotifications.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              New Notifications
              <Badge variant="default" className="ml-2">{unreadNotifications.length}</Badge>
            </h2>
            {unreadNotifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-primary/50 bg-primary/5 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {notification.relatedUser && (
                        <Avatar className="h-12 w-12 border-2 border-primary">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {notification.relatedUser.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1 space-y-3">
                        <p className="text-foreground leading-relaxed">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification._creationTime).toLocaleString()}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {notification.relatedUserId && (
                            <Button
                              size="sm"
                              onClick={() => handleConnect(notification.relatedUserId!, notification._id)}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Connect
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsRead(notification._id)}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Mark Read
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(notification._id)}
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
        )}

        {readNotifications.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-muted-foreground">Earlier</h2>
            {readNotifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-all opacity-75">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {notification.relatedUser && (
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {notification.relatedUser.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1 space-y-2">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification._creationTime).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(notification._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {notifications?.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-dashed border-2">
              <CardHeader className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bell className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl mb-2">No Notifications Yet</CardTitle>
                <CardDescription className="text-base">
                  You'll be notified when someone with shared interests joins!
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
