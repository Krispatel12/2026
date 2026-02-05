import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Building2,
  LayoutGrid,
  UserPlus,
  Telescope,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Users,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/shared/lib/api";
import { useApp } from "@/shared/contexts/AppContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/shared/components/ui/dialog";

const Welcome = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const { user, loading: appLoading, refreshWorkspaces, enterReconMode } = useApp();

  // Dialog States
  const [showJoinWorkspace, setShowJoinWorkspace] = useState(false);

  // Form States
  const [loading, setLoading] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState("");

  // Protect route
  useEffect(() => {
    if (!appLoading && !user) {
      navigate("/auth");
    }
  }, [appLoading, user, navigate]);

  // Handle invite code
  useEffect(() => {
    if (code) {
      setInviteCode(code);
      setShowJoinWorkspace(true);
    }
  }, [code]);

  if (appLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Handlers
  const handleJoinWorkspace = async () => {
    if (!inviteCode.trim()) { toast.error("Invite code is required"); return; }
    try {
      setLoading("join");
      const result = await apiClient.joinByCode(inviteCode);
      toast.success("Joined workspace successfully!");
      setShowJoinWorkspace(false); setInviteCode("");
      await refreshWorkspaces(); navigate(`/app/workspace/${result.workspace._id}`);
    } catch (error: any) { console.error(error); toast.error(error.message || "Failed to join workspace. Check your code."); } finally { setLoading(null); }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden text-foreground selection:bg-primary/30 selection:text-primary-foreground">

      {/* Advanced AI Network Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Animated fluid blobs */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] animate-fluid opacity-60 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px] animate-fluid animation-delay-2000 opacity-50 mix-blend-screen" />

        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.07)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Attractive Professional Back Arrow */}
      <div className="absolute top-8 left-8 z-50">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="group flex items-center gap-3 px-5 py-6 rounded-full bg-background/50 hover:bg-background/80 border border-border/50 hover:border-primary/30 backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_20px_-5px_rgba(var(--primary-rgb),0.3)]"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-1 transition-transform duration-300" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">Return</span>
            <span className="text-[10px] font-mono text-primary/70 opacity-0 group-hover:opacity-100 -mt-1 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">TO_MAIN_HUB</span>
          </div>
        </Button>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl z-10 flex flex-col items-center justify-center min-h-[85vh] gap-12">

        {/* Header Section */}
        <div className="text-center space-y-6 animate-slide-up max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/50 border border-border backdrop-blur-md shadow-sm mb-2 group cursor-default hover:bg-muted transition-colors">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500/80 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase font-mono">System Operational // v2.4.0</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-foreground leading-[0.9] drop-shadow-2xl">
            Orchestrate <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-primary to-violet-400 animate-shimmer bg-[length:200%_auto]">Neural Operations</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Initialize your cognitive command center. Synchronize autonomous agents, strategic workflows, and team intelligence in a unified grid.
          </p>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full animate-fade-in stagger-children px-4">

          {/* Card 1: Enterprise (Organization) */}
          <div
            className="group relative col-span-1 md:col-span-2 lg:col-span-1 lg:row-span-1 bg-card/60 backdrop-blur-2xl border border-border rounded-[2rem] p-6 cursor-pointer overflow-hidden transition-all duration-500 hover:bg-card/80 hover:scale-[1.02] hover:border-primary/50 hover:shadow-[0_0_50px_-10px_rgba(59,130,246,0.3)] flex flex-col h-[400px]"
            onClick={() => navigate("/login/organization")}
          >
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-2">Enterprise Grid</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Strategic organization & domain management.</p>
            </div>

            {/* Neural Node Visualization */}
            <div className="relative flex-1 mt-6 w-full flex items-center justify-center perspective-1000 group-hover:perspective-[1200px] transition-all">
              <div className="relative w-32 h-32 preserve-3d group-hover:rotate-y-12 transition-transform duration-700">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <div className="absolute inset-2 border-2 border-primary/30 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-6 border border-indigo-400/50 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-background rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] -translate-x-1/2 -translate-y-1/2 z-20" />
              </div>
            </div>

            <div className="relative z-10 pt-4 flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs group-hover:translate-x-2 transition-transform">
              Access Infrastructure <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Workspace */}
          <div
            className="group relative bg-card/60 backdrop-blur-2xl border border-border rounded-[2rem] p-6 cursor-pointer overflow-hidden transition-all duration-500 hover:bg-card/80 hover:scale-[1.02] hover:border-emerald-400/50 hover:shadow-[0_0_50px_-10px_rgba(16,185,129,0.3)] flex flex-col justify-between h-[400px]"
            onClick={() => navigate("/login/project")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <LayoutGrid className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-2">Tactical Operations</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Project-level execution & task deployment.</p>
            </div>

            <div className="relative h-24 w-full mt-4 flex items-center justify-center opacity-40 group-hover:opacity-80 transition-opacity">
              <div className="grid grid-cols-4 gap-2 w-full max-w-[180px]">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-md bg-emerald-500/30 transition-all duration-300 group-hover:bg-emerald-400/50" style={{ transitionDelay: `${i * 50}ms`, transform: `scale(${Math.random() * 0.5 + 0.5})` }} />
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-4 flex items-center gap-2 text-emerald-500 font-bold uppercase tracking-widest text-xs group-hover:translate-x-2 transition-transform">
              Deploy Workspace <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3: Join Unit */}
          <div
            className="group relative bg-card/60 backdrop-blur-2xl border border-border rounded-[2rem] p-6 cursor-pointer overflow-hidden transition-all duration-500 hover:bg-card/80 hover:scale-[1.02] hover:border-violet-400/50 hover:shadow-[0_0_50px_-10px_rgba(139,92,246,0.3)] flex flex-col justify-between h-[400px]"
            onClick={() => setShowJoinWorkspace(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <UserPlus className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-2">Link Sequence</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Secure protocol for existing unit entry.</p>
            </div>

            <div className="relative h-24 w-full mt-4 flex items-center justify-center opacity-40 group-hover:opacity-80 transition-opacity">
              <div className="flex -space-x-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-background bg-violet-500/20 backdrop-blur-md flex items-center justify-center">
                    <Users className="w-5 h-5 text-violet-400" />
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-4 flex items-center gap-2 text-violet-500 font-bold uppercase tracking-widest text-xs group-hover:translate-x-2 transition-transform">
              Initiate Handshake <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 4: Recon */}
          <div
            className="group relative bg-card/60 backdrop-blur-2xl border border-border rounded-[2rem] p-6 cursor-pointer overflow-hidden transition-all duration-500 hover:bg-card/80 hover:scale-[1.02] hover:border-orange-400/50 hover:shadow-[0_0_50px_-10px_rgba(249,115,22,0.3)] flex flex-col justify-between h-[400px]"
            onClick={() => { enterReconMode(); navigate("/app"); }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Telescope className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-2">Visual Recon</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Guest-level system exploration.</p>
            </div>

            <div className="relative h-24 w-full mt-4 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border border-orange-500/30 relative overflow-hidden group-hover:border-orange-400/60 transition-colors">
                <div className="absolute inset-0 animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(249,115,22,0.5)_360deg)] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-orange-500 rounded-full shadow-[0_0_10px_orange]" />
              </div>
            </div>

            <div className="relative z-10 pt-4 flex items-center gap-2 text-orange-500 font-bold uppercase tracking-widest text-xs group-hover:translate-x-2 transition-transform">
              Start Simulation <ArrowRight className="w-4 h-4" />
            </div>
          </div>

        </div>
      </div>

      {/* --- DIALOGS --- */}


      <Dialog open={showJoinWorkspace} onOpenChange={setShowJoinWorkspace}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground shadow-2xl backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Authentication</DialogTitle>
            <DialogDescription className="text-muted-foreground">Enter secure invite sequence.</DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Label htmlFor="inviteCode" className="text-sm font-medium text-muted-foreground mb-2 block">Access Code</Label>
            <Input id="inviteCode" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="XXXX-XXXX-XXXX" className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary text-center text-xl font-mono tracking-[0.2em] uppercase" autoFocus />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowJoinWorkspace(false)} className="text-muted-foreground hover:text-foreground hover:bg-muted">Cancel</Button>
            <Button onClick={handleJoinWorkspace} disabled={loading === "join" || !inviteCode.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {loading === "join" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Authenticate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Welcome;
