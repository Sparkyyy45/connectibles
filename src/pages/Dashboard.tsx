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
import { Progress } from "@/components/ui/progress";
import OnlineAvatar from "@/components/OnlineAvatar";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const matches = useQuery(api.matching.getMatches);
  const connections = useQuery(api.connections.getConnections);
  const events = useQuery(api.events.getAllEvents);
  const profileCompletion = useQuery(api.profiles.getProfileCompletion);
  const recentPosts = useQuery(api.posts.getAllPosts);
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
  const recentCollaborations = recentPosts?.slice(0, 3) || [];
  const pendingRequests = connectionRequests?.length || 0;

  const navigationSections = [
    {
      title: "Discover",
      description: "Find your perfect matches and connect with like-minded people",
      icon: Users,
      path: "/discover",
      gradient: "from-violet-500 via-purple-500 to-fuchsia-600",
      stat: `${matches?.length || 0} matches`,
      delay: 0.1
    },
    {
      title: "Messages",
      description: "Private conversations with your connections",
      icon: MessageCircle,
      path: "/messages",
      gradient: "from-emerald-500 via-teal-500 to-cyan-600",
      stat: "Direct messages",
      delay: 0.2
    },
    {
      title: "Confessional",
      description: "Share your secrets anonymously in a judgment-free zone",
      icon: Lock,
      path: "/chill",
      gradient: "from-slate-700 via-purple-800 to-indigo-900",
      stat: "Anonymous",
      delay: 0.3
    },
    {
      title: "Community Chat",
      description: "Join the conversation and connect with everyone in real-time",
      icon: MessageSquare,
      path: "/gossip",
      gradient: "from-blue-500 via-cyan-500 to-teal-600",
      stat: "Live chat",
      delay: 0.4
    },
    {
      title: "Truth or Dare",
      description: "Play interactive games with your connections",
      icon: Heart,
      path: "/truth-dare",
      gradient: "from-pink-500 via-rose-500 to-red-600",
      stat: "Play now",
      delay: 0.5
    },
    {
      title: "Games",
      description: "Challenge your friends to multiplayer games",
      icon: Gamepad2,
      path: "/games",
      gradient: "from-orange-500 via-amber-500 to-yellow-600",
      stat: "8 games",
      delay: 0.6
    },
    {
      title: "Game Stats",
      description: "Track your performance and achievements",
      icon: Trophy,
      path: "/game-stats",
      gradient: "from-yellow-500 via-orange-500 to-red-600",
      stat: "View stats",
      delay: 0.7
    },
    {
      title: "Events",
      description: "Explore upcoming activities and create your own events",
      icon: Calendar,
      path: "/events",
      gradient: "from-indigo-500 via-blue-500 to-purple-600",
      stat: "Discover events",
      delay: 0.8
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

        {/* Profile Completion Card */}
        {!needsProfile && profileCompletion !== undefined && profileCompletion < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="border-2 border-primary/50 shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <TrendingUp className="h-6 w-6 text-primary" />
                      Profile Completion
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      Complete your profile to unlock better matches
                    </CardDescription>
                  </div>
                  <div className="text-4xl font-bold text-primary">{profileCompletion}%</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={profileCompletion} className="h-3" />
                <Button onClick={() => navigate("/profile")} size="lg" className="w-full shadow-lg hover:shadow-xl transition-all">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Complete Profile
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

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

          {/* Recent Collaborations */}
          {recentCollaborations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="shadow-xl border-2 border-border/50 bg-card/95 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <TrendingUp className="h-6 w-6 text-green-500" />
                      Recent Collaborations
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/posts")}>
                      View All <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                  <CardDescription>Latest project opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {recentCollaborations.map((post, index) => (
                      <motion.div
                        key={post._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25 + index * 0.05 }}
                        className="p-4 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all cursor-pointer bg-gradient-to-br from-background to-muted/20"
                      >
                        <h4 className="font-semibold mb-2">{post.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Navigation Hub */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Explore Connect Minds
            </h2>
            <p className="text-muted-foreground">
              Discover all the amazing features we have to offer
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {navigationSections.map((section) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: section.delay + 0.2 }}
                  whileHover={{ scale: 1.02, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(section.path)}
                  className="group cursor-pointer relative overflow-hidden rounded-3xl h-64"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Animated Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </div>

                  {/* Content */}
                  <div className="relative h-full p-8 flex flex-col justify-between text-white">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1.5 font-semibold">
                          {section.stat}
                        </Badge>
                      </div>
                      
                      <div>
                        <h3 className="text-3xl font-bold mb-2 tracking-tight">
                          {section.title}
                        </h3>
                        <p className="text-white/90 text-sm leading-relaxed">
                          {section.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-4 transition-all duration-300">
                      <span>Explore</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}