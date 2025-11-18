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

const CONFESSIONAL_COLORS = [
  "bg-gradient-to-br from-slate-800 via-purple-800 to-indigo-800",
  "bg-gradient-to-br from-indigo-800 via-slate-800 to-purple-800",
  "bg-gradient-to-br from-purple-800 via-indigo-800 to-slate-800",
  "bg-gradient-to-br from-slate-700 via-indigo-800 to-purple-800",
  "bg-gradient-to-br from-purple-800 via-slate-800 to-indigo-800",
  "bg-gradient-to-br from-indigo-800 via-purple-800 to-slate-700",
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
      toast.success("Confession posted anonymously! 🤫");
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
      toast.success("Confession deleted");
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 p-6 relative overflow-hidden">
        {/* Clean mystery-themed background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.05),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left relative z-10"
          >
            <div className="flex-1">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                <div className="p-3 rounded-xl bg-white border border-purple-200 shadow-sm">
                  <Sparkles className="h-7 w-7 text-purple-600" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-800 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
                  The Confessional
                </h1>
              </div>
              <p className="text-slate-600 text-base md:text-lg font-medium">
                Share your secrets anonymously, judgment-free zone 🤫
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="gap-2 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-6 py-5 md:py-6 text-base md:text-lg rounded-xl hover:scale-105 active:scale-95"
                >
                  <Plus className="h-5 w-5" />
                  New Confession
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg bg-white border border-slate-200 shadow-xl rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-slate-800 font-bold flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                    What's on your mind?
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 text-base">
                    Share anonymously in up to 1200 characters - no judgment, just truth
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-5 mt-6">
                  <div className="relative">
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Your secret is safe here..."
                      className="min-h-[220px] text-base resize-none bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-xl shadow-sm transition-all duration-200 p-4"
                      maxLength={1200}
                    />
                    <div className="absolute bottom-3 right-3 pointer-events-none">
                      <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        content.length > 1100 
                          ? "bg-red-100 text-red-700" 
                          : content.length > 0 
                          ? "bg-purple-100 text-purple-700" 
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        {content.length} / 1200
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-2">
                      <Button
                        onClick={handleCreateSpill}
                        disabled={isSubmitting || !content.trim()}
                        size="lg"
                        className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed px-8 py-6 text-base font-semibold rounded-xl"
                      >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5" />
                          Post Confession
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Confessions Grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            <AnimatePresence>
              {spills?.map((spill, index) => {
                const colorClass = CONFESSIONAL_COLORS[index % CONFESSIONAL_COLORS.length];
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
                    className="break-inside-avoid mb-6"
                  >
                    <Card className={`${colorClass} border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm group hover:border-purple-300`}>
                      {/* Clean accent line */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-indigo-500 to-purple-600 pointer-events-none" />
                      
                      <CardContent className="p-8 md:p-10 relative">
                        {/* Delete Button (only for owner) */}
                        {isOwner && (
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteSpill(spill._id)}
                              className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-lg transition-all border border-transparent hover:border-red-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        {/* Content */}
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap break-words text-base md:text-lg font-medium pl-5 pr-2">
                          {spill.content}
                        </p>
                      </CardContent>
                    </Card>
                    
                    {/* Vote controls extension below the card */}
                    <div className="flex items-center justify-center gap-3 mt-4 bg-white border border-slate-200 rounded-full px-5 py-2.5 shadow-md hover:shadow-lg transition-all">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUpvote(spill._id)}
                        className={`h-9 w-9 p-0 rounded-lg transition-all ${
                          hasUpvoted 
                            ? "bg-green-50 hover:bg-green-100 text-green-600 border border-green-200" 
                            : "hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        <ChevronUp className="h-5 w-5" />
                      </Button>
                      <span className="text-sm font-bold text-slate-700 min-w-[2.5rem] text-center">
                        {upvoteCount - downvoteCount}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownvote(spill._id)}
                        className={`h-9 w-9 p-0 rounded-lg transition-all ${
                          hasDownvoted 
                            ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200" 
                            : "hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        <ChevronDown className="h-5 w-5" />
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
              className="text-center py-20 relative z-10"
            >
              <Sparkles className="h-16 w-16 mx-auto text-purple-600 mb-4" />
              <h3 className="text-2xl font-bold mb-2 text-slate-800">No confessions yet</h3>
              <p className="text-slate-600 mb-6 font-medium">Be the first to share your secret!</p>
              <Button onClick={() => setIsDialogOpen(true)} size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all rounded-xl">
                <Plus className="h-5 w-5" />
                Make First Confession
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}