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
      <div className="bg-gradient-to-br from-background via-muted/20 to-primary/5 min-h-[calc(100vh-180px)]">
        <div className="max-w-5xl mx-auto p-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3"
          >
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="p-3 rounded-2xl bg-primary/10 backdrop-blur-sm">
                <MessageSquare className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Community Chat
              </h1>
            </div>
            <p className="text-muted-foreground text-base font-medium">
              Connect with everyone in real-time
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-2xl border-2 border-border/50 bg-card/95 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <ScrollArea className="h-[550px] px-8 pt-8" ref={scrollRef}>
                  <div className="space-y-5">
                    {messages?.map((msg, index) => {
                      const isOwner = msg.senderId === user._id;
                      
                      return (
                        <motion.div
                          key={msg._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.01 }}
                          className={`flex gap-4 ${isOwner ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <Avatar className="h-11 w-11 flex-shrink-0 ring-2 ring-border/30">
                            <AvatarImage src={msg.sender?.image} alt={msg.sender?.name || "User"} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-foreground font-semibold text-base">
                              {msg.sender?.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`flex flex-col ${isOwner ? "items-end" : "items-start"} max-w-[72%] group`}>
                            <div className="flex items-center gap-2 mb-2">
                              <p className={`text-sm font-bold text-foreground/90 ${isOwner ? "order-2" : "order-1"}`}>
                                {isOwner ? "You" : msg.sender?.name || "Anonymous"}
                              </p>
                              {isOwner && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/10 order-1"
                                  onClick={() => handleDelete(msg._id)}
                                >
                                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                                </Button>
                              )}
                            </div>
                            <div
                              className={`rounded-2xl px-5 py-3.5 shadow-sm ${
                                isOwner
                                  ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground"
                                  : "bg-muted/90 backdrop-blur-sm border border-border/50"
                              }`}
                            >
                              <p className="text-[15px] leading-relaxed break-words">{msg.message}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    {messages?.length === 0 && (
                      <div className="text-center py-24 text-muted-foreground">
                        <div className="p-6 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                          <MessageSquare className="h-16 w-16 opacity-30" />
                        </div>
                        <p className="text-lg font-semibold mb-1">No messages yet</p>
                        <p className="text-sm">Be the first to start the conversation</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="flex gap-4 p-6 border-t-2 border-border/50 bg-gradient-to-r from-background/80 to-muted/30 backdrop-blur-sm">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 h-12 rounded-xl px-5 border-2 border-border/50 focus:border-primary/60 bg-background/80 text-[15px] shadow-sm transition-all"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sending || !message.trim()}
                    size="icon"
                    className="h-12 w-12 rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    {sending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
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