import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Home, Users, Calendar, MessageCircle, User, LogOut, Bell, Lock, MessageSquare, Gamepad2, Trophy, Heart, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = useQuery(api.notifications.getUnreadCount);
  const prevUnreadCount = useRef<number | undefined>(undefined);
  const navScrollRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Preserve scroll position
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('sidebar-scroll-position');
    if (savedScrollPosition && navScrollRef.current) {
      navScrollRef.current.scrollTop = parseInt(savedScrollPosition, 10);
    }
  }, []);

  // Save scroll position before navigation
  const handleNavigation = (path: string) => {
    if (navScrollRef.current) {
      sessionStorage.setItem('sidebar-scroll-position', navScrollRef.current.scrollTop.toString());
    }
    navigate(path);
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  };

  // Show toast when new notifications arrive
  useEffect(() => {
    if (prevUnreadCount.current !== undefined && unreadCount !== undefined) {
      if (unreadCount > prevUnreadCount.current) {
        const newCount = unreadCount - prevUnreadCount.current;
        toast.success(`You have ${newCount} new notification${newCount > 1 ? 's' : ''}!`, {
          action: {
            label: "View",
            onClick: () => navigate("/notifications"),
          },
        });
      }
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount, navigate]);

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Discover", path: "/discover" },
    { icon: MessageCircle, label: "Messages", path: "/messages" },
    { icon: Lock, label: "Confessional", path: "/chill" },
    { icon: MessageSquare, label: "Gossip", path: "/gossip" },
    { icon: Heart, label: "Truth/Dare", path: "/truth-dare" },
    { icon: Gamepad2, label: "Games", path: "/games" },
    { icon: Trophy, label: "Stats", path: "/game-stats" },
    { icon: Calendar, label: "Events", path: "/events" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5 flex">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden h-12 w-12 rounded-xl bg-card/95 backdrop-blur-xl border border-border/40 shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Vertical Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ 
          x: isMobileMenuOpen ? 0 : -100, 
          opacity: isMobileMenuOpen ? 1 : 0 
        }}
        className={cn(
          "w-80 bg-gradient-to-b from-card/95 via-card/90 to-card/95 backdrop-blur-2xl border-r border-border/40 shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex flex-col fixed h-screen z-50",
          "lg:opacity-100 lg:translate-x-0"
        )}
        style={{ 
          transform: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'translateX(0)' : undefined,
          opacity: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 1 : undefined
        }}
      >
        {/* Logo Section */}
        <div className="p-7 border-b border-border/30">
          <motion.div
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => handleNavigation("/")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary/25 to-purple-500/25 group-hover:from-primary/35 group-hover:to-purple-500/35 transition-all duration-300 shadow-lg group-hover:shadow-xl">
              <Sparkles className="h-7 w-7 text-primary group-hover:rotate-12 transition-transform duration-300" />
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-2xl blur-md"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-500 to-purple-600 bg-clip-text text-transparent">
                Connectibles
              </span>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Connect & Collaborate</p>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions Section */}
        <div className="p-5 border-b border-border/30">
          <div className="flex items-center justify-around gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 hover:bg-muted/60 transition-all duration-300 rounded-xl relative"
              onClick={() => handleNavigation("/notifications")}
            >
              <Bell className="h-5 w-5" />
              <AnimatePresence>
                {unreadCount !== undefined && unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge
                      variant="destructive"
                      className="h-5 min-w-5 flex items-center justify-center px-1 text-xs font-bold shadow-lg"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 hover:bg-muted/60 transition-all duration-300 rounded-xl"
              onClick={() => handleNavigation("/profile")}
            >
              <User className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 text-destructive hover:bg-destructive/15 hover:text-destructive transition-all duration-300 rounded-xl"
              onClick={() => signOut()}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav ref={navScrollRef} className="flex-1 p-5 space-y-2.5 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  variant={active ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-4 h-14 text-base font-semibold transition-all duration-300 rounded-xl",
                    active
                      ? "bg-gradient-to-r from-primary via-purple-500 to-purple-600 text-primary-foreground shadow-xl shadow-primary/30 scale-[1.02]"
                      : "hover:bg-muted/60 hover:translate-x-2 hover:shadow-md"
                  )}
                  onClick={() => handleNavigation(item.path)}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-all duration-300",
                    active ? "bg-white/20" : "bg-transparent group-hover:bg-muted"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="tracking-wide">{item.label}</span>
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto h-2.5 w-2.5 rounded-full bg-white shadow-lg"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Button>
              </motion.div>
            );
          })}
        </nav>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-80 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}