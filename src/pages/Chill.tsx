import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, Image, Music, Pencil, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import type { Id } from "@/convex/_generated/dataModel";

type CreationType = "image" | "doodle" | "music" | null;

export default function Chill() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const posts = useQuery(api.chill.getAllChillPosts);
  const createPost = useMutation(api.chill.createChillPost);
  const deletePost = useMutation(api.chill.deleteChillPost);
  const generateUploadUrl = useMutation(api.chill.generateUploadUrl);

  const [showCreationMenu, setShowCreationMenu] = useState(false);
  const [creationType, setCreationType] = useState<CreationType>(null);
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Doodle canvas state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setMediaUrl(previewUrl);
    }
  };

  // Upload file to Convex storage
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

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL();
    const newHistory = canvasHistory.slice(0, historyStep + 1);
    newHistory.push(dataUrl);
    setCanvasHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      const img = document.createElement('img');
      img.src = canvasHistory[historyStep - 1];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      setHistoryStep(historyStep - 1);
    }
  };

  const redo = () => {
    if (historyStep < canvasHistory.length - 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      const img = document.createElement('img');
      img.src = canvasHistory[historyStep + 1];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      setHistoryStep(historyStep + 1);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setCanvasHistory([]);
    setHistoryStep(-1);
  };

  const saveDoodle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL("image/png");
    setMediaUrl(dataUrl);
  };

  const handleCreate = async () => {
    // For doodles, check if canvas has content via mediaUrl
    // For images/music, check if file is selected
    if (creationType === "doodle" && !mediaUrl) {
      toast.error("Please draw something on the canvas");
      return;
    }
    
    if (creationType !== "doodle" && !selectedFile && !content.trim()) {
      toast.error("Please add some content or media");
      return;
    }

    setCreating(true);
    try {
      let storageId: string | null = null;
      let finalMediaUrl = mediaUrl;

      // Upload file if selected
      if (selectedFile && creationType !== "doodle") {
        storageId = await uploadFile(selectedFile);
        if (!storageId) {
          setCreating(false);
          return;
        }
        finalMediaUrl = ""; // Will be generated from storageId
      }

      await createPost({
        content: content.trim() || undefined,
        mediaUrl: finalMediaUrl || undefined,
        storageId: storageId as Id<"_storage"> | undefined,
        mediaType: creationType || undefined,
      });
      
      toast.success("Posted to Canvas! 🎨");
      setShowCreationMenu(false);
      setCreationType(null);
      setContent("");
      setMediaUrl("");
      setSelectedFile(null);
      clearCanvas();
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
        {/* Canvas Grid Background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Floating Add Button */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Button
            size="lg"
            onClick={() => setShowCreationMenu(true)}
            className="h-16 w-16 rounded-full shadow-2xl hover:shadow-3xl transition-all"
          >
            <Plus className="h-8 w-8" />
          </Button>
        </motion.div>

        {/* Creation Type Selection Dialog */}
        <Dialog open={showCreationMenu && !creationType} onOpenChange={(open) => {
          if (!open) {
            setShowCreationMenu(false);
            setCreationType(null);
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl">Create on Canvas</DialogTitle>
              <DialogDescription>Choose what you'd like to add</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4 py-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCreationType("image")}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all"
              >
                <Image className="h-10 w-10 text-primary" />
                <span className="font-medium">Image</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCreationType("doodle")}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all"
              >
                <Pencil className="h-10 w-10 text-primary" />
                <span className="font-medium">Doodle</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCreationType("music")}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all"
              >
                <Music className="h-10 w-10 text-primary" />
                <span className="font-medium">Music</span>
              </motion.button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Image Upload Dialog */}
        <Dialog open={creationType === "image"} onOpenChange={(open) => {
          if (!open) {
            setCreationType(null);
            setContent("");
            setMediaUrl("");
            setSelectedFile(null);
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Add Image</DialogTitle>
              <DialogDescription>Select an image from your device</DialogDescription>
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
                  {uploading ? "Uploading..." : creating ? "Posting..." : "Post to Canvas"}
                </Button>
                <Button variant="outline" onClick={() => setCreationType(null)} className="h-11">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Doodle Dialog */}
        <Dialog open={creationType === "doodle"} onOpenChange={(open) => {
          if (!open) {
            setCreationType(null);
            setContent("");
            setMediaUrl("");
            clearCanvas();
          }
        }}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Create Doodle</DialogTitle>
              <DialogDescription>Draw something creative!</DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="border-2 border-dashed rounded-lg overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  width={900}
                  height={600}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="cursor-crosshair w-full"
                />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Tool:</label>
                  <Button
                    variant={tool === "brush" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTool("brush")}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Brush
                  </Button>
                  <Button
                    variant={tool === "eraser" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTool("eraser")}
                  >
                    Eraser
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Color:</label>
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="h-10 w-16 rounded cursor-pointer"
                    disabled={tool === "eraser"}
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm font-medium">Size:</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-10">{brushSize}px</span>
                </div>
                <Button variant="outline" size="sm" onClick={undo} disabled={historyStep <= 0}>
                  Undo
                </Button>
                <Button variant="outline" size="sm" onClick={redo} disabled={historyStep >= canvasHistory.length - 1}>
                  Redo
                </Button>
                <Button variant="outline" size="sm" onClick={clearCanvas}>
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
              
              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <Button onClick={() => { saveDoodle(); handleCreate(); }} disabled={creating} className="flex-1 h-12 text-base">
                  {creating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Upload className="mr-2 h-5 w-5" />}
                  {creating ? "Posting..." : "Post to Canvas"}
                </Button>
                <Button variant="outline" onClick={() => setCreationType(null)} className="h-12 px-8">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Music Dialog */}
        <Dialog open={creationType === "music"} onOpenChange={(open) => {
          if (!open) {
            setCreationType(null);
            setContent("");
            setMediaUrl("");
            setSelectedFile(null);
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Add Music</DialogTitle>
              <DialogDescription>Select a music file from your device</DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="music-upload"
                />
                <Button
                  onClick={() => document.getElementById("music-upload")?.click()}
                  variant="outline"
                  className="w-full h-32 border-2 border-dashed"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Music className="h-8 w-8" />
                    <span>Click to select music file</span>
                    {selectedFile && <span className="text-sm text-muted-foreground">{selectedFile.name}</span>}
                  </div>
                </Button>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tell us about this track..."
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={creating || uploading || !selectedFile} className="flex-1 h-11">
                  {creating || uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Music className="mr-2 h-4 w-4" />}
                  {uploading ? "Uploading..." : creating ? "Posting..." : "Post Music"}
                </Button>
                <Button variant="outline" onClick={() => setCreationType(null)} className="h-11">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Canvas Posts Display */}
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
                          {post.mediaType === "image" || post.mediaType === "doodle" ? (
                            <img
                              src={post.mediaUrl}
                              alt="Canvas content"
                              className="w-full h-full object-cover"
                            />
                          ) : post.mediaType === "music" ? (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                              <Music className="h-20 w-20 text-primary" />
                            </div>
                          ) : null}
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
                  <Pencil className="h-24 w-24 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-400 mb-2">Your Canvas Awaits</h2>
                <p className="text-gray-400">Click the + button to start creating</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}