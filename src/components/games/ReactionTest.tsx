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
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Reaction Test</CardTitle>
        <CardDescription className="text-center">
          Click as fast as you can when the screen turns green!
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
              className={`h-64 rounded-lg flex items-center justify-center text-2xl font-bold cursor-pointer transition-all ${
                gameState === "ready" 
                  ? "bg-red-500 text-white" 
                  : gameState === "go" 
                    ? "bg-green-500 text-white" 
                    : "bg-muted"
              }`}
            >
              {gameState === "ready" && "Wait..."}
              {gameState === "go" && "CLICK NOW!"}
              {gameState === "waiting" && "Ready?"}
            </motion.div>
          </>
        )}

        <div className="space-y-2">
          {results.map((result, index) => (
            <div key={index} className="p-3 rounded-lg bg-muted">
              <div className="flex justify-between">
                <span className="font-medium">{result.player}</span>
                <span className="text-primary font-bold">{result.time}ms</span>
              </div>
            </div>
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
