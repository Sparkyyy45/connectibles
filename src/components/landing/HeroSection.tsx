import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronDown, Zap, Heart } from "lucide-react";

interface HeroSectionProps {
  isAuthenticated: boolean;
  onNavigate: (path: string) => void;
  onScrollToSection: (sectionId: string) => void;
}

export default function HeroSection({ isAuthenticated, onNavigate, onScrollToSection }: HeroSectionProps) {
  return (
    <section id="hero" className="max-w-7xl mx-auto px-6 py-32 md:py-48 relative" aria-labelledby="hero-heading">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-5xl mx-auto"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-300/50 mb-10 shadow-md"
        >
          <Zap className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-semibold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">Connect. Collaborate. Create.</span>
        </motion.div>

        <h1 id="hero-heading" className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-tight">
          <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
            Connect with Your
          </span>
          <br />
          <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 bg-clip-text text-transparent inline-block mt-2">
            Tribe
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-600 mb-14 max-w-3xl mx-auto leading-relaxed font-medium">
          Discover people who share your passions. Collaborate on projects. Build meaningful connections in a vibrant community.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <Button
            size="lg"
            onClick={() => onNavigate(isAuthenticated ? "/dashboard" : "/auth")}
            className="text-lg px-10 py-7 h-auto relative overflow-hidden group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 shadow-xl hover:shadow-2xl transition-all font-bold"
            aria-label={isAuthenticated ? "Go to your dashboard" : "Join Connectibles now"}
          >
            <span className="relative z-10 flex items-center gap-2">
              {isAuthenticated ? "Go to Dashboard" : "Join Connectibles"}
              <Sparkles className="h-5 w-5" />
            </span>
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => onScrollToSection("features")}
            className="text-lg px-10 py-7 h-auto border-2 border-purple-300 bg-white hover:bg-purple-50 hover:border-purple-400 text-slate-700 transition-all font-semibold"
          >
            Learn More
            <ChevronDown className="h-5 w-5 ml-2" />
          </Button>
        </div>

        <motion.div
          className="mt-20 flex items-center justify-center gap-12 text-sm text-slate-600 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center gap-2 group cursor-default">
            <div className="p-2 rounded-full bg-red-100 group-hover:bg-red-200 transition-colors">
              <Heart className="h-4 w-4 text-red-600 fill-red-600" />
            </div>
            <span className="font-medium text-slate-700">Trusted by students</span>
          </div>
          <div className="flex items-center gap-2 group cursor-default">
            <div className="p-2 rounded-full bg-yellow-100 group-hover:bg-yellow-200 transition-colors">
              <Zap className="h-4 w-4 text-yellow-600" />
            </div>
            <span className="font-medium text-slate-700">Instant matching</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
