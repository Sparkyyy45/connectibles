// @ts-nocheck
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { UserCheck, Users as UsersIcon, Briefcase } from "lucide-react";

export default function Posts() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const posts = useQuery(api.posts.getAllPosts);
  const createPost = useMutation(api.posts.createPost);
  const volunteerForPost = useMutation(api.posts.volunteerForPost);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const selectedPostVolunteers = useQuery(
    api.posts.getPostVolunteers,
    selectedPostId ? { postId: selectedPostId as any } : "skip"
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setCreating(true);
    try {
      await createPost({ title, description, tags });
      toast.success("Post created successfully!");
      setOpen(false);
      setTitle("");
      setDescription("");
      setTags([]);
    } catch (error) {
      toast.error("Failed to create post");
    } finally {
      setCreating(false);
    }
  };

  const handleVolunteer = async (postId: string) => {
    try {
      await volunteerForPost({ postId: postId as any });
      toast.success("Volunteer status updated!");
    } catch (error) {
      toast.error("Failed to update volunteer status");
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
      <div className="bg-gradient-to-br from-background via-muted/20 to-primary/5 min-h-[calc(100vh-180px)]">
        <div className="max-w-5xl mx-auto p-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3"
          >
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="p-3 rounded-2xl bg-primary/10 backdrop-blur-sm">
                <Briefcase className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Collaboration Posts
              </h1>
            </div>
            <p className="text-muted-foreground text-base font-medium">
              Find partners for your projects or join existing collaborations
            </p>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="mt-4 shadow-lg hover:shadow-xl transition-all">
                  <Plus className="h-5 w-5 mr-2" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Create Collaboration Post</DialogTitle>
                  <DialogDescription className="text-base">
                    Share what you're working on and find collaborators
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-5 py-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Title</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="What are you looking for?"
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Description</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your project and what kind of help you need"
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Tags</label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag"
                        onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                        className="h-11"
                      />
                      <Button onClick={handleAddTag} className="px-6">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1 px-3 py-1.5 text-sm">
                          {tag}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => setTags(tags.filter((t) => t !== tag))}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleCreate} disabled={creating} className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all">
                    {creating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Post"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          <div className="space-y-5">
            {posts?.map((post, index) => {
              const isAuthor = post.authorId === user._id;
              const hasVolunteered = post.volunteers?.includes(user._id);
              const volunteerCount = post.volunteers?.length || 0;

              return (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-xl transition-all">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 ring-2 ring-border/30">
                          <AvatarImage src={post.author?.image} alt={post.author?.name || "User"} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-foreground font-semibold">
                            {post.author?.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-1">{post.title}</CardTitle>
                          <CardDescription className="text-sm">
                            by <span className="font-medium">{post.author?.name || "Anonymous"}</span> • {new Date(post._creationTime).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed">{post.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="px-3 py-1">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                        {!isAuthor && (
                          <Button
                            variant={hasVolunteered ? "default" : "outline"}
                            onClick={() => handleVolunteer(post._id)}
                            className="gap-2 shadow-sm hover:shadow-md transition-all"
                          >
                            <UserCheck className="h-4 w-4" />
                            {hasVolunteered ? "Volunteered" : "Volunteer"}
                          </Button>
                        )}
                        {volunteerCount > 0 && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                className="gap-2 hover:bg-muted/80"
                                onClick={() => setSelectedPostId(post._id)}
                              >
                                <UsersIcon className="h-4 w-4" />
                                {volunteerCount} {volunteerCount === 1 ? "Volunteer" : "Volunteers"}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle className="text-xl">Volunteers</DialogTitle>
                                <DialogDescription>
                                  People interested in this collaboration
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
                                {selectedPostVolunteers?.map((volunteer) => (
                                  <div key={volunteer?._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <Avatar className="h-11 w-11 ring-2 ring-border/30">
                                      <AvatarImage src={volunteer?.image} alt={volunteer?.name || "User"} />
                                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 font-semibold">
                                        {volunteer?.name?.charAt(0).toUpperCase() || "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <p className="font-semibold text-foreground">{volunteer?.name || "Anonymous"}</p>
                                      <p className="text-sm text-muted-foreground line-clamp-1">
                                        {volunteer?.bio || "No bio"}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {posts?.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm">
                <CardHeader className="text-center py-16">
                  <div className="p-6 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                    <Briefcase className="h-16 w-16 opacity-30" />
                  </div>
                  <CardTitle className="text-2xl mb-2">No Collaborations Yet</CardTitle>
                  <CardDescription className="text-base">
                    Be the first to create a collaboration!
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}