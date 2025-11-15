import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface LandingNavProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  onNavigate: (path: string) => void;
  onScrollToSection: (sectionId: string) => void;
}

export default function LandingNav({ isAuthenticated, isLoading, onNavigate, onScrollToSection }: LandingNavProps) {
  return (
    <nav className="border-b border-purple-200/50 backdrop-blur-xl bg-white/80 sticky top-0 z-50 shadow-sm" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavigate("/")}
          role="button"
          tabIndex={0}
          aria-label="Go to home page"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onNavigate("/");
            }
          }}
        >
          <div className="relative">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 group-hover:from-purple-200 group-hover:to-blue-200 transition-all duration-300 border border-purple-200/50">
              <Sparkles className="h-6 w-6 text-purple-600 group-hover:rotate-12 transition-transform duration-300" aria-hidden="true" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 bg-clip-text text-transparent">
              Connectibles
            </span>
            <p className="text-xs text-purple-600/70 font-medium">Connect & Collaborate</p>
          </div>
        </motion.div>

        <div className="hidden md:flex items-center gap-8 h-full">
          <button
            onClick={() => onScrollToSection("features")}
            className="text-sm font-semibold text-slate-700 hover:text-purple-600 transition-colors relative group flex items-center h-full"
          >
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full transition-all duration-300" />
          </button>
          <button
            onClick={() => onScrollToSection("cta")}
            className="text-sm font-semibold text-slate-700 hover:text-purple-600 transition-colors relative group flex items-center h-full"
          >
            Get Started
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full transition-all duration-300" />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {!isLoading && (
            <Button
              onClick={() => onNavigate(isAuthenticated ? "/dashboard" : "/auth")}
              size="lg"
              className="relative overflow-hidden group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 shadow-lg hover:shadow-xl transition-all px-6 py-5 text-base font-semibold"
              aria-label={isAuthenticated ? "Go to dashboard" : "Get started with Connectibles"}
            >
              <span className="relative z-10">{isAuthenticated ? "Dashboard" : "Get Started"}</span>
            </Button>
          )}
        </motion.div>
      </div>
    </nav>
  );
}
