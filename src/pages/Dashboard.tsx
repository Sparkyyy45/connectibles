import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, FileText, Calendar, Sparkles, MessageSquare, Palette, MessageCircle, Briefcase, Bell, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const posts = useQuery(api.posts.getAllPosts);
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
      title: "Collaborations",
      description: "Discover projects and find partners for your next big idea",
      icon: Briefcase,
      path: "/posts",
      gradient: "from-amber-500 via-orange-500 to-red-600",
      stat: `${posts?.length || 0} active posts`,
      delay: 0.4
    },
    {
      title: "Messages",
      description: "Private conversations with your connections",
      icon: MessageCircle,
      path: "/messages",
      gradient: "from-emerald-500 via-teal-500 to-cyan-600",
      stat: "Direct messages",
      delay: 0.5
    },
    {
      title: "Events",
      description: "Explore upcoming activities and create your own events",
      icon: Calendar,
      path: "/events",
      gradient: "from-indigo-500 via-blue-500 to-purple-600",
      stat: "Discover events",
      delay: 0.6
    }
  ];

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-br from-background via-muted/20 to-primary/5 min-h-[calc(100vh-180px)]">
        <div className="max-w-7xl mx-auto p-8 space-y-12">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                Welcome back, {user.name || "there"}!
              </h1>
            </div>
            <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">
              Your hub for connections, collaborations, and community
            </p>
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
                    Add your interests and skills to unlock the full potential of Connect Minds
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
            className="grid md:grid-cols-3 gap-6"
          >
            <Card className="shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-xl transition-all">
              <CardHeader className="pb-3">
                <CardDescription className="text-sm font-medium">Total Connections</CardDescription>
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
                  {connections?.length || 0}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">People you're connected with</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-xl transition-all">
              <CardHeader className="pb-3">
                <CardDescription className="text-sm font-medium">Active Collaborations</CardDescription>
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                  {posts?.length || 0}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Projects seeking partners</p>
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
                <p className="text-sm text-muted-foreground">Events to explore</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Navigation Hub - Unique Design */}
          <div className="space-y-6">
            <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-3xl font-bold tracking-tight"
          >
            Explore Connect Minds
          </motion.h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

          {/* Recent Collaboration Posts */}
          {posts && posts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Recent Collaborations</h2>
                <Button variant="outline" onClick={() => navigate("/posts")} size="lg" className="shadow-md hover:shadow-lg transition-all">
                  View All
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts?.slice(0, 3).map((post, index) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.85 + index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                  >
                    <Card className="shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm cursor-pointer hover:shadow-xl hover:border-primary/30 transition-all duration-300 h-full" onClick={() => navigate("/posts")}>
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="h-11 w-11 ring-2 ring-border/30">
                            <AvatarImage src={post.author?.image} alt={post.author?.name || "User"} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-foreground font-semibold">
                              {post.author?.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg mb-1 line-clamp-1">{post.title}</CardTitle>
                            <CardDescription className="text-sm">
                              by <span className="font-medium">{post.author?.name || "Anonymous"}</span>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                          {post.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="px-2 py-0.5 text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {post.tags.length > 3 && (
                            <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                              +{post.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}