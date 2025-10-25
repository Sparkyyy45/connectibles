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
import { UserCheck, Users as UsersIcon } from "lucide-react";

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
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Collaboration Posts</h1>
            <p className="text-muted-foreground">
              Find partners for your projects or join existing collaborations
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Collaboration Post</DialogTitle>
                <DialogDescription>
                  Share what you're working on and find collaborators
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What are you looking for?"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your project and what kind of help you need"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                    />
                    <Button onClick={handleAddTag}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => setTags(tags.filter((t) => t !== tag))}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreate} disabled={creating} className="w-full">
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

        <div className="space-y-4">
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
                <Card>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.author?.image} alt={post.author?.name || "User"} />
                        <AvatarFallback>
                          {post.author?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-xl">{post.title}</CardTitle>
                        <CardDescription>
                          by {post.author?.name || "Anonymous"} • {new Date(post._creationTime).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{post.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      {!isAuthor && (
                        <Button
                          variant={hasVolunteered ? "default" : "outline"}
                          onClick={() => handleVolunteer(post._id)}
                          className="gap-2"
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
                              className="gap-2"
                              onClick={() => setSelectedPostId(post._id)}
                            >
                              <UsersIcon className="h-4 w-4" />
                              {volunteerCount} {volunteerCount === 1 ? "Volunteer" : "Volunteers"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Volunteers</DialogTitle>
                              <DialogDescription>
                                People interested in this collaboration
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3 py-4">
                              {selectedPostVolunteers?.map((volunteer) => (
                                <div key={volunteer?._id} className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={volunteer?.image} alt={volunteer?.name || "User"} />
                                  <AvatarFallback>
                                    {volunteer?.name?.charAt(0).toUpperCase() || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                  <div>
                                    <p className="font-medium">{volunteer?.name || "Anonymous"}</p>
                                    <p className="text-sm text-muted-foreground">
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
          <Card>
            <CardHeader>
              <CardTitle>No Collaborations Yet</CardTitle>
              <CardDescription>
                Be the first to create a collaboration!
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}