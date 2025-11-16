import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Users, Heart, Flame, SkipForward } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import type { Id } from "@/convex/_generated/dataModel";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function TruthDare() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const connections = useQuery(api.connections.getConnections);
  const activeSessions = useQuery(api.truthDare.getActiveSessions);
  const createSession = useMutation(api.truthDare.createSession);
  const makeChoice = useMutation(api.truthDare.makeChoice);
  const completeRound = useMutation(api.truthDare.completeRound);
  const skipRound = useMutation(api.truthDare.skipRound);
  const endSession = useMutation(api.truthDare.endSession);
  const answerTruth = useMutation(api.truthDare.answerTruth);

  const [selectedSession, setSelectedSession] = useState<Id<"truth_dare_sessions"> | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<"truth" | "dare" | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);

  const sessionData = useQuery(
    api.truthDare.getSession,
    selectedSession ? { sessionId: selectedSession } : "skip"
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleStartGame = async (opponentId: Id<"users">) => {
    try {
      const sessionId = await createSession({ opponentId });
      setSelectedSession(sessionId);
      toast.success("Game started! 🎮");
    } catch (error: any) {
      toast.error(error.message || "Failed to start game");
    }
  };

  const handleChoiceClick = (choice: "truth" | "dare") => {
    setSelectedChoice(choice);
    setQuestionText("");
    setShowQuestionDialog(true);
  };

  const handleSubmitQuestion = async () => {
    if (!selectedSession || !selectedChoice || !questionText.trim()) {
      toast.error("Please enter a question or dare");
      return;
    }

    try {
      await makeChoice({ 
        sessionId: selectedSession, 
        choice: selectedChoice,
        question: questionText.trim()
      });
      toast.success(`${selectedChoice === "truth" ? "Truth" : "Dare"} sent!`);
      setShowQuestionDialog(false);
      setSelectedChoice(null);
      setQuestionText("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send question");
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedSession || !answerText.trim()) {
      toast.error("Please enter your answer");
      return;
    }

    try {
      await answerTruth({ 
        sessionId: selectedSession, 
        answer: answerText.trim()
      });
      toast.success("Answer submitted!");
      setAnswerText("");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit answer");
    }
  };

  const handleComplete = async () => {
    if (!selectedSession) return;
    try {
      await completeRound({ sessionId: selectedSession });
      toast.success("Round completed! 🎉");
    } catch (error: any) {
      toast.error(error.message || "Failed to complete round");
    }
  };

  const handleSkip = async () => {
    if (!selectedSession) return;
    try {
      await skipRound({ sessionId: selectedSession });
      toast.success("Skipped! Moving to next turn");
    } catch (error: any) {
      toast.error(error.message || "Failed to skip");
    }
  };

  const handleEndGame = async () => {
    if (!selectedSession) return;
    try {
      await endSession({ sessionId: selectedSession });
      setSelectedSession(null);
      toast.success("Game ended!");
    } catch (error: any) {
      toast.error(error.message || "Failed to end game");
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isMyTurn = sessionData?.currentTurn === user._id;
  const lastRound = sessionData?.rounds[sessionData.rounds.length - 1];
  const waitingForCompletion = lastRound && !lastRound.completed;
  const isQuestionAsker = lastRound?.playerId === user._id;

  return (
    <DashboardLayout>
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              {selectedChoice === "truth" ? (
                <>
                  <Heart className="h-6 w-6 text-blue-500" />
                  Ask a Truth Question
                </>
              ) : (
                <>
                  <Flame className="h-6 w-6 text-red-500" />
                  Give a Dare Challenge
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Write your {selectedChoice === "truth" ? "question" : "dare"} for your opponent
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder={selectedChoice === "truth" ? "What do you want to know?" : "What challenge do you dare them to do?"}
              className="min-h-[150px] text-base resize-none"
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {questionText.length} / 500
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowQuestionDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitQuestion}
                  disabled={!questionText.trim()}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-red-50 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-4">
              <Heart className="h-12 w-12 text-pink-500 animate-pulse" />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-red-600 bg-clip-text text-transparent">
                Truth or Dare
              </h1>
              <Flame className="h-12 w-12 text-red-500 animate-pulse" />
            </div>
            <p className="text-muted-foreground text-lg">
              Play with your connections and discover secrets! 🔥
            </p>
          </motion.div>

          {!selectedSession ? (
            <>
              {/* Active Sessions */}
              {activeSessions && activeSessions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-bold">Active Games</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {activeSessions.map((session: any) => (
                      <Card
                        key={session._id}
                        className="cursor-pointer hover:shadow-lg transition-all border-2 border-pink-200"
                        onClick={() => setSelectedSession(session._id)}
                      >
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={session.opponent?.image} />
                              <AvatarFallback>
                                {session.opponent?.name?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle>{session.opponent?.name || "Anonymous"}</CardTitle>
                              <CardDescription>
                                {session.rounds.length} rounds played
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Start New Game */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-2 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Start New Game
                    </CardTitle>
                    <CardDescription>Choose a connection to play with</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {connections?.map((connection) => {
                        if (!connection) return null;
                        return (
                          <Card
                            key={connection._id}
                            className="cursor-pointer hover:shadow-md transition-all hover:border-pink-300"
                            onClick={() => handleStartGame(connection._id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={connection.image} />
                                  <AvatarFallback>
                                    {connection.name?.charAt(0).toUpperCase() || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold">{connection.name || "Anonymous"}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    {connections?.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No connections yet. Connect with people first!
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </>
          ) : (
            /* Game Session */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Game Header */}
              <Card className="border-2 border-pink-300 bg-gradient-to-br from-pink-50 to-purple-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-4 border-pink-300">
                        <AvatarImage src={sessionData?.player1?.image} />
                        <AvatarFallback>
                          {sessionData?.player1?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-2xl">VS</span>
                      <Avatar className="h-16 w-16 border-4 border-purple-300">
                        <AvatarImage src={sessionData?.player2?.image} />
                        <AvatarFallback>
                          {sessionData?.player2?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <Button variant="outline" onClick={handleEndGame}>
                      End Game
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Current Turn Indicator */}
              <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`flex items-center gap-3 px-6 py-3 rounded-full ${
                        isMyTurn && !waitingForCompletion
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                          : "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700"
                      }`}
                    >
                      <Avatar className="h-10 w-10 border-2 border-white">
                        <AvatarImage src={isMyTurn ? user.image : (sessionData?.player1Id === user._id ? sessionData?.player2?.image : sessionData?.player1?.image)} />
                        <AvatarFallback>
                          {isMyTurn 
                            ? user.name?.charAt(0).toUpperCase() || "U"
                            : (sessionData?.player1Id === user._id ? sessionData?.player2?.name?.charAt(0).toUpperCase() : sessionData?.player1?.name?.charAt(0).toUpperCase()) || "U"
                          }
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-bold text-lg">
                          {isMyTurn && !waitingForCompletion 
                            ? "Your Turn!" 
                            : waitingForCompletion && !isQuestionAsker 
                            ? "Your Challenge!" 
                            : `${sessionData?.player1Id === user._id ? sessionData?.player2?.name : sessionData?.player1?.name}'s Turn`
                          }
                        </p>
                        <p className="text-xs opacity-90">
                          {isMyTurn && !waitingForCompletion 
                            ? "Choose Truth or Dare" 
                            : waitingForCompletion && !isQuestionAsker 
                            ? "Complete or Skip" 
                            : "Waiting for their move..."
                          }
                        </p>
                      </div>
                      {isMyTurn && !waitingForCompletion && (
                        <Sparkles className="h-6 w-6 animate-pulse" />
                      )}
                    </motion.div>
                  </div>
                  <CardTitle className="text-center text-2xl">
                    {isMyTurn && !waitingForCompletion ? "🎯 Make Your Choice" : waitingForCompletion && !isQuestionAsker ? "💪 Time to Respond!" : "⏳ Opponent's Turn"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!waitingForCompletion && isMyTurn && (
                    <div className="flex gap-4 justify-center">
                      <Button
                        size="lg"
                        onClick={() => handleChoiceClick("truth")}
                        className="h-32 w-48 text-2xl bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                      >
                        <Heart className="h-8 w-8 mr-2" />
                        Truth
                      </Button>
                      <Button
                        size="lg"
                        onClick={() => handleChoiceClick("dare")}
                        className="h-32 w-48 text-2xl bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                      >
                        <Flame className="h-8 w-8 mr-2" />
                        Dare
                      </Button>
                    </div>
                  )}

                  {waitingForCompletion && lastRound && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <Card className={`border-2 ${lastRound.choice === "truth" ? "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300" : "bg-gradient-to-br from-red-50 to-pink-50 border-red-300"}`}>
                        <CardContent className="p-8">
                          <Badge className="mb-4" variant={lastRound.choice === "truth" ? "default" : "destructive"}>
                            {lastRound.choice === "truth" ? "Truth" : "Dare"}
                          </Badge>
                          <p className="text-xl text-center font-semibold">{lastRound.question}</p>
                        </CardContent>
                      </Card>
                      {!isQuestionAsker && (
                        <>
                          {lastRound.choice === "truth" ? (
                            <div className="space-y-3">
                              <Textarea
                                value={answerText}
                                onChange={(e) => setAnswerText(e.target.value)}
                                placeholder="Type your answer here..."
                                className="min-h-[120px] text-base resize-none"
                                maxLength={500}
                              />
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                  {answerText.length} / 500
                                </span>
                              </div>
                              <div className="flex gap-3">
                                <Button onClick={handleSubmitAnswer} size="lg" className="flex-1" disabled={!answerText.trim()}>
                                  <Sparkles className="h-5 w-5 mr-2" />
                                  Submit Answer
                                </Button>
                                <Button onClick={handleSkip} size="lg" variant="outline" className="flex-1">
                                  <SkipForward className="h-5 w-5 mr-2" />
                                  Pass
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-3">
                              <Button onClick={handleComplete} size="lg" className="flex-1">
                                <Sparkles className="h-5 w-5 mr-2" />
                                I Did It!
                              </Button>
                              <Button onClick={handleSkip} size="lg" variant="outline" className="flex-1">
                                <SkipForward className="h-5 w-5 mr-2" />
                                Skip
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                      {isQuestionAsker && (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">
                            Waiting for opponent to respond...
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {!isMyTurn && !waitingForCompletion && (
                    <div className="text-center py-12">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-500" />
                      <p className="text-lg text-muted-foreground">
                        Waiting for {sessionData?.player1Id === user._id ? sessionData?.player2?.name : sessionData?.player1?.name} to make their move...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Game History */}
              {sessionData && sessionData.rounds.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Game History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sessionData.rounds.map((round, index) => (
                        <div
                          key={index}
                          className="flex flex-col gap-2 p-4 rounded-lg bg-muted"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant={round.choice === "truth" ? "default" : "destructive"}>
                              {round.choice}
                            </Badge>
                            <p className="flex-1 text-sm font-medium">{round.question}</p>
                            {round.completed && <Badge variant="outline">✓ Done</Badge>}
                          </div>
                          {round.choice === "truth" && round.answer && (
                            <div className="ml-8 pl-4 border-l-2 border-blue-300">
                              <p className="text-sm text-muted-foreground italic">
                                Answer: {round.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}