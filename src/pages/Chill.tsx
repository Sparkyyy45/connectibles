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
  "bg-gradient-to-br from-slate-50 to-gray-100",
  "bg-gradient-to-br from-purple-50 to-indigo-100",
  "bg-gradient-to-br from-blue-50 to-cyan-100",
  "bg-gradient-to-br from-violet-50 to-purple-100",
  "bg-gradient-to-br from-indigo-50 to-blue-100",
  "bg-gradient-to-br from-pink-50 to-rose-100",
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left"
          >
            <div className="flex-1">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 border border-purple-200/50">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 bg-clip-text text-transparent">
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
                  className="gap-2 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-6 py-5 md:py-6 text-base md:text-lg rounded-2xl hover:scale-105 active:scale-95"
                >
                  <Plus className="h-5 w-5" />
                  New Confession
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg bg-white border-purple-200/50 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-slate-900 font-bold">What's on your mind?</DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Share anonymously in up to 1200 characters - no judgment, just truth
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-5 mt-6">
                  <div className="relative">
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Your secret is safe here..."
                      className="min-h-[220px] text-base resize-none bg-white border-2 border-purple-200/60 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl shadow-sm transition-all duration-200 p-4"
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
                      className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed px-8 py-6 text-base font-semibold rounded-xl"
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
                    <Card className={`${colorClass} border-2 border-slate-200/60 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden rounded-3xl backdrop-blur-sm group`}>
                      {/* Subtle gradient overlay */}
                      <div className="absolute inset-0 pointer-events-none opacity-5">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-blue-400 to-indigo-400" />
                      </div>
                      
                      {/* Side accent line */}
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-purple-500 via-blue-500 to-purple-600 pointer-events-none opacity-80" />
                      
                      <CardContent className="p-8 md:p-10 relative">
                        {/* Delete Button (only for owner) */}
                        {isOwner && (
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteSpill(spill._id)}
                              className="h-10 w-10 p-0 hover:bg-red-50 hover:text-red-600 rounded-full transition-all shadow-md hover:shadow-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        {/* Content */}
                        <p className="text-slate-800 leading-relaxed whitespace-pre-wrap break-words text-base md:text-lg font-medium tracking-wide">
                          {spill.content}
                        </p>
                      </CardContent>
                    </Card>
                    
                    {/* Vote controls extension below the card */}
                    <div className="flex items-center justify-center gap-4 mt-4 bg-white/98 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border-2 border-slate-200/60 hover:shadow-xl transition-all">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUpvote(spill._id)}
                        className={`h-10 w-10 p-0 rounded-full transition-all shadow-sm hover:shadow-md ${
                          hasUpvoted 
                            ? "bg-gradient-to-br from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-green-700 border-2 border-green-300" 
                            : "hover:bg-slate-100 text-slate-600 border-2 border-transparent hover:border-slate-200"
                        }`}
                      >
                        <ChevronUp className="h-5 w-5" />
                      </Button>
                      <span className="text-base font-bold text-slate-800 min-w-[3rem] text-center">
                        {upvoteCount - downvoteCount}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownvote(spill._id)}
                        className={`h-10 w-10 p-0 rounded-full transition-all shadow-sm hover:shadow-md ${
                          hasDownvoted 
                            ? "bg-gradient-to-br from-red-100 to-rose-100 hover:from-red-200 hover:to-rose-200 text-red-700 border-2 border-red-300" 
                            : "hover:bg-slate-100 text-slate-600 border-2 border-transparent hover:border-slate-200"
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
              className="text-center py-20"
            >
              <Sparkles className="h-16 w-16 mx-auto text-purple-600 mb-4" />
              <h3 className="text-2xl font-bold mb-2 text-slate-900">No confessions yet</h3>
              <p className="text-slate-600 mb-6 font-medium">Be the first to share your secret!</p>
              <Button onClick={() => setIsDialogOpen(true)} size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg hover:shadow-xl transition-all">
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