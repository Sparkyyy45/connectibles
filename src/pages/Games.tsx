import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Gamepad2, Trophy, Zap, Target, Flame } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import type { Id } from "@/convex/_generated/dataModel";
import TicTacToe from "@/components/games/TicTacToe";
import ReactionTest from "@/components/games/ReactionTest";
import GlowHockey from "@/components/games/GlowHockeyGame";

type GameType = "tic_tac_toe" | "reaction_test" | "glow_hockey";

export default function Games() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const startGame = useMutation(api.games.startGame);

  const [viewingSession, setViewingSession] = useState<Id<"game_sessions"> | null>(null);
  
  // Only fetch the specific session when viewing it
  const activeSessions = useQuery(
    api.games.getActiveSessions,
    viewingSession ? {} : "skip"
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const games = [
    {
      type: "tic_tac_toe" as GameType,
      name: "Tic Tac Toe",
      description: "Classic 3x3 grid game vs AI",
      icon: "🎯",
    },
    {
      type: "reaction_test" as GameType,
      name: "Reaction Test",
      description: "Test your reflexes",
      icon: "⚡",
    },
    {
      type: "glow_hockey" as GameType,
      name: "Glow Hockey",
      description: "Neon air hockey vs AI",
      icon: "🏒",
    },
  ];

  const handleStartGame = async (gameType: GameType) => {
    try {
      const sessionId = await startGame({ 
        gameType,
        difficulty: gameType === "tic_tac_toe" ? "hard" : undefined
      });
      setViewingSession(sessionId);
      toast.success("Game started!");
    } catch (error: any) {
      toast.error(error.message || "Failed to start game");
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (viewingSession) {
    const session = activeSessions?.find(s => s._id === viewingSession);
    if (!session && activeSessions !== undefined) {
      setViewingSession(null);
      return null;
    }
    
    if (!session) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    // Map game type to component
    const GameComponent = (() => {
      switch (session.gameType) {
        case "tic_tac_toe":
          return TicTacToe;
        case "reaction_test":
          return ReactionTest;
        case "glow_hockey":
          return GlowHockey;
        default:
          return null;
      }
    })();

    const isCompleted = session.status === "completed";
    const result = session.result;

    return (
      <DashboardLayout>
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setViewingSession(null)}
                disabled={session.status === "in_progress"}
              >
                ← {session.status === "in_progress" ? "Game in Progress" : "Back to Games"}
              </Button>
              <h1 className="text-3xl font-bold">
                {session.gameType.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
              </h1>
            </div>
            {session.status === "in_progress" && (
              <Badge variant="destructive" className="text-lg px-4 py-2">
                🔒 Game Locked
              </Badge>
            )}
          </div>

          {/* Result Display */}
          {isCompleted && result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6"
            >
              <Card className={`border-4 ${
                result === "win" ? "border-green-500 bg-green-50" : 
                result === "loss" ? "border-red-500 bg-red-50" : 
                "border-yellow-500 bg-yellow-50"
              }`}>
                <CardHeader className="text-center">
                  <CardTitle className="text-4xl mb-4">
                    {result === "win" ? "🎉 Victory!" : result === "loss" ? "😔 Defeat" : "🤝 Draw"}
                  </CardTitle>
                  <CardDescription className="text-xl">
                    {result === "win" ? "You beat the AI!" : 
                     result === "loss" ? "The AI won this round!" : 
                     "It's a tie!"}
                  </CardDescription>
                  <Button 
                    onClick={() => setViewingSession(null)} 
                    className="mt-6"
                    size="lg"
                  >
                    Return to Games
                  </Button>
                </CardHeader>
              </Card>
            </motion.div>
          )}

          {GameComponent && (
            <GameComponent
              sessionId={session._id}
              currentUserId={user._id}
              session={session}
            />
          )}
        </div>
      </DashboardLayout>
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
                Singleplayer Games
              </h1>
              <p className="text-muted-foreground text-lg font-medium mt-2">
                Challenge yourself against AI opponents!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Game Selection */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Choose a Game</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {games.map((game, index) => (
              <motion.div
                key={game.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-xl transition-all cursor-pointer group">
                  <CardHeader>
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                      {game.icon}
                    </div>
                    <CardTitle>{game.name}</CardTitle>
                    <CardDescription>{game.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      onClick={() => handleStartGame(game.type)}
                    >
                      <Gamepad2 className="h-4 w-4 mr-2" />
                      Play Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}