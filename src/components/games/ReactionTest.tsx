import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";

interface ReactionTestProps {
  sessionId: Id<"game_sessions">;
  currentUserId: Id<"users">;
  session: any;
}

export default function ReactionTest({ sessionId, currentUserId, session }: ReactionTestProps) {
  const updateGameState = useMutation(api.games.updateGameState);
  const [gameState, setGameState] = useState<"waiting" | "ready" | "go">("waiting");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [reactionTime, setReactionTime] = useState<number | null>(null);

  useEffect(() => {
    if (session.gameState) {
      try {
        const state = JSON.parse(session.gameState);
        setReactionTime(state.reactionTime || null);
      } catch (e) {
        setReactionTime(null);
      }
    }
  }, [session]);

  const startTest = () => {
    setGameState("ready");
    const delay = Math.random() * 3000 + 2000;
    setTimeout(() => {
      setGameState("go");
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = async () => {
    if (gameState === "go" && startTime) {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setGameState("waiting");

      const result = time < 300 ? "win" : "loss";

      try {
        await updateGameState({
          sessionId,
          gameState: JSON.stringify({ reactionTime: time }),
          result,
        });

        if (result === "win") {
          toast.success(`Amazing! ${time}ms 🎉`);
        } else {
          toast.success(`${time}ms - Keep practicing!`);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to update game");
      }
    }
  };

  return (
    <Card className="max-w-md mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
        <CardTitle className="text-center text-2xl">⚡ Reaction Test</CardTitle>
        <CardDescription className="text-center text-lg font-medium mt-2">
          Click as fast as you can when the screen turns <span className="text-green-500 font-bold">GREEN</span>!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {session.status === "in_progress" && !reactionTime && (
          <>
            {gameState === "waiting" && (
              <Button onClick={startTest} className="w-full" size="lg">
                Start Test
              </Button>
            )}
            
            <motion.div
              onClick={handleClick}
              animate={{ 
                scale: gameState === "go" ? [1, 1.05, 1] : 1,
                boxShadow: gameState === "go" ? ["0 0 0 0 rgba(34, 197, 94, 0.7)", "0 0 0 20px rgba(34, 197, 94, 0)"] : "none"
              }}
              transition={{ 
                duration: gameState === "go" ? 0.5 : 0.3,
                repeat: gameState === "go" ? Infinity : 0
              }}
              className={`h-64 rounded-2xl flex items-center justify-center text-3xl font-bold cursor-pointer transition-all shadow-xl ${
                gameState === "ready" 
                  ? "bg-gradient-to-br from-red-500 to-red-600 text-white" 
                  : gameState === "go" 
                    ? "bg-gradient-to-br from-green-500 to-green-600 text-white" 
                    : "bg-gradient-to-br from-muted to-muted/50 text-muted-foreground"
              }`}
            >
              {gameState === "ready" && "⏳ Wait..."}
              {gameState === "go" && "🚀 CLICK NOW!"}
              {gameState === "waiting" && "🎮 Ready?"}
            </motion.div>
          </>
        )}

        {reactionTime && (
          <div className="text-center space-y-2">
            <p className="text-4xl font-bold text-primary">{reactionTime}ms</p>
            <p className="text-lg text-muted-foreground">
              {reactionTime < 300 ? "🎉 Excellent!" : "Keep practicing!"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}