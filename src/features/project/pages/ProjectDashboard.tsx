import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  LayoutGrid,
  CheckSquare,
  MessageSquare,
  Users,
  Activity,
  ArrowUpRight,
  Clock,
  Zap,
  Star,
  Shield,
  Target,
  Plus
} from "lucide-react";
import { useApp } from "@/shared/contexts/AppContext";
import { useNavigate } from "react-router-dom";

export default function ProjectDashboard() {
  const { currentWorkspace, user } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading Tactical Telemetry
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-background/50 backdrop-blur-sm h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">Syncing Tactical Telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto h-full overflow-auto no-scrollbar pb-24">
      {/* Tactical Hero Section */}
      <div className="relative overflow-hidden rounded-[32px] p-8 border border-white/10 bg-gradient-to-br from-primary/20 via-background to-accent/10 shadow-xl group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Activity className="w-32 h-32" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                Operational
              </span>
              <span className="text-muted-foreground/60 text-sm font-medium">Mission: {currentWorkspace?.name || "Active Session"}</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground/90 leading-tight">
              Welcome back, <span className="text-primary">{user?.name?.split(' ')[0] || "Crew"}</span>.
            </h1>
            <p className="text-muted-foreground max-w-xl font-medium leading-relaxed">
              Tactical telemetry shows high engagement across all neural links. Your current objective is to synchronize workspace goals.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02]">
              View Briefing
            </Button>
            <Button variant="outline" className="h-12 w-12 rounded-2xl border-white/10 hover:bg-white/5 p-0">
              <Zap className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Neural Commits", value: "24", icon: LayoutGrid, color: "text-blue-500" },
          { label: "Active Nodes", value: "12", icon: Target, color: "text-emerald-500" },
          { label: "Pending Tasks", value: "8", icon: CheckSquare, color: "text-orange-500" },
          { label: "Team Morale", value: "98%", icon: Star, color: "text-yellow-500" },
        ].map((stat, i) => (
          <Card key={i} className="glass-card hover:bg-white/5 transition-all duration-300 group border-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-xl bg-white/5 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-black text-foreground/90">{stat.value}</p>
              <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Activity Area */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-card border-white/5 overflow-hidden">
            <CardHeader className="border-b border-white/5 px-8 pb-6 bg-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Mission Activity
                  </CardTitle>
                  <CardDescription>Live update stream from the workspace</CardDescription>
                </div>
                <Button variant="ghost" className="text-[12px] font-bold hover:bg-primary/10 hover:text-primary rounded-xl">
                  View History
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {[
                  { user: "Sarah Chen", action: "uplinked a new brief", time: "12m ago", type: "update" },
                  { user: "Orbix AI", action: "optimized task sequence", time: "45m ago", type: "ai" },
                  { user: "James Wu", action: "synchronized neural link", time: "2h ago", type: "sync" },
                  { user: "Alex Rivers", action: "completed primary objective", time: "4h ago", type: "success" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-6 hover:bg-white/5 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-muted/50 border border-white/5 flex items-center justify-center font-bold text-sm">
                      {item.user.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground/90">
                        {item.user} <span className="text-muted-foreground font-medium">{item.action}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">{item.time}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Space */}
        <div className="space-y-8 text-foreground">
          <Card className="glass-card bg-primary/5 border-primary/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Shield className="w-16 h-16" />
            </div>
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-[2px] flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/80 font-medium">Neural link encryption is at maximum capacity. Workspace is secure.</p>
              <div className="h-2 w-full bg-primary/20 rounded-full overflow-hidden">
                <div className="h-full w-[94%] bg-primary rounded-full" />
              </div>
              <Button size="sm" className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-bold rounded-xl h-9">
                Verify Identity
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5 overflow-hidden">
            <CardHeader className="bg-white/5">
              <CardTitle className="text-sm font-black uppercase tracking-[2px] flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Squad
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background ring-2 ring-white/5 overflow-hidden transition-transform hover:scale-110 cursor-pointer">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="Avatar" />
                  </div>
                ))}
                <button className="w-10 h-10 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
