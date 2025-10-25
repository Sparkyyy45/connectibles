import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { Users, MessageCircle, Calendar, Sparkles, ChevronDown, Zap, Heart } from "lucide-react";
import { useMemo } from "react";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const features = useMemo(() => [
    {
      icon: Users,
      title: "Discover Matches",
      description: "Connect with people who share your passions and interests",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: MessageCircle,
      title: "Collaborate",
      description: "Post requests and find partners for your projects",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Calendar,
      title: "Join Events",
      description: "Participate in community meetups and activities",
      gradient: "from-orange-500 to-red-500",
    },
  ], []);

  const handleNavigation = (path: string) => {
    try {
      navigate(path);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 cursor-pointer group"
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
            <div className="relative">
              <Sparkles className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform" aria-hidden="true" />
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-full blur-md"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Connectibles
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("cta")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Get Started
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {!isLoading && (
              <Button
                onClick={() => handleNavigation(isAuthenticated ? "/dashboard" : "/auth")}
                size="lg"
                className="relative overflow-hidden group"
                aria-label={isAuthenticated ? "Go to dashboard" : "Get started with Connectibles"}
              >
                <span className="relative z-10">{isAuthenticated ? "Dashboard" : "Get Started"}</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/20 to-primary/0"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </Button>
            )}
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="max-w-7xl mx-auto px-6 py-20 md:py-32 relative" aria-labelledby="hero-heading">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Connect. Collaborate. Create.</span>
          </motion.div>

          <h1 id="hero-heading" className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Connect with Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Tribe
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover people who share your passions. Collaborate on projects. Build meaningful connections.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => handleNavigation(isAuthenticated ? "/dashboard" : "/auth")}
              className="text-lg px-8 py-6 h-auto relative overflow-hidden group shadow-lg hover:shadow-xl transition-shadow"
              aria-label={isAuthenticated ? "Go to your dashboard" : "Join Connectibles now"}
            >
              <span className="relative z-10 flex items-center gap-2">
                {isAuthenticated ? "Go to Dashboard" : "Join Connectibles"}
                <Sparkles className="h-5 w-5" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("features")}
              className="text-lg px-8 py-6 h-auto border-2 hover:border-primary transition-colors"
            >
              Learn More
              <ChevronDown className="h-5 w-5 ml-2" />
            </Button>
          </div>

          <motion.div
            className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              <span>Trusted by students</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Instant matching</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 md:py-32 scroll-mt-20 relative" aria-labelledby="features-heading">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 id="features-heading" className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Everything You Need to
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"> Connect</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you build meaningful relationships
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="relative group"
              >
                <div className="relative p-8 rounded-2xl border bg-card hover:shadow-2xl transition-all duration-300 h-full">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />
                  
                  <div className="relative">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" aria-hidden="true" />
                    </div>
                    
                    <h3 className="text-2xl font-bold tracking-tight mb-4">
                      {feature.title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="max-w-7xl mx-auto px-6 py-20 md:py-32 scroll-mt-20 relative" aria-labelledby="cta-heading">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl p-12 md:p-16 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-500 to-pink-500 opacity-90" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
          
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6"
            >
              <Sparkles className="h-10 w-10 text-white" />
            </motion.div>

            <h2 id="cta-heading" className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white">
              Ready to Connect?
            </h2>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of students building meaningful connections
            </p>
            
            <Button
              size="lg"
              onClick={() => handleNavigation(isAuthenticated ? "/dashboard" : "/auth")}
              className="text-lg px-8 py-6 h-auto bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              aria-label="Get started with Connectibles"
            >
              Get Started Now
              <Sparkles className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer spacing */}
      <div className="h-20" />
    </div>
  );
}