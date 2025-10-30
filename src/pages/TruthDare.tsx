import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Users, Heart, Flame } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import type { Id } from "@/convex/_generated/dataModel";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function TruthDare() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const connections = useQuery(api.connections.getConnections);
  const activeSessions = useQuery(api.truthDare.getActiveSessions);
  const createSession = useMutation(api.truthDare.createSession);
  const makeChoice = useMutation(api.truthDare.makeChoice);
  const completeRound = useMutation(api.truthDare.completeRound);
  const endSession = useMutation(api.truthDare.endSession);

  const [selectedSession, setSelectedSession] = useState<Id<"truth_dare_sessions"> | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      setIsDialogOpen(false);
      toast.success("Game started! 🎮");
    } catch (error: any) {
      toast.error(error.message || "Failed to start game");
    }
  };

  const handleChoice = async (choice: "truth" | "dare") => {
    if (!selectedSession) return;
    try {
      const question = await makeChoice({ sessionId: selectedSession, choice });
      setCurrentQuestion(question);
      toast.success(`${choice === "truth" ? "Truth" : "Dare"} selected!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to make choice");
    }
  };

  const handleComplete = async () => {
    if (!selectedSession) return;
    try {
      await completeRound({ sessionId: selectedSession });
      setCurrentQuestion(null);
      toast.success("Round completed! 🎉");
    } catch (error: any) {
      toast.error(error.message || "Failed to complete round");
    }
  };

  const handleEndGame = async () => {
    if (!selectedSession) return;
    try {
      await endSession({ sessionId: selectedSession });
      setSelectedSession(null);
      setCurrentQuestion(null);
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

  return (
    <DashboardLayout>
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
                      {connections?.map((connection) => (
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
                      ))}
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

              {/* Current Turn */}
              <Card className="border-2 border-purple-300">
                <CardHeader>
                  <CardTitle className="text-center text-2xl">
                    {isMyTurn ? "Your Turn! 🎯" : "Waiting for opponent..."}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!waitingForCompletion && isMyTurn && !currentQuestion && (
                    <div className="flex gap-4 justify-center">
                      <Button
                        size="lg"
                        onClick={() => handleChoice("truth")}
                        className="h-32 w-48 text-2xl bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                      >
                        <Heart className="h-8 w-8 mr-2" />
                        Truth
                      </Button>
                      <Button
                        size="lg"
                        onClick={() => handleChoice("dare")}
                        className="h-32 w-48 text-2xl bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                      >
                        <Flame className="h-8 w-8 mr-2" />
                        Dare
                      </Button>
                    </div>
                  )}

                  {currentQuestion && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-orange-300">
                        <CardContent className="p-8">
                          <p className="text-xl text-center font-semibold">{currentQuestion}</p>
                        </CardContent>
                      </Card>
                      <Button onClick={handleComplete} size="lg" className="w-full">
                        <Sparkles className="h-5 w-5 mr-2" />
                        I Did It!
                      </Button>
                    </motion.div>
                  )}

                  {!isMyTurn && (
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
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted"
                        >
                          <Badge variant={round.choice === "truth" ? "default" : "destructive"}>
                            {round.choice}
                          </Badge>
                          <p className="flex-1 text-sm">{round.question}</p>
                          {round.completed && <Badge variant="outline">✓ Done</Badge>}
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
