import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { Users, MessageCircle, Calendar, Lock, Gamepad2 } from "lucide-react";
import { useMemo } from "react";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/Footer";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const features = useMemo(() => [
    {
      icon: Users,
      title: "Discover Matches",
      description: "Connect with people who share your passions and interests through intelligent matching",
      gradient: "from-violet-500 via-purple-500 to-fuchsia-600",
    },
    {
      icon: MessageCircle,
      title: "Real-Time Chat",
      description: "Engage in meaningful conversations with your connections and community",
      gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    },
    {
      icon: Lock,
      title: "Anonymous Confessions",
      description: "Share your thoughts freely in a judgment-free, anonymous space",
      gradient: "from-slate-700 via-purple-800 to-indigo-900",
    },
    {
      icon: Gamepad2,
      title: "Interactive Games",
      description: "Challenge friends with multiplayer games and track your achievements",
      gradient: "from-orange-500 via-amber-500 to-yellow-600",
    },
    {
      icon: Calendar,
      title: "Community Events",
      description: "Discover and create events to bring your community together",
      gradient: "from-indigo-500 via-blue-500 to-purple-600",
    },
  ], []);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/40 relative overflow-x-hidden">
      <AnimatedBackground />
      
      <LandingNav 
        isAuthenticated={isAuthenticated}
        isLoading={isLoading}
        onNavigate={handleNavigation}
        onScrollToSection={scrollToSection}
      />

      <HeroSection 
        isAuthenticated={isAuthenticated}
        onNavigate={handleNavigation}
        onScrollToSection={scrollToSection}
      />

      <FeaturesSection features={features} />

      <CTASection 
        isAuthenticated={isAuthenticated}
        onNavigate={handleNavigation}
      />

      <Footer onNavigate={handleNavigation} onScrollToSection={scrollToSection} />
    </div>
  );
}