import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import { useApp } from "@/shared/contexts/AppContext";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  LayoutGrid,
  MessageSquare,
  CheckSquare,
  Users,
  Video,
  Brain,
  TrendingUp,
  Settings,
  Search,
  Bell,
  ChevronDown,
  Plus,
  Check,
  LogOut,
  Sparkles,
  Menu,
  Building2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { useEffect } from "react";

export default function ProjectLayout() {
  const { workspaces, user, isReconMode, logout, currentWorkspace, setCurrentWorkspace } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle Recon Mode Body Class
  useEffect(() => {
    if (isReconMode) {
      document.body.classList.add('recon-mode');
    } else {
      document.body.classList.remove('recon-mode');
    }
    return () => document.body.classList.remove('recon-mode');
  }, [isReconMode]);

  // Navigation Items
  const navigationGroups = [
    {
      title: "Workspace",
      items: [
        {
          name: "Home",
          href: "/app",
          icon: LayoutGrid
        },
        { name: "Chat", href: "/app/chat", icon: MessageSquare },
        { name: "Tasks", href: "/app/tasks", icon: CheckSquare },
        { name: "Team", href: "/app/team", icon: Users },
        { name: "Meetings", href: "/app/meetings", icon: Video },
      ]
    },
    {
      title: "Tools",
      items: [
        { name: "Orbix Chatbot", href: "/app/chatbot", icon: Brain },
      ]
    }
  ];

  return (
    <div className="flex w-full h-screen bg-background overflow-hidden selection:bg-primary/20 relative">
      {/* Recon Banner */}

      {/* Background Ambience */}
      {/* Background Ambience - Elite */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[130px] animate-pulse-slow mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] animate-fluid mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay"></div>
      </div>

      {/* Sidebar - Elite Glass Design */}
      <aside className={cn(
        "flex flex-col w-[280px] shrink-0 m-4 mr-0 rounded-[24px] border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] relative z-30 transition-all duration-300 md:translate-x-0 glass-premium backdrop-blur-2xl",
        isMobileMenuOpen ? "translate-x-0 absolute inset-y-0 left-0 m-0 rounded-none w-3/4 z-50 transform-gpu" : "hidden md:flex transform-gpu"
      )}>

        {/* Workspace Brand / Switcher */}
        <div className="p-6 pb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 transition-all duration-300 border border-transparent hover:border-border/40 group bg-card/30">
                {currentWorkspace ? (
                  <>
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-all transform group-hover:scale-105 shrink-0">
                      {currentWorkspace.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left min-w-0 flex flex-col justify-center">
                      <p className="font-bold text-[15px] truncate text-foreground/90 tracking-tight leading-none mb-1">{currentWorkspace.name}</p>
                      <div className="flex items-center gap-1.5 opacity-60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <p className="text-[11px] font-medium capitalize tracking-wide text-muted-foreground">{currentWorkspace.role}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 text-left">
                    <p className="font-bold text-sm text-foreground/70">Select Workspace</p>
                  </div>
                )}
                <div className="w-8 h-8 rounded-full bg-background/50 flex items-center justify-center text-muted-foreground group-hover:bg-background/80 transition-colors">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-68 glass-card rounded-[24px] p-2 shadow-xl" align="start" sideOffset={8}>
              <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-[2px] font-bold px-4 py-3">Switch Workspace</DropdownMenuLabel>
              <div className="max-h-[240px] overflow-y-auto pr-1">
                {workspaces.map((ws) => (
                  <DropdownMenuItem
                    key={ws._id}
                    className={cn(
                      "flex items-center gap-3 py-3 px-3 rounded-xl cursor-pointer mb-1 transition-all duration-200 outline-none",
                      currentWorkspace?._id === ws._id ? "bg-primary/15" : "hover:bg-white/5"
                    )}
                    onClick={() => setCurrentWorkspace(ws)}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm transition-colors",
                      currentWorkspace?._id === ws._id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-muted/50 text-muted-foreground"
                    )}>
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className={cn("font-semibold text-sm", currentWorkspace?._id === ws._id ? "text-primary" : "text-foreground/80")}>{ws.name}</p>
                    </div>
                    {currentWorkspace?._id === ws._id && <Check className="w-4 h-4 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator className="bg-border/50" />
              <Link to="/join-workspace">
                <DropdownMenuItem className="py-2.5 px-3 rounded-xl cursor-pointer focus:bg-muted/60 mt-1">
                  <Plus className="w-4 h-4 mr-2 text-primary" />
                  <span className="text-primary font-medium">Join / Create Workspace</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-8 overflow-y-auto no-scrollbar scroll-smooth">
          {navigationGroups.map((group) => (
            <div key={group.title} className="relative">
              <h4 className="px-5 mb-3 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[2px]">
                {group.title}
              </h4>
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  /* Logic ensuring /app/chat isn't highlighted when /app/chatbot is active */
                  const isActive = item.href === "/app"
                    ? location.pathname === "/app"
                    : location.pathname.startsWith(item.href) &&
                    (item.href !== "/app/chat" || location.pathname === "/app/chat");

                  const isChatbot = item.name === "Orbix Chatbot";

                  if ((item as any).hidden) return null;

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[14px] font-medium transition-all duration-300 ease-out relative",
                        isActive
                          ? "bg-primary/10 text-primary shadow-sm scale-[1.02]"
                          : "text-muted-foreground/80 hover:text-foreground hover:bg-muted/30 hover:shadow-sm",
                        isChatbot && !isActive && "text-indigo-500/80 hover:text-indigo-600 hover:bg-indigo-50/10"
                      )}
                    >
                      <div className={cn(
                        "relative flex items-center justify-center transition-all duration-300",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                        isChatbot && !isActive && "text-indigo-500"
                      )}>
                        <item.icon className={cn("w-[22px] h-[22px]", isActive && "fill-primary/20")} strokeWidth={1.8} />
                        {/* Active styling dot */}
                        {isActive && <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-primary" />}
                      </div>

                      <span className="flex-1 tracking-tight">{item.name}</span>

                      {isChatbot && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Decorator Line */}
        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent shrink-0 my-2" />

        {/* Bottom Actions */}
        <div className="p-4 mt-auto space-y-3">
          {isReconMode ? (
            <div className="space-y-2 p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20 backdrop-blur-xl">
              <div className="text-[10px] font-bold text-orange-600 px-1 uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                Recon Mode Active
              </div>
              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg shadow-orange-500/20 recon-action h-10 rounded-xl font-bold"
                onClick={logout}
              >
                <Plus className="w-4 h-4 mr-2" /> Create Workspace
              </Button>
              <Button
                variant="ghost"
                className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-500/10 recon-action h-10 rounded-xl font-semibold border border-orange-500/20"
                onClick={logout}
              >
                Join Unit
              </Button>
            </div>
          ) : (
            <>
              {/* AI Promo Card - Mini (Orbix AI) */}
              <div
                onClick={() => navigate('/app/chatbot')}
                className="relative overflow-hidden rounded-[24px] p-4 cursor-pointer group transition-all duration-500 hover:shadow-lg hover:shadow-primary/20 border border-white/10 bg-gradient-to-br from-[#4f46e5]/90 via-[#7c3aed]/90 to-[#2563eb]/90 mt-2"
              >
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity"><Sparkles className="w-12 h-12 text-white" /></div>

                <div className="flex items-center gap-3 relative z-10 text-white">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/10 group-hover:rotate-12 transition-transform duration-500">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm leading-tight">Orbix AI</p>
                    <p className="text-[10px] text-white/80 font-medium">Auto-pilot active</p>
                  </div>
                  <Sparkles className="w-5 h-5 opacity-40 group-hover:opacity-80 transition-opacity" />
                </div>
              </div>

              {/* Settings Link */}
              <Link to="/app/settings">
                <Button variant="ghost" className="w-full justify-start h-12 px-4 rounded-2xl hover:bg-muted/30 text-muted-foreground/80 hover:text-foreground border border-transparent hover:border-border/40 transition-all font-medium">
                  <Settings className="w-5 h-5 mr-3 text-muted-foreground group-hover:text-foreground" />
                  Settings
                </Button>
              </Link>
            </>
          )}
        </div>
      </aside>

      {/* Main Content Area - Elite Layout */}
      <main className="flex-1 min-w-0 relative flex flex-col h-full overflow-hidden">

        {/* Top Header - Floating Glass */}
        <header className="h-20 shrink-0 px-8 flex items-center justify-between z-20">
          {/* Mobile Toggle */}
          <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="w-6 h-6" />
          </Button>

          <div className="flex-1 max-w-xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-hover:text-primary/80" />
            <Input
              placeholder="Search anything..."
              className="w-full pl-12 h-11 rounded-[16px] border-white/5 bg-white/5 backdrop-blur-md focus:bg-white/10 focus:ring-0 focus:border-primary/30 shadow-sm transition-all text-sm hover:bg-white/10 placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="flex items-center gap-4 ml-4">
            <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-muted/60 text-muted-foreground/80 relative transition-all duration-300">
              <Bell className="w-[1.4rem] h-[1.4rem]" />
              <span className="absolute top-[10px] right-[10px] w-2 h-2 bg-destructive rounded-full border-2 border-background shadow-sm" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 p-1.5 pr-4 rounded-full bg-card/40 hover:bg-card/60 border border-border/60 cursor-pointer transition-all duration-300 shadow-sm hover:shadow group">
                  <Avatar className="h-9 w-9 border-2 border-background shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">{user?.name?.charAt(0) || "K"}</AvatarFallback>
                  </Avatar>
                  <p className="text-[15px] font-bold text-foreground hidden sm:block tracking-tight">{user?.name || "Kris Patel"}</p>
                  <ChevronDown className="w-4 h-4 text-muted-foreground opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px] glass-card rounded-[22px] p-2 shadow-xl mt-2 animate-in fade-in zoom-in duration-200">
                <DropdownMenuLabel className="px-3 py-2 text-[15px] font-bold text-foreground">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem
                  className="mx-1 my-1 px-3 py-2.5 rounded-xl cursor-pointer bg-primary text-primary-foreground focus:bg-primary/90 focus:text-primary-foreground transition-all font-medium"
                  onClick={() => navigate('/app/profile')}
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="mx-1 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-muted transition-all font-medium text-muted-foreground">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem
                  className="mx-1 mt-1 px-3 py-2.5 rounded-xl cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 transition-all font-medium flex items-center gap-2"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Outlet - Glass Container */}
        <div className="flex-1 overflow-auto rounded-tl-[32px] border-l border-t border-white/5 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-[2px] relative shadow-inner scroll-smooth">
          <Outlet />
        </div>

      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </div>
  );
}
