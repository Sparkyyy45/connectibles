import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { Users, MessageCircle, Calendar, Sparkles } from "lucide-react";
import { useMemo } from "react";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const features = useMemo(() => [
    {
      icon: Users,
      title: "Discover Matches",
      description: "Connect with people who share your passions and interests",
    },
    {
      icon: MessageCircle,
      title: "Collaborate",
      description: "Post requests and find partners for your projects",
    },
    {
      icon: Calendar,
      title: "Join Events",
      description: "Participate in community meetups and activities",
    },
  ], []);

  const handleNavigation = (path: string) => {
    try {
      navigate(path);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleNavigation("/")}
            role="button"
            tabIndex={0}
            aria-label="Go to home page"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleNavigation("/");
              }
            }}
          >
            <Sparkles className="h-6 w-6" aria-hidden="true" />
            <span className="text-xl font-bold tracking-tight">Connectibles</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {!isLoading && (
              <Button
                onClick={() => handleNavigation(isAuthenticated ? "/dashboard" : "/auth")}
                size="lg"
                aria-label={isAuthenticated ? "Go to dashboard" : "Get started with Connectibles"}
              >
                {isAuthenticated ? "Dashboard" : "Get Started"}
              </Button>
            )}
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-32" aria-labelledby="hero-heading">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 id="hero-heading" className="text-6xl font-bold tracking-tight mb-6">
            Connect with Your Tribe
          </h1>
          <p className="text-xl text-muted-foreground mb-12">
            Discover people who share your passions. Collaborate on projects. Build meaningful connections.
          </p>
          <Button
            size="lg"
            onClick={() => handleNavigation(isAuthenticated ? "/dashboard" : "/auth")}
            className="text-lg px-8 py-6"
            aria-label={isAuthenticated ? "Go to your dashboard" : "Join Connectibles now"}
          >
            {isAuthenticated ? "Go to Dashboard" : "Join Connectibles"}
          </Button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-32" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">Platform Features</h2>
        <div className="grid md:grid-cols-3 gap-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <Icon className="h-8 w-8" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-32" aria-labelledby="cta-heading">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-primary/5 rounded-2xl p-16 text-center"
        >
          <h2 id="cta-heading" className="text-4xl font-bold tracking-tight mb-6">
            Ready to Connect?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of students building meaningful connections
          </p>
          <Button
            size="lg"
            onClick={() => handleNavigation(isAuthenticated ? "/dashboard" : "/auth")}
            className="text-lg px-8 py-6"
            aria-label="Get started with Connectibles"
          >
            Get Started Now
          </Button>
        </motion.div>
      </section>
    </div>
  );
}