import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trophy, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GameStats() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const userStats = useQuery(api.gameStats.getUserGameStats, {});
  const overallLeaderboard = useQuery(api.gameStats.getOverallLeaderboard, { limit: 10 });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const gameNames: Record<string, string> = {
    tic_tac_toe: "Tic Tac Toe",
    memory_match: "Memory Match",
    reaction_test: "Reaction Test",
    word_chain: "Word Chain",
    quick_draw: "Quick Draw",
    trivia_duel: "Trivia Duel",
    number_guess: "Number Guess",
    emoji_match: "Emoji Match",
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                Game Statistics
              </h1>
              <p className="text-muted-foreground text-lg font-medium mt-2">
                Track your performance and compete with others!
              </p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="mystats" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="mystats">My Stats</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="mystats" className="space-y-6">
            {/* Overall Stats */}
            {userStats?.overall && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-primary/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Overall Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary">{userStats.overall.totalGames}</p>
                        <p className="text-sm text-muted-foreground">Total Games</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-500">{userStats.overall.wins}</p>
                        <p className="text-sm text-muted-foreground">Wins</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-red-500">{userStats.overall.losses}</p>
                        <p className="text-sm text-muted-foreground">Losses</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-yellow-500">{userStats.overall.draws}</p>
                        <p className="text-sm text-muted-foreground">Draws</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-blue-500">{userStats.overall.winRate}%</p>
                        <p className="text-sm text-muted-foreground">Win Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Stats by Game */}
            <div className="grid md:grid-cols-2 gap-6">
              {userStats?.byGame.map((stat, index) => (
                <motion.div
                  key={stat._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{gameNames[stat.gameType]}</CardTitle>
                      <CardDescription>
                        {stat.totalGames} game{stat.totalGames !== 1 ? "s" : ""} played
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <p className="text-xl font-bold text-green-500">{stat.wins}</p>
                          <p className="text-xs text-muted-foreground">Wins</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-red-500">{stat.losses}</p>
                          <p className="text-xs text-muted-foreground">Losses</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-yellow-500">{stat.draws}</p>
                          <p className="text-xs text-muted-foreground">Draws</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-blue-500">
                            {Math.round((stat.wins / stat.totalGames) * 100)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Win Rate</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {(!userStats?.byGame || userStats.byGame.length === 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>No Games Played Yet</CardTitle>
                  <CardDescription>
                    Start playing games to see your statistics here!
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Top Players
                  </CardTitle>
                  <CardDescription>Overall leaderboard across all games</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {overallLeaderboard?.map((entry, index) => (
                      <motion.div
                        key={entry.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Badge
                            variant={index === 0 ? "default" : "outline"}
                            className={`w-8 h-8 flex items-center justify-center ${
                              index === 0
                                ? "bg-yellow-500 text-white"
                                : index === 1
                                ? "bg-gray-400 text-white"
                                : index === 2
                                ? "bg-orange-600 text-white"
                                : ""
                            }`}
                          >
                            {index + 1}
                          </Badge>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={entry.user?.image} />
                            <AvatarFallback>
                              {entry.user?.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{entry.user?.name || "Anonymous"}</p>
                            <p className="text-sm text-muted-foreground">
                              {entry.totalGames} games played
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-500">{entry.wins}</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round(entry.winRate)}% win rate
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {(!overallLeaderboard || overallLeaderboard.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No leaderboard data yet. Be the first to play!
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
