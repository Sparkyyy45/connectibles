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
  "bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900",
  "bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950",
  "bg-gradient-to-br from-purple-950 via-indigo-900 to-slate-900",
  "bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-900",
  "bg-gradient-to-br from-purple-900 via-slate-950 to-indigo-950",
  "bg-gradient-to-br from-indigo-900 via-purple-950 to-slate-950",
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-indigo-950 p-6 relative overflow-hidden">
        {/* Mystery-themed background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left relative z-10"
          >
            <div className="flex-1">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border-2 border-purple-400/30 shadow-lg backdrop-blur-sm">
                  <Sparkles className="h-8 w-8 text-purple-300" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-300 via-indigo-300 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
                  The Confessional
                </h1>
              </div>
              <p className="text-purple-200/90 text-base md:text-lg font-medium drop-shadow-md">
                Share your secrets anonymously, judgment-free zone 🤫
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="gap-2 shadow-2xl hover:shadow-purple-500/50 transition-all bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:via-indigo-500 hover:to-purple-600 text-white font-bold px-6 py-5 md:py-6 text-base md:text-lg rounded-2xl hover:scale-105 active:scale-95 border border-purple-400/30"
                >
                  <Plus className="h-5 w-5" />
                  New Confession
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg bg-gradient-to-br from-slate-900 to-purple-950 border-2 border-purple-500/30 shadow-2xl rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-purple-100 font-bold flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-purple-400" />
                    What's on your mind?
                  </DialogTitle>
                  <DialogDescription className="text-purple-300/80 text-base">
                    Share anonymously in up to 1200 characters - no judgment, just truth
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-5 mt-6">
                  <div className="relative">
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Your secret is safe here..."
                      className="min-h-[220px] text-base resize-none bg-slate-950/50 border-2 border-purple-500/30 text-purple-100 placeholder:text-purple-400/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 rounded-xl shadow-sm transition-all duration-200 p-4 backdrop-blur-sm"
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
                        className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed px-8 py-6 text-base font-semibold rounded-xl border border-purple-400/30"
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
                    <Card className={`${colorClass} border-2 border-purple-500/30 shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 relative overflow-hidden rounded-3xl backdrop-blur-md group hover:border-purple-400/50`}>
                      {/* Mystery glow effect */}
                      <div className="absolute inset-0 pointer-events-none opacity-20">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-indigo-500/20 to-transparent" />
                      </div>
                      
                      {/* Animated side accent line */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 via-indigo-400 to-purple-500 pointer-events-none group-hover:w-1.5 transition-all" />
                      
                      {/* Top corner mystery accent */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-400/20 to-transparent pointer-events-none rounded-bl-3xl" />
                      
                      {/* Sparkle effect on hover */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <Sparkles className="h-4 w-4 text-purple-300/50" />
                      </div>
                      
                      <CardContent className="p-8 md:p-10 relative">
                        {/* Delete Button (only for owner) */}
                        {isOwner && (
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteSpill(spill._id)}
                              className="h-9 w-9 p-0 hover:bg-red-500/20 hover:text-red-300 text-purple-300/70 rounded-full transition-all shadow-lg border border-red-400/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        {/* Content */}
                        <p className="text-purple-100 leading-relaxed whitespace-pre-wrap break-words text-base md:text-lg font-medium pl-5 pr-2 tracking-wide drop-shadow-sm">
                          {spill.content}
                        </p>
                      </CardContent>
                    </Card>
                    
                    {/* Vote controls extension below the card */}
                    <div className="flex items-center justify-center gap-3 mt-4 bg-slate-900/80 backdrop-blur-md rounded-full px-5 py-2.5 shadow-lg border-2 border-purple-500/30 hover:shadow-purple-500/30 hover:border-purple-400/50 transition-all">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUpvote(spill._id)}
                        className={`h-9 w-9 p-0 rounded-full transition-all ${
                          hasUpvoted 
                            ? "bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-400/30" 
                            : "hover:bg-purple-500/20 text-purple-300"
                        }`}
                      >
                        <ChevronUp className="h-5 w-5" />
                      </Button>
                      <span className="text-sm font-bold text-purple-200 min-w-[2.5rem] text-center">
                        {upvoteCount - downvoteCount}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownvote(spill._id)}
                        className={`h-9 w-9 p-0 rounded-full transition-all ${
                          hasDownvoted 
                            ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/30" 
                            : "hover:bg-purple-500/20 text-purple-300"
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
              <Sparkles className="h-16 w-16 mx-auto text-purple-400 mb-4 animate-pulse" />
              <h3 className="text-2xl font-bold mb-2 text-purple-100">No confessions yet</h3>
              <p className="text-purple-300/80 mb-6 font-medium">Be the first to share your secret!</p>
              <Button onClick={() => setIsDialogOpen(true)} size="lg" className="gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 shadow-2xl hover:shadow-purple-500/50 transition-all rounded-2xl border border-purple-400/30">
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