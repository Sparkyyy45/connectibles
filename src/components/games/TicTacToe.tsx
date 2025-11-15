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

  const playerSymbol = "X";
  const aiSymbol = "O";

  useEffect(() => {
    if (session.gameState) {
      try {
        const state = JSON.parse(session.gameState);
        setBoard(state.board || Array(9).fill(null));
      } catch (e) {
        setBoard(Array(9).fill(null));
      }
    }
  }, [session]);

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

  const makeAIMove = (currentBoard: Board): number => {
    const emptyCells = currentBoard.map((cell, idx) => cell === null ? idx : -1).filter(idx => idx !== -1);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  };

  const handleCellClick = async (index: number) => {
    if (board[index] || session.status !== "in_progress") return;

    const newBoard = [...board];
    newBoard[index] = playerSymbol;
    setBoard(newBoard);

    let winner = checkWinner(newBoard);
    
    if (!winner) {
      // AI makes a move
      const aiMove = makeAIMove(newBoard);
      if (aiMove !== undefined) {
        newBoard[aiMove] = aiSymbol;
        setBoard(newBoard);
        winner = checkWinner(newBoard);
      }
    }

    try {
      let result: "win" | "loss" | "draw" | undefined;
      
      if (winner === "draw") {
        result = "draw";
        toast.success("Game ended in a draw! 🤝");
      } else if (winner === playerSymbol) {
        result = "win";
        toast.success("You won! 🎉");
      } else if (winner === aiSymbol) {
        result = "loss";
        toast.error("AI won this round!");
      }
      
      await updateGameState({
        sessionId,
        gameState: JSON.stringify({ board: newBoard }),
        result,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to update game");
      const prevState = session.gameState ? JSON.parse(session.gameState) : { board: Array(9).fill(null) };
      setBoard(prevState.board || Array(9).fill(null));
    }
  };

  if (session.status === "completed") {
    return null;
  }

  return (
    <Card className="max-w-md mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
        <CardTitle className="text-center text-2xl">
          Your Turn ({playerSymbol})
        </CardTitle>
        <div className="text-center mt-2">
          <span className="text-green-500 font-semibold">● Playing vs AI</span>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-3 gap-3 aspect-square">
          {board.map((cell, index) => (
            <motion.button
              key={index}
              whileHover={!cell ? { scale: 1.08 } : {}}
              whileTap={!cell ? { scale: 0.92 } : {}}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleCellClick(index)}
              disabled={!!cell}
              className={`aspect-square rounded-xl border-2 text-5xl font-bold transition-all shadow-md ${
                cell 
                  ? cell === playerSymbol
                    ? "bg-green-500/20 border-green-500 text-green-600"
                    : "bg-red-500/20 border-red-500 text-red-600"
                  : "hover:bg-primary/10 hover:border-primary border-muted-foreground/30 cursor-pointer"
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