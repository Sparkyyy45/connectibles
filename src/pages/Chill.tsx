import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Plus, Image, Music, Smile, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import type { Id } from "@/convex/_generated/dataModel";

const EMOJI_OPTIONS = ["❤️", "😂", "🔥", "👍", "🎉", "✨", "💯", "🎨"];

export default function Chill() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const posts = useQuery(api.chill.getAllChillPosts);
  const createPost = useMutation(api.chill.createChillPost);
  const addReaction = useMutation(api.chill.addReaction);
  const deletePost = useMutation(api.chill.deleteChillPost);

  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "doodle" | "sticker" | "music" | "other">("image");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleCreate = async () => {
    if (!content.trim() && !mediaUrl.trim()) {
      toast.error("Please add some content or a media link");
      return;
    }

    setCreating(true);
    try {
      await createPost({
        content: content.trim() || undefined,
        mediaUrl: mediaUrl.trim() || undefined,
        mediaType: mediaUrl.trim() ? mediaType : undefined,
      });
      toast.success("Posted to Chill! 🎉");
      setOpen(false);
      setContent("");
      setMediaUrl("");
      setMediaType("image");
    } catch (error) {
      toast.error("Failed to create post");
    } finally {
      setCreating(false);
    }
  };

  const handleReaction = async (postId: Id<"chill_posts">, emoji: string) => {
    try {
      await addReaction({ postId, emoji });
    } catch (error) {
      toast.error("Failed to add reaction");
    }
  };

  const handleDelete = async (postId: Id<"chill_posts">) => {
    try {
      await deletePost({ postId });
      toast.success("Post deleted");
    } catch (error) {
      toast.error("Failed to delete post");
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
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Chill Zone
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Share your vibes - doodles, music, memes, anything! ✨
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-sm hover:shadow-md transition-shadow">
                <Plus className="h-4 w-4 mr-2" />
                Share Something
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">Share to Chill Zone</DialogTitle>
                <DialogDescription className="text-base">
                  Post anything creative - images, music, doodles, or just vibes
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">What's on your mind?</label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your thoughts, vibes, or caption..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Media Link (Optional)</label>
                  <Input
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="Paste image, music, or any media URL"
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Media Type</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "image", icon: Image, label: "Image" },
                      { value: "music", icon: Music, label: "Music" },
                      { value: "sticker", icon: Smile, label: "Sticker" },
                      { value: "doodle", icon: Sparkles, label: "Doodle" },
                      { value: "other", icon: Plus, label: "Other" },
                    ].map((type) => {
                      const Icon = type.icon;
                      return (
                        <Button
                          key={type.value}
                          type="button"
                          variant={mediaType === type.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setMediaType(type.value as any)}
                          className="gap-2"
                        >
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
                <Button onClick={handleCreate} disabled={creating} className="w-full h-11 text-base">
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Post to Chill
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid gap-6">
          {posts?.map((post, index) => {
            const reactionCounts = (post.reactions || []).reduce((acc, r) => {
              acc[r.emoji] = (acc[r.emoji] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            const userReactions = (post.reactions || []).filter(r => r.userId === user._id).map(r => r.emoji);

            return (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-primary/10">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {post.author?.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{post.author?.name || "Anonymous"}</CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {new Date(post._creationTime).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {post.authorId === user._id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(post._id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {post.content && (
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    )}
                    {post.mediaUrl && (
                      <div className="rounded-lg overflow-hidden border bg-muted/30">
                        {post.mediaType === "image" ? (
                          <img
                            src={post.mediaUrl}
                            alt="Shared content"
                            className="w-full max-h-96 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : post.mediaType === "music" ? (
                          <div className="p-4 flex items-center gap-3">
                            <Music className="h-8 w-8 text-primary" />
                            <a
                              href={post.mediaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline truncate"
                            >
                              {post.mediaUrl}
                            </a>
                          </div>
                        ) : (
                          <div className="p-4 flex items-center gap-3">
                            <Sparkles className="h-8 w-8 text-primary" />
                            <a
                              href={post.mediaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline truncate"
                            >
                              View {post.mediaType}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2 border-t flex-wrap">
                      {EMOJI_OPTIONS.map((emoji) => (
                        <Button
                          key={emoji}
                          variant={userReactions.includes(emoji) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleReaction(post._id, emoji)}
                          className="gap-1.5 h-8"
                        >
                          <span className="text-base">{emoji}</span>
                          {reactionCounts[emoji] && (
                            <span className="text-xs font-medium">{reactionCounts[emoji]}</span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {posts?.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-dashed border-2">
              <CardHeader className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl mb-2">No Posts Yet</CardTitle>
                <p className="text-muted-foreground text-base">
                  Be the first to paint your canvas! 🎨
                </p>
              </CardHeader>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
