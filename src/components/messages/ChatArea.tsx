import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader2, Send, MessageCircle, MoreVertical, Ban, ShieldOff } from "lucide-react";
import { motion } from "framer-motion";
import type { Id } from "@/convex/_generated/dataModel";

interface Message {
  _id: Id<"messages">;
  senderId: Id<"users">;
  message: string;
  _creationTime: number;
}

interface User {
  _id: Id<"users">;
  name?: string;
  image?: string;
  location?: string;
}

interface ChatAreaProps {
  selectedUser: User | undefined;
  conversation: Message[] | undefined;
  currentUserId: Id<"users">;
  isBlocked: boolean | undefined;
  onSendMessage: (message: string) => Promise<void>;
  onBlockUser: () => void;
  onUnblockUser: () => void;
  sending: boolean;
}

const MESSAGE_CHAR_LIMIT = 1000;

export function ChatArea({ 
  selectedUser, 
  conversation, 
  currentUserId, 
  isBlocked,
  onSendMessage, 
  onBlockUser,
  onUnblockUser,
  sending 
}: ChatAreaProps) {
  const [message, setMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  const handleSend = async () => {
    if (!message.trim()) return;
    await onSendMessage(message.trim());
    setMessage("");
  };

  if (!selectedUser) {
    return (
      <Card className="shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm flex flex-col h-[600px] md:h-[700px] overflow-hidden">
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="h-20 w-20 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">Select a connection</p>
            <p className="text-sm text-muted-foreground/70">Choose someone from your connections to start chatting</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm flex flex-col h-full overflow-hidden">
      <CardHeader className="pb-3 md:pb-4 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
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
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isBlocked ? (
                <DropdownMenuItem onClick={onUnblockUser} className="gap-2">
                  <ShieldOff className="h-4 w-4" />
                  Unblock User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={onBlockUser} className="gap-2 text-red-600">
                  <Ban className="h-4 w-4" />
                  Block User
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-3 md:p-6 scroll-smooth" ref={scrollAreaRef}>
          <div className="space-y-4">
            {conversation && conversation.length > 0 ? (
              <>
                {conversation.map((msg) => (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                        msg.senderId === currentUserId
                          ? "bg-gradient-to-br from-primary to-purple-600 text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                      <p className={`text-xs mt-1.5 ${msg.senderId === currentUserId ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {new Date(msg._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <MessageCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-sm text-muted-foreground/70">Start the conversation!</p>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-3 md:p-4 border-t border-border/50 bg-muted/20 flex-shrink-0 sticky bottom-0">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                className="w-full bg-background border-border/50 focus:border-primary transition-all text-base md:text-sm min-h-[44px] rounded-xl px-4 py-3 pr-16"
                maxLength={MESSAGE_CHAR_LIMIT}
              />
              {message.length > 0 && (
                <div className={`absolute bottom-3 right-3 text-xs font-medium pointer-events-none ${
                  message.length > MESSAGE_CHAR_LIMIT * 0.9 ? "text-destructive" : "text-muted-foreground"
                }`}>
                  {message.length}/{MESSAGE_CHAR_LIMIT}
                </div>
              )}
            </div>
            <Button 
              onClick={handleSend} 
              disabled={sending || !message.trim()}
              size="icon"
              className="h-11 w-11 md:h-10 md:w-10 shadow-md hover:shadow-lg transition-all flex-shrink-0 rounded-xl"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
              ) : (
                <Send className="h-4 w-4 md:h-5 md:w-5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}