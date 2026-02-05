import { useState } from "react";
import SocialLoginButtons from "@/features/auth/components/SocialLoginButtons";
import { Link, useSearchParams, useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/shared/lib/api";
import { socketClient } from "@/shared/lib/socket";
import { useApp } from "@/shared/contexts/AppContext";
import { cn, getPasswordStrength } from "@/shared/lib/utils";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get("mode") || "login";



  // Try to get context methods, but don't fail if not available (e.g., on first load)
  let refreshUser: (() => Promise<void>) | null = null;
  let refreshWorkspaces: (() => Promise<void>) | null = null;
  try {
    const appContext = useApp();
    refreshUser = appContext.refreshUser;
    refreshWorkspaces = appContext.refreshWorkspaces;
  } catch {
    // Context not available, that's okay - it will initialize on next page load
  }

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPass = e.target.value;
    setFormData({ ...formData, password: newPass });
    setPasswordScore(getPasswordStrength(newPass));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "login") {
        const result = await apiClient.login({
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem('token', result.token);
        apiClient.setToken(result.token);
        socketClient.connect(result.token);

        // Refresh user data and workspaces if context is available
        if (refreshUser) {
          await refreshUser();
        }
        if (refreshWorkspaces) {
          await refreshWorkspaces();
        }

        toast.success("Identity Verified", {
          description: "Establishing secure connection to workspace...",
          className: "font-code" // specific for that tech feel
        });
        // Check for pending invite redirect
        const pendingInvite = localStorage.getItem('pending_invite_code');
        if (pendingInvite) {
          navigate(`/join-workspace?code=${pendingInvite}`);
        } else {
          navigate("/welcome");
        }
      } else {
        if (passwordScore < 3) {
          toast.error("Security Protocol Violation", {
            description: "Password strength insufficient. Minimum 'Good' rating required.",
            className: "font-code"
          });
          setIsLoading(false);
          return;
        }

        const result = await apiClient.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem('token', result.token);
        apiClient.setToken(result.token);
        socketClient.connect(result.token);

        // Refresh user data and workspaces if context is available
        if (refreshUser) {
          await refreshUser();
        }
        if (refreshWorkspaces) {
          await refreshWorkspaces();
        }

        toast.success("Profile Initialized", {
          description: "Welcome to the Network. Preparing your environment...",
          className: "font-code"
        });
        // Check for pending invite redirect
        const pendingInvite = localStorage.getItem('pending_invite_code');
        if (pendingInvite) {
          navigate(`/join-workspace?code=${pendingInvite}`);
        } else {
          navigate("/welcome");
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const errorMessage = error.message || "Authentication failed";

      // Provide more helpful error messages
      if (errorMessage.includes('Server error') || errorMessage.includes('Failed to fetch')) {
        toast.error("Neural Uplink Offline", {
          description: "Cannot connect to server. Check Port 5000.",
          className: "font-code"
        });
      } else if (errorMessage.includes('Invalid credentials')) {
        toast.error("Access Denied", {
          description: "Invalid credentials provided.",
          className: "font-code"
        });
      } else if (errorMessage.includes('already registered')) {
        toast.error("Identity Conflict", {
          description: "Email already registered. Redirecting to Login...",
          className: "font-code"
        });
        // Optional: Switch to login mode automatically for better UX
        navigate("/auth?mode=login");
      } else {
        toast.error("System Error", {
          description: errorMessage,
          className: "font-code"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-background flex mesh-gradient-bg relative">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden bg-engineer-grid z-0" />

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] animate-fluid" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[100px] animate-fluid animation-delay-2000" />
      </div>

      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md relative z-10 perspective-1000">
          <div className="card-prism p-10 rounded-[2.5rem]">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>

            <div className="flex items-center gap-2 mb-8 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground tracking-tight font-code">cortexa</span>
            </div>

            <div className="animate-slide-up">
              <h1 className="text-3xl font-bold mb-2 text-foreground font-code tracking-tight">
                {isLogin ? "Welcome back" : "Initialize Account"}
              </h1>
              <p className="text-muted-foreground mb-8 font-code text-xs uppercase tracking-wider opacity-70">
                {isLogin
                  ? "Authenticate to access workspace"
                  : "Begin human-ai collaboration sequence"}
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-code text-xs">FULL_NAME</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        className="pl-10 input-code text-sm text-black"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-code text-xs">WORK_EMAIL</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="dev@company.com"
                      className="pl-10 input-code text-sm text-black"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-code text-xs">ACCESS_KEY</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 input-code text-sm text-black"
                      value={formData.password}
                      onChange={handlePasswordChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password Strength Meter */}
                  {!isLogin && formData.password && (
                    <div className="space-y-2 pt-1 animate-in slide-in-from-top-1 duration-300">
                      <div className="flex gap-1 h-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={cn(
                              "flex-1 rounded-full transition-all duration-500",
                              passwordScore >= level
                                ? level <= 2 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                  : level === 3 ? "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                                    : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                : "bg-muted"
                            )}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-widest transition-colors duration-300",
                          passwordScore <= 2 ? "text-red-400" :
                            passwordScore === 3 ? "text-yellow-400" : "text-emerald-400"
                        )}>
                          {passwordScore === 0 ? "Very Weak" :
                            passwordScore === 1 ? "Weak" :
                              passwordScore === 2 ? "Fair" :
                                passwordScore === 3 ? "Good" : "Strong"}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50 font-mono">
                          {passwordScore < 3 ? "REQ: GOOD+" : "SECURE"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {isLogin && (
                  <div className="flex items-center justify-end">
                    <a href="#" className="font-code text-xs text-primary hover:underline">
                      &lt;Recover Password /&gt;
                    </a>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full font-code"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      {isLogin ? "EXECUTE LOGIN" : "INITIALIZE ACCOUNT"}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <SocialLoginButtons loading={isLoading} />

              <p className="text-center mt-8 text-muted-foreground font-code text-xs">
                {isLogin ? (
                  <>
                    No credentials?{" "}
                    <Link
                      to="/auth?mode=signup"
                      className="text-primary hover:underline font-bold"
                    >
                      [SIGN_UP]
                    </Link>
                  </>
                ) : (
                  <>
                    Has credentials?{" "}
                    <Link
                      to="/auth?mode=login"
                      className="text-primary hover:underline font-bold"
                    >
                      [SIGN_IN]
                    </Link>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-violet-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-white/10 blur-[120px] animate-fluid" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-black/10 blur-[100px] animate-fluid animation-delay-2000" />

        {/* Code Overlay */}
        <div className="absolute inset-0 opacity-10 font-code text-sm text-white p-10 overflow-hidden pointer-events-none select-none">
          {`function initializeNeuralLink() {
  const cortex = new CortexaCore({
    mode: 'human-first',
    latency: 0,
    sync: true
  });
  
  return cortex.connect().then(stream => {
    // Optimizing team velocity
    stream.optimize();
  });
}`}
        </div>

        <div className="relative z-10 text-center text-primary-foreground">
          <div className="w-24 h-24 rounded-[32px] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-10 animate-float shadow-2xl">
            <Sparkles className="w-12 h-12 text-white" />
          </div>

          <h2 className="text-5xl font-bold mb-6 tracking-tight text-white font-code">
            Human-first AI
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-md mx-auto font-medium leading-relaxed">
            Where your team's conversations become organized, assigned, and completed work.
          </p>

          <div className="mt-16 flex flex-col items-center gap-6">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center text-sm font-bold shadow-lg text-white font-code"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span className="text-primary-foreground/70 font-semibold tracking-wide uppercase text-xs font-code">
              Deployed by 10,000+ top-tier teams
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
