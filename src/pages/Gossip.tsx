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

const EMOJI_OPTIONS = ["❤️", "😂", "🔥", "👍", "🎉", "✨"];

export default function Gossip() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const messages = useQuery(api.gossip.getAllGossipMessages);
  const sendMessage = useMutation(api.gossip.sendGossipMessage);
  const addReaction = useMutation(api.gossip.addGossipReaction);
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

  const handleReaction = async (messageId: Id<"gossip_messages">, emoji: string) => {
    try {
      await addReaction({ messageId, emoji });
    } catch (error) {
      toast.error("Failed to add reaction");
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
      <div className="bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-5xl mx-auto p-6 space-y-6 min-h-[calc(100vh-180px)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight">Gossip</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Join the community conversation - everyone's welcome! 💬
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Community Chat</CardTitle>
                <CardDescription>
                  Chat with everyone in the community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-[500px] pr-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages?.map((msg, index) => {
                      const reactionCounts = (msg.reactions || []).reduce((acc, r) => {
                        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);

                      const userReactions = (msg.reactions || [])
                        .filter((r) => r.userId === user._id)
                        .map((r) => r.emoji);

                      return (
                        <motion.div
                          key={msg._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="group"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 border-2 border-primary/10">
                              <AvatarImage src={msg.sender?.image} alt={msg.sender?.name || "User"} />
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {msg.sender?.name?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">
                                  {msg.sender?.name || "Anonymous"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(msg._creationTime).toLocaleTimeString()}
                                </p>
                                {msg.senderId === user._id && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDelete(msg._id)}
                                  >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  </Button>
                                )}
                              </div>
                              <div className="bg-muted rounded-lg p-3">
                                <p className="text-sm leading-relaxed">{msg.message}</p>
                              </div>
                              <div className="flex items-center gap-1 flex-wrap">
                                {EMOJI_OPTIONS.map((emoji) => (
                                  <Button
                                    key={emoji}
                                    variant={
                                      userReactions.includes(emoji) ? "default" : "ghost"
                                    }
                                    size="sm"
                                    onClick={() => handleReaction(msg._id, emoji)}
                                    className="h-7 px-2 gap-1"
                                  >
                                    <span className="text-sm">{emoji}</span>
                                    {reactionCounts[emoji] && (
                                      <span className="text-xs font-medium">
                                        {reactionCounts[emoji]}
                                      </span>
                                    )}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    {messages?.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="flex gap-2 pt-4 border-t">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sending || !message.trim()}
                    size="icon"
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
