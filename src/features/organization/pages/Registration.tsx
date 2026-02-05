import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import {
    Building2, CheckCircle2,
    LayoutGrid, BarChart3, Receipt, Plus, Trash2,
    Sparkles, Loader2, ArrowLeft, Globe, MapPin, X,
    Target, AlertTriangle, CalendarDays, Bot, BrainCircuit, Rocket, Zap, Plane,
    Train, Bus, Wifi, Activity, Satellite, Search, Mail, Check,
    Monitor, RefreshCcw, Globe2, ShieldCheck, Users2, Cpu, HardDrive, Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from "@/shared/lib/api";
import { COUNTRIES } from "@/constants/countries";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { cn, getPasswordStrength, isPasswordStrong, isAccessCodeStrong, isFakeData, isValidUrlPattern, formatEliteUrl } from "@/shared/lib/utils";

type CompanySize = '1-10' | '11-50' | '51-200' | '200+';
type TeamStructure = 'single' | 'multi';
type AiMode = 'assist' | 'semi' | 'auto';

interface Invite {
    email: string;
    role: string;
    skills: string[];
    squad?: string;
}

interface EliteOrgRegistrationData {
    // Identity
    orgName: string;
    industry: string;
    size: CompanySize;
    country: string;
    coords?: { lat: number; lng: number };
    services: string[];

    // User
    adminName: string;
    adminEmail: string;
    adminRole: string;

    // Strategic Alignment
    goals: string;
    risks: string[];
    timeline: {
        start: string;
        end: string;
        type: 'whole' | 'separated';
    };

    // Architecture & AI
    structure: TeamStructure;
    aiMode: AiMode;
    defaultPermissions: 'open' | 'restricted';
    squads: { name: string; targetDate?: string }[];

    // Team
    invites: Invite[];

    tools: {
        projects: boolean;
        tasks: boolean;
        analytics: boolean;
        billing: boolean;
    };
}

const INDUSTRIES_DEFAULT = [
    "Software & Technology", "Neural Engineering", "Marketing & Agency",
    "Financial Services", "Bio-Tech", "E-commerce", "Deep Learning Research", "Strategic Defense"
];

const SERVICES_DEFAULT = [
    "AI/ML Development", "Cloud Infrastructure", "Cybersecurity",
    "Product Design", "Data Analytics", "Strategy Consulting",
    "Network Operations", "Enterprise Solutions", "Blockchain Systems"
];

const SKILL_OPTIONS_DEFAULT = [
    "React", "Node.js", "Python", "Neural Architecture", "Strategic Analysis", "Data Science", "DevOps", "Governance", "Personnel Management"
];

const ROLE_OPTIONS_DEFAULT = ['Founder', 'Director', 'Specialist', 'Analyst'];

const TOOLS = [
    { id: 'projects', label: 'Projects & Goals', desc: 'Track roadmaps and milestones', icon: LayoutGrid },
    { id: 'tasks', label: 'Task Management', desc: 'Kanban, lists, and sprints', icon: CheckCircle2 },
    { id: 'analytics', label: 'Analytics', desc: 'Team velocity and insights', icon: BarChart3 },
    { id: 'billing', label: 'Billing & Invoicing', desc: 'Manage client payments', icon: Receipt },
];

// Resource Definitions

const InviteRow = ({ invite, index, onUpdate, onRemove, skillOptions, roleOptions, onAddCustomRole, onAddCustomSkill, deleteRole, setRoleOptions, deleteSkill, setSkillOptions }: {
    invite: Invite;
    index: number;
    onUpdate: (field: keyof Invite, value: any) => void;
    onRemove: () => void;
    skillOptions: string[];
    roleOptions: string[];
    onAddCustomRole: (role: string) => void;
    onAddCustomSkill: (skill: string) => void;
    deleteRole: (role: string) => void; // Added
    setRoleOptions: React.Dispatch<React.SetStateAction<string[]>>; // Added
    deleteSkill: (skill: string) => void; // Added
    setSkillOptions: React.Dispatch<React.SetStateAction<string[]>>; // Added
}) => {
    const [isAddingSkill, setIsAddingSkill] = useState(false);
    const [customSkill, setCustomSkill] = useState('');
    const [customRole, setCustomRole] = useState('');
    const [isAddingRole, setIsAddingRole] = useState(false);

    const hasNoSkills = invite.skills.length === 0;

    return (
        <div className="bg-card/20 backdrop-blur-md border border-white/[0.05] p-8 rounded-[2.5rem] relative group/row transition-all duration-500 hover:bg-card/30 hover:border-primary/20 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20 group-hover/row:bg-primary transition-all duration-500" />

            <button
                onClick={onRemove}
                className="absolute top-6 right-6 text-muted-foreground hover:text-red-400 opacity-0 group-hover/row:opacity-100 transition-all p-2.5 hover:bg-red-400/10 rounded-2xl"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]">
                        <Users2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-black text-base text-foreground tracking-tight italic">Personnel Unit #{index + 1}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={cn("w-1.5 h-4 rounded-full", invite.email && invite.skills.length > 0 ? "bg-emerald-500" : "bg-amber-500 animate-pulse")} />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                {invite.email && invite.skills.length > 0 ? "UNIT_READY_FOR_DEPLOY" : "AWAITING_CRITICAL_DATA"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative z-10">
                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-2 mb-1">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Governance Access Relay</Label>
                        {!invite.email && <Badge className="bg-primary/10 text-primary border-primary/20 text-[7px] font-black px-1.5 py-0 rounded-sm">REQUIRED</Badge>}
                    </div>
                    <div className="relative group/input">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                        <Input
                            value={invite.email}
                            onChange={(e) => onUpdate('email', e.target.value)}
                            placeholder="specialist@company.ai"
                            className="h-14 bg-black/20 backdrop-blur-sm border-border/50 text-foreground rounded-xl pl-12 focus:border-primary/50 transition-all font-mono text-sm tracking-tight shadow-inner"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 mb-1">Operational Role Designation</Label>
                    {!isAddingRole ? (
                        <Select value={invite.role} onValueChange={(v: any) => v === 'BUILD_CUSTOM' ? setIsAddingRole(true) : onUpdate('role', v)}>
                            <SelectTrigger className="h-14 bg-muted/20 border-border text-foreground rounded-xl font-black text-[10px] uppercase tracking-[0.2em] pl-6 shadow-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border text-foreground rounded-xl shadow-2xl min-w-[240px]">
                                {roleOptions.map(r => (
                                    <div key={r} className="flex items-center group/role px-1">
                                        <SelectItem key={r} value={r} className="flex-1 rounded-lg font-bold text-[10px] uppercase tracking-widest py-3">{r}</SelectItem>
                                        {!ROLE_OPTIONS_DEFAULT.includes(r) && (
                                            <button
                                                onPointerDown={(e) => e.stopPropagation()}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    deleteRole(r);
                                                }}
                                                className="p-2 opacity-0 group-hover/role:opacity-100 text-muted-foreground hover:text-red-400 transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <div className="h-[1px] bg-border my-1 mx-2" />
                                <SelectItem value="BUILD_CUSTOM" className="font-black text-primary bg-primary/10 py-3 cursor-pointer">BUILD CUSTOM +</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="flex gap-2 animate-in slide-in-from-top-2 duration-300">
                            <Input
                                value={customRole}
                                onChange={(e) => setCustomRole(e.target.value)}
                                placeholder="e.g. Lead Investigator"
                                className="h-14 bg-muted rounded-xl border-primary/50 focus:border-primary px-6 font-bold text-xs uppercase"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        if (customRole.trim()) {
                                            onAddCustomRole(customRole.trim());
                                            onUpdate('role', customRole.trim());
                                            setCustomRole('');
                                            setIsAddingRole(false);
                                        }
                                    }
                                    if (e.key === 'Escape') setIsAddingRole(false);
                                }}
                            />
                            <Button onClick={() => {
                                if (customRole.trim()) {
                                    const fresh = customRole.trim();
                                    const isDuplicate = roleOptions.some(r => r.toLowerCase() === fresh.toLowerCase());
                                    if (isDuplicate) {
                                        toast.error("Role protocol already active");
                                        return;
                                    }
                                    setRoleOptions(prev => [...prev, fresh]);
                                    onUpdate('role', fresh);
                                    setCustomRole('');
                                    setIsAddingRole(false);
                                    toast.success("Personnel role integrated");
                                }
                            }} className="h-14 w-14 shrink-0 rounded-xl bg-primary text-black"><CheckCircle2 className="w-5 h-5" /></Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between ml-3">
                    <div className="flex items-center gap-2">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Competency Matrix Mapping</Label>
                        {hasNoSkills && <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[7px] font-black px-1.5 py-0 rounded-sm animate-pulse">REQUIRED</Badge>}
                    </div>
                    <span className="text-[9px] font-black text-primary/60 uppercase tracking-[0.3em] italic">{invite.skills.length} / 5 Active</span>
                </div>
                <div className="flex flex-wrap gap-2.5 items-center bg-black/40 p-5 rounded-[2rem] border border-white/[0.03] shadow-inner relative min-h-[80px]">
                    {invite.skills.map(skill => (
                        <Badge key={skill} variant="secondary" className="bg-card/80 backdrop-blur-sm border border-border text-foreground hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 cursor-pointer px-4 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest group/badge shadow-sm" onClick={() => onUpdate('skills', invite.skills.filter(s => s !== skill))}>
                            {skill} <X className="w-3.5 h-3.5 ml-2 opacity-50 group-hover/badge:rotate-90 transition-transform" />
                        </Badge>
                    ))}

                    {!isAddingSkill ? (
                        invite.skills.length < 5 && (
                            <button
                                onClick={() => setIsAddingSkill(true)}
                                className="h-10 px-5 rounded-xl border border-dashed border-primary/30 hover:border-primary hover:bg-primary/10 text-[9px] font-black uppercase tracking-[0.2em] text-primary/70 hover:text-primary transition-all flex items-center gap-2 shadow-sm"
                            >
                                <Plus className="w-4 h-4" /> Load Competency
                            </button>
                        )
                    ) : (
                        <div className="flex gap-2 animate-in zoom-in-95 duration-300">
                            <Select onValueChange={(v) => {
                                if (v === 'BUILD_CUSTOM') return;
                                if (!invite.skills.includes(v)) onUpdate('skills', [...invite.skills, v]);
                                setIsAddingSkill(false);
                            }}>
                                <SelectTrigger className="h-10 min-w-[160px] text-[9px] font-black rounded-xl bg-card border-primary/50 text-foreground uppercase tracking-widest shadow-xl">
                                    <SelectValue placeholder="Map Skill..." />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border shadow-2xl min-w-[240px]">
                                    {skillOptions.filter(s => !invite.skills.includes(s)).map(s => (
                                        <div key={s} className="flex items-center group/skill px-1">
                                            <SelectItem value={s} className="flex-1 text-[10px] font-black uppercase tracking-widest py-3">{s}</SelectItem>
                                            {!SKILL_OPTIONS_DEFAULT.includes(s) && (
                                                <button
                                                    onPointerDown={(e) => e.stopPropagation()}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        deleteSkill(s);
                                                    }}
                                                    className="p-2 opacity-0 group-hover/skill:opacity-100 text-muted-foreground hover:text-red-400 transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <div className="h-[1px] bg-border my-1 mx-2" />
                                    <div
                                        className="px-2 py-3 text-[10px] font-black text-primary hover:bg-muted cursor-pointer rounded-lg flex items-center justify-center gap-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Handled by Input below
                                        }}
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            <Input
                                                value={customSkill}
                                                onChange={(e) => setCustomSkill(e.target.value)}
                                                placeholder="Bespoke Skill..."
                                                className="h-8 text-[9px] font-black uppercase bg-muted/50 border-primary/20"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && customSkill.trim()) {
                                                        const fresh = customSkill.trim();
                                                        onAddCustomSkill(fresh);
                                                        if (!invite.skills.includes(fresh)) {
                                                            onUpdate('skills', [...invite.skills, fresh]);
                                                        }
                                                        setCustomSkill('');
                                                        setIsAddingSkill(false);
                                                    }
                                                }}
                                            />
                                            <Button
                                                size="icon"
                                                className="h-8 w-8 shrink-0"
                                                onClick={() => {
                                                    if (customSkill.trim()) {
                                                        const fresh = customSkill.trim();
                                                        const isDuplicate = skillOptions.some(s => s.toLowerCase() === fresh.toLowerCase());
                                                        if (isDuplicate) {
                                                            toast.error("Competency already in matrix");
                                                            return;
                                                        }
                                                        setSkillOptions(prev => [...prev, fresh]);
                                                        if (!invite.skills.includes(fresh)) {
                                                            onUpdate('skills', [...invite.skills, fresh]);
                                                        }
                                                        setCustomSkill('');
                                                        setIsAddingSkill(false);
                                                        toast.success("Bespoke competency integrated");
                                                    }
                                                }}
                                            >
                                                <Check className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </SelectContent>
                            </Select>
                            <button onClick={() => setIsAddingSkill(false)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-foreground border border-border">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {hasNoSkills && (
                        <p className="text-[9px] font-black text-amber-500/60 uppercase tracking-[0.2em] ml-2 animate-in fade-in duration-700">
                            No competencies mapped • Min 1 required
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const OrganizationRegistration = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [industries, setIndustries] = useState<string[]>(INDUSTRIES_DEFAULT);
    const [skillOptions, setSkillOptions] = useState<string[]>(SKILL_OPTIONS_DEFAULT);
    const [roleOptions, setRoleOptions] = useState<string[]>(ROLE_OPTIONS_DEFAULT);
    const [newIndustry, setNewIndustry] = useState('');
    const [showAddIndustry, setShowAddIndustry] = useState(false);
    const [availableServices, setAvailableServices] = useState<string[]>(SERVICES_DEFAULT);
    const [newService, setNewService] = useState('');
    const [showAddService, setShowAddService] = useState(false);

    const [formData, setFormData] = useState<EliteOrgRegistrationData>({
        orgName: '',
        industry: '',
        size: '1-10',
        country: 'India',
        coords: { lat: 20.5937, lng: 78.9629 }, // Default India center
        services: [],
        adminName: '',
        adminEmail: '',
        adminRole: 'Founder',
        goals: '',
        risks: [''],
        timeline: { start: '', end: '', type: 'whole' },
        structure: 'multi',
        aiMode: 'assist',
        defaultPermissions: 'restricted',
        squads: [{ name: 'HQ Core', targetDate: '' }],
        invites: [{ email: '', role: 'member', skills: [] }],
        tools: { projects: true, tasks: true, analytics: true, billing: true },
    });
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isGenesisActive, setIsGenesisActive] = useState(false);
    const [baseIsAddingRole, setBaseIsAddingRole] = useState(false);
    const [customRole, setCustomRole] = useState('');
    const totalSteps = 2;

    // Explore Area State
    const [scanStage, setScanStage] = useState<'idle' | 'connecting' | 'analyzing' | 'resolved'>('idle');
    const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
    const [showExploreModal, setShowExploreModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Helper: Calculate Haversine Distance
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    // Helper: Form Overpass Query
    const fetchOverpassData = async (lat: number, lng: number) => {
        // Query for Airports (50km), Stations (10km), Bus Stations (5km) (Reduced radius for perf)
        const query = `
            [out:json][timeout:10];
            (
              node["aeroway"="aerodrome"](around:50000,${lat},${lng});
              node["railway"="station"](around:10000,${lat},${lng});
              node["amenity"="bus_station"](around:5000,${lat},${lng});
            );
            out body 5;
        `;
        try {
            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: query
            });
            const data = await response.json();
            return data.elements;
        } catch (error) {
            console.error("Overpass API Error:", error);
            return [];
        }
    };

    // Simulate finding places when location changes
    useEffect(() => {
        if (formData.coords) {
            setScanStage('connecting');
            setNearbyPlaces([]);

            // Stage 1: Triangulating (1.5s)
            const triangulateTimer = setTimeout(() => {
                setScanStage('analyzing');

                // Start performing the real fetch in parallel during "Analyzing"
                const performScan = async () => {
                    const lat = formData.coords!.lat;
                    const lng = formData.coords!.lng;

                    // Fetch real data
                    const realNodes = await fetchOverpassData(lat, lng);

                    // Process Data
                    let processedPlaces: any[] = [];

                    if (realNodes && realNodes.length > 0) {
                        processedPlaces = realNodes.map((node: any) => {
                            const distKm = getDistance(lat, lng, node.lat, node.lon);
                            let type = 'Transport';
                            let icon = MapPin;
                            let color = 'text-slate-400';
                            let bg = 'bg-slate-800';
                            let time = `${Math.ceil(distKm * 12)} min walk`;

                            // Refine types and icons
                            if (node.tags.aeroway === 'aerodrome') {
                                type = 'International Travel';
                                icon = Plane;
                                color = 'text-emerald-400';
                                bg = 'bg-emerald-500/10';
                                time = `${Math.ceil(distKm * 1.5)} min drive`;
                            } else if (node.tags.railway === 'station') {
                                type = 'Railway Terminal';
                                icon = Train;
                                color = 'text-indigo-400';
                                bg = 'bg-indigo-500/10';
                                if (distKm > 2) time = `${Math.ceil(distKm * 3)} min drive`;
                            } else if (node.tags.amenity === 'bus_station') {
                                type = 'Transit Hub';
                                icon = Bus;
                                color = 'text-blue-400';
                                bg = 'bg-blue-500/10';
                            }

                            return {
                                name: node.tags.name || 'Unknown Station',
                                type,
                                time,
                                icon,
                                color,
                                bg,
                                distance: distKm
                            };
                        })
                            .filter((p: any) => p.name !== 'Unknown Station')
                            .sort((a: any, b: any) => a.distance - b.distance)
                            .slice(0, 4);
                    }

                    // Fallback if no real data found
                    if (processedPlaces.length === 0) {
                        processedPlaces = [
                            { name: 'Central Railway Station', type: 'Railway Terminal', time: '10 min walk', icon: Train, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                            { name: 'City Bus Exchange', type: 'Transit Hub', time: '5 min walk', icon: Bus, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                            { name: 'Metro Line 3', type: 'Rapid Transit', time: '12 min walk', icon: MapPin, color: 'text-violet-400', bg: 'bg-violet-500/10' },
                            { name: 'International Airport', type: 'International Travel', time: '45 min drive', icon: Plane, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                        ];
                    }

                    setTimeout(() => {
                        setNearbyPlaces(processedPlaces);
                        setScanStage('resolved');
                    }, 1000);
                };

                performScan();

            }, 1500);

            return () => clearTimeout(triangulateTimer);
        }
    }, [formData.coords]);

    const updateField = (field: keyof EliteOrgRegistrationData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const addIndustry = () => {
        if (!newIndustry.trim()) return;
        const fresh = newIndustry.trim();

        // Professional check: Case-insensitive duplicate prevention
        const isDuplicate = industries.some(i => i.toLowerCase() === fresh.toLowerCase());

        if (isDuplicate) {
            toast.error("Industrial protocol already active");
            return;
        }

        setIndustries(prev => [...prev, fresh]);
        updateField('industry', fresh);
        setNewIndustry('');
        setShowAddIndustry(false);
        toast.success("Vertical protocol integrated");
    };

    const deleteIndustry = (industryToDelete: string) => {
        setIndustries(prev => prev.filter(i => i !== industryToDelete));
        setFormData(prev => ({
            ...prev,
            industry: prev.industry === industryToDelete ? '' : prev.industry
        }));
        toast.success("Vertical protocol decommissioned");
    };

    const deleteRole = (roleToDelete: string) => {
        setRoleOptions(prev => prev.filter(r => r !== roleToDelete));
        setFormData(prev => ({
            ...prev,
            adminRole: prev.adminRole === roleToDelete ? '' : prev.adminRole
        }));
        toast.success("Governance protocol decommissioned");
    };

    const deleteSkill = (skillToDelete: string) => {
        setSkillOptions(prev => prev.filter(s => s !== skillToDelete));
        setFormData(prev => ({
            ...prev,
            invites: prev.invites.map(inv => ({
                ...inv,
                skills: inv.skills.filter(s => s !== skillToDelete)
            }))
        }));
        toast.success("Competency protocol decommissioned");
    };

    const toggleService = (service: string) => {
        setFormData(prev => {
            const isSelected = prev.services.includes(service);
            if (isSelected) {
                return { ...prev, services: prev.services.filter(s => s !== service) };
            } else {
                return { ...prev, services: [...prev.services, service] };
            }
        });
    };

    const addCustomService = () => {
        if (!newService.trim()) return;
        const fresh = newService.trim();

        // Professional check: Case-insensitive duplicate prevention
        const isDuplicate = availableServices.some(s => s.toLowerCase() === fresh.toLowerCase());

        if (isDuplicate) {
            toast.error("Service protocol already exists in matrix");
            return;
        }

        setAvailableServices(prev => [...prev, fresh]);
        setFormData(prev => ({ ...prev, services: [...prev.services, fresh] }));
        setNewService('');
        setShowAddService(false);
        toast.success("Custom service integrated");
    };

    const deleteService = (serviceToDelete: string) => {
        setAvailableServices(prev => prev.filter(s => s !== serviceToDelete));
        setFormData(prev => ({
            ...prev,
            services: prev.services.filter(s => s !== serviceToDelete)
        }));
        toast.success("Service protocol decommissioned");
    };

    const fetchLocation = () => {
        setIsLocating(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        setFormData(prev => ({ ...prev, coords: { lat: latitude, lng: longitude } }));
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await response.json();
                        const country = data.address.country;
                        if (country) {
                            updateField('country', country);
                            toast.success(`Location detected: ${country}`);
                        } else {
                            toast.error("Could not determine country from location");
                        }
                        setIsLocating(false);
                    } catch (error) {
                        console.error('Geocoding error:', error);
                        toast.error('Failed to fetch location details');
                        setIsLocating(false);
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    toast.error('Location access denied. Please enable location permissions.');
                    setIsLocating(false);
                }
            );
        } else {
            toast.error('Geolocation not supported by your browser');
            setIsLocating(false);
        }
    };

    const performLocationSearch = async (query: string) => {
        if (!query.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const result = data[0];
                const lat = parseFloat(result.lat);
                const lng = parseFloat(result.lon);

                setFormData(prev => ({ ...prev, coords: { lat, lng } }));

                const displayNameParts = result.display_name.split(', ');
                const possibleCountry = displayNameParts[displayNameParts.length - 1];

                if (COUNTRIES.includes(possibleCountry)) {
                    updateField('country', possibleCountry);
                }

                toast.success(`Location set to: ${result.name || result.display_name.split(',')[0]}`);
                setSearchQuery('');
            } else {
                toast.error("Location not found");
            }
        } catch (error) {
            toast.error("Search failed");
        } finally {
            setIsSearching(false);
        }
    };

    // Auto-detection on mount
    useEffect(() => {
        if (step === 1 && !formData.country && !isLocating) {
            fetchLocation();
        }
    }, [step, formData.country, isLocating]);

    // Auto-detect location on mount for professional convenience
    useEffect(() => {
        // Only auto-detect if coords are default (India) and we are on step 1
        if (formData.coords?.lat === 20.5937 && formData.coords?.lng === 78.9629 && step === 1) {
            fetchLocation();
        }
    }, []);

    const totalInvites = formData.invites.length;
    const squadStats = formData.structure === 'multi' ? formData.squads.map(s => formData.invites.filter(i => i.squad === s.name).length) : [totalInvites];
    const isStrongTeam = squadStats.every(count => count >= 5);
    const anySquadUnderstaffed = squadStats.some(count => count < 5);
    const anySquadEmpty = squadStats.some(count => count === 0);
    const allInvitesHaveSkills = formData.invites.every(inv => inv.skills.length > 0);
    const allInvitesComplete = formData.invites.every(inv => !!inv.email?.trim() && inv.skills.length > 0 && !!inv.role);

    const getMissingRequirements = () => {
        const missing: string[] = [];
        if (step === 1) {
            if (!formData.orgName?.trim()) missing.push("Org Name");
            if (!formData.industry) missing.push("Industry");
            if (!formData.size) missing.push("Capacity");
            if (!formData.country) missing.push("Location");
            if (!formData.services.length) missing.push("Portfolio (Select 1+)");
        } else if (step === 2) {
            if (!formData.adminName?.trim()) missing.push("Lead Delegate");
            if (!formData.adminEmail?.trim()) missing.push("Lead Email");
            if (!formData.adminRole?.trim()) missing.push("Lead Role");

            if (!isPasswordStrong(password)) missing.push("Strong Passcode");
            if (password !== confirmPassword) missing.push("Mirror Sync (Confirm Pass)");
        }
        return missing;
    };

    const isStepValid = () => getMissingRequirements().length === 0;

    const nextStep = () => {
        if (isStepValid()) {
            setStep(s => Math.min(s + 1, totalSteps));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const missing = getMissingRequirements();
            toast.error("Initialization Blocked", {
                description: `Complete following protocols: ${missing.join(', ')}`,
                icon: <AlertTriangle className="w-4 h-4" />,
            });
        }
    };
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        if (!password || !confirmPassword) {
            toast.error("Please fill in all security fields.");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters long.");
            return;
        }

        setIsLoading(true);
        try {
            // Professional Validation check before transmission
            const missing = getMissingRequirements();
            if (missing.length > 0) {
                toast.error("Security Block", {
                    description: `Critical protocols missing: ${missing.join(', ')}`
                });
                setIsLoading(false);
                return;
            }

            // Direct Organization Registration (Creates Admin Identity + Org in one atomic transaction)
            const orgRes = await apiClient.createOrganizationElite({
                name: formData.orgName, // Explicit field mapping (API expects 'name', not 'orgName')
                industry: formData.industry,
                size: formData.size,
                country: formData.country,
                // Admin Credentials (Securely passed to backend + Normalized)
                adminName: formData.adminName,
                adminEmail: formData.adminEmail?.toLowerCase().trim(),
                password: password,
                adminRole: formData.adminRole,
                coords: formData.coords,
                services: formData.services,
                profile: {
                    goals: formData.goals,
                    risks: formData.risks.filter(r => r.trim()),
                    timeline: formData.timeline,
                    structure: formData.structure,
                    aiMode: formData.aiMode,
                    squads: formData.squads,
                    tools: formData.tools,
                    invites: formData.invites,
                    services: formData.services
                }
            });

            // Store Token securely
            if (orgRes.token) {
                apiClient.setToken(orgRes.token);
                apiClient.setUser(orgRes.user);
            }

            toast.success(`Genesis Engine: ${formData.orgName} Initialized`, {
                description: "Administrative authority established. Redirecting to Command Center.",
                className: "bg-card border-primary text-foreground font-black uppercase tracking-widest text-[10px]",
                duration: 5000
            });

            await new Promise(resolve => setTimeout(resolve, 1500));
            navigate(`/app/org-admin`);

        } catch (error: any) {
            console.error("Submission error:", error);

            // Professional Error Mapping
            const errorMsg = error.response?.data?.error || error.message || "Registration protocol failed";
            toast.error("Uplink Interrupted", {
                description: errorMsg,
                className: "bg-background border-red-500/50 text-red-500 font-black uppercase text-[10px]"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const InputLabel = ({ children, className }: { children: React.ReactNode, className?: string }) => (
        <Label className={cn("text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block", className)}>{children}</Label>
    );

    // ===================================
    // RENDER STEPS
    // ===================================

    const renderExploreModal = () => (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${showExploreModal ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl transition-all duration-700"
                onClick={() => setShowExploreModal(false)}
            />

            {/* Modal Card */}
            <div className={`w-full max-w-4xl bg-card rounded-[2.5rem] shadow-2xl border border-border overflow-hidden relative transform transition-all duration-700 flex flex-col lg:flex-row ${showExploreModal ? 'translate-y-0 scale-100' : 'translate-y-12 scale-95'}`}>

                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 pointer-events-none">
                    <div className="pointer-events-auto bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border border-border shadow-sm flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${scanStage === 'resolved' ? 'bg-emerald-500' : 'bg-primary animate-pulse'}`} />
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                            {scanStage === 'resolved' ? 'Live Intelligence Active' : 'Scanning Grid...'}
                        </span>
                    </div>

                    <Button
                        size="icon"
                        className="pointer-events-auto h-10 w-10 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all backdrop-blur-md border border-border"
                        onClick={() => setShowExploreModal(false)}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 h-[80vh] max-h-[800px] w-full">
                    {/* Map Side */}
                    <div className="relative bg-background lg:order-last">
                        {formData.coords ? (
                            <>
                                <iframe
                                    title="Explore Area Map"
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    scrolling="no"
                                    src={`https://maps.google.com/maps?q=${formData.coords.lat},${formData.coords.lng}&z=14&output=embed&iwloc=near`}
                                    className={`w-full h-full transition-all duration-[2000ms] ease-out opacity-60 dark:invert-[.9] dark:hue-rotate-180 dark:grayscale contrast-125 ${scanStage !== 'resolved' ? 'blur-[2px] scale-110' : 'blur-0 scale-100'}`}
                                />
                                {/* Scanning Reticle Overlay */}
                                {scanStage !== 'resolved' && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                                        <div className="relative">
                                            <div className="absolute inset-0 border-2 border-primary/50 rounded-full animate-ping opacity-20" />
                                            <div className="w-64 h-64 border border-primary/20 rounded-full animate-spin-slow border-dashed" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-background text-muted-foreground">
                                <Globe className="w-12 h-12 opacity-20" />
                            </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-card to-transparent pointer-events-none lg:hidden" />
                    </div>

                    {/* Content Side */}
                    <div className="p-8 lg:p-10 overflow-y-auto custom-scrollbar flex flex-col relative bg-card">
                        <div className="mt-12 lg:mt-4 space-y-8">
                            <div>
                                <h3 className="text-3xl font-black text-foreground tracking-tight mb-2">Detailed Recon</h3>
                                <p className="text-muted-foreground text-lg">Analysis of strategic infrastructure near your HQ.</p>
                            </div>

                            {/* Identified Location Card */}
                            <div className="bg-muted/50 p-6 rounded-3xl border border-border relative group">
                                <div className="absolute -right-4 -top-4 bg-background border border-border p-3 rounded-2xl shadow-xl">
                                    <MapPin className="w-6 h-6 text-primary" />
                                </div>
                                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Target Matrix</h4>
                                <div className="text-2xl font-bold text-foreground font-mono tracking-tight">
                                    {formData.coords ? `${formData.coords.lat.toFixed(4)}° N, ${formData.coords.lng.toFixed(4)}° E` : "—"}
                                </div>
                                <div className="text-primary font-medium mt-1">{formData.country || "Unknown Region"}</div>
                            </div>

                            {/* Strategic Nodes List */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Strategic Nodes</h4>
                                    {scanStage === 'resolved' && (
                                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/20">
                                            {nearbyPlaces.length} Assets
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {scanStage !== 'resolved' ? (
                                        [1, 2, 3].map(i => (
                                            <div key={i} className="h-20 w-full bg-muted rounded-2xl animate-pulse" />
                                        ))
                                    ) : nearbyPlaces.length > 0 ? (
                                        nearbyPlaces.map((item, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between group/item cursor-pointer hover:bg-muted p-4 rounded-2xl transition-all border border-border hover:border-primary/20"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} border border-border`}>
                                                        <item.icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <span className="text-foreground font-bold text-sm block transition-colors">{item.name}</span>
                                                        <span className="text-xs text-muted-foreground font-semibold tracking-wide uppercase">{item.type}</span>
                                                    </div>
                                                </div>
                                                <span className="text-muted-foreground text-xs font-bold bg-muted px-3 py-1.5 rounded-xl border border-border">
                                                    {item.time}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground italic bg-muted rounded-3xl border border-dashed border-border">
                                            No strategic nodes detected in this sector.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStepIdentity = () => (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Identity HUD */}
            {(!formData.orgName || !formData.industry || !formData.country) && (
                <div className="p-4 rounded-[2rem] border backdrop-blur-md animate-in slide-in-from-top-4 duration-700 flex items-center justify-between px-8 bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_8px_32px_rgba(245,158,11,0.1)]">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-amber-500/20 rounded-xl">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-widest">Identity Protocol</h4>
                            <p className="text-[10px] font-bold opacity-70 uppercase tracking-tighter mt-0.5">Map foundational legal and regional parameters</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tighter">Genesis Engine Initializer</h2>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Establish legal entity and operational footprint</p>
                </div>
            </div>


            {/* PRIMARY ORGANIZATION PROFILE */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[1.25rem] bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shadow-inner">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight uppercase">Primary Organization</h3>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Lead Entity Profile Protocol</p>
                        </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black px-2 py-0.5 rounded-full">HQ_CORE</Badge>
                </div>

                <div className="bg-card/40 backdrop-blur-xl border border-white/[0.08] rounded-[3rem] p-8 md:p-10 space-y-10 shadow-2xl relative overflow-hidden group/primary">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

                    {/* Legal Identity */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <InputLabel className="text-primary/70 mb-0">Legal Entity Identity</InputLabel>
                            {!formData.orgName && <Badge className="bg-primary/10 text-primary border-primary/20 text-[7px] font-black px-1.5 py-0 rounded-sm">REQUIRED</Badge>}
                        </div>
                        <div className="relative group/name">
                            <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within/name:text-primary transition-colors" />
                            <Input
                                value={formData.orgName}
                                onChange={e => updateField('orgName', e.target.value)}
                                placeholder="e.g. Acme Global Industries"
                                className="h-16 pl-16 text-xl bg-black/40 border-border/50 focus:border-primary/50 text-white rounded-2xl font-black tracking-tight shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Sector A: Vertical & Capacity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <InputLabel className="ml-1">Industry Vertical</InputLabel>
                            {!showAddIndustry ? (
                                <Select value={formData.industry} onValueChange={(v) => v === 'BUILD_NEW' ? setShowAddIndustry(true) : updateField('industry', v)}>
                                    <SelectTrigger className="h-14 bg-black/30 border-border/50 rounded-xl text-white font-black text-[10px] uppercase tracking-widest pl-6">
                                        <SelectValue placeholder="Select Industry" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border min-w-[280px]">
                                        {industries.map(i => (
                                            <div key={i} className="flex items-center group/item px-1">
                                                <SelectItem value={i} className="flex-1 font-bold text-[10px] uppercase py-3">{i}</SelectItem>
                                                {!INDUSTRIES_DEFAULT.includes(i) && (
                                                    <button
                                                        onPointerDown={(e) => e.stopPropagation()}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            deleteIndustry(i);
                                                        }}
                                                        className="p-2 opacity-0 group-hover/item:opacity-100 text-muted-foreground hover:text-red-400 transition-all"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <div className="h-[1px] bg-border my-1 mx-2" />
                                        <div className="px-4 py-3 text-[10px] font-black text-primary hover:bg-primary/10 cursor-pointer rounded-lg uppercase" onClick={() => setShowAddIndustry(true)}>Build New Entity Type +</div>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="flex gap-2 animate-in slide-in-from-top-2">
                                    <Input
                                        value={newIndustry}
                                        onChange={e => setNewIndustry(e.target.value)}
                                        placeholder="Specify vertical..."
                                        className="h-14 bg-black/40 border-primary/50 text-white rounded-xl px-6 font-black text-[10px] uppercase"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && addIndustry()}
                                    />
                                    <Button onClick={addIndustry} size="icon" className="h-14 w-14 rounded-xl bg-primary text-black"><CheckCircle2 className="w-5 h-5" /></Button>
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            <InputLabel className="ml-1">Personnel Capacity</InputLabel>
                            <Select value={formData.size} onValueChange={v => updateField('size', v)}>
                                <SelectTrigger className="h-14 bg-black/30 border-border/50 rounded-xl text-white font-black text-[10px] uppercase tracking-widest pl-6">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    {['1-10', '11-50', '51-200', '200+'].map(s => (
                                        <SelectItem key={s} value={s} className="font-bold text-[10px] uppercase py-3">{s} Employees</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Sector B: Service Portfolio */}
                    <div className="space-y-4 pt-6 border-t border-white/[0.05]">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <div className="flex items-center gap-2">
                                <LayoutGrid className="w-4 h-4 text-primary" />
                                <InputLabel className="mb-0">Service Portfolio</InputLabel>
                            </div>
                            <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest italic">{formData.services.length} / 5 Active</span>
                        </div>
                        <div className="flex flex-wrap gap-2.5 items-center bg-black/40 p-6 rounded-[2rem] border border-white/[0.03] shadow-inner relative min-h-[100px]">
                            {availableServices.map(service => {
                                const isSelected = formData.services.includes(service);
                                return (
                                    <div key={service} className="relative group/service inline-block">
                                        <Badge
                                            variant={isSelected ? "default" : "secondary"}
                                            className={cn(
                                                "cursor-pointer px-4 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest border flex items-center gap-2",
                                                isSelected
                                                    ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                                                    : "bg-card/80 border-border text-foreground hover:border-primary/30"
                                            )}
                                            onClick={() => toggleService(service)}
                                        >
                                            {service}
                                            {isSelected && <Check className="w-3.5 h-3.5" />}
                                        </Badge>
                                        {!SERVICES_DEFAULT.includes(service) && (
                                            <button
                                                onPointerDown={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    deleteService(service);
                                                }}
                                                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/service:opacity-100 transition-opacity hover:scale-110 shadow-lg z-50 cursor-pointer"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                            {!showAddService ? (
                                <button onClick={() => setShowAddService(true)} className="h-10 px-5 rounded-xl border border-dashed border-primary/30 hover:border-primary text-[9px] font-black uppercase tracking-widest text-primary/70 transition-all flex items-center gap-2">+ Add Custom Service</button>
                            ) : (
                                <div className="flex gap-2 animate-in zoom-in-95 duration-300">
                                    <Input
                                        value={newService}
                                        onChange={e => setNewService(e.target.value)}
                                        placeholder="Bespoke service..."
                                        className="h-10 w-40 bg-black/40 border-primary/50 text-white rounded-xl px-4 font-black text-[9px] uppercase tracking-widest"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') addCustomService();
                                            if (e.key === 'Escape') setShowAddService(false);
                                        }}
                                    />
                                    <Button onClick={addCustomService} size="icon" className="h-10 w-10 rounded-xl bg-primary text-black flex items-center justify-center">
                                        <Check className="w-4 h-4" />
                                    </Button>
                                    <button onClick={() => setShowAddService(false)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-foreground">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sector C: Location */}
                    <div className="space-y-4 pt-6 border-t border-white/[0.05]">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                <InputLabel className="mb-0">Operational HQ Location</InputLabel>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setShowExploreModal(true)} className="h-9 px-4 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 font-black text-[9px] uppercase tracking-[0.2em] border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all active:scale-95"><Activity className="w-3.5 h-3.5 mr-2" /> View Intel</Button>
                                <Button variant="ghost" size="sm" onClick={() => fetchLocation()} className="h-9 px-4 rounded-full bg-primary/10 text-primary hover:bg-primary/20 font-black text-[9px] uppercase tracking-[0.2em] border border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)] transition-all active:scale-95">{isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Sparkles className="w-3.5 h-3.5 mr-2" />} Detect Live</Button>
                            </div>
                        </div>
                        <div className="relative group/search">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
                            <Input
                                placeholder="Geospatial lookup: Address, City, or Region..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && performLocationSearch(searchQuery)}
                                className="h-16 pl-14 bg-black/40 border-border/50 rounded-2xl text-white font-black text-xs tracking-widest shadow-inner focus:border-primary/50 transition-all placeholder:text-white/20 uppercase"
                            />
                            {isSearching && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />}
                        </div>
                        {formData.country && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl w-fit animate-in fade-in slide-in-from-left-2">
                                <Globe2 className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{formData.country} Sector Validated</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const addInvite = () => {
        setFormData(prev => ({
            ...prev,
            invites: [...prev.invites, { email: '', role: 'Specialist', skills: [], squad: formData.structure === 'multi' ? (formData.squads[0]?.name || 'Alpha') : undefined }]
        }));
    };


    const renderStepAuth = () => (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 uppercase font-black">
            {(!formData.adminName || !formData.adminEmail || !password) && (
                <div className="p-4 rounded-[2rem] border backdrop-blur-md animate-in slide-in-from-top-4 duration-700 flex items-center justify-between px-8 bg-purple-500/10 border-purple-500/20 text-purple-400 shadow-[0_8px_32px_rgba(168,85,247,0.1)]">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-500/20 rounded-xl">
                            <ShieldCheck className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-widest">Governance Protocol</h4>
                            <p className="text-[10px] font-bold opacity-70 uppercase tracking-tighter mt-0.5">Initialize top-level administrative authority</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tighter italic">Administrative Governance</h2>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                        Secure the organizational perimeter
                    </p>
                </div>
            </div>

            <div className="space-y-12">
                {/* Lead Organization Governance */}
                <div className="p-10 bg-primary/5 border border-primary/20 rounded-[2.5rem] relative overflow-hidden group/lead">
                    <div className="absolute top-0 right-0 p-6 opacity-20 group-hover/lead:opacity-40 transition-opacity">
                        <Building2 className="w-12 h-12 text-primary" />
                    </div>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-black text-primary tracking-[0.3em] uppercase">{formData.orgName || 'LEAD ORGANIZATION'} DELEGATE</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <InputLabel>Primary Governance Delegate</InputLabel>
                            <div className="relative group/name">
                                <Users2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/name:text-primary transition-colors" />
                                <Input
                                    placeholder="Delegate Legal Name"
                                    value={formData.adminName}
                                    onChange={(e) => updateField('adminName', e.target.value)}
                                    className="h-14 pl-12 bg-black/40 border-border/50 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <InputLabel>Authority Status</InputLabel>
                            {!baseIsAddingRole ? (
                                <Select value={formData.adminRole} onValueChange={(v: any) => v === 'BUILD_CUSTOM' ? setBaseIsAddingRole(true) : updateField('adminRole', v)}>
                                    <SelectTrigger className="h-14 bg-muted/20 border-border text-foreground rounded-xl font-black text-[10px] uppercase tracking-[0.2em] pl-6 shadow-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border text-foreground rounded-xl shadow-2xl min-w-[240px]">
                                        {roleOptions.map(r => (
                                            <div key={r} className="flex items-center group/item px-1">
                                                <SelectItem value={r} className="flex-1 rounded-lg font-bold text-[10px] uppercase tracking-widest py-3">{r}</SelectItem>
                                                {!ROLE_OPTIONS_DEFAULT.includes(r) && (
                                                    <button
                                                        onPointerDown={(e) => e.stopPropagation()}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            deleteRole(r);
                                                        }}
                                                        className="p-2 opacity-0 group-hover/item:opacity-100 text-muted-foreground hover:text-red-400 transition-all"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <div className="h-[1px] bg-border my-1 mx-2" />
                                        <SelectItem value="BUILD_CUSTOM" className="font-black text-primary bg-primary/10 py-3 cursor-pointer">NEW STATUS +</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="flex gap-2 animate-in slide-in-from-top-2 duration-300">
                                    <Input
                                        value={customRole}
                                        onChange={(e) => setCustomRole(e.target.value)}
                                        placeholder="e.g. Chief Strategist"
                                        className="h-14 bg-muted rounded-xl border-primary/50 focus:border-primary px-6 font-bold text-xs uppercase"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && customRole.trim()) {
                                                if (!roleOptions.includes(customRole.trim())) setRoleOptions(prev => [...prev, customRole.trim()]);
                                                updateField('adminRole', customRole.trim());
                                                setCustomRole('');
                                                setBaseIsAddingRole(false);
                                            }
                                        }}
                                    />
                                    <Button onClick={() => {
                                        if (customRole.trim()) {
                                            const fresh = customRole.trim();
                                            const isDuplicate = roleOptions.some(r => r.toLowerCase() === fresh.toLowerCase());
                                            if (isDuplicate) {
                                                toast.error("Role protocol already active");
                                                return;
                                            }
                                            setRoleOptions(prev => [...prev, fresh]);
                                            updateField('adminRole', fresh);
                                            setCustomRole('');
                                            setBaseIsAddingRole(false);
                                            toast.success("Authority status integrated");
                                        }
                                    }} className="h-14 w-14 shrink-0 rounded-xl bg-primary text-black"><CheckCircle2 className="w-5 h-5" /></Button>
                                </div>
                            )}
                        </div>

                        <div className="col-span-full space-y-2">
                            <InputLabel>Governance Access Relay (Work Email)</InputLabel>
                            <div className="relative group/email">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/email:text-primary transition-colors" />
                                <Input
                                    placeholder="delegate@organization.ai"
                                    value={formData.adminEmail}
                                    onChange={(e) => updateField('adminEmail', e.target.value)}
                                    className="h-14 pl-12 bg-black/40 border-border/50 rounded-xl lowercase"
                                />
                            </div>
                        </div>
                    </div>
                </div>



                {/* Global Security Controls */}
                <div className="p-10 bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] relative overflow-hidden group/security">
                    <div className="absolute top-0 right-0 p-6 opacity-20 group-hover/security:opacity-40 transition-opacity">
                        <ShieldCheck className="w-12 h-12 text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                            <Zap className="w-4 h-4 text-emerald-500" />
                        </div>
                        <h3 className="text-sm font-black text-emerald-500 tracking-[0.3em] uppercase">FEDERATED SECURITY PROTOCOLS</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1 mb-1">
                                <InputLabel className="mb-0">Cryptographic Access Key</InputLabel>
                                {password && (
                                    <Badge className={cn(
                                        "text-[7px] font-black px-2 py-0.5 rounded-sm",
                                        isPasswordStrong(password) ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                    )}>
                                        {isPasswordStrong(password) ? "STRENGTH: ELITE" : "STRENGTH: INSUFFICIENT"}
                                    </Badge>
                                )}
                            </div>
                            <Input
                                type="password"
                                placeholder="Secure Authority Passcode"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-14 bg-black/40 border-border/50 rounded-xl pl-6"
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel>Confirm Authority Access</InputLabel>
                            <Input
                                type="password"
                                placeholder="Mirror Access Key"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="h-14 bg-black/40 border-border/50 rounded-xl pl-6"
                            />
                        </div>
                    </div>
                </div>

                <div className="col-span-full mt-10 bg-primary/5 border border-primary/20 rounded-[3rem] p-10 shadow-inner group/summary transition-all hover:bg-primary/10">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-[0.25em] text-primary">Organization Identity Matrix</h4>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Global Instance Mapping • Active</p>
                        </div>
                        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <div className="font-sans text-2xl text-foreground bg-black/40 py-8 px-10 rounded-[2.5rem] border border-white/[0.05] shadow-2xl text-center flex flex-col items-center gap-2">
                        <div className="text-primary font-black tracking-[0.2em] italic">
                            {formData.orgName ? `${formData.orgName.toUpperCase()} • ELITE_WORKSPACE` : "ESTABLISHING_IDENTITY..."}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-black tracking-[0.3em] opacity-50 uppercase mt-2">
                            Operational HQ: {formData.country || "Pending Region Sync"} • Security Level: Tier-1
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground font-sans">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] pointer-events-none fixed z-0"></div>
            <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none z-0 mix-blend-screen" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none z-0" />

            {renderExploreModal()}

            <div className="container mx-auto max-w-4xl px-6 py-12 relative z-10">
                <div className="flex items-center justify-between mb-16">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-2 h-10 px-4 rounded-xl transition-all font-bold text-xs uppercase tracking-widest" onClick={() => navigate('/welcome')}>
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                            <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-xl tracking-tight leading-none">Organization Initializer</span>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">Enterprise System Mapping v1.0</span>
                        </div>
                    </div>
                </div>

                <div className="mb-12 relative group/nav">
                    <div className="flex justify-between mb-4 px-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Deployment Step</span>
                            <span className="text-lg font-black text-primary leading-none">{step.toString().padStart(2, '0')}</span>
                            <span className="text-xs font-bold text-muted-foreground/50 tracking-widest">/ {totalSteps.toString().padStart(2, '0')}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-0.5">Active Module</span>
                            <span className="text-sm font-black text-foreground tracking-tight transition-all group-hover/nav:text-primary">{
                                ['Identity & Architecture', 'Access Governance'][step - 1]
                            }</span>
                        </div>
                    </div>
                    <div className="h-2 bg-muted/40 rounded-full overflow-hidden border border-border/20 backdrop-blur-sm">
                        <div
                            className="h-full bg-gradient-to-r from-primary via-blue-500 to-primary/80 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] bg-[length:200%_auto] animate-shimmer"
                            style={{ width: `${(step / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="mb-12 min-h-[500px] bg-card/60 backdrop-blur-xl border border-white/[0.08] rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group/container transition-all hover:border-white/[0.12]">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 opacity-50 pointer-events-none" />

                    {step === 1 && renderStepIdentity()}
                    {step === 2 && renderStepAuth()}
                </div>

                <div className="flex flex-col gap-6 border-t border-white/[0.05] pt-10">
                    {!isStepValid() && (
                        <div className="flex flex-wrap items-center gap-3 px-6 py-4 bg-red-500/5 backdrop-blur-xl border border-red-500/10 rounded-[2rem] animate-in slide-in-from-bottom-2 duration-500 shadow-[0_0_30px_rgba(239,68,68,0.05)]">
                            <div className="flex items-center gap-2 text-red-400">
                                <AlertTriangle className="w-4 h-4 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-[0.25em]">Pending Protocols:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {getMissingRequirements().map(req => (
                                    <Badge key={req} variant="outline" className="text-[8px] font-black uppercase tracking-widest border-red-400/20 text-red-300 bg-red-400/5 px-3 py-1 rounded-lg">
                                        <X className="w-2.5 h-2.5 mr-1.5 text-red-400/50" /> {req}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            disabled={step === 1}
                            className="text-muted-foreground hover:text-foreground hover:bg-white/5 h-12 rounded-xl px-6 font-bold text-xs uppercase tracking-widest transition-all"
                        >
                            Previous Step
                        </Button>

                        {step < 2 ? (
                            <Button
                                onClick={nextStep}
                                className={cn(
                                    "bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-12 h-14 text-sm font-black uppercase tracking-widest shadow-[0_10px_40px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_10px_60px_rgba(var(--primary-rgb),0.4)] hover:scale-[1.02] transition-all group/btn",
                                    !isStepValid() && "bg-muted/30 text-white/30 border border-white/5 shadow-none hover:bg-muted/40 hover:text-white/40 hover:scale-100"
                                )}
                            >
                                Initialize Module <ArrowLeft className="w-4 h-4 ml-4 rotate-180 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className={cn(
                                    "bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl px-12 h-14 text-sm font-black uppercase tracking-widest shadow-[0_10px_40px_rgba(16,185,129,0.3)] hover:shadow-[0_10px_60px_rgba(16,185,129,0.4)] hover:scale-[1.02] transition-all relative overflow-hidden",
                                    (isLoading || !isStepValid()) && "opacity-50 cursor-not-allowed bg-muted text-muted-foreground shadow-none hover:bg-muted hover:scale-100 hover:shadow-none px-8"
                                )}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Establishing Uplink...
                                    </>
                                ) : (
                                    <>
                                        Confirm Enterprise Launch <Check className="w-4 h-4 ml-4" />
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationRegistration;
