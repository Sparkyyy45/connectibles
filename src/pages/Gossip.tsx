// @ts-nocheck
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20 p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 border border-purple-200/50">
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 bg-clip-text text-transparent">
                Community Chat
              </h1>
            </div>
            <p className="text-slate-600 text-base md:text-lg font-medium">
              Connect with everyone in real-time 💬
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-xl border-2 border-purple-200/50 bg-white/95 backdrop-blur-sm overflow-hidden rounded-3xl">
              <CardContent className="p-0">
                <ScrollArea className="h-[550px] px-6 md:px-8 pt-6 md:pt-8" ref={scrollRef}>
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
                          <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-purple-300/60 shadow-md">
                            <AvatarImage src={msg.sender?.image} alt={msg.sender?.name || "User"} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-100 to-blue-100 text-slate-700 font-semibold text-base">
                              {msg.sender?.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                            <div className={`flex flex-col ${isOwner ? "items-end" : "items-start"} max-w-[75%] group`}>
                            <div className="flex items-center gap-2.5 mb-2.5">
                              <p className={`text-sm font-bold text-slate-800 ${isOwner ? "order-2" : "order-1"}`}>
                                {isOwner ? "You" : msg.sender?.name || "Anonymous"}
                              </p>
                              {isOwner && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:border-red-200 rounded-full order-1 shadow-sm"
                                  onClick={() => handleDelete(msg._id)}
                                >
                                  <Trash2 className="h-4 w-4 text-slate-600 hover:text-red-600 transition-colors" />
                                </Button>
                              )}
                            </div>
                            <div
                              className={`rounded-2xl px-6 py-4 shadow-lg transition-all duration-200 ${
                                isOwner
                                  ? "bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 text-white shadow-purple-500/30"
                                  : "bg-white border-2 border-purple-200/50 text-slate-800 hover:border-purple-300/60 hover:shadow-xl"
                              }`}
                            >
                              <p className="text-base leading-relaxed break-words font-medium">{msg.message}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    {messages?.length === 0 && (
                      <div className="text-center py-24 text-slate-600">
                        <div className="p-6 rounded-full bg-purple-100/50 w-fit mx-auto mb-4">
                          <MessageSquare className="h-16 w-16 text-purple-400" />
                        </div>
                        <p className="text-lg font-semibold mb-1 text-slate-900">No messages yet</p>
                        <p className="text-sm">Be the first to start the conversation 🚀</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="flex gap-3 p-5 md:p-6 border-t-2 border-purple-200/50 bg-gradient-to-r from-white/90 to-purple-50/30 backdrop-blur-sm">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    className="flex-1 h-12 rounded-xl px-5 border-2 border-purple-200/60 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white text-[15px] shadow-sm transition-all text-slate-900 placeholder:text-slate-400"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sending || !message.trim()}
                    size="icon"
                    className="h-12 w-12 rounded-xl shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
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