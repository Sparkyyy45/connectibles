// @ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";

interface TicTacToeProps {
  sessionId: Id<"game_sessions">;
  currentUserId: Id<"users">;
  session: any;
}

type Board = (string | null)[];

export default function TicTacToe({ sessionId, currentUserId, session }: TicTacToeProps) {
  const updateGameState = useMutation(api.games.updateGameState);
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isMyTurn, setIsMyTurn] = useState(false);

  const playerSymbol = session.player1Id === currentUserId ? "X" : "O";
  const opponentSymbol = playerSymbol === "X" ? "O" : "X";

  useEffect(() => {
    if (session.gameState) {
      try {
        const state = JSON.parse(session.gameState);
        setBoard(state.board || Array(9).fill(null));
      } catch (e) {
        setBoard(Array(9).fill(null));
      }
    }
    setIsMyTurn(session.currentTurn === currentUserId);
  }, [session, currentUserId]);

  const checkWinner = (board: Board): string | null => {
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

    return board.every(cell => cell !== null) ? "draw" : null;
  };

  const handleCellClick = async (index: number) => {
    if (!isMyTurn || board[index] || session.status !== "in_progress") return;

    const newBoard = [...board];
    newBoard[index] = playerSymbol;
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    
    try {
      if (winner) {
        let winnerId: Id<"users"> | undefined;
        
        if (winner === "draw") {
          winnerId = undefined;
        } else if (winner === playerSymbol) {
          winnerId = currentUserId;
        } else {
          winnerId = session.player1Id === currentUserId ? session.player2Id : session.player1Id;
        }
        
        await updateGameState({
          sessionId,
          gameState: JSON.stringify({ board: newBoard }),
          winnerId,
        });
        
        if (winner === "draw") {
          toast.success("Game ended in a draw! 🤝");
        } else if (winner === playerSymbol) {
          toast.success("You won! 🎉");
        }
      } else {
        await updateGameState({
          sessionId,
          gameState: JSON.stringify({ board: newBoard }),
        });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update game");
      const prevState = session.gameState ? JSON.parse(session.gameState) : { board: Array(9).fill(null) };
      setBoard(prevState.board || Array(9).fill(null));
    }
  };

  return (
    <Card className="max-w-md mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
        <CardTitle className="text-center text-2xl">
          {session.status === "completed"
            ? session.winnerId === currentUserId
              ? "🎉 You Won!"
              : session.winnerId
                ? "😔 You Lost"
                : "🤝 It's a Draw!"
            : isMyTurn 
              ? `Your Turn (${playerSymbol})` 
              : `Opponent's Turn (${opponentSymbol})`}
        </CardTitle>
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
      <CardContent className="pt-6">
        <div className="grid grid-cols-3 gap-3 aspect-square">
          {board.map((cell, index) => (
            <motion.button
              key={index}
              whileHover={!cell && isMyTurn && session.status === "in_progress" ? { scale: 1.08 } : {}}
              whileTap={!cell && isMyTurn && session.status === "in_progress" ? { scale: 0.92 } : {}}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleCellClick(index)}
              disabled={!isMyTurn || !!cell || session.status !== "in_progress"}
              className={`aspect-square rounded-xl border-2 text-5xl font-bold transition-all shadow-md ${
                cell 
                  ? cell === playerSymbol
                    ? "bg-green-500/20 border-green-500 text-green-600"
                    : "bg-red-500/20 border-red-500 text-red-600"
                  : isMyTurn && session.status === "in_progress"
                    ? "hover:bg-primary/10 hover:border-primary border-muted-foreground/30 cursor-pointer" 
                    : "border-muted-foreground/10 cursor-not-allowed bg-muted/30"
              }`}
            >
              {cell}
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}