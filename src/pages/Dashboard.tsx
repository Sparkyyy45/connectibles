import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, FileText, Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const posts = useQuery(api.posts.getAllPosts);
  const matches = useQuery(api.matching.getMatches);

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

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-br from-background via-muted/20 to-primary/5 min-h-[calc(100vh-180px)]">
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3"
          >
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="p-3 rounded-2xl bg-primary/10 backdrop-blur-sm">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Welcome back, {user.name || "there"}!
              </h1>
            </div>
            <p className="text-muted-foreground text-base font-medium">
              Discover connections and collaborate with your community
            </p>
          </motion.div>

          {/* Profile Setup Alert */}
          {needsProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-2 border-primary/50 shadow-lg bg-card/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Complete Your Profile</CardTitle>
                  <CardDescription className="text-base">
                    Add your interests and skills to start discovering matches
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/profile")} size="lg" className="shadow-md hover:shadow-lg transition-all">
                    Set Up Profile
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer" onClick={() => navigate("/discover")}>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base font-semibold">Matches</CardTitle>
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{matches?.length || 0}</div>
                  <p className="text-sm text-muted-foreground mt-1">Potential connections</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer" onClick={() => navigate("/posts")}>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base font-semibold">Active Posts</CardTitle>
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{posts?.length || 0}</div>
                  <p className="text-sm text-muted-foreground mt-1">Collaboration opportunities</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer" onClick={() => navigate("/events")}>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base font-semibold">Events</CardTitle>
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">View All</div>
                  <p className="text-sm text-muted-foreground mt-1">Upcoming activities</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Collaboration Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold tracking-tight">Recent Collaborations</h2>
              <Button variant="outline" onClick={() => navigate("/posts")} size="lg" className="shadow-sm hover:shadow-md transition-all">
                View All
              </Button>
            </div>
            <div className="space-y-5">
              {posts?.slice(0, 3).map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <Card className="shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm cursor-pointer hover:shadow-xl hover:border-primary/30 transition-all" onClick={() => navigate("/posts")}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 ring-2 ring-border/30">
                          <AvatarImage src={post.author?.image} alt={post.author?.name || "User"} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-foreground font-semibold">
                            {post.author?.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-1">{post.title}</CardTitle>
                          <CardDescription className="text-sm">
                            by <span className="font-medium">{post.author?.name || "Anonymous"}</span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed line-clamp-2">
                        {post.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="px-3 py-1">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {posts?.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm">
                  <CardHeader className="text-center py-16">
                    <div className="p-6 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                      <FileText className="h-16 w-16 opacity-30" />
                    </div>
                    <CardTitle className="text-2xl mb-2">No Collaborations Yet</CardTitle>
                    <CardDescription className="text-base">
                      Check back soon for new collaboration opportunities
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}