import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";

interface WordChainProps {
  sessionId: Id<"game_sessions">;
  currentUserId: Id<"users">;
  session: any;
}

export default function WordChain({ sessionId, currentUserId, session }: WordChainProps) {
  const updateGameState = useMutation(api.games.updateGameState);
  const [word, setWord] = useState("");
  const [chain, setChain] = useState<Array<{player: string, word: string}>>([]);
  const [isMyTurn, setIsMyTurn] = useState(false);

  const playerName = session.player1Id === currentUserId ? "You" : "Opponent";

  useEffect(() => {
    if (session.gameState) {
      try {
        const state = JSON.parse(session.gameState);
        setChain(state.chain || []);
      } catch (e) {
        setChain([]);
      }
    }
    setIsMyTurn(session.currentTurn === currentUserId);
  }, [session, currentUserId]);

  const handleSubmitWord = async () => {
    if (!isMyTurn || !word || session.status !== "in_progress") return;

    const trimmedWord = word.trim().toLowerCase();
    
    if (trimmedWord.length < 2) {
      toast.error("Word must be at least 2 characters long");
      return;
    }

    // Check if word starts with last letter of previous word
    if (chain.length > 0) {
      const lastWord = chain[chain.length - 1].word;
      const lastLetter = lastWord[lastWord.length - 1];
      if (trimmedWord[0] !== lastLetter) {
        toast.error(`Word must start with '${lastLetter.toUpperCase()}'`);
        return;
      }
    }

    // Check if word was already used
    if (chain.some(entry => entry.word === trimmedWord)) {
      toast.error("This word was already used!");
      return;
    }

    const newChain = [...chain, { player: playerName, word: trimmedWord }];
    setChain(newChain);
    setWord("");

    try {
      await updateGameState({
        sessionId,
        gameState: JSON.stringify({ chain: newChain }),
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to submit word");
    }
  };

  const getNextLetter = () => {
    if (chain.length === 0) return "any letter";
    const lastWord = chain[chain.length - 1].word;
    return lastWord[lastWord.length - 1].toUpperCase();
  };

  return (
    <Card className="max-w-md mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
        <CardTitle className="text-center text-2xl">
          {session.status === "completed" 
            ? "🏁 Game Over"
            : isMyTurn 
              ? "📝 Your Turn" 
              : "⏳ Opponent's Turn"}
        </CardTitle>
        <CardDescription className="text-center text-lg font-medium mt-2">
          {chain.length === 0 
            ? "Start with any word!" 
            : (
              <span>
                Next word must start with: <span className="text-3xl font-bold text-primary">{getNextLetter()}</span>
              </span>
            )}
        </CardDescription>
        {session.status === "in_progress" && isMyTurn && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-center mt-2 text-sm text-green-500 font-semibold"
          >
            ● Type your word!
          </motion.div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {session.status === "in_progress" && isMyTurn && (
          <div className="flex gap-2">
            <Input
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmitWord()}
              placeholder="Enter a word"
              className="lowercase"
            />
            <Button onClick={handleSubmitWord}>Submit</Button>
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {chain.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-xl shadow-md ${
                entry.player === "You" 
                  ? "bg-gradient-to-r from-green-500/20 to-green-600/10 border-l-4 border-green-500" 
                  : "bg-gradient-to-r from-blue-500/20 to-blue-600/10 border-l-4 border-blue-500"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{entry.player}</span>
                <span className="text-lg font-bold">{entry.word}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {chain.length === 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Build a chain of words where each word starts with the last letter of the previous word!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
