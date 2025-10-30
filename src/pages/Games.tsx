import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Gamepad2, Trophy, Zap, Brain, Target } from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

export default function Games() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [ticTacToeBoard, setTicTacToeBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [ticTacToePlayer, setTicTacToePlayer] = useState<"X" | "O">("X");
  const [memoryCards, setMemoryCards] = useState<{ id: number; value: string; flipped: boolean; matched: boolean }[]>([]);
  const [memoryFlipped, setMemoryFlipped] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [reactionStart, setReactionStart] = useState<number | null>(null);
  const [reactionWaiting, setReactionWaiting] = useState(false);
  const [reactionScore, setReactionScore] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    initializeMemoryGame();
  }, []);

  const initializeMemoryGame = () => {
    const emojis = ["🎮", "🎯", "🎨", "🎭", "🎪", "🎸", "🎺", "🎻"];
    const cards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((value, id) => ({ id, value, flipped: false, matched: false }));
    setMemoryCards(cards);
    setMemoryFlipped([]);
    setMemoryMoves(0);
  };

  const handleTicTacToeClick = (index: number) => {
    if (ticTacToeBoard[index] || checkWinner(ticTacToeBoard)) return;
    
    const newBoard = [...ticTacToeBoard];
    newBoard[index] = ticTacToePlayer;
    setTicTacToeBoard(newBoard);
    
    const winner = checkWinner(newBoard);
    if (winner) {
      toast.success(`Player ${winner} wins! 🎉`);
      return;
    }
    
    if (newBoard.every(cell => cell !== null)) {
      toast.info("It's a draw! 🤝");
      return;
    }
    
    setTicTacToePlayer(ticTacToePlayer === "X" ? "O" : "X");
  };

  const checkWinner = (board: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    
    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const resetTicTacToe = () => {
    setTicTacToeBoard(Array(9).fill(null));
    setTicTacToePlayer("X");
  };

  const handleMemoryCardClick = (id: number) => {
    if (memoryFlipped.length === 2 || memoryCards[id].flipped || memoryCards[id].matched) return;
    
    const newFlipped = [...memoryFlipped, id];
    setMemoryFlipped(newFlipped);
    
    const newCards = [...memoryCards];
    newCards[id].flipped = true;
    setMemoryCards(newCards);
    
    if (newFlipped.length === 2) {
      setMemoryMoves(memoryMoves + 1);
      const [first, second] = newFlipped;
      
      if (memoryCards[first].value === memoryCards[second].value) {
        setTimeout(() => {
          const updatedCards = [...memoryCards];
          updatedCards[first].matched = true;
          updatedCards[second].matched = true;
          setMemoryCards(updatedCards);
          setMemoryFlipped([]);
          
          if (updatedCards.every(card => card.matched)) {
            toast.success(`You won in ${memoryMoves + 1} moves! 🎉`);
          }
        }, 500);
      } else {
        setTimeout(() => {
          const updatedCards = [...memoryCards];
          updatedCards[first].flipped = false;
          updatedCards[second].flipped = false;
          setMemoryCards(updatedCards);
          setMemoryFlipped([]);
        }, 1000);
      }
    }
  };

  const startReactionTest = () => {
    setReactionScore(null);
    setReactionWaiting(true);
    const delay = Math.random() * 3000 + 2000;
    
    setTimeout(() => {
      setReactionStart(Date.now());
      setReactionWaiting(false);
    }, delay);
  };

  const handleReactionClick = () => {
    if (reactionWaiting) {
      toast.error("Too early! Wait for the green signal.");
      setReactionWaiting(false);
      return;
    }
    
    if (reactionStart) {
      const time = Date.now() - reactionStart;
      setReactionScore(time);
      setReactionStart(null);
      toast.success(`${time}ms - ${time < 200 ? "Lightning fast!" : time < 300 ? "Great!" : "Good!"}`);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20">
              <Gamepad2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                Games Zone
              </h1>
              <p className="text-muted-foreground text-lg font-medium mt-2">
                Take a break and have some fun!
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tic Tac Toe */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-primary" />
                  <CardTitle>Tic Tac Toe</CardTitle>
                </div>
                <CardDescription>Classic two-player game</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {ticTacToeBoard.map((cell, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-20 text-3xl font-bold"
                      onClick={() => handleTicTacToeClick(index)}
                    >
                      {cell}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Current Player: {ticTacToePlayer}</p>
                  <Button onClick={resetTicTacToe} variant="secondary" size="sm">
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Memory Game */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Brain className="h-6 w-6 text-primary" />
                  <CardTitle>Memory Match</CardTitle>
                </div>
                <CardDescription>Find matching pairs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  {memoryCards.map((card) => (
                    <Button
                      key={card.id}
                      variant={card.matched ? "default" : "outline"}
                      className="h-16 text-2xl"
                      onClick={() => handleMemoryCardClick(card.id)}
                      disabled={card.matched}
                    >
                      {card.flipped || card.matched ? card.value : "?"}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Moves: {memoryMoves}</p>
                  <Button onClick={initializeMemoryGame} variant="secondary" size="sm">
                    New Game
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reaction Time Test */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Zap className="h-6 w-6 text-primary" />
                  <CardTitle>Reaction Test</CardTitle>
                </div>
                <CardDescription>Test your reflexes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant={reactionStart ? "default" : reactionWaiting ? "secondary" : "outline"}
                  className={`w-full h-40 text-xl font-bold transition-all ${
                    reactionStart ? "bg-green-500 hover:bg-green-600" : ""
                  }`}
                  onClick={reactionStart ? handleReactionClick : startReactionTest}
                  disabled={reactionWaiting}
                >
                  {reactionWaiting
                    ? "Wait..."
                    : reactionStart
                    ? "CLICK NOW!"
                    : "Start Test"}
                </Button>
                {reactionScore !== null && (
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <p className="text-2xl font-bold">{reactionScore}ms</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {reactionScore < 200
                        ? "⚡ Lightning fast!"
                        : reactionScore < 300
                        ? "🎯 Great reflexes!"
                        : "👍 Good job!"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
