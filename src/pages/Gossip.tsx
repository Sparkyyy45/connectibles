import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import type { Id } from "@/convex/_generated/dataModel";

export default function Gossip() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const messages = useQuery(api.gossip.getAllGossipMessages);
  const sendMessage = useMutation(api.gossip.sendGossipMessage);
  const deleteMessage = useMutation(api.gossip.deleteGossipMessage);

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setSending(true);
    try {
      await sendMessage({ message: message.trim() });
      setMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId: Id<"gossip_messages">) => {
    try {
      await deleteMessage({ messageId });
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-br from-background via-background to-primary/5 min-h-[calc(100vh-180px)]">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <MessageSquare className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Community Chat
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Connect with everyone in real-time
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-lg border bg-card">
              <CardContent className="p-0">
                <ScrollArea className="h-[500px] px-6 pt-6" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages?.map((msg, index) => {
                      const isOwner = msg.senderId === user._id;
                      
                      return (
                        <motion.div
                          key={msg._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.01 }}
                          className={`flex gap-3 ${isOwner ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={msg.sender?.image} alt={msg.sender?.name || "User"} />
                            <AvatarFallback className="bg-muted text-foreground font-medium">
                              {msg.sender?.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`flex flex-col ${isOwner ? "items-end" : "items-start"} max-w-[70%] group`}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <p className={`text-xs font-semibold text-foreground ${isOwner ? "order-2" : "order-1"}`}>
                                {isOwner ? "You" : msg.sender?.name || "Anonymous"}
                              </p>
                              {isOwner && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity order-1"
                                  onClick={() => handleDelete(msg._id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                                </Button>
                              )}
                            </div>
                            <div
                              className={`rounded-2xl px-4 py-3 ${
                                isOwner
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted/80"
                              }`}
                            >
                              <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    {messages?.length === 0 && (
                      <div className="text-center py-20 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p className="text-base font-medium">No messages yet</p>
                        <p className="text-sm">Be the first to start the conversation</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="flex gap-3 p-6 border-t bg-background/50">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 h-11 rounded-lg px-4 border focus:border-primary"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sending || !message.trim()}
                    size="icon"
                    className="h-11 w-11 rounded-lg"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}