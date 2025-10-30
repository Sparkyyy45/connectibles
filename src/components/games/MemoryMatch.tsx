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
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {session.status === "completed" 
            ? session.winnerId === currentUserId ? "🎉 You Won!" : "😔 You Lost"
            : isMyTurn ? "Your Turn" : "Opponent's Turn"}
        </CardTitle>
        <div className="flex justify-around text-sm">
          <span>Your Score: {session.player1Id === currentUserId ? scores.player1 : scores.player2}</span>
          <span>Opponent: {session.player1Id === currentUserId ? scores.player2 : scores.player1}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          {cards.map((emoji, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(index)}
              className={`aspect-square rounded-lg text-4xl flex items-center justify-center transition-all ${
                flipped.includes(index) || matched.includes(index)
                  ? "bg-primary/20 border-2 border-primary"
                  : "bg-muted border-2 border-muted-foreground/20"
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
