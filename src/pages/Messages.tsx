import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, UserCheck, MessageCircle, Ban, ShieldOff, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import type { Id } from "@/convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Messages() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const connections = useQuery(api.connections.getConnections);
  const connectionRequests = useQuery(api.connections.getConnectionRequests);
  const acceptRequest = useMutation(api.connections.acceptConnectionRequest);
  const sendMessage = useMutation(api.messages.sendMessage);
  const blockUser = useMutation(api.messages.blockUser);
  const unblockUser = useMutation(api.messages.unblockUser);

  const [selectedConnection, setSelectedConnection] = useState<Id<"users"> | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [userToBlock, setUserToBlock] = useState<Id<"users"> | null>(null);

  const conversation = useQuery(
    api.messages.getConversation,
    selectedConnection ? { otherUserId: selectedConnection } : "skip"
  );

  const isBlocked = useQuery(
    api.messages.isUserBlocked,
    selectedConnection ? { userId: selectedConnection } : "skip"
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

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConnection) return;

    setSending(true);
    try {
      await sendMessage({
        receiverId: selectedConnection,
        message: message.trim(),
      });
      setMessage("");
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes("BLOCKED_USER")) {
        toast.error("You have blocked this user");
      } else if (errorMessage.includes("BLOCKED_BY_USER")) {
        toast.error("This user has blocked you");
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
      setShowBlockDialog(false);
      setUserToBlock(null);
      setSelectedConnection(null);
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes("ALREADY_BLOCKED")) {
        toast.error("User is already blocked");
      } else if (errorMessage.includes("SELF_BLOCK")) {
        toast.error("You cannot block yourself");
      } else {
        toast.error("Failed to block user");
      }
    }
  };

  const handleUnblockUser = async (userId: Id<"users">) => {
    try {
      await unblockUser({ userId });
      toast.success("User unblocked successfully");
    } catch (error: any) {
      toast.error("Failed to unblock user");
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const selectedUser = connections?.find((c) => c?._id === selectedConnection);

  return (
    <DashboardLayout>
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent className="border-2 border-destructive/30 bg-gradient-to-br from-background via-background to-destructive/5 shadow-2xl">
          <AlertDialogHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-br from-destructive/20 to-orange-500/20">
                <Ban className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-2xl font-bold">Block User</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base leading-relaxed">
              Are you sure you want to block this user? They won't be able to message you, and you won't see their messages. You can unblock them later from the chat menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel 
              onClick={() => setUserToBlock(null)}
              className="shadow-sm hover:shadow-md transition-all"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBlockUser}
              className="bg-gradient-to-r from-destructive to-orange-600 hover:from-destructive/90 hover:to-orange-600/90 shadow-md hover:shadow-lg transition-all"
            >
              <Ban className="h-4 w-4 mr-2" />
              Block User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="h-screen flex flex-col bg-gradient-to-br from-background via-muted/10 to-primary/5 overflow-hidden">
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
        <div className="flex-1 overflow-hidden">
          <div className="max-w-7xl mx-auto h-full p-6 space-y-6">
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
              className="h-[calc(100vh-280px)] md:h-[calc(100vh-280px)] overflow-hidden"
            >
              <div className="grid md:grid-cols-[340px_1fr] gap-4 md:gap-6 h-full flex-col md:flex-row">
                {/* Connections List */}
                <Card className="shadow-xl border border-border/30 bg-white/98 backdrop-blur-md flex flex-col h-[200px] md:h-auto rounded-2xl">
                  <CardHeader className="pb-4 border-b border-border/30 bg-gradient-to-br from-primary/5 to-purple-500/5">
                    <CardTitle className="text-lg font-semibold">Connections</CardTitle>
                    <CardDescription className="text-xs font-medium">
                      {connections?.length || 0} active connection{connections?.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <ScrollArea className="flex-1">
                    {connections && connections.length > 0 ? (
                      <div className="p-2">
                        {connections.map((connection) => (
                          <motion.div
                            key={connection?._id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={`p-3 mb-1.5 rounded-xl cursor-pointer transition-all ${
                              selectedConnection === connection?._id
                                ? "bg-gradient-to-r from-primary via-primary to-purple-600 text-primary-foreground shadow-lg border border-primary/20"
                                : "hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30 border border-transparent"
                            }`}
                            onClick={() => setSelectedConnection(connection?._id || null)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-11 w-11 border-2 border-white/20">
                                <AvatarImage src={connection?.image} alt={connection?.name || "User"} />
                                <AvatarFallback className={selectedConnection === connection?._id ? "bg-white/20" : ""}>
                                  {connection?.name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{connection?.name || "Anonymous"}</p>
                                <p className={`text-xs truncate ${selectedConnection === connection?._id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                  {connection?.bio || "No bio"}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
                        <p className="text-sm text-muted-foreground mb-4">No connections yet</p>
                        <Button onClick={() => navigate("/discover")} size="sm">
                          Discover People
                        </Button>
                      </div>
                    )}
                  </ScrollArea>
                </Card>

                {/* Chat Area */}
                <Card className="shadow-xl border border-border/30 bg-white/98 backdrop-blur-md flex flex-col min-h-0 rounded-2xl">
                  {selectedConnection ? (
                    <>
                      <CardHeader className="pb-4 border-b border-border/30 bg-gradient-to-br from-primary/5 to-purple-500/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border-2 border-primary/30 shadow-sm">
                              <AvatarImage src={selectedUser?.image} alt={selectedUser?.name || "User"} />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                                {selectedUser?.name?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-xl">{selectedUser?.name || "Anonymous"}</CardTitle>
                              <CardDescription className="text-xs">{selectedUser?.location || "Unknown location"}</CardDescription>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-muted/50 rounded-lg">
                                <MoreVertical className="h-5 w-5 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl border border-border/50 shadow-lg">
                              {isBlocked ? (
                                <DropdownMenuItem 
                                  onClick={() => handleUnblockUser(selectedConnection)}
                                  className="gap-2 py-2.5 cursor-pointer rounded-lg"
                                >
                                  <ShieldOff className="h-4 w-4" />
                                  <span className="font-medium">Unblock User</span>
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setUserToBlock(selectedConnection);
                                    setShowBlockDialog(true);
                                  }}
                                  className="gap-2 py-2.5 cursor-pointer text-destructive focus:text-destructive rounded-lg"
                                >
                                  <Ban className="h-4 w-4" />
                                  <span className="font-medium">Block User</span>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                        {isBlocked ? (
                          <div className="flex-1 flex items-center justify-center p-6">
                            <div className="text-center">
                              <Ban className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                              <p className="text-lg font-medium text-muted-foreground mb-2">User Blocked</p>
                              <p className="text-sm text-muted-foreground/70 mb-4">You have blocked this user</p>
                              <Button onClick={() => handleUnblockUser(selectedConnection)} variant="outline">
                                <ShieldOff className="h-4 w-4 mr-2" />
                                Unblock User
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <ScrollArea className="flex-1 p-4 md:p-6">
                              <div className="space-y-4">
                                {conversation && conversation.length > 0 ? (
                                  conversation.map((msg) => (
                                    <motion.div
                                      key={msg._id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className={`flex ${
                                        msg.senderId === user._id ? "justify-end" : "justify-start"
                                      }`}
                                    >
                                      <div
                                        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                                          msg.senderId === user._id
                                            ? "bg-gradient-to-br from-primary to-purple-600 text-primary-foreground"
                                            : "bg-muted"
                                        }`}
                                      >
                                        <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                                        <p className={`text-xs mt-1.5 ${msg.senderId === user._id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                          {new Date(msg._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                      </div>
                                    </motion.div>
                                  ))
                                ) : (
                                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                    <MessageCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
                                    <p className="text-muted-foreground">No messages yet</p>
                                    <p className="text-sm text-muted-foreground/70">Start the conversation!</p>
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                            <div className="p-4 md:p-5 border-t border-border/30 bg-gradient-to-br from-muted/20 to-muted/10 flex-shrink-0">
                              <div className="flex gap-2 md:gap-3">
                                <Input
                                  value={message}
                                  onChange={(e) => setMessage(e.target.value)}
                                  placeholder="Type your message..."
                                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                                  className="flex-1 bg-background border-border/40 focus:border-primary transition-all rounded-xl h-11 px-4"
                                />
                                <Button 
                                  onClick={handleSendMessage} 
                                  disabled={sending || !message.trim()}
                                  size="icon"
                                  className="h-11 w-11 shadow-lg hover:shadow-xl transition-all flex-shrink-0 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                                >
                                  {sending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Send className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </>
                  ) : (
                    <CardContent className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <MessageCircle className="h-20 w-20 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-lg font-medium text-muted-foreground mb-2">Select a connection</p>
                        <p className="text-sm text-muted-foreground/70">Choose someone from your connections to start chatting</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}