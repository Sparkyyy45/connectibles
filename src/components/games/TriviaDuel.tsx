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
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Array<{correct: boolean}>>([]);

  useEffect(() => {
    if (session.gameState) {
      try {
        const state = JSON.parse(session.gameState);
        setCurrentQuestion(state.currentQuestion || 0);
        setScore(state.score || 0);
        setAnswers(state.answers || []);
      } catch (e) {
        setCurrentQuestion(0);
      }
    }
  }, [session]);

  const handleAnswer = async (selectedIndex: number) => {
    if (session.status !== "in_progress") return;

    const question = TRIVIA_QUESTIONS[currentQuestion];
    const isCorrect = selectedIndex === question.correct;
    
    const newScore = isCorrect ? score + 1 : score;
    const newAnswers = [...answers, { correct: isCorrect }];
    const nextQuestion = currentQuestion + 1;
    
    setScore(newScore);
    setAnswers(newAnswers);
    setCurrentQuestion(nextQuestion);

    const result = nextQuestion >= TRIVIA_QUESTIONS.length
      ? (newScore >= 4 ? "win" : "loss")
      : undefined;

    try {
      await updateGameState({
        sessionId,
        gameState: JSON.stringify({ 
          currentQuestion: nextQuestion, 
          score: newScore, 
          answers: newAnswers 
        }),
        result,
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
            ? session.result === "win" ? "🎉 You Won!" : "😔 Better luck next time!"
            : `Question ${currentQuestion + 1} of ${TRIVIA_QUESTIONS.length}`}
        </CardTitle>
        <CardDescription className="text-center">
          <div className="text-lg font-semibold mt-2">
            Score: {score} / {TRIVIA_QUESTIONS.length}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {session.status === "in_progress" && currentQuestion < TRIVIA_QUESTIONS.length && (
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
        )}

        {session.status === "completed" && (
          <div className="space-y-2">
            <h3 className="font-bold text-center">Final Score</h3>
            <p className="text-center text-2xl font-bold">{score} / {TRIVIA_QUESTIONS.length}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}