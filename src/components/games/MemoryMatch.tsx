// @ts-nocheck
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
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [isMyTurn, setIsMyTurn] = useState(false);

  useEffect(() => {
    if (session.gameState) {
      try {
        const state = JSON.parse(session.gameState);
        setCards(state.cards || []);
        setMatched(state.matched || []);
        setScores(state.scores || { player1: 0, player2: 0 });
      } catch (e) {
        initializeGame();
      }
    } else {
      initializeGame();
    }
    setIsMyTurn(session.currentTurn === currentUserId);
  }, [session, currentUserId]);

  const initializeGame = () => {
    const shuffled = [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5);
    setCards(shuffled);
  };

  const handleCardClick = async (index: number) => {
    if (!isMyTurn || flipped.length >= 2 || matched.includes(index) || flipped.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      
      if (cards[first] === cards[second]) {
        const newMatched = [...matched, first, second];
        const newScores = { ...scores };
        if (session.player1Id === currentUserId) {
          newScores.player1++;
        } else {
          newScores.player2++;
        }
        
        setMatched(newMatched);
        setScores(newScores);
        setFlipped([]);

        const winnerId = newMatched.length === cards.length 
          ? (newScores.player1 > newScores.player2 ? session.player1Id : session.player2Id)
          : undefined;

        try {
          await updateGameState({
            sessionId,
            gameState: JSON.stringify({ cards, matched: newMatched, scores: newScores }),
            winnerId,
          });
        } catch (error: any) {
          toast.error(error.message || "Failed to update game");
        }
      } else {
        setTimeout(async () => {
          setFlipped([]);
          try {
            await updateGameState({
              sessionId,
              gameState: JSON.stringify({ cards, matched, scores }),
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
            ? session.winnerId === currentUserId ? "🎉 Victory!" : "😔 Defeat"
            : isMyTurn ? "Your Turn" : "Opponent's Turn"}
        </CardTitle>
        <div className="flex justify-around text-lg font-semibold mt-3">
          <div className="text-center">
            <div className="text-2xl text-green-500">{session.player1Id === currentUserId ? scores.player1 : scores.player2}</div>
            <div className="text-xs text-muted-foreground">Your Matches</div>
          </div>
          <div className="text-4xl">🆚</div>
          <div className="text-center">
            <div className="text-2xl text-red-500">{session.player1Id === currentUserId ? scores.player2 : scores.player1}</div>
            <div className="text-xs text-muted-foreground">Opponent</div>
          </div>
        </div>
        {session.status === "in_progress" && (
          <div className="text-center mt-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="inline-block"
            >
              {isMyTurn ? (
                <span className="text-green-500 font-semibold">● Your Move</span>
              ) : (
                <span className="text-yellow-500 font-semibold">● Waiting...</span>
              )}
            </motion.div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          {cards.map((emoji, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: isMyTurn && !matched.includes(index) && !flipped.includes(index) ? 1.08 : 1 }}
              whileTap={{ scale: isMyTurn && !matched.includes(index) && !flipped.includes(index) ? 0.92 : 1 }}
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