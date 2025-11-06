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
      {/* Mobile Menu Button - Enhanced for better visibility */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/95 to-purple-600/95 backdrop-blur-xl border-2 border-white/30 shadow-2xl hover:scale-110 active:scale-90 transition-all duration-200"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMobileMenuOpen ? <X className="h-8 w-8 text-white" /> : <Menu className="h-8 w-8 text-white" />}
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

      {/* Vertical Sidebar - Enhanced mobile experience */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isMobileMenuOpen ? 0 : '-100%', 
          opacity: isMobileMenuOpen ? 1 : 0 
        }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={cn(
          "w-[85vw] max-w-sm bg-gradient-to-br from-white via-purple-50/40 to-blue-50/30 backdrop-blur-2xl border-r-2 border-purple-200/60 shadow-[0_8px_64px_rgba(139,92,246,0.2)] flex flex-col fixed h-screen z-50 overflow-hidden",
          "lg:static lg:w-80 lg:translate-x-0 lg:opacity-100 lg:bg-gradient-to-b lg:from-card/98 lg:via-card/95 lg:to-card/98 lg:border-border/40"
        )}
      >
        {/* Logo Section */}
        <div className="p-6 lg:p-7 border-b border-purple-200/40 lg:border-border/30 bg-white/60 lg:bg-transparent">
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

        {/* Quick Actions Section - Enhanced for mobile */}
        <div className="p-6 lg:p-5 border-b border-purple-200/40 lg:border-border/30 bg-gradient-to-r from-purple-50/60 to-blue-50/60 lg:bg-transparent">
          <div className="flex items-center justify-around gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-16 w-16 lg:h-12 lg:w-12 hover:bg-purple-100 lg:hover:bg-muted/60 transition-all duration-200 rounded-2xl relative touch-manipulation shadow-md hover:shadow-lg active:scale-95"
              onClick={() => handleNavigation("/notifications")}
              aria-label="Notifications"
            >
              <Bell className="h-7 w-7 lg:h-5 lg:w-5 text-purple-600 lg:text-foreground" />
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
                      className="h-7 min-w-7 lg:h-5 lg:min-w-5 flex items-center justify-center px-2 text-xs font-bold shadow-lg"
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
              className="h-16 w-16 lg:h-12 lg:w-12 hover:bg-purple-100 lg:hover:bg-muted/60 transition-all duration-200 rounded-2xl touch-manipulation shadow-md hover:shadow-lg active:scale-95"
              onClick={() => handleNavigation("/profile")}
              aria-label="Profile"
            >
              <User className="h-7 w-7 lg:h-5 lg:w-5 text-purple-600 lg:text-foreground" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-16 w-16 lg:h-12 lg:w-12 text-red-500 hover:bg-red-50 lg:hover:bg-destructive/15 hover:text-red-600 lg:hover:text-destructive transition-all duration-200 rounded-2xl touch-manipulation shadow-md hover:shadow-lg active:scale-95"
              onClick={() => signOut()}
              aria-label="Sign out"
            >
              <LogOut className="h-7 w-7 lg:h-5 lg:w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation Items - Enhanced mobile scrolling */}
        <nav 
          ref={navScrollRef} 
          className="flex-1 p-6 lg:p-5 space-y-4 lg:space-y-2.5 overflow-y-auto bg-gradient-to-b from-transparent via-white/20 to-transparent lg:bg-transparent scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent"
        >
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Button
                  variant={active ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-4 h-18 lg:h-14 text-lg lg:text-base font-semibold transition-all duration-200 rounded-2xl touch-manipulation shadow-md",
                    active
                      ? "bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white shadow-xl shadow-purple-500/40 scale-[1.02] border-2 border-purple-300/60"
                      : "hover:bg-purple-50 lg:hover:bg-muted/60 hover:translate-x-1 hover:shadow-lg active:scale-95 text-slate-700 lg:text-foreground border-2 border-transparent hover:border-purple-200/60"
                  )}
                  onClick={() => handleNavigation(item.path)}
                  aria-label={`Navigate to ${item.label}`}
                  aria-current={active ? "page" : undefined}
                >
                  <div className={cn(
                    "p-3 lg:p-2 rounded-xl transition-all duration-200",
                    active ? "bg-white/30 shadow-inner" : "bg-purple-100/60 lg:bg-transparent group-hover:bg-purple-100 lg:group-hover:bg-muted"
                  )}>
                    <Icon className={cn(
                      "h-7 w-7 lg:h-5 lg:w-5",
                      active ? "text-white" : "text-purple-600 lg:text-foreground"
                    )} />
                  </div>
                  <span className="tracking-wide flex-1 text-left">{item.label}</span>
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto h-3.5 w-3.5 lg:h-2.5 lg:w-2.5 rounded-full bg-white shadow-lg"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Button>
              </motion.div>
            );
          })}
        </nav>
      </motion.aside>

      {/* Main Content Area - Enhanced mobile spacing */}
      <main className="flex-1 min-h-screen overflow-auto pt-20 lg:pt-0">
        {children}
      </main>
    </div>
  );
}