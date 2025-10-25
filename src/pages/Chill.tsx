import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, Upload, X, Trash2 } from "lucide-react";
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
  const updatePosition = useMutation(api.chill.updatePostPosition);
  const generateUploadUrl = useMutation(api.chill.generateUploadUrl);

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [draggedPost, setDraggedPost] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingPost, setResizingPost] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Calculate new dimensions (max 1200px on longest side)
          const maxSize = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            0.85 // 85% quality
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      
      // Compress image before upload
      const compressedFile = await compressImage(file);
      
      const uploadUrl = await generateUploadUrl();
      
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": compressedFile.type },
        body: compressedFile,
      });

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await result.json();
      return storageId;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }

    setCreating(true);
    try {
      const storageId = await uploadFile(selectedFile);
      if (!storageId) {
        setCreating(false);
        return;
      }

      // Random initial position
      const randomX = Math.random() * 60 + 10; // 10-70%
      const randomY = Math.random() * 60 + 10; // 10-70%
      const randomSize = Math.random() * 150 + 150; // 150-300px

      await createPost({
        content: content.trim() || undefined,
        storageId: storageId as Id<"_storage">,
        mediaType: "image",
        positionX: randomX,
        positionY: randomY,
        width: randomSize,
        height: randomSize,
        zIndex: Date.now(),
      });
      
      toast.success("Meme posted! 🎨");
      setShowUploadDialog(false);
      setContent("");
      setSelectedFile(null);
      setPreviewUrl("");
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

  const handleMouseDown = (e: React.MouseEvent, postId: string, currentX: number, currentY: number) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = e.clientX - (rect.left + (currentX / 100) * rect.width);
    const offsetY = e.clientY - (rect.top + (currentY / 100) * rect.height);
    
    setDraggedPost(postId);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedPost || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const newY = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
    
    // Clamp values
    const clampedX = Math.max(0, Math.min(90, newX));
    const clampedY = Math.max(0, Math.min(90, newY));
    
    const post = posts?.find(p => p._id === draggedPost);
    if (post) {
      updatePosition({
        postId: draggedPost as Id<"chill_posts">,
        positionX: clampedX,
        positionY: clampedY,
        width: post.width,
        height: post.height,
        zIndex: Date.now(), // Bring to front
      }).catch((error) => {
        console.error("Failed to update position:", error);
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedPost(null);
    setResizingPost(null);
  };

  const handleResizeStart = (e: React.MouseEvent, postId: string, currentWidth: number, currentHeight: number) => {
    e.stopPropagation();
    setResizingPost(postId);
    setResizeStart({ x: e.clientX, y: e.clientY, width: currentWidth, height: currentHeight });
  };

  const handleResize = (e: React.MouseEvent) => {
    if (!resizingPost || !canvasRef.current) return;
    
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    const newWidth = Math.max(100, resizeStart.width + deltaX);
    const newHeight = Math.max(100, resizeStart.height + deltaY);
    
    const post = posts?.find(p => p._id === resizingPost);
    if (post) {
      updatePosition({
        postId: resizingPost as Id<"chill_posts">,
        positionX: post.positionX || 20,
        positionY: post.positionY || 20,
        width: newWidth,
        height: newHeight,
        zIndex: post.zIndex,
      }).catch((error) => {
        console.error("Failed to resize:", error);
      });
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
      <div className="min-h-[calc(100vh-180px)] bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
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
            setSelectedFile(null);
            setPreviewUrl("");
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Add Your Meme 🎨
              </DialogTitle>
              <DialogDescription className="text-base">
                Upload an image and place it anywhere on the canvas
              </DialogDescription>
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
                  className="w-full h-40 border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 group"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Upload className="h-10 w-10 text-primary" />
                    </div>
                    <div className="text-center">
                      <span className="text-lg font-semibold block">Click to select image</span>
                      <span className="text-sm text-muted-foreground">or drag and drop</span>
                    </div>
                  </div>
                </Button>
              </div>
              {previewUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl overflow-hidden border-2 border-primary/20 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 p-2"
                >
                  <img src={previewUrl} alt="Preview" className="w-full max-h-64 object-contain rounded-lg" />
                </motion.div>
              )}
              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground">
                  Caption (Optional)
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add a funny caption..."
                  rows={3}
                  className="resize-none border-primary/20 focus:border-primary/50 transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={handleCreate} 
                  disabled={creating || uploading || !selectedFile} 
                  className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all"
                >
                  {creating || uploading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {uploading ? "Uploading..." : "Posting..."}
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Post Meme
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowUploadDialog(false)} 
                  className="h-12 px-6 border-2 hover:bg-muted"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div 
          ref={canvasRef}
          className="relative w-full h-[calc(100vh-180px)]"
          onMouseMove={(e) => {
            if (draggedPost && !resizingPost) {
              handleMouseMove(e);
            } else if (resizingPost && !draggedPost) {
              handleResize(e);
            }
          }}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <AnimatePresence>
            {posts && posts.length > 0 ? (
              posts.map((post) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  style={{
                    position: "absolute",
                    left: `${post.positionX || 20}%`,
                    top: `${post.positionY || 20}%`,
                    width: `${post.width || 200}px`,
                    height: `${post.height || 200}px`,
                    zIndex: post.zIndex || 1,
                    cursor: post.authorId === user._id ? "move" : "default",
                  }}
                  className="group"
                  onMouseDown={(e) => {
                    if (post.authorId === user._id && !resizingPost) {
                      handleMouseDown(e, post._id, post.positionX || 20, post.positionY || 20);
                    }
                  }}
                >
                  <div className="relative w-full h-full bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all border-4 border-white overflow-hidden">
                    {post.mediaUrl && (
                      <img
                        src={post.mediaUrl}
                        alt="Meme"
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    )}
                    {post.content && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs">
                        {post.content}
                      </div>
                    )}
                    {post.authorId === user._id && (
                      <>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(post._id)}
                          className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div
                          className="absolute bottom-0 right-0 w-6 h-6 bg-primary/80 rounded-tl-lg cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity"
                          onMouseDown={(e) => handleResizeStart(e, post._id, post.width || 200, post.height || 200)}
                        >
                          <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-white" />
                        </div>
                      </>
                    )}
                    <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {post.author?.name || "Anonymous"}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <div className="text-gray-300 mb-4">
                  <Upload className="h-24 w-24 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-400 mb-2">No Memes Yet</h2>
                <p className="text-gray-400">Click the + button to add your first meme</p>
                <p className="text-sm text-gray-400 mt-2">Drag and drop them anywhere!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}