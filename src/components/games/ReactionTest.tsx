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
  const [results, setResults] = useState<Array<{player: string, time: number}>>([]);
  const [isMyTurn, setIsMyTurn] = useState(false);

  useEffect(() => {
    if (session.gameState) {
      try {
        const state = JSON.parse(session.gameState);
        setResults(state.results || []);
      } catch (e) {
        setResults([]);
      }
    }
    setIsMyTurn(session.currentTurn === currentUserId);
  }, [session, currentUserId]);

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
      const reactionTime = Date.now() - startTime;
      const playerName = session.player1Id === currentUserId ? "You" : "Opponent";
      const newResults = [...results, { player: playerName, time: reactionTime }];
      setResults(newResults);
      setGameState("waiting");

      const winnerId = newResults.length === 2
        ? newResults[0].time < newResults[1].time
          ? (newResults[0].player === "You" ? currentUserId : (session.player1Id === currentUserId ? session.player2Id : session.player1Id))
          : (newResults[1].player === "You" ? currentUserId : (session.player1Id === currentUserId ? session.player2Id : session.player1Id))
        : undefined;

      try {
        await updateGameState({
          sessionId,
          gameState: JSON.stringify({ results: newResults }),
          winnerId,
        });

        if (winnerId) {
          toast.success(winnerId === currentUserId ? "You won!" : "Opponent won!");
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
        {session.status === "in_progress" && isMyTurn && results.length < 2 && (
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

        <div className="space-y-2">
          {results.map((result, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl shadow-md ${
                result.player === "You"
                  ? "bg-gradient-to-r from-green-500/20 to-green-600/10 border-l-4 border-green-500"
                  : "bg-gradient-to-r from-blue-500/20 to-blue-600/10 border-l-4 border-blue-500"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">{result.player}</span>
                <span className="text-primary font-bold text-2xl">{result.time}ms</span>
              </div>
            </motion.div>
          ))}
        </div>

        {session.status === "completed" && (
          <div className="text-center text-xl font-bold">
            {session.winnerId === currentUserId ? "🎉 You Won!" : "😔 Opponent Won"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
