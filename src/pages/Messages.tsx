import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import type { Id } from "@/convex/_generated/dataModel";

export default function Messages() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const connections = useQuery(api.connections.getConnections);
  const connectionRequests = useQuery(api.connections.getConnectionRequests);
  const acceptRequest = useMutation(api.connections.acceptConnectionRequest);
  const sendMessage = useMutation(api.messages.sendMessage);

  const [selectedConnection, setSelectedConnection] = useState<Id<"users"> | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

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
    } catch (error) {
      toast.error("Failed to accept request");
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
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
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
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold tracking-tight mb-2">Messages</h1>
          <p className="text-muted-foreground">
            Chat with your connections
          </p>
        </motion.div>

        {/* Connection Requests */}
        {connectionRequests && connectionRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Connection Requests</CardTitle>
                <CardDescription>People who want to connect with you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {connectionRequests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {request.sender?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.sender?.name || "Anonymous"}</p>
                        <p className="text-sm text-muted-foreground">{request.sender?.bio}</p>
                      </div>
                    </div>
                    <Button onClick={() => handleAcceptRequest(request._id)}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                  </div>
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
          <div className="grid md:grid-cols-3 gap-6">
            {/* Connections List */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Connections</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {connections?.map((connection) => (
                    <div
                      key={connection?._id}
                      className={`p-4 cursor-pointer hover:bg-muted transition-colors border-b ${
                        selectedConnection === connection?._id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedConnection(connection?._id || null)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {connection?.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{connection?.name || "Anonymous"}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {connection?.bio || "No bio"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="md:col-span-2">
              {selectedConnection ? (
                <>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {selectedUser?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{selectedUser?.name || "Anonymous"}</CardTitle>
                        <CardDescription>{selectedUser?.location}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ScrollArea className="h-[350px] pr-4">
                      <div className="space-y-4">
                        {conversation?.map((msg) => (
                          <div
                            key={msg._id}
                            className={`flex ${
                              msg.senderId === user._id ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                msg.senderId === user._id
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{msg.message}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(msg._creationTime).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="flex gap-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage} disabled={sending || !message.trim()}>
                        {sending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="h-[500px] flex items-center justify-center">
                  <p className="text-muted-foreground">Select a connection to start chatting</p>
                </CardContent>
              )}
            </Card>
          </div>
        </motion.div>

        {connections?.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Connections Yet</CardTitle>
              <CardDescription>
                Start by discovering matches and sending connection requests!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/discover")}>
                Discover Matches
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
