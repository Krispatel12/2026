import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import {
  MessageSquare,
  CheckSquare,
  Brain,
  Users,
  Shield,
  Sparkles,
  ArrowRight,
  Play,
  Zap,
  Eye,
  AlertTriangle,
  Heart,
  Check,
  Send,
  MoreHorizontal,
  Globe,
  Command,
  Cpu,
  Sun,
  Moon,
  Bot,
  MessageCircle,
  X
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";

const Landing = () => {
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200 text-foreground transition-colors duration-300">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <LivePreviewSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />

      {/* Floating AI Assistant Widget */}
      <div className="fixed bottom-8 right-8 z-50">
        {isAiOpen ? (
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-80 sm:w-96 overflow-hidden animate-slide-up origin-bottom-right">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-indigo-600/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Cortexa AI</h3>
                  <p className="text-[10px] text-indigo-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online & Ready
                  </p>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => setIsAiOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="h-80 p-4 overflow-y-auto space-y-4 custom-scrollbar">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="bg-white/5 rounded-2xl rounded-tl-none p-3 text-sm text-slate-300 border border-white/5">
                  Hello! I'm your Cortexa AI assistant. I can help you understand how our autonomous team platform works. What would you like to know?
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {["How does it work?", "Pricing?", "Integration?"].map((q, i) => (
                  <button key={i} className="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-3 py-1.5 rounded-full transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-3 border-t border-white/10 bg-white/5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
                <button className="absolute right-2 top-2 p-0.5 text-indigo-400 hover:text-white transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAiOpen(true)}
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:shadow-[0_0_50px_rgba(99,102,241,0.7)] transition-all hover:scale-110 active:scale-95"
          >
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-20" />
            <MessageCircle className="w-7 h-7 text-white" />
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-slate-900">1</span>
          </button>
        )}
      </div>
    </div>
  );
};


// ========================
// THEME TOGGLE
// ========================
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className="relative flex items-center bg-muted border border-border rounded-full p-1 cursor-pointer w-16 h-8 transition-colors duration-300 hover:border-primary/50"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <div
        className={cn(
          "absolute left-1 bg-white dark:bg-slate-800 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center",
          theme === "dark" ? "translate-x-8" : "translate-x-0"
        )}
      >
        {theme === "dark" ? (
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
      </div>
      <div className="flex justify-between w-full px-2">
        <div className="w-4" /> {/* Spacer */}
      </div>
      <span className="sr-only">Toggle theme</span>
    </div>
  );
};

// ========================
// NAVBAR
// ========================
const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 glass-premium border-b border-white/5">
    <div className="container mx-auto px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-all ring-1 ring-white/10">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-foreground tracking-tighter">cortexa</span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
        <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
        <a href="#preview" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Preview</a>
        <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link to="/auth?mode=login">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted">Sign In</Button>
        </Link>
        <Link to="/auth?mode=signup">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 border-0" size="sm">Get Started</Button>
        </Link>
      </div>
    </div>
  </nav>
);

// ========================
// HERO SECTION
// ========================
const HeroSection = () => {
  return (
    <section className="pt-32 pb-16 md:pt-48 md:pb-32 px-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[120px] animate-fluid opacity-40 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[100px] animate-fluid animation-delay-2000 opacity-40 mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8 animate-slide-down backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Human-first AI for elite teams</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 animate-slide-up text-foreground leading-[1.1] drop-shadow-2xl">
              Your Team's <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-400 to-sky-400 animate-shimmer bg-[length:200%_auto]">AI Operating System</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mb-10 animate-slide-up mx-auto lg:mx-0 leading-relaxed font-light" style={{ animationDelay: "0.1s" }}>
              Cortexa transforms your team chats into clear, assigned, and completed work — automatically.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/auth?mode=signup" className="w-full sm:w-auto">
                <Button size="xl" className="bg-foreground text-background hover:bg-foreground/90 w-full sm:w-auto h-14 px-8 text-lg font-bold shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
                  Start Deployment
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="xl" className="h-14 px-8 text-lg font-bold border-border bg-card/60 hover:bg-muted text-foreground transition-all gap-2 w-full sm:w-auto hover:border-foreground/20 backdrop-blur-md">
                <Play className="w-5 h-5 fill-foreground" />
                Live Demo
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6 animate-slide-up font-medium" style={{ animationDelay: "0.3s" }}>
              No credit card required. Built with privacy in mind.
            </p>
          </div>

          {/* Right animated visual */}
          <div className="relative h-[400px] md:h-[500px] animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <HeroAnimation />
          </div>
        </div>
      </div>
    </section>
  );
};

// Animated hero visual with orbiting cards
const HeroAnimation = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-1000">
      {/* Center AI Orb */}
      <div className="absolute w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center animate-glow-pulse z-20 shadow-[0_0_50px_rgba(99,102,241,0.5)] transition-colors duration-300">
        <Brain className="w-10 h-10 md:w-14 md:h-14 text-white" />
      </div>

      {/* Orbital ring */}
      <div className="absolute w-[280px] h-[280px] md:w-[380px] md:h-[380px] rounded-full border border-white/5 animate-[spin_20s_linear_infinite]" />
      <div className="absolute w-[340px] h-[340px] md:w-[460px] md:h-[460px] rounded-full border border-white/10 animate-[spin_30s_linear_infinite_reverse]" />

      {/* Chat card - orbiting */}
      <div className="absolute animate-orbit" style={{ animationDuration: "25s" }}>
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-4 w-52 md:w-64">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Team Chat</span>
              <span className="text-[10px] text-slate-400">#engineering</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-slate-300">Login API failing again 😭</div>
            <div className="bg-blue-500/10 rounded-lg px-3 py-2 text-xs text-blue-200 ml-4 border border-blue-500/20">On it! Checking logs now</div>
          </div>
        </div>
      </div>

      {/* Team Mode card - orbiting (offset) */}
      <div className="absolute animate-orbit" style={{ animationDuration: "25s", animationDelay: "-12.5s" }}>
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-4 w-48 md:w-56">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Team Mode</span>
              <span className="text-[10px] text-slate-400">Active Session</span>
            </div>
          </div>
          <div className="flex items-center -space-x-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-slate-900" />
            <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900" />
            <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-slate-900" />
            <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[8px] text-white">+5</div>
          </div>
          <div className="text-[10px] text-violet-300 font-medium bg-violet-500/10 rounded-full px-2 py-0.5 inline-block border border-violet-500/20">
            High Velocity
          </div>
        </div>
      </div>


      {/* Task card - orbiting opposite */}
      <div className="absolute animate-orbit-reverse" style={{ animationDuration: "30s" }}>
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-4 w-48 md:w-56">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">New Task</span>
              <span className="text-[10px] text-slate-400">Auto-created</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <div className="w-3 h-3 rounded-full bg-emerald-500/20 flex items-center justify-center"><Check className="w-2 h-2 text-emerald-400" /></div>
              <span className="line-through text-slate-500">Fix auth bug</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white">
              <div className="w-3 h-3 rounded border border-slate-500" />
              <span>Deploy to staging</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant card - orbiting opposite (offset) */}
      <div className="absolute animate-orbit-reverse" style={{ animationDuration: "30s", animationDelay: "-15s" }}>
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-4 w-52 md:w-64">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">AI Assistant</span>
              <span className="text-[10px] text-slate-400">Ready to help</span>
            </div>
          </div>
          <div className="bg-amber-500/5 rounded-lg p-2 border border-amber-500/10 mb-2">
            <div className="flex gap-2">
              <div className="w-1 h-8 bg-amber-500/40 rounded-full" />
              <p className="text-[10px] text-slate-300 leading-tight">
                I've analyzed the logs. The error is in the JWT middleware on line 42.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] text-amber-500 font-medium">Processing...</span>
          </div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute top-10 left-10 w-2 h-2 rounded-full bg-blue-400/50 animate-float blur-[1px]" />
      <div className="absolute bottom-20 right-10 w-3 h-3 rounded-full bg-violet-400/50 animate-float blur-[1px]" style={{ animationDelay: "1s" }} />
    </div>
  );
};

