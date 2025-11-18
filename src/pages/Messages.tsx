import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, UserCheck, MessageCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { ConnectionsList } from "@/components/messages/ConnectionsList";
import { ChatArea } from "@/components/messages/ChatArea";
import type { Id } from "@/convex/_generated/dataModel";

export default function Messages() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const connections = useQuery(api.connections.getConnections);
  const connectionRequests = useQuery(api.connections.getConnectionRequests);
  const acceptRequest = useMutation(api.connections.acceptConnectionRequest);
  const sendMessage = useMutation(api.messages.sendMessage);

  const [selectedConnection, setSelectedConnection] = useState<Id<"users"> | null>(null);
  const [sending, setSending] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [userToBlock, setUserToBlock] = useState<Id<"users"> | null>(null);

  const blockUser = useMutation(api.messages.blockUser);
  const unblockUser = useMutation(api.messages.unblockUser);
  const isBlocked = useQuery(
    api.messages.isUserBlocked,
    selectedConnection ? { userId: selectedConnection } : "skip"
  );

  const conversation = useQuery(
    api.messages.getConversation,
    selectedConnection ? { otherUserId: selectedConnection } : "skip"
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleAcceptRequest = async (requestId: Id<"connection_requests">) => {
    try {
      await acceptRequest({ requestId });
      toast.success("Connection request accepted!");
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      
      if (errorMessage.includes("ALREADY_ACCEPTED")) {
        toast.error("This request has already been accepted");
      } else if (errorMessage.includes("REQUEST_NOT_FOUND")) {
        toast.error("This connection request no longer exists");
      } else if (errorMessage.includes("UNAUTHORIZED")) {
        toast.error("You can only accept requests sent to you");
      } else if (errorMessage.includes("AUTH_REQUIRED")) {
        toast.error("Please sign in to accept requests");
      } else {
        toast.error("Failed to accept connection request");
      }
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedConnection) return;

    setSending(true);
    try {
      await sendMessage({
        receiverId: selectedConnection,
        message,
      });
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes("BLOCKED")) {
        toast.error("You cannot send messages to this user");
      } else if (errorMessage.includes("too long")) {
        toast.error(errorMessage);
      } else {
        toast.error("Failed to send message");
      }
    } finally {
      setSending(false);
    }
  };

  const handleBlockUser = async () => {
    if (!userToBlock) return;

    try {
      await blockUser({ userId: userToBlock });
      toast.success("User blocked successfully");
      setSelectedConnection(null);
      setShowBlockDialog(false);
      setUserToBlock(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to block user");
    }
  };

  const handleUnblockUser = async () => {
    if (!selectedConnection) return;

    try {
      await unblockUser({ userId: selectedConnection });
      toast.success("User unblocked successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to unblock user");
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const selectedUser = connections?.find((c) => c?._id === selectedConnection) || undefined;

  return (
    <DashboardLayout>
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to block this user? They won't be able to message you, and you won't see their messages. You can unblock them later from the chat menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToBlock(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlockUser} className="bg-red-600 hover:bg-red-700">
              Block User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted/10 to-primary/5">
        {/* Header */}
        <div className="p-6 border-b border-border/50 bg-card/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Messages
              </h1>
            </div>
            <p className="text-muted-foreground ml-14">
              Chat with your connections in real-time
            </p>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Connection Requests */}
            {connectionRequests && connectionRequests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-2 border-primary/30 shadow-lg bg-gradient-to-br from-primary/5 to-purple-500/5">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-primary" />
                      Connection Requests
                    </CardTitle>
                    <CardDescription>People who want to connect with you</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {connectionRequests.map((request) => (
                      <motion.div
                        key={request._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarImage src={request.sender?.image} alt={request.sender?.name || "User"} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                              {request.sender?.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{request.sender?.name || "Anonymous"}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{request.sender?.bio || "No bio"}</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleAcceptRequest(request._id)}
                          className="gap-2 shadow-md hover:shadow-lg transition-all"
                        >
                          <UserCheck className="h-4 w-4" />
                          Accept
                        </Button>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Messages Interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="grid md:grid-cols-[320px_1fr] gap-4 md:gap-6 min-h-[600px] md:min-h-[700px]">
                <ConnectionsList
                  connections={connections}
                  selectedConnection={selectedConnection}
                  onSelectConnection={setSelectedConnection}
                />
                <ChatArea
                  selectedUser={selectedUser}
                  conversation={conversation}
                  currentUserId={user._id}
                  isBlocked={isBlocked}
                  onSendMessage={handleSendMessage}
                  onBlockUser={() => {
                    setUserToBlock(selectedConnection);
                    setShowBlockDialog(true);
                  }}
                  onUnblockUser={handleUnblockUser}
                  sending={sending}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}