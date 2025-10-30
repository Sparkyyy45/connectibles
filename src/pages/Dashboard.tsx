import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Calendar, Sparkles, MessageSquare, Palette, MessageCircle, Bell, ArrowRight } from "lucide-react";
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
      title: "Canvas",
      description: "Collaborate on a shared visual space with images and creativity",
      icon: Palette,
      path: "/chill",
      gradient: "from-pink-500 via-rose-500 to-red-600",
      stat: "Create together",
      delay: 0.2
    },
    {
      title: "Community Chat",
      description: "Join the conversation and connect with everyone in real-time",
      icon: MessageSquare,
      path: "/gossip",
      gradient: "from-blue-500 via-cyan-500 to-teal-600",
      stat: "Live chat",
      delay: 0.3
    },
    {
      title: "Messages",
      description: "Private conversations with your connections",
      icon: MessageCircle,
      path: "/messages",
      gradient: "from-emerald-500 via-teal-500 to-cyan-600",
      stat: "Direct messages",
      delay: 0.4
    },
    {
      title: "Events",
      description: "Explore upcoming activities and create your own events",
      icon: Calendar,
      path: "/events",
      gradient: "from-indigo-500 via-blue-500 to-purple-600",
      stat: "Discover events",
      delay: 0.5
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-8 space-y-12 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-6">
            <motion.div 
              className="p-5 rounded-3xl bg-gradient-to-br from-primary/20 via-purple-500/15 to-primary/10 backdrop-blur-sm shadow-lg"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-10 w-10 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Welcome back, {user.name || "there"}!
              </h1>
              <p className="text-muted-foreground text-xl font-medium mt-3">
                Your hub for connections, collaborations, and community ✨
              </p>
            </div>
          </div>
        </motion.div>

        {/* Profile Setup Alert */}
        {needsProfile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="border-2 border-primary/60 shadow-2xl bg-gradient-to-br from-primary/10 via-purple-500/5 to-pink-500/10 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5 animate-pulse" />
              <CardHeader className="relative">
                <CardTitle className="text-3xl flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Bell className="h-7 w-7 text-primary" />
                  </motion.div>
                  Complete Your Profile
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  Add your interests and skills to unlock the full potential of Connect Minds 🚀
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Button 
                  onClick={() => navigate("/profile")} 
                  size="lg" 
                  className="shadow-xl hover:shadow-2xl transition-all text-lg px-8 py-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
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
          className="grid md:grid-cols-2 gap-8"
        >
          <motion.div whileHover={{ scale: 1.03, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="shadow-2xl border-2 border-violet-200/50 bg-gradient-to-br from-violet-50/80 to-purple-50/80 backdrop-blur-sm hover:shadow-violet-200/50 transition-all overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-400/20 to-purple-500/20 rounded-full blur-3xl" />
              <CardHeader className="pb-4 relative">
                <CardDescription className="text-sm font-semibold text-violet-700">Total Connections</CardDescription>
                <CardTitle className="text-6xl font-bold bg-gradient-to-r from-violet-600 to-purple-700 bg-clip-text text-transparent">
                  {connections?.length || 0}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-base text-muted-foreground font-medium">People you're connected with 🤝</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="shadow-2xl border-2 border-indigo-200/50 bg-gradient-to-br from-indigo-50/80 to-blue-50/80 backdrop-blur-sm hover:shadow-indigo-200/50 transition-all overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-blue-500/20 rounded-full blur-3xl" />
              <CardHeader className="pb-4 relative">
                <CardDescription className="text-sm font-semibold text-indigo-700">Upcoming Events</CardDescription>
                <CardTitle className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-blue-700 bg-clip-text text-transparent">
                  {events?.length || 0}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-base text-muted-foreground font-medium">Events to explore 📅</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Navigation Hub */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
              Explore Connect Minds
            </h2>
            <p className="text-muted-foreground text-lg">Discover all the amazing features we have to offer</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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