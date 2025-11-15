import { Sparkles, Instagram, Linkedin } from "lucide-react";

interface FooterProps {
  onNavigate: (path: string) => void;
  onScrollToSection: (sectionId: string) => void;
}

export default function Footer({ onNavigate, onScrollToSection }: FooterProps) {
  return (
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
            onClick={() => onScrollToSection("features")}
            className="text-sm text-slate-600 hover:text-purple-600 transition-colors font-semibold"
          >
            Features
          </button>
          <button
            onClick={() => onNavigate("/discover")}
            className="text-sm text-slate-600 hover:text-purple-600 transition-colors font-semibold"
          >
            Discover
          </button>
          <button
            onClick={() => onNavigate("/dashboard")}
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
            <a
              href="https://www.instagram.com/suyash.yadv/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-purple-100 hover:bg-purple-200 hover:text-purple-700 text-purple-600 border border-purple-200/50 transition-all hover:scale-110"
              aria-label="Instagram profile"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/suyash-yadav-b63251378?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-purple-100 hover:bg-purple-200 hover:text-purple-700 text-purple-600 border border-purple-200/50 transition-all hover:scale-110"
              aria-label="LinkedIn profile"
            >
              <Linkedin className="h-5 w-5" />
            </a>
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
  );
}