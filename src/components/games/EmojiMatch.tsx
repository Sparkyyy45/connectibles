import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";

interface EmojiMatchProps {
  sessionId: Id<"game_sessions">;
  currentUserId: Id<"users">;
  session: any;
}

const EMOJI_PAIRS = [
  { emoji: "😊", name: "Happy" },
  { emoji: "😢", name: "Sad" },
  { emoji: "😡", name: "Angry" },
  { emoji: "😱", name: "Scared" },
  { emoji: "🤔", name: "Thinking" },
  { emoji: "😴", name: "Sleepy" },
  { emoji: "🤩", name: "Excited" },
  { emoji: "😎", name: "Cool" }
];

export default function EmojiMatch({ sessionId, currentUserId, session }: EmojiMatchProps) {
  const updateGameState = useMutation(api.games.updateGameState);
  const [currentEmoji, setCurrentEmoji] = useState(0);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [isMyTurn, setIsMyTurn] = useState(false);

  useEffect(() => {
    if (session.gameState) {
      try {
        const state = JSON.parse(session.gameState);
        setCurrentEmoji(state.currentEmoji || 0);
        setScores(state.scores || { player1: 0, player2: 0 });
      } catch (e) {
        setCurrentEmoji(0);
      }
    }
    setIsMyTurn(session.currentTurn === currentUserId);
  }, [session, currentUserId]);

  const handleGuess = async (guessedName: string) => {
    if (!isMyTurn || session.status !== "in_progress") return;

    const correctName = EMOJI_PAIRS[currentEmoji].name;
    const isCorrect = guessedName === correctName;
    
    const newScores = { ...scores };
    if (isCorrect) {
      if (session.player1Id === currentUserId) {
        newScores.player1++;
      } else {
        newScores.player2++;
      }
    }

    const nextEmoji = currentEmoji + 1;
    setScores(newScores);
    setCurrentEmoji(nextEmoji);

    const winnerId = nextEmoji >= EMOJI_PAIRS.length
      ? (newScores.player1 > newScores.player2 ? session.player1Id : 
         newScores.player2 > newScores.player1 ? session.player2Id : undefined)
      : undefined;

    try {
      await updateGameState({
        sessionId,
        gameState: JSON.stringify({ 
          currentEmoji: nextEmoji, 
          scores: newScores 
        }),
        winnerId,
      });

      if (isCorrect) {
        toast.success("Correct match! ✅");
      } else {
        toast.error(`Wrong! It was ${correctName} ❌`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit guess");
    }
  };

  // Ensure correct answer is always included in options
  const correctEmoji = EMOJI_PAIRS[currentEmoji];
  const otherOptions = EMOJI_PAIRS.filter((_, idx) => idx !== currentEmoji)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const shuffledOptions = [correctEmoji, ...otherOptions].sort(() => Math.random() - 0.5);

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {session.status === "completed" 
            ? session.winnerId === currentUserId 
              ? "🎉 You Won!" 
              : session.winnerId 
                ? "😔 You Lost" 
                : "🤝 It's a Tie!"
            : `Emoji ${currentEmoji + 1} of ${EMOJI_PAIRS.length}`}
        </CardTitle>
        <CardDescription className="text-center">
          <div className="flex justify-around text-lg font-semibold mt-2">
            <span>You: {session.player1Id === currentUserId ? scores.player1 : scores.player2}</span>
            <span>Opponent: {session.player1Id === currentUserId ? scores.player2 : scores.player1}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {session.status === "in_progress" && currentEmoji < EMOJI_PAIRS.length && (
          <>
            {isMyTurn ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-8xl mb-4">{EMOJI_PAIRS[currentEmoji].emoji}</div>
                  <p className="text-lg font-medium">What emotion is this?</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {shuffledOptions.map((option, index) => (
                    <motion.div key={index} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => handleGuess(option.name)}
                        variant="outline"
                        className="w-full h-16 text-lg"
                      >
                        {option.name}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-lg text-muted-foreground py-8">
                Waiting for opponent...
              </div>
            )}
          </>
        )}

        {session.status === "completed" && (
          <div className="text-center space-y-2">
            <p className="text-lg">Final Score:</p>
            <p className="text-2xl font-bold">
              {session.player1Id === currentUserId ? scores.player1 : scores.player2} - {session.player1Id === currentUserId ? scores.player2 : scores.player1}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
