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
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (session.gameState) {
      try {
        const state = JSON.parse(session.gameState);
        setCurrentEmoji(state.currentEmoji || 0);
        setScore(state.score || 0);
      } catch (e) {
        setCurrentEmoji(0);
      }
    }
  }, [session]);

  const handleGuess = async (guessedName: string) => {
    if (session.status !== "in_progress") return;

    const correctName = EMOJI_PAIRS[currentEmoji].name;
    const isCorrect = guessedName === correctName;
    
    const newScore = isCorrect ? score + 1 : score;
    const nextEmoji = currentEmoji + 1;
    setScore(newScore);
    setCurrentEmoji(nextEmoji);

    const result = nextEmoji >= EMOJI_PAIRS.length
      ? (newScore >= 6 ? "win" : "loss")
      : undefined;

    try {
      await updateGameState({
        sessionId,
        gameState: JSON.stringify({ 
          currentEmoji: nextEmoji, 
          score: newScore 
        }),
        result,
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

  const shuffledOptions = [...EMOJI_PAIRS].sort(() => Math.random() - 0.5).slice(0, 4);
  if (!shuffledOptions.find(o => o.name === EMOJI_PAIRS[currentEmoji]?.name)) {
    shuffledOptions[0] = EMOJI_PAIRS[currentEmoji];
    shuffledOptions.sort(() => Math.random() - 0.5);
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {session.status === "completed" 
            ? session.result === "win" ? "🎉 You Won!" : "😔 Better luck next time!"
            : `Emoji ${currentEmoji + 1} of ${EMOJI_PAIRS.length}`}
        </CardTitle>
        <CardDescription className="text-center">
          <div className="text-lg font-semibold mt-2">
            Score: {score} / {EMOJI_PAIRS.length}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {session.status === "in_progress" && currentEmoji < EMOJI_PAIRS.length && (
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
        )}

        {session.status === "completed" && (
          <div className="text-center space-y-2">
            <p className="text-lg">Final Score:</p>
            <p className="text-2xl font-bold">{score} / {EMOJI_PAIRS.length}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}