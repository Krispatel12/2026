import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Building2,
  LayoutGrid,
  Users,
  UserPlus,
  Settings,
  Plus,
  ArrowRight,
  Sparkles,
  Handshake,
  MessageSquare,
  Search,
  X,
  Hash,
  FileText,
  TrendingUp,
  Shield,
  Activity,
  Globe,
  Zap,
  Briefcase,
  Monitor,
  Brain
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "@/shared/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/components/ui/badge";

interface Organization {
  _id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  slug?: string;
}

interface Workspace {
  _id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  role: string;
  omniCount?: number;
  crewCount?: number;
  totalMembers?: number;
  hasProjectProfile?: boolean;
  status?: 'active' | 'deploying' | 'on-hold';
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const OrganizationDashboard = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [messageTab, setMessageTab] = useState<'internal' | 'project' | 'partner'>('internal');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      loadWorkspaces(selectedOrg._id);
    }
  }, [selectedOrg]);

  const loadOrganizations = async () => {
    try {
      const result = await apiClient.getOrganizations();
      setOrganizations(result.organizations || []);
      if (result.organizations && result.organizations.length > 0) {
        setSelectedOrg(result.organizations[0]);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  const loadWorkspaces = async (orgId: string) => {
    try {
      const result = await apiClient.getOrganization(orgId);
      setWorkspaces(result.workspaces || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load workspaces");
    }
  };

  const handleCreateWorkspaceManual = () => {
    if (!selectedOrg) {
      toast.error("Please select an organization first");
      return;
    }
    navigate(`/register/project?orgId=${selectedOrg._id}&returnTo=${encodeURIComponent(window.location.pathname)}`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background/50 backdrop-blur-sm h-full">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground font-black uppercase tracking-[0.3em] animate-pulse">Syncing Admin Node...</p>
        </div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="glass-premium border-white/5 overflow-hidden">
            <CardHeader className="pb-4 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-inner">
                <Building2 className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-3xl font-black tracking-tight mb-2 uppercase">No Organizations Detected</CardTitle>
              <CardDescription className="text-muted-foreground/80 font-medium">
                Your administrative identity is not yet linked to an organization domain.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-12 pt-6">
              <Button
                size="lg"
                className="h-16 px-10 rounded-2xl bg-primary text-black font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20"
                onClick={() => navigate("/welcome")}
              >
                <Plus className="w-5 h-5 mr-3" />
                Create Organization
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden selection:bg-primary/20 font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] animate-fluid" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[100px] animate-fluid animation-delay-2000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto p-6 md:p-10 space-y-10 animate-in fade-in duration-1000">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Operational Authority Locked</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
              Organization Admin
            </h1>
            <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-xl">
              Strategic oversight and mission-critical deployment console for <span className="text-foreground font-bold italic">@{selectedOrg?.name}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/app/chatbot">
              <Button variant="outline" className="h-12 border-indigo-500/20 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/30 font-bold px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/10">
                <Brain className="w-4 h-4 mr-2" />
                Orbix AI Assistant
              </Button>
            </Link>
            <Button
              className="h-12 bg-primary text-black font-black uppercase tracking-widest px-8 rounded-xl hover:scale-105 transition-all shadow-xl shadow-primary/20"
              onClick={handleCreateWorkspaceManual}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Workspace
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { label: 'Active Workspaces', value: workspaces.length, icon: LayoutGrid, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Intelligence Nodes', value: '4 Active', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Global Sectors', value: '7 Targeted', icon: Globe, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Personnel Strength', value: workspaces.reduce((acc, ws) => acc + (ws.totalMembers || 1), 0), icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="glass-card border-white/5 hover:border-white/10 transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <stat.icon className="w-12 h-12" />
                </div>
                <CardContent className="p-6">
                  <div className={cn("w-10 h-10 rounded-xl mb-4 flex items-center justify-center transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black tracking-tight text-white">{stat.value}</h3>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Workspace Management Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight uppercase text-foreground">Workspace Matrix</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active deployment environments and missions</p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="h-10 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 font-black uppercase tracking-widest text-[10px] rounded-xl px-6 hidden sm:flex"
              onClick={handleCreateWorkspaceManual}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Mission Node
            </Button>
            <div className="relative group w-64 hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search Mission Node..."
                className="h-10 pl-11 bg-card/40 border-white/5 focus:border-primary/50 text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
              />
            </div>
            <Button variant="ghost" size="icon" className="rounded-xl bg-muted/30 border border-white/5 hover:bg-muted/50">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Organization Selection Bar (if multiple) */}
        {organizations.length > 1 && (
          <div className="bg-card/30 backdrop-blur-xl border border-white/5 p-2 rounded-2xl flex flex-wrap gap-2 shadow-inner">
            <div className="px-4 py-2 border-r border-white/5 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Active Org Domain</span>
            </div>
            {organizations.map((org) => (
              <button
                key={org._id}
                onClick={() => setSelectedOrg(org)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  selectedOrg?._id === org._id
                    ? "bg-primary text-black shadow-lg shadow-primary/20"
                    : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                )}
              >
                {org.name}
              </button>
            ))}
          </div>
        )}

        {/* Workspaces Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {workspaces.map((workspace) => (
              <motion.div
                key={workspace._id}
                layout
                variants={itemVariants}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="glass-premium border-white/5 hover:border-primary/30 transition-all duration-300 group overflow-hidden relative cursor-default h-full flex flex-col">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-primary/10 transition-colors" />

                  <CardHeader className="relative">
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-110 transition-transform cursor-pointer" onClick={() => navigate(`/app?workspace=${workspace._id}`)}>
                        {workspace.name.charAt(0).toUpperCase()}
                      </div>
                      <Badge variant="outline" className={cn(
                        "border-white/10 uppercase font-black text-[8px] tracking-[0.2em] px-3 py-1 bg-white/5",
                        workspace.hasProjectProfile ? "text-emerald-400" : "text-amber-500"
                      )}>
                        {workspace.hasProjectProfile ? "Profile Secured" : "Pending Intel"}
                      </Badge>
                    </div>
                    <div className="pt-6">
                      <CardTitle className="text-2xl font-black tracking-tight text-white group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/app?workspace=${workspace._id}`)}>
                        {workspace.name}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground font-medium line-clamp-2 mt-2 leading-relaxed">
                        {workspace.description}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-6 flex flex-col">
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Personnel</p>
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          {workspace.totalMembers || 1}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Tactical</p>
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          {workspace.crewCount || 0}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Objective</p>
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <Activity className="w-3.5 h-3.5 text-emerald-500" />
                          {workspace.omniCount || 0}
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 space-y-3">
                      <Button
                        className="w-full h-12 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-black transition-all group/btn"
                        onClick={() => navigate(`/app?workspace=${workspace._id}`)}
                      >
                        Enter Workspace
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                      <div className="flex items-center gap-2 px-2">
                        <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-primary/40 rounded-full" style={{ width: workspace.hasProjectProfile ? '100%' : '30%' }} />
                        </div>
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">{workspace.hasProjectProfile ? '100%' : '30%'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Create Project Card */}
            <motion.div variants={itemVariants}>
              <Card
                className="border-2 border-dashed border-white/10 bg-transparent hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group cursor-pointer h-full min-h-[400px] flex flex-col justify-center items-center p-12 text-center"
                onClick={handleCreateWorkspaceManual}
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all border border-white/10 group-hover:border-primary/30 shadow-2xl">
                  <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors italic">Launch New Mission</h3>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Initialize Operational Domain</p>
                </div>
                <Button
                  variant="ghost"
                  className="mt-8 border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest px-8 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                >
                  Confirm Entry
                </Button>
              </Card>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {workspaces.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20"
          >
            <Card className="glass-card border-dashed border-white/10 bg-muted/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="py-20 text-center space-y-8 relative z-10">
                <div className="w-24 h-24 bg-card/60 rounded-[2.5rem] border border-white/10 flex items-center justify-center mx-auto shadow-2xl relative">
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
                  <LayoutGrid className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black tracking-tight text-white uppercase italic">Zero Mission Matrix Detected</h3>
                  <p className="text-muted-foreground font-medium text-lg">Initialize your first operational workspace to begin deployment.</p>
                </div>
                <Button
                  size="lg"
                  onClick={handleCreateWorkspaceManual}
                  className="h-16 px-12 rounded-2xl bg-primary text-black font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20"
                >
                  <Plus className="w-5 h-5 mr-3" />
                  Launch New Workspace
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Footer Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-white/5">
          <Card className="glass-card border-white/5 hover:border-blue-500/20 transition-all cursor-pointer group p-6" onClick={() => navigate("/register/org")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <Handshake className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-white tracking-tight">Partner Collaboration</h4>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Establish Cross-Domain Interlinks</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-blue-400 transition-all" />
            </div>
          </Card>
          <Card className="glass-card border-white/5 hover:border-emerald-500/20 transition-all cursor-pointer group p-6" onClick={() => setShowNewMessage(true)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-white tracking-tight">Broadcast Comms</h4>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Establish Neural Link Transmissions</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-emerald-400 transition-all" />
            </div>
          </Card>
        </div>
      </main>

      {/* Removed Create Workspace Dialog */}

      {/* New Message Dialog */}
      <Dialog open={showNewMessage} onOpenChange={setShowNewMessage}>
        <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-3xl border-white/10 text-foreground rounded-[2.5rem]">
          <DialogHeader className="border-b border-white/5 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-3xl font-black tracking-tight uppercase leading-none italic">Neural Link Relay</DialogTitle>
                <DialogDescription className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2 px-0.5 opacity-60">
                  Targeted Multi-Channel Transmission Protocol for Synchronized Personnel Deployment
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-white/5"
                onClick={() => setShowNewMessage(false)}
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-8 py-8">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search Personnel, Squads, or External Sectors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-16 pl-14 bg-black/40 border-white/5 focus:border-primary/40 rounded-2xl text-base font-bold placeholder:text-muted-foreground/30 transition-all shadow-inner"
              />
            </div>

            <div className="flex gap-2 p-1.5 bg-muted/20 rounded-2xl border border-white/5">
              {(['internal', 'project', 'partner'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMessageTab(tab)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-3 px-4 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all",
                    messageTab === tab
                      ? 'bg-primary shadow-lg shadow-primary/20 text-black'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  )}
                >
                  {tab === 'internal' && <FileText className="w-3.5 h-3.5" />}
                  {tab === 'project' && <Briefcase className="w-3.5 h-3.5" />}
                  {tab === 'partner' && <Handshake className="w-3.5 h-3.5" />}
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] px-1 italic">Suggested Nodes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                {workspaces.map((workspace) => (
                  <button
                    key={workspace._id}
                    onClick={() => {
                      if (selectedRecipients.includes(workspace._id)) {
                        setSelectedRecipients(selectedRecipients.filter(id => id !== workspace._id));
                      } else {
                        setSelectedRecipients([...selectedRecipients, workspace._id]);
                      }
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl transition-all border group text-left",
                      selectedRecipients.includes(workspace._id)
                        ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]'
                        : 'bg-card/40 border-white/5 hover:border-white/10 hover:bg-card/60'
                    )}
                  >
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg transition-transform group-hover:scale-110",
                      selectedRecipients.includes(workspace._id) ? "bg-primary text-black" : "bg-muted text-muted-foreground"
                    )}>
                      {workspace.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{workspace.name}</p>
                      <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">Active Objective</p>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      selectedRecipients.includes(workspace._id) ? "bg-primary border-primary" : "border-white/10"
                    )}>
                      {selectedRecipients.includes(workspace._id) && <Zap className="w-3 h-3 text-black" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-8">
            <div className="space-y-0.5">
              <p className="text-xs font-black text-foreground uppercase tracking-widest italic">{selectedRecipients.length} Recipient Nodes Targeted</p>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">Neural Link Established</p>
            </div>
            <Button
              disabled={selectedRecipients.length === 0}
              onClick={() => {
                toast.success('Neural Link Established');
                setShowNewMessage(false);
                setSelectedRecipients([]);
                navigate('/app/org-admin/chat');
              }}
              className="px-10 h-14 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all"
            >
              Establish Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationDashboard;
