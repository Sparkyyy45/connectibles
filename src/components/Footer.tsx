import { Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/80 backdrop-blur-xl mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center space-y-4">
          <div>
            <p className="font-bold text-base mb-1 text-foreground">Suyash Yadav</p>
            <a
              href="mailto:suyashyadav1709@gmail.com"
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              suyashyadav1709@gmail.com
            </a>
          </div>
          
          <div className="flex items-center justify-center gap-3">
            <a
              href="https://www.instagram.com/suyash.yadv/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground border border-border/50 transition-all hover:scale-110"
              aria-label="Instagram profile"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/suyash-yadav-b63251378?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground border border-border/50 transition-all hover:scale-110"
              aria-label="LinkedIn profile"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>

          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground font-medium">
              © {new Date().getFullYear()} Connectibles. Developed by Suyash Yadav
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
