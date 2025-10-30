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
        const winnerId = winner === "draw" ? undefined : 
          (winner === playerSymbol ? currentUserId : 
            (session.player1Id === currentUserId ? session.player2Id : session.player1Id));
        
        await updateGameState({
          sessionId,
          gameState: JSON.stringify({ board: newBoard }),
          winnerId,
        });
        
        toast.success(winner === "draw" ? "Game ended in a draw!" : 
          winner === playerSymbol ? "You won!" : "You lost!");
      } else {
        await updateGameState({
          sessionId,
          gameState: JSON.stringify({ board: newBoard }),
        });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update game");
      setBoard(board);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {session.status === "completed" 
            ? session.winnerId === currentUserId 
              ? "🎉 You Won!" 
              : session.winnerId 
                ? "😔 You Lost" 
                : "🤝 Draw"
            : isMyTurn 
              ? `Your Turn (${playerSymbol})` 
              : `Opponent's Turn (${opponentSymbol})`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 aspect-square">
          {board.map((cell, index) => (
            <motion.button
              key={index}
              whileHover={!cell && isMyTurn ? { scale: 1.05 } : {}}
              whileTap={!cell && isMyTurn ? { scale: 0.95 } : {}}
              onClick={() => handleCellClick(index)}
              disabled={!isMyTurn || !!cell || session.status !== "in_progress"}
              className={`aspect-square rounded-lg border-2 text-4xl font-bold transition-all ${
                cell 
                  ? "bg-primary/10 border-primary" 
                  : isMyTurn 
                    ? "hover:bg-muted border-muted-foreground/20 cursor-pointer" 
                    : "border-muted-foreground/10 cursor-not-allowed"
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