// ========================
// HOW IT WORKS SECTION
// ========================
const HowItWorksSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll(".scroll-reveal");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      icon: <MessageSquare className="w-7 h-7" />,
      title: "It listens to your chats",
      description: "Cortexa reads your team's chats (in AI-enabled channels) and spots real work hidden inside the messages."
    },
    {
      icon: <Brain className="w-7 h-7" />,
      title: "It understands and plans",
      description: "It detects tasks, assigns them to the right people based on skills and workload, and predicts bottlenecks."
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: "It keeps everyone aligned",
      description: "It reminds, tracks, and summarizes so work flows smoothly without micro-management."
    }
  ];

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 px-6 bg-muted/30 border-y border-border">
      <div className="container mx-auto">
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">How Cortexa works in your team</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            From chaos to clarity in three simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="scroll-reveal text-center bg-card rounded-3xl p-8 border border-border hover:border-primary/20 hover:bg-muted/50 transition-all duration-300 group shadow-sm"
              style={{ transitionDelay: `${index * 0.15}s` }}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
                {step.icon}
              </div>
              <div className="text-sm font-bold text-primary mb-3 tracking-widest uppercase">Step {index + 1}</div>
              <h3 className="text-xl font-bold mb-4 text-foreground">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-light">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ========================
// FEATURES SECTION
// ========================
const FeaturesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll(".scroll-reveal");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const features = [
    { icon: <Zap className="w-6 h-6" />, title: "Realtime chat + tasks", description: "Messages instantly become actionable tasks without context switching." },
    { icon: <Cpu className="w-6 h-6" />, title: "Smart Logic Engine", description: "AI considers skills, workload, and fairness when assigning work." },
    { icon: <Eye className="w-6 h-6" />, title: "Explainable AI decisions", description: "Every AI action can be questioned. Transparency is built in." },
    { icon: <Shield className="w-6 h-6" />, title: "No-surveillance, privacy-first", description: "You control what AI sees. Private channels stay private." },
    { icon: <AlertTriangle className="w-6 h-6" />, title: "Crisis mode for P0 incidents", description: "Automatic escalation and focused response for critical issues." },
    { icon: <Heart className="w-6 h-6" />, title: "Non-toxic performance insights", description: "Recognition over ranking. Wellbeing over burnout metrics." },
  ];

  return (
    <section id="features" ref={sectionRef} className="py-24 px-6 relative">
      <div className="container mx-auto">
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">Built for fast-moving IT teams</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Everything your team needs to stay productive, aligned, and healthy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="scroll-reveal bg-card hover:bg-muted/50 border border-border hover:border-border/80 rounded-[2rem] p-8 transition-all duration-300 group shadow-sm hover:shadow-md"
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-foreground mb-6 transition-all duration-500 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ========================
// LIVE PREVIEW SECTION
// ========================
const LivePreviewSection = () => {
  const [messageVisible, setMessageVisible] = useState(false);
  const [taskVisible, setTaskVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageVisible(true);
      setTaskVisible(false);

      setTimeout(() => {
        setTaskVisible(true);
      }, 1500);

      setTimeout(() => {
        setMessageVisible(false);
        setTaskVisible(false);
      }, 5000);
    }, 6000);

    // Initial trigger
    setTimeout(() => {
      setMessageVisible(true);
      setTimeout(() => setTaskVisible(true), 1500);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="preview" className="py-24 px-6 bg-muted/30 border-y border-border">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-foreground tracking-tight">Experience the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Future</span></h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            A unified neural workspace where chat, tasks, and AI work together in perfect harmony.
          </p>
        </div>

        <div className="relative bg-[#0f172a] rounded-2xl shadow-2xl border border-white/10 overflow-hidden max-w-6xl mx-auto ring-1 ring-white/10">
          {/* Mock navbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/5">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span className="text-xs font-medium text-slate-300">Backend IT Team</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10" />
            </div>
          </div>

          {/* Main content */}
          <div className="flex h-[500px] md:h-[600px]">
            {/* Sidebar */}
            <div className="hidden sm:block w-64 border-r border-white/5 bg-[#020617]/50 p-4 space-y-1">
              <div className="text-[10px] font-bold text-slate-500 px-2 py-2 tracking-widest uppercase">CHANNELS</div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/10 text-indigo-300 text-sm font-medium border border-indigo-500/20">
                <MessageSquare className="w-4 h-4" />
                general
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-slate-400 transition-colors">
                <MessageSquare className="w-4 h-4 opacity-50" />
                backend-squad
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-slate-400 transition-colors">
                <MessageSquare className="w-4 h-4 opacity-50" />
                releases
              </div>

              <div className="text-[10px] font-bold text-slate-500 px-2 py-2 tracking-widest uppercase mt-6">DIRECT MESSAGES</div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-slate-400 transition-colors">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Sarah K.
              </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col bg-[#0b1120]">
              <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">JD</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-white">John Doe</span>
                      <span className="text-xs text-slate-500">10:32 AM</span>
                    </div>
                    <div className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-slate-300 inline-block max-w-md border border-white/5 leading-relaxed">
                      Morning team! Anyone looked at the staging issues? I'm seeing erratic behavior on the auth service.
                    </div>
                  </div>
                </div>

                {messageVisible && (
                  <div className="flex items-start gap-4 animate-message-appear">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">SK</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white">Sarah Kim</span>
                        <span className="text-xs text-slate-500">10:34 AM</span>
                      </div>
                      <div className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-slate-300 inline-block max-w-md border border-white/5 leading-relaxed">
                        The login API is throwing 500 errors 😭 Need someone to look at it ASAP. It seems related to the new JWT middleware.
                      </div>
                    </div>
                  </div>
                )}

                {taskVisible && (
                  <div className="animate-task-slide bg-indigo-500/10 rounded-2xl p-4 border border-indigo-500/20 max-w-md ml-14">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded bg-indigo-500/20">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Cortexa Analysis</span>
                    </div>
                    <div className="flex items-center gap-3 bg-indigo-950/40 p-3 rounded-xl border border-indigo-500/10">
                      <div className="w-5 h-5 rounded border-2 border-indigo-400 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-indigo-400 rounded-sm" />
                      </div>
                      <span className="text-sm font-semibold text-white">Fix Login API 500 errors</span>
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-400 pl-1">
                      <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/10">P0 CRITICAL</span>
                      <span>→ Assigned to Backend Team</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/5 bg-[#020617]/30">
                <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/5 focus-within:border-indigo-500/50 transition-colors">
                  <input
                    type="text"
                    placeholder="Message #general"
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-600 text-white"
                    disabled
                  />
                  <Send className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            </div>

            {/* Right panel - Tasks */}
            <div className="hidden lg:block w-72 border-l border-white/5 bg-[#020617]/50 p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Tasks</h3>
                <MoreHorizontal className="w-4 h-4 text-slate-600" />
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="mt-0.5 rounded-full p-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 line-through group-hover:text-slate-400">Update staging env</p>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase">Completed</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/15 transition-colors cursor-pointer">
                  <div className="w-4 h-4 rounded border-2 border-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Review PR #234</p>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase">In Progress</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="w-4 h-4 rounded border-2 border-slate-600 mt-0.5 group-hover:border-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-300 group-hover:text-white">API documentation</p>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">To Do</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ========================
// TESTIMONIALS SECTION
// ========================
const TestimonialsSection = () => {
  const testimonials = [
    { quote: "Cortexa killed our standup chaos. Now we just... work.", author: "Alex Chen", role: "Engineering Lead" },
    { quote: "We stopped losing tasks in Slack. Finally, accountability without the overhead.", author: "Maria Garcia", role: "Product Manager" },
    { quote: "Assignment is finally fair and transparent. The team morale improved.", author: "James Wilson", role: "DevOps Lead" },
  ];

  return (
    <section className="py-24 px-6 relative">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-bold text-primary mb-4 tracking-[0.2em] uppercase">Trusted by elite teams</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">What teams are saying</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="glass-card border-border/50 rounded-[2rem] p-8 shadow-xl card-lift hover:border-border/80">
              <div className="text-4xl text-primary font-serif mb-4 leading-none opacity-50">"</div>
              <p className="text-lg mb-8 text-foreground/80 font-light leading-relaxed">{testimonial.quote}</p>
              <div className="flex items-center gap-4 border-t border-border/50 pt-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20 text-sm">
                  {testimonial.author.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{testimonial.author}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ========================
// CTA SECTION
// ========================
const CTASection = () => (
  <section className="py-24 px-6 relative">
    <div className="container mx-auto">
      <div className="relative rounded-[48px] bg-[#020617] p-12 md:p-24 text-center overflow-hidden border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay" />
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/30 blur-[120px] animate-fluid" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[100px] animate-fluid animation-delay-2000" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none">
            Ready to turn team chaos into <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">absolute clarity?</span>
          </h2>
          <p className="text-xl md:text-2xl text-indigo-100 mb-12 max-w-2xl mx-auto font-light leading-relaxed opacity-80">
            Join elite teams who've discovered the power of autonomous AI collaboration.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/auth?mode=signup" className="w-full sm:w-auto">
              <Button size="xl" className="bg-white text-indigo-950 hover:bg-indigo-50 w-full sm:w-auto h-16 px-10 text-xl font-bold shadow-2xl shadow-indigo-500/20 transition-all hover:scale-105">
                Deploy cortexa Now
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="xl" className="h-16 px-10 text-xl font-bold border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all w-full sm:w-auto backdrop-blur-sm">
              Schedule Recon
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ========================
// FOOTER
// ========================
const Footer = () => (
  <footer className="py-16 px-6 border-t border-border bg-card">
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/20 border border-white/10">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-black text-foreground tracking-tighter">cortexa</span>
        </div>

        <p className="text-sm text-muted-foreground font-bold uppercase tracking-[0.2em]">
          Building the future of team intelligence.
        </p>

        <div className="flex items-center gap-8">
          <a href="#" className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">Protocol</a>
          <a href="#" className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">Privacy</a>
          <a href="#" className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">Support</a>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-muted-foreground font-medium">&copy; 2026 Cortexa Neural Systems. All rights reserved.</p>
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors cursor-pointer border border-border">
            <Globe className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Landing;