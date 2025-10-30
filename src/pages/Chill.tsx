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
import { Loader2, Sparkles, Trash2, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import type { Id } from "@/convex/_generated/dataModel";

const DIARY_COLORS = [
  "bg-gradient-to-br from-amber-50 to-yellow-100",
  "bg-gradient-to-br from-rose-50 to-pink-100",
  "bg-gradient-to-br from-sky-50 to-blue-100",
  "bg-gradient-to-br from-emerald-50 to-green-100",
  "bg-gradient-to-br from-violet-50 to-purple-100",
  "bg-gradient-to-br from-orange-50 to-amber-100",
];

export default function Chill() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const spills = useQuery(api.chill.getAllSpills);
  const createSpill = useMutation(api.chill.createSpill);
  const deleteSpill = useMutation(api.chill.deleteSpill);
  const upvoteSpill = useMutation(api.chill.upvoteSpill);
  const downvoteSpill = useMutation(api.chill.downvoteSpill);

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

  const handleUpvote = async (postId: Id<"chill_posts">) => {
    try {
      await upvoteSpill({ postId });
    } catch (error: any) {
      toast.error("Failed to upvote");
    }
  };

  const handleDownvote = async (postId: Id<"chill_posts">) => {
    try {
      await downvoteSpill({ postId });
    } catch (error: any) {
      toast.error("Failed to downvote");
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
                <Button 
                  size="lg" 
                  className="gap-2 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:from-primary/90 hover:via-purple-600/90 hover:to-pink-600/90 text-white font-bold px-6 py-6 text-lg rounded-2xl hover:scale-105 active:scale-95"
                >
                  <Sparkles className="h-5 w-5 animate-pulse" />
                  spill the tea ☕
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
                const colorClass = DIARY_COLORS[index % DIARY_COLORS.length];
                const isOwner = spill.authorId === user._id;
                const upvoteCount = spill.upvotes?.length || 0;
                const downvoteCount = spill.downvotes?.length || 0;
                const hasUpvoted = spill.upvotes?.includes(user._id);
                const hasDownvoted = spill.downvotes?.includes(user._id);
                
                return (
                  <motion.div
                    key={spill._id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ delay: index * 0.03 }}
                    className="break-inside-avoid"
                  >
                    <Card className={`${colorClass} border-2 border-gray-300/50 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden`}>
                      {/* Diary page lines effect */}
                      <div className="absolute inset-0 pointer-events-none opacity-20">
                        {[...Array(12)].map((_, i) => (
                          <div key={i} className="h-8 border-b border-gray-400/30" />
                        ))}
                      </div>
                      
                      {/* Red margin line */}
                      <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-red-300/40 pointer-events-none" />
                      
                      <CardContent className="p-8 space-y-4 relative">
                        {/* Delete Button (only for owner) */}
                        {isOwner && (
                          <div className="absolute top-3 right-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteSpill(spill._id)}
                              className="h-7 w-7 p-0 hover:bg-gray-300/50 rounded-full"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-gray-600" />
                            </Button>
                          </div>
                        )}

                        {/* Content */}
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap break-words text-base font-serif italic pl-4 pt-2">
                          {spill.content}
                        </p>
                      </CardContent>
                    </Card>
                    
                    {/* Vote controls extension below the card */}
                    <div className="flex items-center justify-center gap-1 mt-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border border-gray-200/50">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUpvote(spill._id)}
                        className={`h-8 w-8 p-0 rounded-full transition-all ${
                          hasUpvoted 
                            ? "bg-green-200/60 hover:bg-green-300/60 text-green-700" 
                            : "hover:bg-gray-200/60 text-gray-600"
                        }`}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-semibold text-gray-700 min-w-[2.5rem] text-center">
                        {upvoteCount - downvoteCount}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownvote(spill._id)}
                        className={`h-8 w-8 p-0 rounded-full transition-all ${
                          hasDownvoted 
                            ? "bg-red-200/60 hover:bg-red-300/60 text-red-700" 
                            : "hover:bg-gray-200/60 text-gray-600"
                        }`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
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