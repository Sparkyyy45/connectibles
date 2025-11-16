import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Calendar, Sparkles, Bell, ArrowRight, Gamepad2, MessageSquare, Heart, Lock, Star, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import OnlineAvatar from "@/components/OnlineAvatar";

const motivationalQuotes = [
  { text: "Connect, collaborate, and create amazing things! 🚀", emoji: "🚀" },
  { text: "Your next great connection is just a click away! ✨", emoji: "✨" },
  { text: "Every connection is a new opportunity! 🌟", emoji: "🌟" },
  { text: "Build your network, build your future! 💪", emoji: "💪" },
  { text: "Great minds think together! 🧠", emoji: "🧠" },
  { text: "Today's connections are tomorrow's collaborations! 🤝", emoji: "🤝" },
  { text: "Your community is growing stronger every day! 🌱", emoji: "🌱" },
  { text: "Make meaningful connections that matter! 💫", emoji: "💫" }
];

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const matches = useQuery(api.matching.getMatches);
  const connections = useQuery(api.connections.getConnections);
  const events = useQuery(api.events.getAllEvents);
  const connectionRequests = useQuery(api.connections.getConnectionRequests);

  const [currentQuote, setCurrentQuote] = useState(0);
  const [showQuote, setShowQuote] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowQuote(false);
      setTimeout(() => {
        setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
        setShowQuote(true);
      }, 500);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/10 to-primary/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5">
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 lg:space-y-12 max-w-7xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <motion.div 
                className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </motion.div>
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                  Welcome back, {user.name || "there"}!
                </h1>
                <p className="text-muted-foreground text-base sm:text-lg font-medium">
                  Your hub for connections, collaborations, and community ✨
                </p>
              </div>
            </div>
          </motion.div>

          {/* Fun Interactive Quote Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-primary/30 shadow-xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10 backdrop-blur-sm overflow-hidden relative group cursor-pointer"
              onClick={() => {
                setShowQuote(false);
                setTimeout(() => {
                  setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
                  setShowQuote(true);
                }, 300);
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full opacity-50" />
              <CardContent className="p-6 sm:p-8 relative">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="text-xs font-semibold">
                    💡 Daily Inspiration
                  </Badge>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Sparkles className="h-5 w-5 text-primary" />
                  </motion.div>
                </div>
                <AnimatePresence mode="wait">
                  {showQuote && (
                    <motion.div
                      key={currentQuote}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="flex items-center gap-4"
                    >
                      <motion.span 
                        className="text-4xl sm:text-5xl"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                      >
                        {motivationalQuotes[currentQuote].emoji}
                      </motion.span>
                      <p className="text-lg sm:text-xl font-semibold text-foreground leading-relaxed">
                        {motivationalQuotes[currentQuote].text}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <p className="text-xs text-muted-foreground mt-4 text-center sm:text-right">
                  Click for another quote ✨
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Profile Setup Alert */}
          {needsProfile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
            >
              <Card className="border-2 border-primary/50 shadow-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-transparent pointer-events-none" />
                <CardHeader className="relative">
                  <CardTitle className="text-xl sm:text-2xl flex items-center gap-3">
                    <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    Complete Your Profile
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Add your interests and skills to unlock the full potential of Connect Minds 🚀
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <Button 
                    onClick={() => navigate("/profile")} 
                    size="lg" 
                    className="shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                  >
                    Set Up Profile
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Stats Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
          >
            <motion.div variants={itemVariants}>
              <Card className="shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-xl hover:border-primary/30 transition-all group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-2 sm:pb-3 relative">
                  <CardDescription className="text-xs sm:text-sm font-medium flex items-center gap-2">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    Connections
                  </CardDescription>
                  <CardTitle className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
                    {connections?.length || 0}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-xs sm:text-sm text-muted-foreground">People you're connected with 🤝</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-xl hover:border-primary/30 transition-all group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-2 sm:pb-3 relative">
                  <CardDescription className="text-xs sm:text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                    Matches
                  </CardDescription>
                  <CardTitle className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent">
                    {matches?.length || 0}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-xs sm:text-sm text-muted-foreground">Potential connections ✨</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-xl hover:border-primary/30 transition-all group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-2 sm:pb-3 relative">
                  <CardDescription className="text-xs sm:text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    Events
                  </CardDescription>
                  <CardTitle className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent">
                    {events?.length || 0}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-xs sm:text-sm text-muted-foreground">Upcoming activities 📅</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-xl hover:border-primary/30 transition-all group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-2 sm:pb-3 relative">
                  <CardDescription className="text-xs sm:text-sm font-medium flex items-center gap-2">
                    <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                    Requests
                  </CardDescription>
                  <CardTitle className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                    {pendingRequests}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-xs sm:text-sm text-muted-foreground">Pending connections 🔔</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Quick Actions - Fun Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Quick Actions
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">Jump right into the fun!</p>
            </div>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
            >
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.path}
                    variants={itemVariants}
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
                      <CardContent className="p-4 sm:p-6 relative flex flex-col items-center text-center space-y-2 sm:space-y-3">
                        <div className="p-2 sm:p-3 rounded-full bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
                          <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                        </div>
                        <h3 className="text-base sm:text-xl font-bold">{action.title}</h3>
                        <p className="text-xs sm:text-sm text-white/90 hidden sm:block">{action.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Dynamic Content Sections */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-2 gap-6 lg:gap-8"
          >
            {/* Top Matches Preview */}
            {topMatches.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="shadow-xl border-2 border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-2xl transition-all h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl sm:text-2xl flex items-center gap-3">
                        <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                        Top Matches
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => navigate("/discover")} className="hover:bg-primary/10">
                        View All <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                    <CardDescription>People you might connect with</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    {topMatches.map((match, index) => (
                      <motion.div
                        key={match.user._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all cursor-pointer group"
                        onClick={() => navigate("/discover")}
                        whileHover={{ x: 5 }}
                      >
                        <OnlineAvatar
                          userId={match.user._id}
                          image={match.user.image}
                          name={match.user.name}
                          className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-primary/30 group-hover:border-primary/50 transition-colors"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm sm:text-base truncate">{match.user.name || "Anonymous"}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            {match.score}% match
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">{match.sharedInterests?.length || 0} shared</Badge>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Upcoming Events Preview */}
            {upcomingEvents.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="shadow-xl border-2 border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-2xl transition-all h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl sm:text-2xl flex items-center gap-3">
                        <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                        Upcoming Events
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => navigate("/events")} className="hover:bg-primary/10">
                        View All <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                    <CardDescription>Don't miss out on these activities</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    {upcomingEvents.map((event, index) => (
                      <motion.div
                        key={event._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        className="p-3 sm:p-4 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all cursor-pointer bg-gradient-to-br from-background to-muted/20 group"
                        onClick={() => navigate("/events")}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm sm:text-lg line-clamp-1">{event.title}</h4>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {event.interestedUsers?.length || 0} interested
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{event.description}</p>
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
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}