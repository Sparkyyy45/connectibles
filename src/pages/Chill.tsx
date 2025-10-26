import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, Upload, X, Trash2, ZoomIn, ZoomOut } from "lucide-react";
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
  const [placementMode, setPlacementMode] = useState(false);
  const [pendingImage, setPendingImage] = useState<{ file: File; storageId: string; width: number; height: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [draggedPost, setDraggedPost] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingPost, setResizingPost] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [showRotationSlider, setShowRotationSlider] = useState<string | null>(null);
  
  const [localPositions, setLocalPositions] = useState<Record<string, { x: number; y: number; width: number; height: number; rotation: number }>>({});
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(1000);

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ left: 0, top: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Start at the top on initial load
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.scrollLeft = 0;
      canvas.scrollTop = 0;
    }
  }, []);

  // Calculate max z-index from posts
  useEffect(() => {
    if (posts && posts.length > 0) {
      const max = Math.max(...posts.map(p => p.zIndex || 0), 1000);
      setMaxZIndex(max);
    }
  }, [posts]);

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
            0.85
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

      // Get actual image dimensions
      const img = new Image();
      const imageUrl = URL.createObjectURL(selectedFile);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Scale down to a reasonable size while maintaining aspect ratio
      const maxDimension = 300; // Maximum width or height
      let displayWidth = img.width;
      let displayHeight = img.height;

      if (displayWidth > maxDimension || displayHeight > maxDimension) {
        const aspectRatio = displayWidth / displayHeight;
        if (displayWidth > displayHeight) {
          displayWidth = maxDimension;
          displayHeight = maxDimension / aspectRatio;
        } else {
          displayHeight = maxDimension;
          displayWidth = maxDimension * aspectRatio;
        }
      }

      URL.revokeObjectURL(imageUrl);

      // Enter placement mode
      setPendingImage({
        file: selectedFile,
        storageId,
        width: displayWidth,
        height: displayHeight,
      });
      setPlacementMode(true);
      setShowUploadDialog(false);
      
      toast.success("Click anywhere on the canvas to place your image! 🎨");
    } catch (error) {
      console.error("Failed to prepare image:", error);
      toast.error("Failed to prepare image");
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

  const syncPositionToDatabase = (postId: string, x: number, y: number, width: number, height: number, zIndex: number, rotation: number) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      updatePosition({
        postId: postId as Id<"chill_posts">,
        positionX: x,
        positionY: y,
        width,
        height,
        zIndex,
        rotation,
      }).catch((error) => {
        console.error("Failed to update position:", error);
      });
    }, 100);
  };

  const bringToFront = (postId: string) => {
    const post = posts?.find(p => p._id === postId);
    if (!post) return;

    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);
    
    setLocalPositions(prev => ({
      ...prev,
      [postId]: {
        x: post.positionX || 20,
        y: post.positionY || 20,
        width: post.width || 200,
        height: post.height || 200,
        rotation: post.rotation || 0,
      }
    }));

    syncPositionToDatabase(
      postId,
      post.positionX || 20,
      post.positionY || 20,
      post.width || 200,
      post.height || 200,
      newZIndex,
      post.rotation || 0
    );
  };

  const handleMouseDown = (e: React.MouseEvent, postId: string, currentX: number, currentY: number) => {
    if (!canvasRef.current || resizingPost) return;
    
    e.preventDefault();
    e.stopPropagation();
    bringToFront(postId);
    
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = e.clientX - (rect.left + (currentX / 100) * rect.width);
    const offsetY = e.clientY - (rect.top + (currentY / 100) * rect.height);
    
    setDraggedPost(postId);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedPost || !canvasRef.current || resizingPost) return;
    
    e.preventDefault();
    
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const newY = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
    
    const post = posts?.find(p => p._id === draggedPost);
    if (!post) return;

    const postWidth = (localPositions[draggedPost]?.width || post.width || 200) / rect.width * 100;
    const postHeight = (localPositions[draggedPost]?.height || post.height || 200) / rect.height * 100;
    
    const clampedX = Math.max(0, Math.min(100 - postWidth, newX));
    const clampedY = Math.max(0, Math.min(100 - postHeight, newY));
    
    setLocalPositions(prev => ({
      ...prev,
      [draggedPost]: {
        x: clampedX,
        y: clampedY,
        width: post.width || 200,
        height: post.height || 200,
        rotation: localPositions[draggedPost]?.rotation || post.rotation || 0,
      }
    }));
    
    syncPositionToDatabase(draggedPost, clampedX, clampedY, post.width || 200, post.height || 200, maxZIndex, localPositions[draggedPost]?.rotation || post.rotation || 0);
  };

  const handleMouseUp = () => {
    if (draggedPost) {
      setDraggedPost(null);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    }
    if (resizingPost) {
      setResizingPost(null);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    }
    if (isPanning) {
      setIsPanning(false);
    }
  };

  const handleResizeStart = (e: React.MouseEvent, postId: string, currentWidth: number, currentHeight: number) => {
    e.stopPropagation();
    bringToFront(postId);
    setResizingPost(postId);
    setResizeStart({ x: e.clientX, y: e.clientY, width: currentWidth, height: currentHeight });
  };

  const handleResize = (e: React.MouseEvent) => {
    if (!resizingPost || !canvasRef.current || draggedPost) return;
    
    e.preventDefault();
    
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    const newWidth = Math.max(100, resizeStart.width + deltaX);
    const newHeight = Math.max(100, resizeStart.height + deltaY);
    
    const post = posts?.find(p => p._id === resizingPost);
    if (post) {
      setLocalPositions(prev => ({
        ...prev,
        [resizingPost]: {
          x: post.positionX || 20,
          y: post.positionY || 20,
          width: newWidth,
          height: newHeight,
          rotation: localPositions[resizingPost]?.rotation || post.rotation || 0,
        }
      }));
      
      syncPositionToDatabase(resizingPost, post.positionX || 20, post.positionY || 20, newWidth, newHeight, maxZIndex, localPositions[resizingPost]?.rotation || post.rotation || 0);
    }
  };

  const handleRotationChange = (postId: string, newRotation: number) => {
    const post = posts?.find(p => p._id === postId);
    if (!post) return;
    
    setLocalPositions(prev => ({
      ...prev,
      [postId]: {
        x: post.positionX || 20,
        y: post.positionY || 20,
        width: post.width || 200,
        height: post.height || 200,
        rotation: newRotation,
      }
    }));
    
    syncPositionToDatabase(postId, post.positionX || 20, post.positionY || 20, post.width || 200, post.height || 200, post.zIndex || maxZIndex, newRotation);
  };

  const handleCanvasClick = async (e: React.MouseEvent) => {
    if (!placementMode || !pendingImage || !canvasRef.current) return;
    
    // Only place if clicking on the canvas background
    if (e.target === canvasRef.current || (e.target as HTMLElement).closest('.canvas-background')) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left + canvasRef.current.scrollLeft;
      const clickY = e.clientY - rect.top + canvasRef.current.scrollTop;
      
      // Convert to percentage
      const posX = (clickX / (rect.width * zoom)) * 100;
      const posY = (clickY / (rect.height * zoom)) * 100;
      
      try {
        await createPost({
          content: content.trim() || undefined,
          storageId: pendingImage.storageId as Id<"_storage">,
          mediaType: "image",
          positionX: posX,
          positionY: posY,
          width: pendingImage.width,
          height: pendingImage.height,
          zIndex: Date.now(),
        });
        
        toast.success("Image placed! 🎨");
        setPlacementMode(false);
        setPendingImage(null);
        setContent("");
        setSelectedFile(null);
        setPreviewUrl("");
      } catch (error) {
        console.error("Failed to place image:", error);
        toast.error("Failed to place image");
      }
    }
  };

  const handleCanvasPanStart = (e: React.MouseEvent) => {
    // Don't pan in placement mode
    if (placementMode) return;
    
    // Only start panning if clicking on the canvas background (not on a post)
    if (e.target === canvasRef.current || (e.target as HTMLElement).closest('.canvas-background')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      if (canvasRef.current) {
        setScrollStart({
          left: canvasRef.current.scrollLeft,
          top: canvasRef.current.scrollTop,
        });
      }
    }
  };

  const handleCanvasPan = (e: React.MouseEvent) => {
    if (!isPanning || !canvasRef.current) return;
    
    e.preventDefault();
    
    const deltaX = panStart.x - e.clientX;
    const deltaY = panStart.y - e.clientY;
    
    canvasRef.current.scrollLeft = scrollStart.left + deltaX;
    canvasRef.current.scrollTop = scrollStart.top + deltaY;
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
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
      <div className="min-h-[calc(100vh-180px)] bg-[#f5f5f5] relative overflow-hidden">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-8 right-8 z-50 flex flex-col gap-2"
        >
          <Button
            size="lg"
            onClick={() => setShowUploadDialog(true)}
            className="h-16 w-16 rounded-full shadow-lg hover:shadow-xl transition-all bg-white text-foreground hover:bg-gray-50 border border-gray-200"
          >
            <Plus className="h-8 w-8" />
          </Button>
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              onClick={handleZoomIn}
              className="h-12 w-12 rounded-full shadow-lg bg-white text-foreground hover:bg-gray-50 border border-gray-200"
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              size="sm"
              onClick={handleZoomOut}
              className="h-12 w-12 rounded-full shadow-lg bg-white text-foreground hover:bg-gray-50 border border-gray-200"
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
          </div>
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
          className="relative w-full h-[calc(100vh-180px)] overflow-auto scroll-smooth"
          style={{ cursor: placementMode ? 'crosshair' : (isPanning ? 'grabbing' : 'default') }}
          onMouseMove={(e) => {
            if (isPanning) {
              handleCanvasPan(e);
            } else if (draggedPost && !resizingPost) {
              handleMouseMove(e);
            } else if (resizingPost && !draggedPost) {
              handleResize(e);
            }
          }}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleCanvasClick}
        >
          <div 
            className="relative min-h-[1000vh] w-full canvas-background origin-top-left transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
            onMouseDown={handleCanvasPanStart}
          >
            <AnimatePresence>
              {posts && posts.length > 0 ? (
                posts.map((post) => {
                const localPos = localPositions[post._id];
                const posX = localPos?.x ?? post.positionX ?? 50;
                const posY = localPos?.y ?? post.positionY ?? 50;
                const width = localPos?.width ?? post.width ?? 200;
                const height = localPos?.height ?? post.height ?? 200;
                const rotation = localPos?.rotation ?? post.rotation ?? 0;
                const isOwner = post.authorId === user._id;
                const isDragging = draggedPost === post._id;
                const isResizing = resizingPost === post._id;
                const isRotating = false; // Rotation is now handled by slider, not drag
                
                return (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ 
                      opacity: 1, 
                      scale: isDragging || isResizing ? 1.02 : 1,
                    }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "absolute",
                      left: `${posX}%`,
                      top: `${posY}%`,
                      width: `${width}px`,
                      height: `${height}px`,
                      zIndex: localPos ? maxZIndex : (post.zIndex || 1),
                      cursor: isOwner ? (isDragging ? "grabbing" : "grab") : "default",
                      userSelect: "none",
                      touchAction: "none",
                      transform: `rotate(${rotation}deg)`,
                    }}
                    className="group"
                    onMouseDown={(e) => {
                      if (isOwner && !resizingPost) {
                        handleMouseDown(e, post._id, posX, posY);
                      }
                    }}
                  >
                    <div className={`relative w-full h-full transition-all duration-200 overflow-hidden rounded-lg ${
                      isDragging || isResizing ? "shadow-2xl scale-[1.02]" : "shadow-md"
                    }`}>
                      {post.mediaUrl && (
                        <img
                          src={post.mediaUrl}
                          alt="Meme"
                          className="w-full h-full object-cover pointer-events-none"
                          draggable={false}
                        />
                      )}
                      {post.content && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs">
                          {post.content}
                        </div>
                      )}
                      {isOwner && (
                        <>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(post._id);
                            }}
                            className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/90 hover:bg-white text-red-600 hover:text-red-700 shadow-md"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div
                            className="absolute bottom-0 right-0 w-8 h-8 bg-gray-800/80 rounded-tl-lg cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-1"
                            onMouseDown={(e) => handleResizeStart(e, post._id, width, height)}
                          >
                            <div className="w-4 h-4 border-r-2 border-b-2 border-white" />
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center"
                >
                  <div className="text-gray-400 mb-4">
                    <Upload className="h-24 w-24 mx-auto" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-600 mb-2">No Images Yet</h2>
                  <p className="text-gray-500">Click the + button to add your first image</p>
                  <p className="text-sm text-gray-500 mt-2">Place them anywhere on the infinite vertical canvas!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}