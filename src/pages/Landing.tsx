import { motion, useScroll, useTransform } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";
import { Users, MessageCircle, Calendar, Sparkles, ChevronDown, Zap, Heart, Instagram, Linkedin, Lock, Gamepad2, ArrowRight, Star } from "lucide-react";
import { useMemo, useState } from "react";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const features = useMemo(() => [
    {
      icon: Users,
      title: "Discover Matches",
      description: "Connect with people who share your passions and interests through intelligent matching",
      gradient: "from-violet-500 via-purple-500 to-fuchsia-600",
      stat: "10K+ Matches",
    },
    {
      icon: MessageCircle,
      title: "Real-Time Chat",
      description: "Engage in meaningful conversations with your connections and community",
      gradient: "from-emerald-500 via-teal-500 to-cyan-600",
      stat: "Instant Messaging",
    },
    {
      icon: Lock,
      title: "Anonymous Confessions",
      description: "Share your thoughts freely in a judgment-free, anonymous space",
      gradient: "from-slate-700 via-purple-800 to-indigo-900",
      stat: "100% Anonymous",
    },
    {
      icon: Gamepad2,
      title: "Interactive Games",
      description: "Challenge friends with multiplayer games and track your achievements",
      gradient: "from-orange-500 via-amber-500 to-yellow-600",
      stat: "8+ Games",
    },
    {
      icon: Calendar,
      title: "Community Events",
      description: "Discover and create events to bring your community together",
      gradient: "from-indigo-500 via-blue-500 to-purple-600",
      stat: "Live Events",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/40 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.06),transparent_50%)]" />
        
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -40, 0],
            y: [0, -60, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      {/* Navigation */}
      <nav className="border-b border-purple-200/50 backdrop-blur-xl bg-white/80 sticky top-0 z-50 shadow-sm" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer group"
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
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="relative">
              <motion.div 
                className="p-2.5 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 group-hover:from-purple-200 group-hover:to-blue-200 transition-all duration-300 border border-purple-200/50"
                whileHover={{ boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)" }}
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <Sparkles className="h-6 w-6 text-purple-600" aria-hidden="true" />
                </motion.div>
              </motion.div>
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 bg-clip-text text-transparent">
                Connectibles
              </span>
              <p className="text-xs text-purple-600/70 font-medium">Connect & Collaborate</p>
            </div>
          </motion.div>

          <div className="hidden md:flex items-center gap-8 h-full">
            <motion.button
              onClick={() => scrollToSection("features")}
              className="text-sm font-semibold text-slate-700 hover:text-purple-600 transition-colors relative group flex items-center h-full"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Features
              <motion.span 
                className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
            <motion.button
              onClick={() => scrollToSection("cta")}
              className="text-sm font-semibold text-slate-700 hover:text-purple-600 transition-colors relative group flex items-center h-full"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Get Started
              <motion.span 
                className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {!isLoading && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => handleNavigation(isAuthenticated ? "/dashboard" : "/auth")}
                  size="lg"
                  className="relative overflow-hidden group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 shadow-lg hover:shadow-2xl transition-all px-6 py-5 text-base font-semibold"
                  aria-label={isAuthenticated ? "Go to dashboard" : "Get started with Connectibles"}
                >
                  <span className="relative z-10">{isAuthenticated ? "Dashboard" : "Get Started"}</span>
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="max-w-7xl mx-auto px-6 py-32 md:py-48 relative" aria-labelledby="hero-heading">
        <motion.div
          style={{ opacity, scale }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-300/50 mb-10 shadow-md hover:shadow-lg transition-shadow cursor-default"
          >
            <Zap className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-semibold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">Connect. Collaborate. Create.</span>
          </motion.div>

          <h1 id="hero-heading" className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-tight">
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Connect with Your
            </span>
            <br />
            <motion.span 
              className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 bg-clip-text text-transparent inline-block mt-2"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: "200% 200%" }}
            >
              Tribe
            </motion.span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-14 max-w-3xl mx-auto leading-relaxed font-medium">
            Discover people who share your passions. Collaborate on projects. Build meaningful connections in a vibrant community.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                size="lg"
                onClick={() => handleNavigation(isAuthenticated ? "/dashboard" : "/auth")}
                className="text-lg px-10 py-7 h-auto relative overflow-hidden group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 shadow-xl hover:shadow-2xl transition-all font-bold"
                aria-label={isAuthenticated ? "Go to your dashboard" : "Join Connectibles now"}
              >
                <motion.span 
                  className="relative z-10 flex items-center gap-2"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {isAuthenticated ? "Go to Dashboard" : "Join Connectibles"}
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </motion.span>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection("features")}
                className="text-lg px-10 py-7 h-auto border-2 border-purple-300 bg-white hover:bg-purple-50 hover:border-purple-400 text-slate-700 transition-all font-semibold group"
              >
                Learn More
                <motion.div
                  animate={{ y: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronDown className="h-5 w-5 ml-2" />
                </motion.div>
              </Button>
            </motion.div>
          </div>

          <motion.div
            className="mt-20 flex items-center justify-center gap-12 text-sm text-slate-600 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.div 
              className="flex items-center gap-2 group cursor-default"
              whileHover={{ scale: 1.05 }}
            >
              <div className="p-2 rounded-full bg-red-100 group-hover:bg-red-200 transition-colors">
                <Heart className="h-4 w-4 text-red-600 fill-red-600" />
              </div>
              <span className="font-medium text-slate-700">Trusted by students</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2 group cursor-default"
              whileHover={{ scale: 1.05 }}
            >
              <div className="p-2 rounded-full bg-yellow-100 group-hover:bg-yellow-200 transition-colors">
                <Zap className="h-4 w-4 text-yellow-600" />
              </div>
              <span className="font-medium text-slate-700">Instant matching</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2 group cursor-default"
              whileHover={{ scale: 1.05 }}
            >
              <div className="p-2 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors">
                <Star className="h-4 w-4 text-purple-600 fill-purple-600" />
              </div>
              <span className="font-medium text-slate-700">5-star rated</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 md:py-40 scroll-mt-20 relative" aria-labelledby="features-heading">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 id="features-heading" className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-slate-900">
            Everything You Need to
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 bg-clip-text text-transparent"> Connect</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium">
            Powerful features designed to help you build meaningful relationships and collaborate effectively
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -12, transition: { duration: 0.3 } }}
                onHoverStart={() => setHoveredFeature(index)}
                onHoverEnd={() => setHoveredFeature(null)}
                className="relative group cursor-default"
              >
                <motion.div 
                  className="relative p-10 rounded-3xl border-2 border-purple-200/50 bg-white/80 backdrop-blur-xl hover:border-purple-400/50 transition-all duration-500 h-full"
                  whileHover={{ 
                    boxShadow: "0 25px 50px -12px rgba(139, 92, 246, 0.25)",
                    borderColor: "rgba(139, 92, 246, 0.5)"
                  }}
                >
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl`}
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 0.05 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  <div className="relative">
                    <motion.div 
                      className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-8 shadow-lg`}
                      whileHover={{ 
                        scale: 1.15,
                        rotate: [0, -5, 5, 0],
                        boxShadow: "0 20px 25px -5px rgba(139, 92, 246, 0.3)"
                      }}
                      transition={{ duration: 0.4 }}
                    >
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon className="h-10 w-10 text-white" aria-hidden="true" />
                      </motion.div>
                    </motion.div>
                    
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                        {feature.title}
                      </h3>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ 
                          opacity: hoveredFeature === index ? 1 : 0,
                          scale: hoveredFeature === index ? 1 : 0.8
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge className={`bg-gradient-to-r ${feature.gradient} text-white border-0 text-xs px-2 py-1`}>
                          {feature.stat}
                        </Badge>
                      </motion.div>
                    </div>
                    
                    <p className="text-slate-600 leading-relaxed text-base">
                      {feature.description}
                    </p>
                  </div>

                  <motion.div 
                    className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                      initial={{ x: "-200%" }}
                      whileHover={{ x: "200%" }}
                      transition={{ duration: 0.8 }}
                    />
                  </motion.div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="max-w-7xl mx-auto px-6 py-24 md:py-40 scroll-mt-20 relative" aria-labelledby="cta-heading">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-[2rem] p-16 md:p-24 text-center shadow-2xl border-2 border-purple-200/50"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
          
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm mb-8 shadow-xl"
            >
              <Sparkles className="h-12 w-12 text-white" />
            </motion.div>

            <h2 id="cta-heading" className="text-5xl md:text-6xl font-bold tracking-tight mb-8 text-white">
              Ready to Connect?
            </h2>
            
            <p className="text-xl md:text-2xl text-white/95 mb-10 max-w-3xl mx-auto font-medium leading-relaxed">
              Join thousands of students building meaningful connections and collaborating on amazing projects
            </p>
            
            <motion.div
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                size="lg"
                onClick={() => handleNavigation(isAuthenticated ? "/dashboard" : "/auth")}
                className="text-lg px-10 py-7 h-auto bg-white text-purple-600 hover:bg-white/95 shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all font-bold border-0 group"
                aria-label="Get started with Connectibles"
              >
                <span className="flex items-center gap-2">
                  Get Started Now
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </span>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-200/50 bg-white/80 backdrop-blur-xl mt-24">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 border border-purple-200/50">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Connectibles</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Connect with your tribe. Collaborate on projects. Build meaningful connections in a vibrant community.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 mb-12 pb-12 border-b border-purple-200/50">
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm text-slate-600 hover:text-purple-600 transition-colors font-semibold"
            >
              Features
            </button>
            <button
              onClick={() => handleNavigation("/discover")}
              className="text-sm text-slate-600 hover:text-purple-600 transition-colors font-semibold"
            >
              Discover
            </button>
            <button
              onClick={() => handleNavigation("/dashboard")}
              className="text-sm text-slate-600 hover:text-purple-600 transition-colors font-semibold"
            >
              Dashboard
            </button>
          </div>

          <div className="text-center space-y-6">
            <div>
              <p className="font-bold text-lg mb-2 text-slate-900">Suyash Yadav</p>
              <a
                href="mailto:suyashyadav1709@gmail.com"
                className="text-sm text-slate-600 hover:text-purple-600 transition-colors font-medium"
              >
                suyashyadav1709@gmail.com
              </a>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <motion.a
                href="https://www.instagram.com/suyash.yadv/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-purple-100 hover:bg-purple-200 hover:text-purple-700 text-purple-600 border border-purple-200/50 transition-all"
                aria-label="Instagram profile"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Instagram className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/in/suyash-yadav-b63251378?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-purple-100 hover:bg-purple-200 hover:text-purple-700 text-purple-600 border border-purple-200/50 transition-all"
                aria-label="LinkedIn profile"
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Linkedin className="h-5 w-5" />
              </motion.a>
            </div>
          </div>

          <div className="pt-10 mt-10 border-t border-purple-200/50">
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-center">
              <p className="text-sm text-slate-600 font-medium">
                © {new Date().getFullYear()} Connectibles. All rights reserved.
              </p>
              <span className="hidden md:inline text-slate-400">•</span>
              <p className="text-sm text-slate-600 font-medium">
                Developed by Suyash Yadav
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}