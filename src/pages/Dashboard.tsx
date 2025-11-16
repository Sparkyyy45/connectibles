import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Calendar, Sparkles, MessageSquare, Lock, MessageCircle, Bell, ArrowRight, Gamepad2, Trophy, Heart, TrendingUp, Zap, Star } from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import OnlineAvatar from "@/components/OnlineAvatar";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const matches = useQuery(api.matching.getMatches);
  const connections = useQuery(api.connections.getConnections);
  const events = useQuery(api.events.getAllEvents);
  const connectionRequests = useQuery(api.connections.getConnectionRequests);

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

  const needsProfile = !user.interests || user.interests.length === 0;
  const upcomingEvents = events?.slice(0, 3) || [];
  const topMatches = matches?.slice(0, 3) || [];
  const pendingRequests = connectionRequests?.length || 0;

  const quickActions = [
    {
      title: "🎮 Play Games",
      description: "Challenge yourself with fun games",
      path: "/games",
      gradient: "from-orange-400 to-pink-500",
      icon: Gamepad2
    },
    {
      title: "💬 Start Chatting",
      description: "Join the community conversation",
      path: "/gossip",
      gradient: "from-blue-400 to-cyan-500",
      icon: MessageSquare
    },
    {
      title: "🎯 Truth or Dare",
      description: "Play with your connections",
      path: "/truth-dare",
      gradient: "from-pink-400 to-rose-500",
      icon: Heart
    },
    {
      title: "🤫 Confess Anonymously",
      description: "Share your secrets safely",
      path: "/chill",
      gradient: "from-purple-400 to-indigo-500",
      icon: Lock
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-8 space-y-12 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                Welcome back, {user.name || "there"}!
              </h1>
              <p className="text-muted-foreground text-lg font-medium mt-2">
                Your hub for connections, collaborations, and community ✨
              </p>
            </div>
          </div>
        </motion.div>

        {/* Profile Setup Alert */}
        {needsProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="border-2 border-primary/50 shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Bell className="h-6 w-6 text-primary" />
                  Complete Your Profile
                </CardTitle>
                <CardDescription className="text-base">
                  Add your interests and skills to unlock the full potential of Connect Minds 🚀
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/profile")} size="lg" className="shadow-lg hover:shadow-xl transition-all">
                  Set Up Profile
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-xl transition-all">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Connections
              </CardDescription>
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
                {connections?.length || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">People you're connected with 🤝</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-xl transition-all">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Matches
              </CardDescription>
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent">
                {matches?.length || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Potential connections ✨</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-xl transition-all">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Events
              </CardDescription>
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent">
                {events?.length || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Upcoming activities 📅</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-xl transition-all">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm font-medium flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Requests
              </CardDescription>
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                {pendingRequests}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Pending connections 🔔</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions - Fun Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="space-y-4"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Quick Actions
            </h2>
            <p className="text-muted-foreground">Jump right into the fun!</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.path}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(action.path)}
                  className="cursor-pointer"
                >
                  <Card className={`h-full border-2 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br ${action.gradient} text-white overflow-hidden relative group`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                    </div>
                    <CardContent className="p-6 relative flex flex-col items-center text-center space-y-3">
                      <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
                        <Icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold">{action.title}</h3>
                      <p className="text-sm text-white/90">{action.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Dynamic Content Sections */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Matches Preview */}
          {topMatches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="shadow-xl border-2 border-border/50 bg-card/95 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <Star className="h-6 w-6 text-yellow-500" />
                      Top Matches
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/discover")}>
                      View All <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                  <CardDescription>People you might connect with</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topMatches.map((match, index) => (
                    <motion.div
                      key={match.user._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all cursor-pointer"
                      onClick={() => navigate("/discover")}
                    >
                      <OnlineAvatar
                        userId={match.user._id}
                        image={match.user.image}
                        name={match.user.name}
                        className="h-12 w-12 border-2 border-primary/30"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{match.user.name || "Anonymous"}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          {match.score}% match
                        </p>
                      </div>
                      <Badge variant="secondary">{match.sharedInterests?.length || 0} shared</Badge>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Upcoming Events Preview */}
          {upcomingEvents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="shadow-xl border-2 border-border/50 bg-card/95 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <Zap className="h-6 w-6 text-blue-500" />
                      Upcoming Events
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/events")}>
                      View All <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                  <CardDescription>Don't miss out on these activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className="p-4 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all cursor-pointer bg-gradient-to-br from-background to-muted/20"
                      onClick={() => navigate("/events")}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-lg">{event.title}</h4>
                        <Badge variant="outline" className="ml-2">
                          {event.interestedUsers?.length || 0} interested
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                      {event.eventDate && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.eventDate).toLocaleDateString()}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}