import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";

interface GlowHockeyProps {
  sessionId: Id<"game_sessions">;
  currentUserId: Id<"users">;
  session: any;
}

interface Vector {
  x: number;
  y: number;
}

interface Mallet {
  x: number;
  y: number;
  radius: number;
  color: string;
}

interface Puck {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const MALLET_RADIUS = 25;
const PUCK_RADIUS = 15;
const GOAL_WIDTH = 120;
const WINNING_SCORE = 7;
const PUCK_SPEED_LIMIT = 12;
const FRICTION = 0.98;

export default function GlowHockey({ sessionId, currentUserId, session }: GlowHockeyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const updateGameState = useMutation(api.games.updateGameState);
  const animationFrameRef = useRef<number>();
  
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const playerMalletRef = useRef<Mallet>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 60,
    radius: MALLET_RADIUS,
    color: "#00ffff"
  });

  const aiMalletRef = useRef<Mallet>({
    x: CANVAS_WIDTH / 2,
    y: 60,
    radius: MALLET_RADIUS,
    color: "#ff00ff"
  });

  const puckRef = useRef<Puck>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    vx: 0,
    vy: 0,
    radius: PUCK_RADIUS
  });

  const mouseRef = useRef<Vector>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  // Initialize game state from session
  useEffect(() => {
    if (session.gameState) {
      try {
        const state = JSON.parse(session.gameState);
        if (state.playerScore !== undefined) setPlayerScore(state.playerScore);
        if (state.aiScore !== undefined) setAiScore(state.aiScore);
        if (state.puck) puckRef.current = state.puck;
      } catch (e) {
        console.error("Failed to parse game state");
      }
    }
  }, [session]);

  const initializePuck = useCallback(() => {
    puckRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      radius: PUCK_RADIUS
    };
  }, []);

  const checkGoal = useCallback(async () => {
    const puck = puckRef.current;
    const goalLeft = (CANVAS_WIDTH - GOAL_WIDTH) / 2;
    const goalRight = goalLeft + GOAL_WIDTH;

    // Player scores (puck in AI goal - top)
    if (puck.y - puck.radius <= 0 && puck.x >= goalLeft && puck.x <= goalRight) {
      const newScore = playerScore + 1;
      setPlayerScore(newScore);
      toast.success("Goal! 🎉");
      initializePuck();

      if (newScore >= WINNING_SCORE) {
        setGameOver(true);
        setWinner("player");
        await updateGameState({
          sessionId,
          gameState: JSON.stringify({ playerScore: newScore, aiScore }),
          result: "win"
        });
      }
      return true;
    }

    // AI scores (puck in player goal - bottom)
    if (puck.y + puck.radius >= CANVAS_HEIGHT && puck.x >= goalLeft && puck.x <= goalRight) {
      const newScore = aiScore + 1;
      setAiScore(newScore);
      toast.error("AI scored!");
      initializePuck();

      if (newScore >= WINNING_SCORE) {
        setGameOver(true);
        setWinner("ai");
        await updateGameState({
          sessionId,
          gameState: JSON.stringify({ playerScore, aiScore: newScore }),
          result: "loss"
        });
      }
      return true;
    }

    return false;
  }, [playerScore, aiScore, sessionId, updateGameState, initializePuck]);

  const distance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  const handleCollision = (mallet: Mallet, puck: Puck) => {
    const dist = distance(mallet.x, mallet.y, puck.x, puck.y);
    if (dist < mallet.radius + puck.radius) {
      const angle = Math.atan2(puck.y - mallet.y, puck.x - mallet.x);
      const speed = Math.sqrt(puck.vx ** 2 + puck.vy ** 2) + 2;
      puck.vx = Math.cos(angle) * speed;
      puck.vy = Math.sin(angle) * speed;

      // Limit speed
      const currentSpeed = Math.sqrt(puck.vx ** 2 + puck.vy ** 2);
      if (currentSpeed > PUCK_SPEED_LIMIT) {
        puck.vx = (puck.vx / currentSpeed) * PUCK_SPEED_LIMIT;
        puck.vy = (puck.vy / currentSpeed) * PUCK_SPEED_LIMIT;
      }

      // Separate puck from mallet
      const overlap = mallet.radius + puck.radius - dist;
      puck.x += Math.cos(angle) * overlap;
      puck.y += Math.sin(angle) * overlap;
    }
  };

  const updateAI = () => {
    const aiMallet = aiMalletRef.current;
    const puck = puckRef.current;

    // AI follows puck with some delay
    const targetX = puck.x;
    const dx = targetX - aiMallet.x;
    const speed = 3;

    aiMallet.x += Math.sign(dx) * Math.min(Math.abs(dx), speed);

    // Keep AI in its half
    aiMallet.x = Math.max(MALLET_RADIUS, Math.min(CANVAS_WIDTH - MALLET_RADIUS, aiMallet.x));
    aiMallet.y = Math.max(MALLET_RADIUS, Math.min(CANVAS_HEIGHT / 2 - MALLET_RADIUS, aiMallet.y));
  };

  const gameLoop = useCallback(async () => {
    if (gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const puck = puckRef.current;
    const playerMallet = playerMalletRef.current;
    const aiMallet = aiMalletRef.current;

    // Update AI
    updateAI();

    // Update puck position
    puck.x += puck.vx;
    puck.y += puck.vy;

    // Apply friction
    puck.vx *= FRICTION;
    puck.vy *= FRICTION;

    // Wall collisions (left/right)
    if (puck.x - puck.radius <= 0 || puck.x + puck.radius >= CANVAS_WIDTH) {
      puck.vx *= -0.8;
      puck.x = Math.max(puck.radius, Math.min(CANVAS_WIDTH - puck.radius, puck.x));
    }

    // Wall collisions (top/bottom) - only outside goal areas
    const goalLeft = (CANVAS_WIDTH - GOAL_WIDTH) / 2;
    const goalRight = goalLeft + GOAL_WIDTH;

    if (puck.y - puck.radius <= 0 && (puck.x < goalLeft || puck.x > goalRight)) {
      puck.vy *= -0.8;
      puck.y = puck.radius;
    }

    if (puck.y + puck.radius >= CANVAS_HEIGHT && (puck.x < goalLeft || puck.x > goalRight)) {
      puck.vy *= -0.8;
      puck.y = CANVAS_HEIGHT - puck.radius;
    }

    // Mallet collisions
    handleCollision(playerMallet, puck);
    handleCollision(aiMallet, puck);

    // Check for goals
    await checkGoal();

    // Draw everything
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw center line
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT / 2);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw goals
    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 3;
    ctx.strokeRect(goalLeft, 0, GOAL_WIDTH, 5);
    ctx.strokeStyle = "#00ffff";
    ctx.strokeRect(goalLeft, CANVAS_HEIGHT - 5, GOAL_WIDTH, 5);

    // Draw AI mallet (top)
    ctx.shadowBlur = 20;
    ctx.shadowColor = aiMallet.color;
    ctx.fillStyle = aiMallet.color;
    ctx.beginPath();
    ctx.arc(aiMallet.x, aiMallet.y, aiMallet.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw player mallet (bottom)
    ctx.shadowColor = playerMallet.color;
    ctx.fillStyle = playerMallet.color;
    ctx.beginPath();
    ctx.arc(playerMallet.x, playerMallet.y, playerMallet.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw puck
    ctx.shadowColor = "#ffffff";
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(puck.x, puck.y, puck.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameOver, checkGoal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      mouseRef.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };

      if (isDraggingRef.current) {
        const playerMallet = playerMalletRef.current;
        playerMallet.x = mouseRef.current.x;
        playerMallet.y = mouseRef.current.y;

        // Keep player in their half
        playerMallet.x = Math.max(MALLET_RADIUS, Math.min(CANVAS_WIDTH - MALLET_RADIUS, playerMallet.x));
        playerMallet.y = Math.max(CANVAS_HEIGHT / 2 + MALLET_RADIUS, Math.min(CANVAS_HEIGHT - MALLET_RADIUS, playerMallet.y));
      }
    };

    const handleMouseDown = () => {
      isDraggingRef.current = true;
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (!gameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop, gameOver]);

  if (session.status === "completed") {
    return null;
  }

  return (
    <Card className="max-w-3xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
        <CardTitle className="text-center text-2xl">
          Glow Hockey 🏒
        </CardTitle>
        <div className="flex justify-between items-center mt-4 text-lg font-bold">
          <div className="text-purple-500">AI: {aiScore}</div>
          <div className="text-sm text-muted-foreground">First to {WINNING_SCORE} wins!</div>
          <div className="text-cyan-500">You: {playerScore}</div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full border-4 border-purple-500/30 rounded-xl shadow-2xl cursor-move"
            style={{ maxWidth: "100%", height: "auto" }}
          />
          {gameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-xl"
            >
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-4 text-white">
                  {winner === "player" ? "🎉 You Win!" : "😔 AI Wins!"}
                </h2>
                <p className="text-xl text-white/80">
                  Final Score: {playerScore} - {aiScore}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Drag your cyan mallet to hit the puck into the AI's goal!
        </p>
      </CardContent>
    </Card>
  );
}