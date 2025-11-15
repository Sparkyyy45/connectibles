// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";

interface QuickDrawProps {
  sessionId: Id<"game_sessions">;
  currentUserId: Id<"users">;
  session: any;
}

const DRAWING_PROMPTS = [
  "House", "Tree", "Cat", "Car", "Sun", "Flower", "Star", "Heart",
  "Smile", "Cloud", "Fish", "Bird", "Apple", "Book", "Cup"
];

export default function QuickDraw({ sessionId, currentUserId, session }: QuickDrawProps) {
  const updateGameState = useMutation(api.games.updateGameState);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [drawings, setDrawings] = useState<Array<{player: string, dataUrl: string}>>([]);
  const [isMyTurn, setIsMyTurn] = useState(false);

  const playerName = session.player1Id === currentUserId ? "You" : "Opponent";

  useEffect(() => {
    if (session.gameState) {
      try {
        const state = JSON.parse(session.gameState);
        setPrompt(state.prompt || DRAWING_PROMPTS[Math.floor(Math.random() * DRAWING_PROMPTS.length)]);
        setDrawings(state.drawings || []);
      } catch (e) {
        const newPrompt = DRAWING_PROMPTS[Math.floor(Math.random() * DRAWING_PROMPTS.length)];
        setPrompt(newPrompt);
      }
    } else {
      const newPrompt = DRAWING_PROMPTS[Math.floor(Math.random() * DRAWING_PROMPTS.length)];
      setPrompt(newPrompt);
    }
    setIsMyTurn(session.currentTurn === currentUserId);
  }, [session, currentUserId]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMyTurn) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isMyTurn) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const submitDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL();
    const newDrawings = [...drawings, { player: playerName, dataUrl }];
    setDrawings(newDrawings);

    // Game completes when both players have submitted
    const winnerId = newDrawings.length === 2 ? undefined : undefined;

    try {
      await updateGameState({
        sessionId,
        gameState: JSON.stringify({ prompt, drawings: newDrawings }),
        winnerId: newDrawings.length === 2 ? undefined : undefined,
      });
      toast.success("Drawing submitted!");
      clearCanvas();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit drawing");
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {session.status === "completed" ? "🎨 Both Drawings Complete!" : "Quick Draw"}
        </CardTitle>
        <CardDescription className="text-center text-lg font-semibold">
          Draw: {prompt}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {session.status === "in_progress" && isMyTurn && drawings.filter(d => d.player === "You").length === 0 && (
          <div className="space-y-2">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="border-2 border-border rounded-lg w-full bg-white cursor-crosshair"
            />
            <div className="flex gap-2">
              <Button onClick={clearCanvas} variant="outline" className="flex-1">
                Clear
              </Button>
              <Button onClick={submitDrawing} className="flex-1">
                Submit Drawing
              </Button>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {drawings.map((drawing, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-2"
            >
              <p className="font-medium text-center">{drawing.player}'s Drawing</p>
              <img 
                src={drawing.dataUrl} 
                alt={`${drawing.player}'s drawing`}
                className="border-2 border-border rounded-lg w-full"
              />
            </motion.div>
          ))}
        </div>

        {session.status === "completed" && (
          <div className="text-center text-xl font-bold">
            Both drawings submitted! 🎨
          </div>
        )}
        
        {session.status === "in_progress" && !isMyTurn && drawings.filter(d => d.player === "You").length === 0 && (
          <div className="text-center text-muted-foreground">
            Waiting for your turn to draw...
          </div>
        )}
      </CardContent>
    </Card>
  );
}