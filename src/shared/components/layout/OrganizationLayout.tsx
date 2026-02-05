import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import { useApp } from "@/shared/contexts/AppContext";
import { apiClient, Organization } from "@/shared/lib/api";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
    LayoutGrid,
    Settings,
    Search,
    Bell,
    ChevronDown,
    LogOut,
    Building2,
    Menu,
    Sparkles,
    ArrowLeft,
    MessageSquare,
    CheckSquare,
    Video,
    Brain,
    TrendingUp,
    Plus,
    Check
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

export default function OrganizationLayout() {
    const { user, logout } = useApp();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Multi-Org Logic
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const res = await apiClient.getOrganizations();
                if (res.organizations) {
                    setOrganizations(res.organizations);
                    // Default to first one or attempt to persist selection if we had storage
                    // For now, if currentOrg is null, set to first
                    if (res.organizations.length > 0) {
                        setCurrentOrg(res.organizations[0]);
                        // Update generic token context if needed, but usually org token is handled at login/switch
                        // NOTE: Backend 'getOrganizations' returns purely list. Switching context usually requires backend 'switch/login' or just using the ID. 
                        // For View-Only admin console, just setting state is enough if endpoints depend on 'orgId' param.
                        // But if endpoints rely on 'Bearer Token' bound to a specific Org, we might need to re-auth.
                        // Assumption: Admin Console uses the OrgAdmin token which has access to all linked orgs?
                        // Re-reading Route: 'getOrganizations' returns all linked. 
                    }
                }
            } catch (error) {
                console.error("Failed to load organizations", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrgs();
    }, []);

    const handleSwitchOrg = (org: Organization) => {
        setCurrentOrg(org);
        // If we needed to reload data for the new org, we'd trigger that here.
        // For visual switching only currently.
        navigate('/app/org-admin'); // Go to overview of selected org
    };

    const navigationGroups = [
        {
            title: "Management",
            items: [
                { name: "Overview", href: "/app/org-admin", icon: LayoutGrid },
                { name: "Chat", href: "/app/org-admin/chat", icon: MessageSquare },
                { name: "Tasks", href: "/app/org-admin/tasks", icon: CheckSquare },
                { name: "Meetings", href: "/app/org-admin/meetings", icon: Video },
            ]
        },
        {
            title: "Tools",
            items: [
                { name: "Orbix Chatbot", href: "/app/org-admin/chatbot", icon: Brain },
                { name: "Updates", href: "/app/org-admin/updates", icon: TrendingUp },
                { name: "Settings", href: "/app/org-admin/settings", icon: Settings },
            ]
        }
    ];

    return (
        <div className="flex w-full h-screen bg-background overflow-hidden selection:bg-primary/20 relative">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[100px] animate-fluid" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            {/* Sidebar */}
            <aside className={cn(
                "flex flex-col w-[280px] shrink-0 m-4 mr-0 rounded-[32px] border border-border/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] relative z-30 transition-all duration-300 md:translate-x-0 glass-premium",
                isMobileMenuOpen ? "translate-x-0 absolute inset-y-0 left-0 m-0 rounded-none w-3/4 z-50" : "hidden md:flex"
            )}>

                {/* Brand / Org Switcher */}
                <div className="p-6 pb-2">
                    {organizations.length > 1 ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card/30 border border-transparent hover:bg-card/40 hover:border-white/5 transition-all cursor-pointer group">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 text-left min-w-0 flex flex-col justify-center">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-[15px] truncate text-foreground/90 tracking-tight leading-none mb-1">
                                                {currentOrg?.name || "Organization"}
                                            </p>
                                            <ChevronDown className="w-3 h-3 text-muted-foreground opacity-50" />
                                        </div>
                                        <p className="text-[11px] font-medium text-muted-foreground">Admin Console</p>
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[240px] glass-card rounded-[22px] p-2 mt-2">
                                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Switch Organization</DropdownMenuLabel>
                                {organizations.map((org) => (
                                    <DropdownMenuItem
                                        key={org._id}
                                        onClick={() => handleSwitchOrg(org)}
                                        className={cn(
                                            "flex items-center gap-2 cursor-pointer rounded-xl px-3 py-2.5 mb-1",
                                            currentOrg?._id === org._id ? "bg-primary/10 text-primary" : "text-foreground/80"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                                            currentOrg?._id === org._id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                        )}>
                                            {org.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="text-sm font-semibold truncate">{org.name}</span>
                                            <span className="text-[10px] text-muted-foreground truncate">{org.slug}</span>
                                        </div>
                                        {currentOrg?._id === org._id && <Check className="w-4 h-4" />}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator className="bg-white/10 my-1" />
                                <DropdownMenuItem onClick={() => navigate('/app')} className="cursor-pointer rounded-xl px-3 py-2 text-muted-foreground gap-2">
                                    <Plus className="w-4 h-4" />
                                    <span>Create New Organization</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card/30 border border-transparent">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div className="flex-1 text-left min-w-0 flex flex-col justify-center">
                                <p className="font-bold text-[15px] truncate text-foreground/90 tracking-tight leading-none mb-1">
                                    {currentOrg?.name || "Organization"}
                                </p>
                                <p className="text-[11px] font-medium text-muted-foreground">Admin Console</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-2 space-y-6 mt-4 overflow-y-auto no-scrollbar">
                    {navigationGroups.map((group) => (
                        <div key={group.title}>
                            <h4 className="px-5 mb-3 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[2px]">{group.title}</h4>
                            <div className="space-y-1.5">
                                {group.items.map((item) => {
                                    const isActive = location.pathname.startsWith(item.href) && (item.href !== "/app/org-admin" || location.pathname === "/app/org-admin");
                                    const isChatbot = item.name === "Orbix Chatbot";

                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={cn(
                                                "group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[14px] font-medium transition-all duration-300 relative",
                                                isActive
                                                    ? "bg-primary/10 text-primary shadow-sm"
                                                    : "text-muted-foreground/80 hover:text-foreground hover:bg-muted/30",
                                                isChatbot && !isActive && "text-indigo-500/80 hover:text-indigo-600 hover:bg-indigo-50/10"
                                            )}
                                        >
                                            <div className={cn("relative flex items-center justify-center transition-all", isChatbot && !isActive && "text-indigo-500")}>
                                                <item.icon className={cn("w-[22px] h-[22px]", isActive && "text-primary")} strokeWidth={1.8} />
                                            </div>
                                            <span className="flex-1">{item.name}</span>
                                            {isChatbot && (
                                                <span className="flex h-2 w-2 relative">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                                </span>
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
                {/* Bottom Actions */}
                <div className="p-4 mt-auto space-y-3">
                    {/* AI Promo Card - Mini */}
                    <div
                        onClick={() => navigate('/app/org-admin/chatbot')}
                        className="relative overflow-hidden rounded-[24px] p-4 cursor-pointer group transition-all duration-500 hover:shadow-lg hover:shadow-primary/20 border border-white/10 gradient-primary"
                    >
                        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity"><Sparkles className="w-12 h-12 text-white" /></div>

                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/10 group-hover:rotate-12 transition-transform duration-500">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-white">
                                <p className="font-bold text-sm leading-tight">Orbix AI</p>
                                <p className="text-[10px] text-white/80 font-medium">Auto-pilot active</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        className="w-full justify-start h-12 px-4 rounded-2xl hover:bg-muted/30 text-muted-foreground/80 hover:text-foreground"
                        onClick={() => navigate('/app')}
                    >
                        <ArrowLeft className="w-5 h-5 mr-3" />
                        Back to Workspace
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 relative flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="h-20 shrink-0 px-8 flex items-center justify-between z-20">
                    <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <Menu className="w-6 h-6" />
                    </Button>

                    <div className="flex-1"></div>

                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-2 p-1.5 pr-4 rounded-full bg-card/40 hover:bg-card/60 border border-border/60 cursor-pointer shadow-sm">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className="bg-primary text-primary-foreground">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                                    </Avatar>
                                    <p className="text-[15px] font-bold hidden sm:block">{user?.name}</p>
                                    <ChevronDown className="w-4 h-4 text-muted-foreground opacity-70" />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px] glass-card rounded-[22px] p-2 mt-2">
                                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer rounded-xl px-3 py-2.5">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <div className="flex-1 overflow-auto rounded-tl-[32px] border-l border-t border-white/10 bg-card/30 backdrop-blur-sm relative shadow-inner">
                    <Outlet />
                </div>
            </main>

            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            )}
        </div>
    );
}
