// @ts-nocheck
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Gamepad2, Users, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import type { Id } from "@/convex/_generated/dataModel";
import OnlineAvatar from "@/components/OnlineAvatar";
import TicTacToe from "@/components/games/TicTacToe";
import MemoryMatch from "@/components/games/MemoryMatch";
import ReactionTest from "@/components/games/ReactionTest";
import NumberGuess from "@/components/games/NumberGuess";
import WordChain from "@/components/games/WordChain";
import QuickDraw from "@/components/games/QuickDraw";
import TriviaDuel from "@/components/games/TriviaDuel";
import EmojiMatch from "@/components/games/EmojiMatch";

type GameType = "tic_tac_toe" | "memory_match" | "reaction_test" | "word_chain" | "quick_draw" | "trivia_duel" | "number_guess" | "emoji_match";

export default function Games() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const connections = useQuery(api.connections.getConnections);
  const gameInvitations = useQuery(api.games.getGameInvitations);
  const activeSessions = useQuery(api.games.getActiveSessions);
  const sendInvitation = useMutation(api.games.sendGameInvitation);
  const acceptInvitation = useMutation(api.games.acceptGameInvitation);

  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [showConnectionSelect, setShowConnectionSelect] = useState(false);
  const [viewingSession, setViewingSession] = useState<Id<"game_sessions"> | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const games = [
    {
      type: "tic_tac_toe" as GameType,
      name: "Tic Tac Toe",
      description: "Classic 3x3 grid game",
      icon: "🎯",
    },
    {
      type: "memory_match" as GameType,
      name: "Memory Match",
      description: "Find matching pairs",
      icon: "🧠",
    },
    {
      type: "reaction_test" as GameType,
      name: "Reaction Test",
      description: "Test your reflexes",
      icon: "⚡",
    },
    {
      type: "word_chain" as GameType,
      name: "Word Chain",
      description: "Build words from last letter",
      icon: "📝",
    },
    {
      type: "quick_draw" as GameType,
      name: "Quick Draw",
      description: "Draw and guess together",
      icon: "🎨",
    },
    {
      type: "trivia_duel" as GameType,
      name: "Trivia Duel",
      description: "Battle of knowledge",
      icon: "🧩",
    },
    {
      type: "number_guess" as GameType,
      name: "Number Guess",
      description: "Guess the secret number",
      icon: "🔢",
    },
    {
      type: "emoji_match" as GameType,
      name: "Emoji Match",
      description: "Match emoji expressions",
      icon: "😊",
    },
  ];

  const handleGameSelect = (gameType: GameType) => {
    setSelectedGame(gameType);
    setShowConnectionSelect(true);
  };

  const handleInvitePlayer = async (connectionId: Id<"users">) => {
    if (!selectedGame) return;

    try {
      await sendInvitation({
        receiverId: connectionId,
        gameType: selectedGame,
      });
      toast.success("Game invitation sent!");
      setShowConnectionSelect(false);
      setSelectedGame(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to send invitation");
    }
  };

  const handleAcceptInvitation = async (invitationId: Id<"game_invitations">) => {
    try {
      await acceptInvitation({ invitationId });
      toast.success("Game started!");
    } catch (error: any) {
      toast.error(error.message || "Failed to accept invitation");
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
    if (!session) {
      setViewingSession(null);
      return null;
    }

    // Prevent leaving if game is still in progress
    const handleBackClick = () => {
      if (session.status === "in_progress") {
        toast.error("You cannot leave an active game! Finish the game first.");
        return;
      }
      setViewingSession(null);
    };

    // Map game type to component
    const GameComponent = (() => {
      switch (session.gameType) {
        case "tic_tac_toe":
          return TicTacToe;
        case "memory_match":
          return MemoryMatch;
        case "reaction_test":
          return ReactionTest;
        case "number_guess":
          return NumberGuess;
        case "word_chain":
          return WordChain;
        case "quick_draw":
          return QuickDraw;
        case "trivia_duel":
          return TriviaDuel;
        case "emoji_match":
          return EmojiMatch;
        default:
          return null;
      }
    })();

    const opponent = session.player1Id === user._id ? session.player2 : session.player1;
    const isWinner = session.winnerId === user._id;
    const isCompleted = session.status === "completed";

    // Safety check: if opponent data is missing, show loading or skip
    if (!opponent) {
      return (
        <DashboardLayout>
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DashboardLayout>
      );
    }

    return (
      <DashboardLayout>
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={handleBackClick}
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

          {/* Winner Display */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6"
            >
              <Card className={`border-4 ${isWinner ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}>
                <CardHeader className="text-center">
                  <CardTitle className="text-4xl mb-4">
                    {isWinner ? "🎉 Victory!" : "😔 Defeat"}
                  </CardTitle>
                  <CardDescription className="text-xl">
                    {isWinner 
                      ? `You defeated ${opponent.name || "your opponent"}!` 
                      : `${opponent.name || "Your opponent"} won this round!`
                    }
                  </CardDescription>
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <OnlineAvatar
                      userId={user._id}
                      image={user.image}
                      name={user.name}
                      className="h-16 w-16 border-4 border-white"
                    />
                    <span className="text-3xl">{isWinner ? ">" : "<"}</span>
                    <OnlineAvatar
                      userId={opponent._id}
                      image={opponent.image}
                      name={opponent.name}
                      className="h-16 w-16 border-4 border-white"
                    />
                  </div>
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

  if (showConnectionSelect) {
    return (
      <DashboardLayout>
        <div className="p-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Select Player</h1>
                <p className="text-muted-foreground text-lg mt-2">
                  Choose a connection to play {selectedGame?.replace("_", " ")} with
                </p>
              </div>
              <Button variant="outline" onClick={() => setShowConnectionSelect(false)}>
                Back
              </Button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections?.map((connection, index) => (
              <motion.div
                key={connection._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <OnlineAvatar
                        userId={connection._id}
                        image={connection.image}
                        name={connection.name}
                        className="h-12 w-12"
                      />
                      <div>
                        <CardTitle className="text-lg">{connection.name || "Anonymous"}</CardTitle>
                        <CardDescription>{connection.email}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      onClick={() => handleInvitePlayer(connection._id)}
                    >
                      Invite to Play
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {connections?.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>No Connections Yet</CardTitle>
                <CardDescription>
                  Connect with other users first to play games together!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/discover")}>Find Connections</Button>
              </CardContent>
            </Card>
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
                Multiplayer Games
              </h1>
              <p className="text-muted-foreground text-lg font-medium mt-2">
                Challenge your connections to fun games!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Game Invitations */}
        {gameInvitations && gameInvitations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Game Invitations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {gameInvitations.map((invitation) => (
                  <div
                    key={invitation._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <OnlineAvatar
                        userId={invitation.senderId}
                        image={invitation.sender?.image}
                        name={invitation.sender?.name}
                        className="h-10 w-10"
                      />
                      <div>
                        <p className="font-medium">
                          {invitation.sender?.name || "Someone"} invited you to play
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {invitation.gameType.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => handleAcceptInvitation(invitation._id)}>
                      Accept
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Active Sessions */}
        {activeSessions && activeSessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Active Games</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeSessions.map((session) => {
                  const opponent =
                    session.player1Id === user._id ? session.player2 : session.player1;
                  
                  // Skip rendering if opponent data is missing
                  if (!opponent) return null;

                  return (
                    <div
                      key={session._id}
                      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setViewingSession(session._id)}
                    >
                      <div className="flex items-center gap-3">
                        <OnlineAvatar
                          userId={opponent._id}
                          image={opponent.image}
                          name={opponent.name}
                          className="h-10 w-10"
                        />
                        <div>
                          <p className="font-medium">
                            Playing with {opponent.name || "Someone"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {session.gameType.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <Badge>
                        {session.currentTurn === user._id ? "Your Turn" : "Their Turn"}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Game Selection */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Choose a Game</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {games.map((game, index) => (
              <motion.div
                key={game.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
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
                      onClick={() => handleGameSelect(game.type)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Play with Connection
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