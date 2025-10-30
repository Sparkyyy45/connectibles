import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Sparkles, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import type { Id } from "@/convex/_generated/dataModel";

const STICKY_COLORS = [
  "bg-gradient-to-br from-yellow-200 to-yellow-300",
  "bg-gradient-to-br from-pink-200 to-pink-300",
  "bg-gradient-to-br from-blue-200 to-blue-300",
  "bg-gradient-to-br from-green-200 to-green-300",
  "bg-gradient-to-br from-purple-200 to-purple-300",
  "bg-gradient-to-br from-orange-200 to-orange-300",
];

export default function Chill() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const spills = useQuery(api.chill.getAllSpills);
  const createSpill = useMutation(api.chill.createSpill);
  const deleteSpill = useMutation(api.chill.deleteSpill);
  const addReaction = useMutation(api.chill.addReaction);

  const [content, setContent] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleCreateSpill = async () => {
    if (!content.trim()) {
      toast.error("Can't post an empty spill!");
      return;
    }

    if (content.length > 1200) {
      toast.error("Spill is too long! Max 1200 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createSpill({ content });
      toast.success("Spill posted! ✨");
      setContent("");
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to post spill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSpill = async (postId: Id<"chill_posts">) => {
    try {
      await deleteSpill({ postId });
      toast.success("Spill deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete spill");
    }
  };

  const handleReaction = async (postId: Id<"chill_posts">, emoji: string) => {
    try {
      await addReaction({ postId, emoji });
    } catch (error: any) {
      toast.error("Failed to add reaction");
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-pink-50/30 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                <Sparkles className="h-10 w-10 text-primary" />
                Spillz
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                spill your thoughts, vibes, and feels ✨
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
                  <Plus className="h-5 w-5" />
                  spill smtg
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-2xl">what's on your mind?</DialogTitle>
                  <DialogDescription>
                    share your thoughts in up to 1200 characters
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="spill it all here..."
                    className="min-h-[200px] text-base resize-none"
                    maxLength={1200}
                  />
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${content.length > 1100 ? "text-destructive" : "text-muted-foreground"}`}>
                      {content.length} / 1200
                    </span>
                    <Button
                      onClick={handleCreateSpill}
                      disabled={isSubmitting || !content.trim()}
                      size="lg"
                      className="gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          post spill
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Spills Grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            <AnimatePresence>
              {spills?.map((spill, index) => {
                const colorClass = STICKY_COLORS[index % STICKY_COLORS.length];
                const isOwner = spill.authorId === user._id;
                
                return (
                  <motion.div
                    key={spill._id}
                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                    animate={{ opacity: 1, scale: 1, rotate: Math.random() * 4 - 2 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                    className="break-inside-avoid"
                  >
                    <Card className={`${colorClass} border-none shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
                      <CardContent className="p-6 space-y-4">
                        {/* Delete Button (only for owner) */}
                        {isOwner && (
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteSpill(spill._id)}
                              className="h-8 w-8 p-0 hover:bg-white/50"
                            >
                              <Trash2 className="h-4 w-4 text-gray-700" />
                            </Button>
                          </div>
                        )}

                        {/* Content */}
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap break-words font-handwriting text-base">
                          {spill.content}
                        </p>

                        {/* Reactions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-400/30">
                          {["❤️", "😂", "🔥", "👏"].map((emoji) => {
                            const reactionCount = spill.reactions?.filter(r => r.emoji === emoji).length || 0;
                            const hasReacted = spill.reactions?.some(r => r.emoji === emoji && r.userId === user._id);
                            
                            return (
                              <Button
                                key={emoji}
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReaction(spill._id, emoji)}
                                className={`h-8 px-2 hover:bg-white/50 ${hasReacted ? "bg-white/50" : ""}`}
                              >
                                <span className="text-lg">{emoji}</span>
                                {reactionCount > 0 && (
                                  <span className="ml-1 text-xs font-semibold text-gray-700">
                                    {reactionCount}
                                  </span>
                                )}
                              </Button>
                            );
                          })}
                        </div>

                        {/* Timestamp */}
                        <p className="text-xs text-gray-600 text-right">
                          {new Date(spill._creationTime).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {spills?.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold mb-2">no spillz yet</h3>
              <p className="text-muted-foreground mb-6">be the first to share your thoughts!</p>
              <Button onClick={() => setIsDialogOpen(true)} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                create first spill
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}