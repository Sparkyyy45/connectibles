import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";

interface NumberGuessProps {
  sessionId: Id<"game_sessions">;
  currentUserId: Id<"users">;
  session: any;
}

export default function NumberGuess({ sessionId, currentUserId, session }: NumberGuessProps) {
  const updateGameState = useMutation(api.games.updateGameState);
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState<Array<{guess: number, hint: string}>>([]);
  const [secretNumber, setSecretNumber] = useState<number | null>(null);

  useEffect(() => {
    if (session.gameState) {
      try {
        const state = JSON.parse(session.gameState);
        setGuesses(state.guesses || []);
        setSecretNumber(state.secretNumber || null);
      } catch (e) {
        const newSecret = Math.floor(Math.random() * 100) + 1;
        setSecretNumber(newSecret);
      }
    } else {
      const newSecret = Math.floor(Math.random() * 100) + 1;
      setSecretNumber(newSecret);
    }
  }, [session]);

  const handleGuess = async () => {
    if (!guess || session.status !== "in_progress") return;

    const guessNum = parseInt(guess);
    if (isNaN(guessNum) || guessNum < 1 || guessNum > 100) {
      toast.error("Please enter a number between 1 and 100");
      return;
    }

    let hint = "";
    let result: "win" | "loss" | undefined;

    if (secretNumber !== null) {
      if (guessNum === secretNumber) {
        hint = "🎉 Correct!";
        result = guesses.length < 7 ? "win" : "loss";
      } else if (guessNum < secretNumber) {
        hint = "📈 Higher!";
      } else {
        hint = "📉 Lower!";
      }
    }

    const newGuesses = [...guesses, { guess: guessNum, hint }];
    setGuesses(newGuesses);
    setGuess("");

    try {
      await updateGameState({
        sessionId,
        gameState: JSON.stringify({ guesses: newGuesses, secretNumber }),
        result,
      });

      if (result) {
        if (result === "win") {
          toast.success(`You guessed it in ${newGuesses.length} tries! 🎉`);
        } else {
          toast.success(`Correct! But took ${newGuesses.length} tries.`);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit guess");
    }
  };

  return (
    <Card className="max-w-md mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
        <CardTitle className="text-center text-2xl">
          {session.status === "completed" 
            ? session.result === "win" ? "🎉 Victory!" : "✅ Completed!"
            : "🎯 Number Guess"}
        </CardTitle>
        <CardDescription className="text-center text-lg font-medium mt-2">
          Guess a number between <span className="text-primary font-bold">1</span> and <span className="text-primary font-bold">100</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {session.status === "in_progress" && (
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              max="100"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGuess()}
              placeholder="Enter your guess"
            />
            <Button onClick={handleGuess}>Guess</Button>
          </div>
        )}

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {guesses.map((g, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 rounded-lg bg-muted"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">Guess #{index + 1}: {g.guess}</span>
                <span className="text-sm">{g.hint}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}