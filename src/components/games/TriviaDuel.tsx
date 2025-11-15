// @ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";

interface TriviaDuelProps {
  sessionId: Id<"game_sessions">;
  currentUserId: Id<"users">;
  session: any;
}

const TRIVIA_QUESTIONS = [
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correct: 2
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correct: 1
  },
  {
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correct: 1
  },
  {
    question: "Who painted the Mona Lisa?",
    options: ["Van Gogh", "Picasso", "Da Vinci", "Monet"],
    correct: 2
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    correct: 3
  }
];

export default function TriviaDuel({ sessionId, currentUserId, session }: TriviaDuelProps) {
  const updateGameState = useMutation(api.games.updateGameState);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [answers, setAnswers] = useState<Array<{player: string, correct: boolean}>>([]);
  const [isMyTurn, setIsMyTurn] = useState(false);

  useEffect(() => {
    if (session.gameState) {
      try {
        const state = JSON.parse(session.gameState);
        setCurrentQuestion(state.currentQuestion || 0);
        setScores(state.scores || { player1: 0, player2: 0 });
        setAnswers(state.answers || []);
      } catch (e) {
        setCurrentQuestion(0);
      }
    }
    setIsMyTurn(session.currentTurn === currentUserId);
  }, [session, currentUserId]);

  const handleAnswer = async (selectedIndex: number) => {
    if (!isMyTurn || session.status !== "in_progress") return;

    const question = TRIVIA_QUESTIONS[currentQuestion];
    const isCorrect = selectedIndex === question.correct;
    const playerName = session.player1Id === currentUserId ? "You" : "Opponent";
    
    const newScores = { ...scores };
    if (isCorrect) {
      if (session.player1Id === currentUserId) {
        newScores.player1++;
      } else {
        newScores.player2++;
      }
    }

    const newAnswers = [...answers, { player: playerName, correct: isCorrect }];
    const nextQuestion = currentQuestion + 1;
    
    setScores(newScores);
    setAnswers(newAnswers);
    setCurrentQuestion(nextQuestion);

    const winnerId = nextQuestion >= TRIVIA_QUESTIONS.length
      ? (newScores.player1 > newScores.player2 ? session.player1Id : 
         newScores.player2 > newScores.player1 ? session.player2Id : undefined)
      : undefined;

    try {
      await updateGameState({
        sessionId,
        gameState: JSON.stringify({ 
          currentQuestion: nextQuestion, 
          scores: newScores, 
          answers: newAnswers 
        }),
        winnerId,
      });

      if (isCorrect) {
        toast.success("Correct! ✅");
      } else {
        toast.error("Wrong answer ❌");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit answer");
    }
  };

  const question = TRIVIA_QUESTIONS[currentQuestion];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {session.status === "completed" 
            ? session.winnerId === currentUserId 
              ? "🎉 You Won!" 
              : session.winnerId 
                ? "😔 You Lost" 
                : "🤝 It's a Tie!"
            : `Question ${currentQuestion + 1} of ${TRIVIA_QUESTIONS.length}`}
        </CardTitle>
        <CardDescription className="text-center">
          <div className="flex justify-around text-lg font-semibold mt-2">
            <span>Your Score: {session.player1Id === currentUserId ? scores.player1 : scores.player2}</span>
            <span>Opponent: {session.player1Id === currentUserId ? scores.player2 : scores.player1}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {session.status === "in_progress" && currentQuestion < TRIVIA_QUESTIONS.length && (
          <>
            {isMyTurn ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-center">{question.question}</h3>
                <div className="grid gap-3">
                  {question.options.map((option, index) => (
                    <motion.div key={index} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => handleAnswer(index)}
                        variant="outline"
                        className="w-full h-auto py-4 text-lg"
                      >
                        {option}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-lg text-muted-foreground py-8">
                Waiting for opponent to answer...
              </div>
            )}
          </>
        )}

        {session.status === "completed" && (
          <div className="space-y-2">
            <h3 className="font-bold text-center">Game Summary</h3>
            <div className="space-y-1">
              {answers.map((answer, index) => (
                <div key={index} className="flex justify-between p-2 rounded bg-muted">
                  <span>{answer.player}</span>
                  <span>{answer.correct ? "✅" : "❌"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}