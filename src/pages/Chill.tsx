import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import type { Id } from "@/convex/_generated/dataModel";

export default function Chill() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const posts = useQuery(api.chill.getAllChillPosts);
  const createPost = useMutation(api.chill.createChillPost);
  const deletePost = useMutation(api.chill.deleteChillPost);
  const generateUploadUrl = useMutation(api.chill.generateUploadUrl);

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setMediaUrl(previewUrl);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const uploadUrl = await generateUploadUrl();
      
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await result.json();
      return storageId;
    } catch (error) {
      toast.error("Failed to upload file");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedFile && !content.trim()) {
      toast.error("Please add an image or caption");
      return;
    }

    setCreating(true);
    try {
      let storageId: string | null = null;
      let finalMediaUrl = mediaUrl;

      if (selectedFile) {
        storageId = await uploadFile(selectedFile);
        if (!storageId) {
          setCreating(false);
          return;
        }
        finalMediaUrl = "";
      }

      await createPost({
        content: content.trim() || undefined,
        mediaUrl: finalMediaUrl || undefined,
        storageId: storageId as Id<"_storage"> | undefined,
        mediaType: "image",
      });
      
      toast.success("Meme posted! 🎨");
      setShowUploadDialog(false);
      setContent("");
      setMediaUrl("");
      setSelectedFile(null);
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("Failed to create post");
    } finally {
      setCreating(false);
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-180px)] bg-white relative">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Button
            size="lg"
            onClick={() => setShowUploadDialog(true)}
            className="h-16 w-16 rounded-full shadow-2xl hover:shadow-3xl transition-all"
          >
            <Plus className="h-8 w-8" />
          </Button>
        </motion.div>

        <Dialog open={showUploadDialog} onOpenChange={(open) => {
          if (!open) {
            setShowUploadDialog(false);
            setContent("");
            setMediaUrl("");
            setSelectedFile(null);
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Add Meme</DialogTitle>
              <DialogDescription>Share your favorite meme with the community</DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full h-32 border-2 border-dashed"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8" />
                    <span>Click to select image</span>
                  </div>
                </Button>
              </div>
              {mediaUrl && (
                <div className="rounded-lg overflow-hidden border">
                  <img src={mediaUrl} alt="Preview" className="w-full max-h-64 object-contain" />
                </div>
              )}
              <div>
                <label className="text-sm font-medium mb-2 block">Caption (Optional)</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add a caption..."
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={creating || uploading || !selectedFile} className="flex-1 h-11">
                  {creating || uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  {uploading ? "Uploading..." : creating ? "Posting..." : "Post Meme"}
                </Button>
                <Button variant="outline" onClick={() => setShowUploadDialog(false)} className="h-11">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="max-w-6xl mx-auto p-8">
          <AnimatePresence>
            {posts && posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, index) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group"
                  >
                    <div className="bg-white rounded-xl border-2 shadow-sm hover:shadow-xl transition-all overflow-hidden">
                      {post.mediaUrl && (
                        <div className="aspect-square bg-gray-50">
                          <img
                            src={post.mediaUrl}
                            alt="Meme"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        {post.content && (
                          <p className="text-sm text-gray-700 mb-3">{post.content}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{post.author?.name || "Anonymous"}</span>
                          {post.authorId === user._id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(post._id)}
                              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center min-h-[60vh] text-center"
              >
                <div className="text-gray-300 mb-4">
                  <Upload className="h-24 w-24 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-400 mb-2">No Memes Yet</h2>
                <p className="text-gray-400">Click the + button to share your first meme</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}