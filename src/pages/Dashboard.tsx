import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Calendar, Sparkles, MessageSquare, Lock, MessageCircle, Bell, ArrowRight, Palette, Gamepad2, Trophy, Heart } from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const matches = useQuery(api.matching.getMatches);
  const connections = useQuery(api.connections.getConnections);
  const events = useQuery(api.events.getAllEvents);

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

        {/* Statistics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <Card className="shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-xl transition-all">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm font-medium">Total Connections</CardDescription>
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
              <CardDescription className="text-sm font-medium">Upcoming Events</CardDescription>
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent">
                {events?.length || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Events to explore 📅</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation Hub */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
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
                  transition={{ delay: section.delay + 0.1 }}
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