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
            <div className="flex items-center justify-center gap-3 mb-3">
              <MessageSquare className="h-10 w-10 text-primary" />
              <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Gossip
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Join the community conversation 💬
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-xl border-0 bg-card/50 backdrop-blur">
              <CardContent className="p-6">
                <ScrollArea className="h-[500px] pr-4" ref={scrollRef}>
                  <div className="space-y-3">
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
                          <Avatar className="h-9 w-9 border-2 border-primary/20 flex-shrink-0">
                            <AvatarImage src={msg.sender?.image} alt={msg.sender?.name || "User"} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                              {msg.sender?.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`flex flex-col ${isOwner ? "items-end" : "items-start"} max-w-[70%] group`}>
                            <div className="flex items-center gap-2 mb-1">
                              <p className={`text-xs font-medium text-muted-foreground ${isOwner ? "order-2" : "order-1"}`}>
                                {isOwner ? "You" : msg.sender?.name || "Anonymous"}
                              </p>
                              {isOwner && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity order-1"
                                  onClick={() => handleDelete(msg._id)}
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              )}
                            </div>
                            <div
                              className={`rounded-2xl px-4 py-2.5 ${
                                isOwner
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    {messages?.length === 0 && (
                      <div className="text-center py-16 text-muted-foreground">
                        <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">No messages yet</p>
                        <p className="text-sm">Start the conversation!</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="flex gap-3 pt-6 mt-6 border-t">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 h-12 rounded-full px-5 border-2 focus:border-primary"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sending || !message.trim()}
                    size="icon"
                    className="h-12 w-12 rounded-full shadow-lg"
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