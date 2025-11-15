import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface CTASectionProps {
  isAuthenticated: boolean;
  onNavigate: (path: string) => void;
}

export default function CTASection({ isAuthenticated, onNavigate }: CTASectionProps) {
  return (
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
          
          <Button
            size="lg"
            onClick={() => onNavigate(isAuthenticated ? "/dashboard" : "/auth")}
            className="text-lg px-10 py-7 h-auto bg-white text-purple-600 hover:bg-white/95 shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all hover:scale-105 font-bold border-0"
            aria-label="Get started with Connectibles"
          >
            Get Started Now
            <Sparkles className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
