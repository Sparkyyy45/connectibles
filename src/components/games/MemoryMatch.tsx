import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";

interface MemoryMatchProps {
  sessionId: Id<"game_sessions">;
  currentUserId: Id<"users">;
  session: any;
}

const EMOJIS = ["🎮", "🎨", "🎭", "🎪", "🎯", "🎲", "🎸", "🎺"];

export default function MemoryMatch({ sessionId, currentUserId, session }: MemoryMatchProps) {
  const updateGameState = useMutation(api.games.updateGameState);
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    if (session.gameState) {
      try {
        const state = JSON.parse(session.gameState);
        setCards(state.cards || []);
        setMatched(state.matched || []);
        setMoves(state.moves || 0);
      } catch (e) {
        initializeGame();
      }
    } else {
      initializeGame();
    }
  }, [session]);

  const initializeGame = () => {
    const shuffled = [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5);
    setCards(shuffled);
  };

  const handleCardClick = async (index: number) => {
    if (flipped.length >= 2 || matched.includes(index) || flipped.includes(index)) return;
    if (session.status !== "in_progress") return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      const newMoves = moves + 1;
      setMoves(newMoves);
      
      if (cards[first] === cards[second]) {
        const newMatched = [...matched, first, second];
        setMatched(newMatched);
        setFlipped([]);

        if (newMatched.length === cards.length) {
          const result = newMoves <= 12 ? "win" : "loss";
          try {
            await updateGameState({
              sessionId,
              gameState: JSON.stringify({ cards, matched: newMatched, moves: newMoves }),
              result,
            });
            if (result === "win") {
              toast.success(`You won in ${newMoves} moves! 🎉`);
            } else {
              toast.success(`Completed in ${newMoves} moves!`);
            }
          } catch (error: any) {
            toast.error(error.message || "Failed to update game");
          }
        } else {
          try {
            await updateGameState({
              sessionId,
              gameState: JSON.stringify({ cards, matched: newMatched, moves: newMoves }),
            });
          } catch (error: any) {
            toast.error(error.message || "Failed to update game");
          }
        }
      } else {
        setTimeout(async () => {
          setFlipped([]);
          try {
            await updateGameState({
              sessionId,
              gameState: JSON.stringify({ cards, matched, moves: newMoves }),
            });
          } catch (error: any) {
            toast.error(error.message || "Failed to update game");
          }
        }, 1000);
      }
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
        <CardTitle className="text-center text-2xl">
          {session.status === "completed" 
            ? session.result === "win" ? "🎉 Victory!" : "✅ Completed!"
            : "Memory Match"}
        </CardTitle>
        <div className="flex justify-around text-lg font-semibold mt-3">
          <div className="text-center">
            <div className="text-2xl text-green-500">{matched.length / 2}</div>
            <div className="text-xs text-muted-foreground">Matches</div>
          </div>
          <div className="text-4xl">🎯</div>
          <div className="text-center">
            <div className="text-2xl text-blue-500">{moves}</div>
            <div className="text-xs text-muted-foreground">Moves</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          {cards.map((emoji, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: !matched.includes(index) && !flipped.includes(index) ? 1.08 : 1 }}
              whileTap={{ scale: !matched.includes(index) && !flipped.includes(index) ? 0.92 : 1 }}
              initial={{ rotateY: 180, opacity: 0 }}
              animate={{ 
                rotateY: flipped.includes(index) || matched.includes(index) ? 0 : 180,
                opacity: 1
              }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              onClick={() => handleCardClick(index)}
              className={`aspect-square rounded-xl text-5xl flex items-center justify-center transition-all shadow-lg cursor-pointer ${
                flipped.includes(index) || matched.includes(index)
                  ? matched.includes(index)
                    ? "bg-green-500/30 border-2 border-green-500"
                    : "bg-primary/20 border-2 border-primary"
                  : "bg-gradient-to-br from-muted to-muted/50 border-2 border-muted-foreground/30 hover:border-primary/50"
              }`}
            >
              {flipped.includes(index) || matched.includes(index) ? emoji : "❓"}
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}