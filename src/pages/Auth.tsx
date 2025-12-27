import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Footer from "@/components/Footer";

import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail, UserX } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

interface AuthProps {
  redirectAfterAuth?: string;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const redirect = redirectAfterAuth || "/";
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirectAfterAuth]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email") as string;
      
      if (!email || !email.includes("@")) {
        setError("Please enter a valid email address");
        setIsLoading(false);
        return;
      }

      await signIn("email-otp", formData);
      setStep({ email });
    } catch (error: any) {
      console.error("Email sign-in error:", error);
      const errorMessage = error?.message || "Failed to send verification code. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);

      const redirect = redirectAfterAuth || "/";
      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Invalid verification code. Please try again.");
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      const redirect = redirectAfterAuth || "/";
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      setError("Failed to sign in as guest. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setStep("signIn");
    setOtp("");
    setError(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
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

      {/* Auth Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step === "signIn" ? "signin" : "otp"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <Card className="border shadow-lg backdrop-blur-sm bg-card/95">
              {step === "signIn" ? (
                <>
                  <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                      <motion.img
                        src="./logo.svg"
                        alt="Logo"
                        width={64}
                        height={64}
                        className="rounded-lg cursor-pointer"
                        onClick={() => navigate("/")}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Get Started</CardTitle>
                      <CardDescription className="text-base mt-2">
                        Enter your email to log in or sign up
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <form onSubmit={handleEmailSubmit}>
                    <CardContent className="space-y-4">
                      <div className="relative flex items-center gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            name="email"
                            placeholder="name@example.com"
                            type="email"
                            className="pl-9 h-11"
                            disabled={isLoading}
                            required
                          />
                        </div>
                        <Button
                          type="submit"
                          variant="outline"
                          size="icon"
                          className="h-11 w-11"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ArrowRight className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      
                      <AnimatePresence>
                        {error && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-sm text-red-500"
                          >
                            {error}
                          </motion.p>
                        )}
                      </AnimatePresence>

                    </CardContent>
                  </form>
                </>
              ) : (
                <>
                  <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl">Check your email</CardTitle>
                    <CardDescription className="text-base">
                      We've sent a 6-digit code to <br />
                      <span className="font-medium text-foreground">{step.email}</span>
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleOtpSubmit}>
                    <CardContent className="space-y-6 pb-4">
                      <input type="hidden" name="email" value={step.email} />
                      <input type="hidden" name="code" value={otp} />

                      <div className="flex justify-center">
                        <InputOTP
                          value={otp}
                          onChange={setOtp}
                          maxLength={6}
                          disabled={isLoading}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                              const form = (e.target as HTMLElement).closest("form");
                              if (form) {
                                form.requestSubmit();
                              }
                            }
                          }}
                        >
                          <InputOTPGroup>
                            {Array.from({ length: 6 }).map((_, index) => (
                              <InputOTPSlot key={index} index={index} />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>

                      <AnimatePresence>
                        {error && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-sm text-red-500 text-center"
                          >
                            {error}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <p className="text-sm text-muted-foreground text-center">
                        Didn't receive a code?{" "}
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto font-medium"
                          onClick={handleTryAgain}
                          disabled={isLoading}
                        >
                          Try again
                        </Button>
                      </p>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                      <Button
                        type="submit"
                        className="w-full h-11"
                        disabled={isLoading || otp.length !== 6}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            Verify code
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleTryAgain}
                        disabled={isLoading}
                        className="w-full"
                      >
                        Use different email
                      </Button>
                    </CardFooter>
                  </form>
                </>
              )}

              <div className="py-4 px-6 text-xs text-center text-muted-foreground bg-muted/50 border-t rounded-b-lg">
                Secured by{" "}
                <a
                  href="https://vly.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary transition-colors"
                >
                  vly.ai
                </a>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <Auth {...props} />
    </Suspense>
  );
}