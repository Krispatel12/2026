// @ts-nocheck
// SYNC_ID: 2026-02-02-ELITE-V1
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Textarea } from "@/shared/components/ui/textarea";
import { DialogDescription, DialogTitle } from "@/shared/components/ui/dialog"; // Added DialogDescription and DialogTitle
import {
    Target, AlertTriangle, AlertCircle, CalendarDays, Bot, BrainCircuit, Rocket, Laptop, Check, Globe, MapPin, Mail, Lock, Info, Sparkles,
    BarChart2, BarChart3, Users2, ShieldCheck, ShieldAlert, Activity, Cpu, HardDrive, Network, Workflow, LayoutGrid, CheckCircle2, Plus, Trash2, ArrowLeft, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, isFakeData, isAccessCodeStrong, isValidUrlPattern, formatEliteUrl, getPasswordStrength, isPasswordStrong } from "@/shared/lib/utils";

const isValidProfessionalEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};
import { apiClient } from "@/shared/lib/api";

const Counter = ({ value, duration = 1000, prefix = "", suffix = "" }: { value: number, duration?: number, prefix?: string, suffix?: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        if (start === end) {
            setCount(end);
            return;
        }

        const totalIntervals = 50;
        const increment = (end - start) / totalIntervals;
        const intervalTime = duration / totalIntervals;

        const timer = setInterval(() => {
            start += increment;
            if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, intervalTime);

        return () => clearInterval(timer);
    }, [value, duration]);

    return (
        <span className="tabular-nums">
            {prefix}{count.toString().padStart(2, '0')}{suffix}
        </span>
    );
};

type CompanySize = '1-10' | '11-50' | '51-200' | '200+';
type TeamStructure = 'single' | 'multi';
type AiMode = 'assist' | 'semi' | 'auto';

interface Invite {
    email: string;
    role: 'Admin' | 'Editor' | 'Viewer' | 'Billing';
    skills: string[];
    squad?: string;
}

interface EliteProjectRegistrationData {
    // Identity
    projectName: string;
    industry: string;
    size: CompanySize;
    country: string;
    coords?: { lat: number; lng: number };


    // Credentials (Login)
    email: string;
    adminRole: string; // NEW: Identification of administrative capacity

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
    unifiedTeamName: string;
    squads: { name: string; targetDate?: string }[];

    // Team
    invites: Invite[];

    // Environment
    tools: {
        projects: boolean;
        tasks: boolean;
        analytics: boolean;
        billing: boolean;
    };
}

const PROJECT_TYPES_DEFAULT = [
    "Web Development", "Mobile App", "Marketing Campaign",
    "Product Launch", "Design System", "Research", "AI Model Training"
];

const SKILL_OPTIONS_DEFAULT = ["React", "Node.js", "Python", "Design", "Marketing", "Data Science", "DevOps", "Management", "Content"];
const ROLE_OPTIONS_DEFAULT = ["Project Lead", "Senior Architect", "Systems Engineer", "Full Stack Dev", "UI Designer", "Product Designer", "Data Analyst", "DevOps Engineer", "Project Director"];

const TOOLS = [
    { id: 'projects', label: 'Roadmap & Goals', desc: 'Timeline and milestones', icon: LayoutGrid },
    { id: 'tasks', label: 'Task Board', desc: 'Kanban, lists, and sprints', icon: CheckCircle2 },
    { id: 'analytics', label: 'Analytics', desc: 'Team velocity and insights', icon: BarChart3 },
];

// --- Sub-components ---

interface InviteRowProps {
    invite: Invite;
    index: number;
    updateInvite: (index: number, field: keyof Invite, value: any) => void;
    removeInvite: (index: number) => void;
    skillOptions: string[];
    roleOptions: string[];
    squadOptions: string[];
    onAddCustomSkill: (skill: string) => void;
    onAddCustomRole: (role: string) => void;
    isDuplicate?: boolean;
}

const InviteRow = ({ invite, index, updateInvite, removeInvite, skillOptions, roleOptions, squadOptions, onAddCustomSkill, onAddCustomRole, isDuplicate }: InviteRowProps) => {
    const [isAddingSkill, setIsAddingSkill] = useState(false);
    const [customSkill, setCustomSkill] = useState("");
    const isReady = isValidProfessionalEmail(invite.email) && invite.skills.length > 0 && !!invite.role && !isDuplicate;

    const handleAddSkill = (skillToAdd: string) => {
        const lowerSkill = skillToAdd.toLowerCase().trim();
        if (!invite.skills.some(s => s.toLowerCase().trim() === lowerSkill)) {
            updateInvite(index, 'skills', [...invite.skills, skillToAdd]);
        } else {
            toast.error("Skill already allocated to this unit!");
        }
        setIsAddingSkill(false);
        setCustomSkill("");
    };

    const handleCreateSkill = () => {
        if (!customSkill.trim()) return;
        onAddCustomSkill(customSkill);
        handleAddSkill(customSkill);
    };

    const [isAddingRole, setIsAddingRole] = useState(false);
    const [customRole, setCustomRole] = useState("");

    const handleCreateRole = () => {
        if (!customRole.trim()) return;
        onAddCustomRole(customRole);
        updateInvite(index, 'role', customRole);
        setIsAddingRole(false);
        setCustomRole("");
    };

    return (
        <div className={cn(
            "bg-card/20 backdrop-blur-2xl border border-white/[0.05] p-8 rounded-[2.5rem] relative group/row transition-all duration-500 hover:bg-card/30 hover:border-primary/20 shadow-xl overflow-hidden",
            isReady && "border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
        )}>
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover/row:bg-primary transition-all duration-500" />
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 transition-all duration-500 group-hover/row:scale-110 group-hover/row:bg-primary group-hover/row:text-primary-foreground group-hover/row:shadow-lg group-hover/row:shadow-primary/20">
                        <Users2 className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-black text-lg tracking-tight">Specialist Allocation</h4>
                            <Badge className={cn(
                                "border text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full transition-all duration-500",
                                isReady ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            )}>
                                {isReady ? "READY_FOR_DEPLOY" : "INCOMPLETE_PROFILE"}
                            </Badge>
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Unit Identity Mapping</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeInvite(index)}
                    className="text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all h-10 w-10 border border-transparent hover:border-red-400/20"
                >
                    <Trash2 className="w-5 h-5" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 relative z-10">
                <div className="space-y-1.5 slice-in-from-left duration-300">
                    <div className="flex justify-between items-center px-3 mb-1">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider leading-none">Email Access</Label>
                        {!invite.email && <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[7px] font-black px-1.5 py-0 rounded-sm">REQUIRED</Badge>}
                    </div>
                    <div className="relative group/input">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                        <Input
                            value={invite.email}
                            onChange={e => updateInvite(index, 'email', e.target.value)}
                            placeholder="specialist@cortexa.ai"
                            className={cn(
                                "h-14 bg-black/20 backdrop-blur-md border-border/50 text-foreground rounded-2xl pl-12 focus:border-primary/50 transition-all font-bold text-sm tracking-tight shadow-inner",
                                (invite.email && (!isValidProfessionalEmail(invite.email) || isDuplicate)) && "border-red-500/50 focus:border-red-500/30 ring-1 ring-red-500/20"
                            )}
                        />
                        {isValidProfessionalEmail(invite.email) && !isDuplicate && (
                            <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 animate-in zoom-in duration-500" />
                        )}
                        {invite.email && !isValidProfessionalEmail(invite.email) && (
                            <p className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em] ml-2 mt-1 animate-in fade-in slide-in-from-top-1">Invalid Format</p>
                        )}
                        {isDuplicate && (
                            <p className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em] ml-2 mt-1 animate-in fade-in slide-in-from-top-1 flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5" /> DUPLICATE_IDENTITY
                            </p>
                        )}
                    </div>
                </div>
                {/* Squad Assignment - AUTO-MAPPING INTERFACE */}
                <div className="space-y-1.5 slice-in-from-left duration-400">
                    <div className="flex justify-between items-center px-3 mb-1">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider leading-none">Unit Assignment</Label>
                        {!invite.squad && <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[7px] font-black px-1.5 py-0 rounded-sm">UNASSIGNED</Badge>}
                    </div>
                    <Select
                        value={invite.squad || "unassigned"}
                        onValueChange={v => updateInvite(index, 'squad', v === "unassigned" ? undefined : v)}
                    >
                        <SelectTrigger className="h-14 bg-black/20 backdrop-blur-md border-border/50 text-foreground rounded-2xl pl-4 focus:border-primary/50 transition-all font-bold text-sm tracking-tight shadow-inner">
                            <SelectValue placeholder="Select Squad" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground rounded-xl shadow-2xl">
                            <SelectItem value="unassigned" className="text-muted-foreground">Unassigned (General)</SelectItem>
                            {squadOptions.map(s => (
                                <SelectItem key={s} value={s} className="font-bold uppercase tracking-widest">{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5 slice-in-from-right duration-500">
                    <div className="flex justify-between items-center px-3 mb-1">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider leading-none">Role Designation</Label>
                        {!invite.role && <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[7px] font-black px-1.5 py-0 rounded-sm">REQUIRED</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                        {!isAddingRole ? (
                            <Select
                                value={invite.role}
                                onValueChange={v => v === 'CUSTOM_PROTOTYPE' ? setIsAddingRole(true) : updateInvite(index, 'role', v)}
                            >
                                <SelectTrigger className="h-12 bg-muted/40 border-border text-foreground rounded-xl font-bold text-[10px] uppercase tracking-widest pl-4 flex-1">
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground rounded-xl shadow-2xl max-h-[250px]">
                                    {roleOptions.map(r => (
                                        <SelectItem key={r} value={r} className="rounded-lg font-bold text-[10px] uppercase tracking-widest focus:bg-primary focus:text-primary-foreground py-2.5">{r}</SelectItem>
                                    ))}
                                    <div className="p-1 border-t border-border/50 mt-1">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start h-9 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsAddingRole(true);
                                            }}
                                        >
                                            <Plus className="w-3 h-3 mr-2" /> Define Custom Role
                                        </Button>
                                    </div>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="flex items-center gap-2 flex-1 animate-in slide-in-from-right-2 duration-300">
                                <div className="relative flex-1 group/role">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                    <Input
                                        value={customRole}
                                        onChange={e => setCustomRole(e.target.value)}
                                        placeholder="e.g. CORE ANALYST"
                                        className="h-12 pl-12 bg-black/40 border-primary/30 text-foreground rounded-xl font-bold text-[10px] uppercase tracking-widest"
                                        autoFocus
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleCreateRole();
                                            if (e.key === 'Escape') setIsAddingRole(false);
                                        }}
                                    />
                                </div>
                                <Button
                                    size="sm"
                                    className="h-12 px-4 rounded-xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
                                    onClick={handleCreateRole}
                                >
                                    Map
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-12 w-12 rounded-xl text-muted-foreground hover:bg-muted"
                                    onClick={() => setIsAddingRole(false)}
                                >
                                    <Plus className="w-5 h-5 rotate-45" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Skills Selection */}
            <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between ml-3">
                    <div className="flex items-center gap-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Competency Matrix</Label>
                        {invite.skills.length === 0 && <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[7px] font-black px-1.5 py-0 rounded-sm animate-pulse">REQUIRED</Badge>}
                    </div>
                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{invite.skills.length} / 5 Active</span>
                </div>
                <div className="flex flex-wrap gap-2 items-center bg-muted/20 p-3 rounded-2xl border border-border/50">
                    {invite.skills.map(skill => (
                        <Badge
                            key={skill}
                            variant="secondary"
                            className="bg-card border border-border text-foreground hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 cursor-pointer px-4 py-2 rounded-xl transition-all text-[10px] font-bold shadow-sm uppercase tracking-wide group/badge"
                            onClick={() => {
                                const newSkills = invite.skills.filter(s => s !== skill);
                                updateInvite(index, 'skills', newSkills);
                            }}
                        >
                            {skill} <Plus className="w-3 h-3 ml-1.5 rotate-45 group-hover/badge:scale-125 transition-transform" />
                        </Badge>
                    ))}

                    {invite.skills.length === 0 && (
                        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest ml-1 animate-in fade-in slide-in-from-left-2 duration-700">
                            NO COMPETENCIES MAPPED TO UNIT • MIN 1 REQUIRED
                        </p>
                    )}

                    {!isAddingSkill ? (
                        invite.skills.length < 5 && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl h-9 text-[10px] font-black uppercase tracking-widest border-dashed border-border bg-transparent text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all"
                                onClick={() => setIsAddingSkill(true)}
                            >
                                <Plus className="w-3 h-3 mr-1.5" /> Allocate Skill
                            </Button>
                        )
                    ) : (
                        <div className="flex items-center gap-2 animate-in fade-in zoom-in-50 duration-300">
                            <Select onValueChange={(v) => handleAddSkill(v)}>
                                <SelectTrigger className="h-9 min-w-[140px] bg-card border-primary/30 text-foreground rounded-xl text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20">
                                    <SelectValue placeholder="Competencies" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground rounded-xl shadow-2xl max-h-[200px]">
                                    {skillOptions.filter(s => !invite.skills.includes(s)).map(s => (
                                        <SelectItem key={s} value={s} className="rounded-lg text-[10px] font-bold uppercase tracking-widest focus:bg-primary py-2">{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 pl-3 shadow-sm">
                                <Input
                                    value={customSkill}
                                    onChange={(e) => setCustomSkill(e.target.value)}
                                    placeholder="Neural custom..."
                                    className="h-7 w-28 border-none shadow-none bg-transparent focus-visible:ring-0 text-[10px] font-bold uppercase tracking-widest p-0 text-foreground placeholder:text-muted-foreground/50"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreateSkill();
                                        if (e.key === 'Escape') setIsAddingSkill(false);
                                    }}
                                    autoFocus
                                />
                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all" onClick={handleCreateSkill}>
                                    <CheckCircle2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground" onClick={() => setIsAddingSkill(false)}>
                                <Plus className="w-4 h-4 rotate-45" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
        </div>
    );
};

const renderStepAuth = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        {/* Governance Status HUD */}
        {(!isValidProfessionalEmail(formData.email) || !formData.adminRole || !password || password !== confirmPassword) && (
            <div className={cn(
                "p-4 rounded-[2rem] border backdrop-blur-md animate-in slide-in-from-top-4 duration-700 flex items-center justify-between px-8",
                !isValidProfessionalEmail(formData.email) ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
            )}>
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "p-2 rounded-xl",
                        !isValidProfessionalEmail(formData.email) ? "bg-red-500/20" : "bg-amber-500/20"
                    )}>
                        {!isValidProfessionalEmail(formData.email) ? <Mail className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest">Governance Alert</h4>
                        <p className="text-[10px] font-bold opacity-70 uppercase tracking-tighter mt-0.5">
                            {!isValidProfessionalEmail(formData.email)
                                ? "Pro-level work email required for administrative mapping."
                                : (password !== confirmPassword ? "Administrative keys must match primary allocation." : "Establish secure identity protocols.")}
                        </p>
                    </div>
                </div>
            </div>
        )}
        <div className="space-y-2">
            <h2 className="text-3xl font-black text-foreground tracking-tighter">Security Protocols</h2>
            <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Establish administrative governance</p>
            </div>
        </div>

        <div className="bg-card/30 backdrop-blur-3xl border border-white/[0.05] p-10 rounded-[3rem] space-y-8 shadow-2xl relative overflow-hidden group/security">
            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-3 mb-1">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Admin Work Email</Label>
                        {!formData.email && <Badge className="bg-primary/10 text-primary border-primary/20 text-[7px] font-black px-1.5 py-0 rounded-sm">REQUIRED</Badge>}
                    </div>
                    <div className="relative group/input">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={e => updateField('email', e.target.value)}
                            placeholder="project.lead@company.com"
                            className={cn(
                                "h-16 pl-14 bg-black/20 backdrop-blur-md border-border/50 rounded-2xl text-foreground focus:border-primary/50 transition-all font-mono text-sm tracking-tight shadow-inner",
                                formData.email && !isValidProfessionalEmail(formData.email) && "border-red-500/50 focus:border-red-500/30 ring-1 ring-red-500/20"
                            )}
                        />
                        {isValidProfessionalEmail(formData.email) && (
                            <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 animate-in zoom-in duration-500" />
                        )}
                    </div>
                    {formData.email && !isValidProfessionalEmail(formData.email) && (
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] ml-3 animate-in fade-in slide-in-from-top-1">Invalid professional email format</p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center px-3 mb-1">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Administrative Role</Label>
                        {!formData.adminRole && <Badge className="bg-primary/10 text-primary border-primary/20 text-[7px] font-black px-1.5 py-0 rounded-sm">REQUIRED</Badge>}
                    </div>
                    <div className="relative group/input">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                        <Input
                            type="text"
                            value={formData.adminRole}
                            onChange={e => updateField('adminRole', e.target.value)}
                            placeholder="e.g. CTO, Product Lead, Senior Architect"
                            className="h-16 pl-14 bg-black/20 backdrop-blur-md border-border/50 rounded-2xl text-foreground focus:border-primary/50 transition-all font-mono text-sm tracking-tight shadow-inner"
                        />
                        {formData.adminRole.trim().length >= 2 && (
                            <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 animate-in zoom-in duration-500" />
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center px-3 mb-1">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Administrative Key</Label>
                        {!password && <span className="text-[8px] font-black text-primary animate-pulse uppercase tracking-widest">REQUIRED</span>}
                    </div>
                    <div className="relative group/input">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                        <Input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="h-16 pl-14 bg-black/20 backdrop-blur-md border-border/50 rounded-2xl text-foreground focus:border-primary/50 transition-all font-mono tracking-[0.4em] text-lg shadow-inner"
                        />
                    </div>
                    {/* Password Strength HUD */}
                    {password && (
                        <div className="px-4 py-3 bg-muted/20 rounded-2xl border border-white/5 space-y-2 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Entropy Status</span>
                                <span className={cn(
                                    "text-[8px] font-black uppercase tracking-widest",
                                    getPasswordStrength(password) === 4 ? "text-emerald-500" :
                                        getPasswordStrength(password) >= 2 ? "text-amber-500" : "text-red-500"
                                )}>
                                    {getPasswordStrength(password) === 4 ? "ELITE_ENCRYPTION" :
                                        getPasswordStrength(password) >= 2 ? "STANDARD_DEFILADE" : "VULNERABLE_VECTOR"}
                                </span>
                            </div>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "h-1 flex-1 rounded-full transition-all duration-500",
                                            getPasswordStrength(password) >= i
                                                ? (getPasswordStrength(password) === 4 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-amber-500")
                                                : "bg-white/5"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center px-3 mb-1">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Confirm Administrative Key</Label>
                        {!confirmPassword && <span className="text-[8px] font-black text-primary animate-pulse uppercase tracking-widest">REQUIRED</span>}
                    </div>
                    <div className="relative group/input">
                        <ShieldCheck className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-500",
                            password && confirmPassword ? (password === confirmPassword ? "text-emerald-500 scale-110" : "text-red-500 animate-bounce") : "text-muted-foreground"
                        )} />
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className={cn(
                                "h-16 pl-14 bg-black/20 backdrop-blur-md border-border/50 rounded-2xl text-foreground focus:border-primary/50 transition-all font-mono tracking-[0.4em] text-lg shadow-inner",
                                confirmPassword && password !== confirmPassword && "border-red-500/50 focus:border-red-500/30 ring-1 ring-red-500/20"
                            )}
                        />
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] ml-3 animate-in fade-in slide-in-from-top-1">Keys do not match</p>
                    )}
                </div>
            </div>


        </div>

        <div className="bg-blue-500/5 border border-blue-500/10 p-8 rounded-[2.5rem] flex gap-4 text-blue-400 group/info transition-all hover:bg-blue-500/10 backdrop-blur-md shadow-lg">
            <Info className="w-6 h-6 shrink-0 mt-0.5 group-hover/info:scale-110 transition-transform text-blue-400/60" />
            <div className="space-y-1.5">
                <p className="text-xs font-black uppercase tracking-widest text-blue-400">Security Clearance Required</p>
                <p className="text-[10px] font-bold text-blue-400/60 leading-relaxed uppercase tracking-widest">Administrative keys are encrypted via AES-256-GCM. Ensure your secondary mapping matches the primary allocation block.</p>
            </div>
        </div>

        {/* Architectural Summary */}
        <div className="bg-primary/5 border border-white/[0.05] p-10 rounded-[3.5rem] relative overflow-hidden group/summary animate-in fade-in zoom-in duration-1000 shadow-[0_32px_64px_-16px_rgba(var(--primary-rgb),0.1)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-emerald-500 to-primary animate-shimmer bg-[length:200%_auto]" />
            <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-[1.5rem] border border-primary/20 shadow-xl group-hover/summary:scale-110 transition-all duration-700">
                        <Globe className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-[0.25em] text-primary">Architectural Summary</h4>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-60">Project Designation Matrix • Tier-1</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-black/20 border border-white/[0.05] p-6 rounded-[2rem] group/path transition-all hover:border-primary/40 shadow-inner col-span-full">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Project Designation</Label>
                            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                        </div>
                        <div className="font-mono text-xs text-foreground bg-primary/5 py-4 px-6 rounded-xl border border-primary/10 shadow-inner font-black tracking-[0.1em] text-center uppercase">
                            {formData.projectName
                                ? `${formData.projectName} • Elite Operational Architecture • Ready`
                                : "Establishing Strategic Identity..."}
                        </div>
                    </div>
                </div>


            </div>
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        </div>
    </div>
);

const ProjectWorkspaceRegistration = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const orgIdFromUrl = searchParams.get('orgId');
    const returnTo = searchParams.get('returnTo') || '/app';
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [activeLogIndex, setActiveLogIndex] = useState(0);

    const ELITE_LOGS = [
        "INITIALIZING_GENESIS_ENGINE",
        "ESTABLISHING_SECURE_UPLINK",
        "MAPPING_NEURAL_PATHWAYS",
        "PROVISIONING_ENVIRONMENT",
        "DEPLOYING_SQUAD_TOPOLOGIES",
        "FINALIZING_ENVIRONMENT"
    ];

    useEffect(() => {
        if (step === 4 || step === 6) {
            setIsScanning(true);
            const timer = setTimeout(() => setIsScanning(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [step]);

    // Dynamic Lists State
    const [projectCategories, setProjectCategories] = useState<string[]>(PROJECT_TYPES_DEFAULT);
    const [skillOptions, setSkillOptions] = useState<string[]>(SKILL_OPTIONS_DEFAULT);
    const [roleOptions, setRoleOptions] = useState<string[]>(ROLE_OPTIONS_DEFAULT);
    const [customCategoryInput, setCustomCategoryInput] = useState("");
    const [showCategoryInput, setShowCategoryInput] = useState(false);

    // Load from LocalStorage on Mount
    useEffect(() => {
        const savedCats = localStorage.getItem('cortexa_project_categories');
        const savedSkills = localStorage.getItem('cortexa_skill_options');
        const savedRoles = localStorage.getItem('cortexa_role_options');

        if (savedCats) setProjectCategories(JSON.parse(savedCats));
        if (savedSkills) setSkillOptions(JSON.parse(savedSkills));
        if (savedRoles) setRoleOptions(JSON.parse(savedRoles));

        // Pre-populate if already logged in as Org Admin
        const currentUser = apiClient.getUser();
        if (currentUser && currentUser.email) {
            setFormData(prev => ({
                ...prev,
                email: currentUser.email,
                adminRole: currentUser.role || 'Admin'
            }));
            // If we have a user, ensure step 4 is passable or auto-verified
        }
    }, []);

    const addCustomCategory = () => {
        const newCat = customCategoryInput.trim();
        if (!newCat) { setShowCategoryInput(false); return; }

        // Dupe Check
        if (projectCategories.some(c => c.toLowerCase() === newCat.toLowerCase())) {
            toast.error(`Category "${newCat}" already exists.`);
            setCustomCategoryInput("");
            const existing = projectCategories.find(c => c.toLowerCase() === newCat.toLowerCase());
            if (existing) updateField('industry', existing);
            setShowCategoryInput(false);
            return;
        }

        const newCategories = [...projectCategories, newCat];
        setProjectCategories(newCategories);
        localStorage.setItem('cortexa_project_categories', JSON.stringify(newCategories));
        updateField('industry', newCat);
        setCustomCategoryInput("");
        setShowCategoryInput(false);
        toast.success(`Category "${newCat}" added!`);
    };

    const deleteCustomCategory = (catToDelete: string) => {
        const newCategories = projectCategories.filter(c => c !== catToDelete);
        setProjectCategories(newCategories);
        localStorage.setItem('cortexa_project_categories', JSON.stringify(newCategories));
        updateField('industry', ''); // Reset selection
        toast.success(`Category "${catToDelete}" deleted.`);
    };

    const addCustomSkill = (newSkill: string) => {
        if (!newSkill.trim()) return;

        if (skillOptions.some(s => s.toLowerCase() === newSkill.toLowerCase())) {
            return;
        }

        const updatedSkills = [...skillOptions, newSkill];
        setSkillOptions(updatedSkills);
        localStorage.setItem('cortexa_skill_options', JSON.stringify(updatedSkills));
        toast.success(`Skill "${newSkill}" mapped globally!`);
    };

    const addCustomRole = (newRole: string) => {
        if (!newRole.trim()) return;

        if (roleOptions.some(r => r.toLowerCase() === newRole.toLowerCase())) {
            return;
        }

        const updatedRoles = [...roleOptions, newRole];
        setRoleOptions(updatedRoles);
        localStorage.setItem('cortexa_role_options', JSON.stringify(updatedRoles));
        toast.success(`Role "${newRole}" registered globally!`);
    };

    // Initial State
    const [formData, setFormData] = useState<EliteProjectRegistrationData>({
        projectName: '',
        industry: '',
        size: '1-10',
        country: 'India',
        coords: { lat: 20.5937, lng: 78.9629 }, // Default India center
        email: '', // CRITICAL: Email field for authentication
        adminRole: '', // NEW: Identification of administrative capacity
        goals: '',
        risks: [''],
        timeline: { start: '', end: '', type: 'whole' },
        structure: 'single',
        aiMode: 'assist',
        unifiedTeamName: 'CORE TEAM',
        squads: [],
        invites: [],
        tools: { projects: true, tasks: true, analytics: false, billing: false },
    });
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');



    const updateField = (field: keyof EliteProjectRegistrationData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateTool = (tool: keyof typeof formData.tools) => {
        setFormData(prev => ({
            ...prev,
            tools: { ...prev.tools, [tool]: !prev.tools[tool] }
        }));
    };


    // Global Dashboard Logic - Derived State for Readiness and Validation
    const getSquadInvites = (squadName: string) => formData.invites.filter(i => i.squad === squadName);
    const totalInvites = formData.invites.length;
    const totalSkills = formData.invites.reduce((acc, inv) => acc + inv.skills.length, 0);
    const squadStats = formData.squads.length > 0 ? formData.squads.map(s => getSquadInvites(s.name).length) : [totalInvites];
    const isStrongTeam = formData.squads.length > 0 ? squadStats.every(count => count >= 5) : totalInvites >= 5;
    const anySquadUnderstaffed = squadStats.some(count => count < 5);
    const anySquadEmpty = squadStats.some(count => count === 0);
    const allInvitesHaveValidEmail = formData.invites.every(inv => isValidProfessionalEmail(inv.email));
    const allInvitesHaveSkills = formData.invites.every(inv => inv.skills.length > 0);
    const allInvitesHaveRoles = formData.invites.every(inv => !!inv.role?.trim());

    // Uniqueness Checks (Squad-Scoped: Specialists must be unique within their team, but can exist across teams)
    const squadsInInvites = Array.from(new Set(formData.invites.map(i => i.squad)));
    const hasDuplicateEmail = squadsInInvites.some(sqName => {
        const emailsInSquad = formData.invites
            .filter(i => i.squad === sqName && i.email.length > 0)
            .map(i => i.email.toLowerCase().trim());
        return new Set(emailsInSquad).size !== emailsInSquad.length;
    });

    const allInvitesComplete = allInvitesHaveValidEmail && allInvitesHaveSkills && allInvitesHaveRoles && !hasDuplicateEmail;

    // Readiness depends on both member count AND data quality (emails/skills/goals)
    const baseReadiness = formData.squads.length > 0
        ? (squadStats.reduce((sum, count) => sum + Math.min(100, (count / 5) * 100), 0) / formData.squads.length)
        : Math.min(100, (totalInvites / 5) * 100);

    // HEAVY PENALTY: Readiness is capped at 30% if core validation (emails/skills) fails
    const isDataValid = allInvitesComplete && !!formData.timeline.start && !!formData.timeline.end;
    const readiness = isDataValid ? Math.round(baseReadiness) : Math.min(30, Math.round(baseReadiness * 0.3));

    const statusColor = isScanning ? "emerald" : (isStrongTeam && allInvitesComplete ? "emerald" : (anySquadEmpty || !allInvitesComplete ? "red" : "amber"));
    const distinctSkills = Array.from(new Set(formData.invites.flatMap(i => i.skills)));

    const totalSteps = 4;
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const isStepValid = () => {
        switch (step) {
            case 1: // Identity
                return !!formData.projectName?.trim() &&
                    formData.projectName.trim().length >= 3 &&
                    !isFakeData(formData.projectName) &&
                    !!formData.industry &&
                    !!formData.size;
            case 2: // Goals
                return !!formData.goals?.trim() &&
                    formData.goals.trim().length >= 10 &&
                    !!formData.timeline.start &&
                    !!formData.timeline.end &&
                    new Date(formData.timeline.end) >= new Date(formData.timeline.start);
            case 3: // Tools & Env
                return true;
            case 4: // Auth (Skip or Validate)
                // If user is already logged in, we only need to validate password if they want to change it
                // but for this flow, if apiClient.getUser() exists, we can allow proceed
                if (apiClient.getUser()) {
                    return !!formData.adminRole?.trim();
                }
                return (
                    isValidProfessionalEmail(formData.email) &&
                    !!formData.adminRole?.trim() &&
                    !!password &&
                    isPasswordStrong(password) &&
                    password === confirmPassword
                );
            default:
                return false;
        }
    };

    const nextStep = () => {
        if (isStepValid()) {
            setStep(s => Math.min(s + 1, totalSteps));
        }
    };

    const handleSubmit = async () => {
        const email = formData.email?.toLowerCase().trim();

        if (!email || !password) {
            toast.error("Authentication Required", {
                description: "Please enter your email and password to proceed.",
                icon: <AlertTriangle className="w-4 h-4" />
            });
            return;
        }

        setIsLoading(true);
        try {
            console.log("Initiating Project Workspace Setup...");
            setActiveLogIndex(0); // Initializing Genesis Engine

            // 1. Try to login first (user might already exist)
            let authToken: string;
            let currentUser: any;
            let userOrgId: string;

            try {
                console.log("Attempting authentication...");
                setActiveLogIndex(1); // Establishing Secure Uplink

                const existingUser = apiClient.getUser();
                if (existingUser && existingUser.email === email) {
                    // Already logged in as the correct user
                    currentUser = existingUser;
                    userOrgId = orgIdFromUrl || currentUser.orgId;
                    console.log(`✓ Using existing session for ${currentUser.name}`);
                } else {
                    const loginRes = await apiClient.login({ email, password });
                    authToken = loginRes.token;
                    currentUser = loginRes.user;
                    apiClient.setToken(authToken);
                    apiClient.setUser(currentUser);
                    userOrgId = orgIdFromUrl || currentUser.orgId;
                }

                if (!userOrgId) {
                    throw new Error("MISSING_ORG: User exists but has no organization context.");
                }

            } catch (loginError: any) {
                // User doesn't exist - register them
                console.log("User not found. Creating new account...");
                setActiveLogIndex(1);

                try {
                    const registerRes = await apiClient.register({
                        name: formData.projectName + " Lead",
                        email,
                        password
                    });

                    authToken = registerRes.token;
                    currentUser = registerRes.user;

                    // New users get a personal organization created automatically by backend
                    if (!currentUser.orgId) {
                        throw new Error("REGISTRATION_ERROR: Registration succeeded but organization was not created. Please try again.");
                    }
                    userOrgId = currentUser.orgId;
                    console.log(`✓ New user registered: ${currentUser.name}`);
                } catch (registerError: any) {
                    // If registration also fails, it might be because user exists with wrong password
                    if (registerError.message?.includes('already registered')) {
                        throw new Error("INVALID_CREDENTIALS: This email is already registered. Please check your password.");
                    }
                    throw registerError;
                }
            }

            // Set authentication if newly registered or logged in
            if (authToken) {
                apiClient.setToken(authToken);
            }
            apiClient.setUser(currentUser);

            setActiveLogIndex(2); // Mapping Neural Pathways
            await new Promise(r => setTimeout(r, 400));
            setActiveLogIndex(3); // Provisioning Environment

            // 2. Create Workspace under user's organization
            console.log("Creating Project Workspace...");
            setActiveLogIndex(4); // Deploying Squad Topologies

            const workspaceRes = await apiClient.createWorkspace({
                name: formData.projectName,
                description: formData.goals || "Project Workspace",
                orgId: userOrgId,
                companyProfile: {
                    industry: formData.industry,
                    size: formData.size,
                    adminName: currentUser.name,
                    adminEmail: email,
                    adminRole: formData.adminRole, // NEW: Pass the collected role
                    goals: formData.goals,
                    risks: formData.risks,
                    timeline: formData.timeline,
                    structure: formData.structure,
                    aiMode: formData.aiMode,
                    squads: formData.squads,
                    tools: formData.tools,
                }
            });

            setActiveLogIndex(5); // Finalizing Environment
            await new Promise(r => setTimeout(r, 600));

            toast.success(`Project workspace "${formData.projectName}" initialized`, {
                className: "bg-card border-primary text-foreground font-mono text-[10px] tracking-tight py-4",
                duration: 5000
            });

            await new Promise(resolve => setTimeout(resolve, 800));

            // Navigate back to the caller or default app
            navigate(returnTo);

        } catch (error: any) {
            console.error("Workspace initialization error:", error);

            // Parse error message for specific handling
            const errorMsg = error.message || "";

            if (errorMsg.includes("INVALID_CREDENTIALS")) {
                toast.error("Invalid Credentials", {
                    description: "This email is already registered. Please check your password or use a different email.",
                    icon: <AlertCircle className="w-4 h-4" />
                });
            } else if (errorMsg.includes("MISSING_ORG")) {
                toast.error("Organization Error", {
                    description: "Your account is missing an organization. Please contact support.",
                    icon: <AlertCircle className="w-4 h-4" />
                });
            } else if (errorMsg.includes("REGISTRATION_ERROR")) {
                toast.error("Registration Failed", {
                    description: "Could not create your account. Please try again or contact support.",
                    icon: <AlertCircle className="w-4 h-4" />
                });
            } else if (errorMsg.includes("Name, description, and Organization ID are required")) {
                toast.error("Workspace Creation Failed", {
                    description: "Missing required information. Please ensure all fields are filled correctly.",
                    icon: <AlertCircle className="w-4 h-4" />
                });
            } else if (errorMsg.toLowerCase().includes("network") || errorMsg.toLowerCase().includes("fetch")) {
                toast.error("Connection Error", {
                    description: "Unable to connect to server. Please check your internet connection and try again.",
                    icon: <AlertCircle className="w-4 h-4" />
                });
            } else {
                toast.error("Initialization Failed", {
                    description: errorMsg || "An unexpected error occurred. Please try again.",
                    icon: <AlertCircle className="w-4 h-4" />
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const InputLabel = ({ children, className }: { children: React.ReactNode, className?: string }) => (
        <Label className={cn("text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block", className)}>{children}</Label>
    );

    // --- STEPS ---

    const renderStepIdentity = () => (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="space-y-2">
                <h2 className="text-3xl font-black text-foreground tracking-tighter">System Designation</h2>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Map foundational project parameters</p>
                </div>
            </div>

            <div className="space-y-8">
                <div>
                    <div className="flex justify-between items-center px-1 mb-2">
                        <InputLabel className="text-primary/70 mb-0">Project Designation</InputLabel>
                        {!formData.projectName && <Badge className="bg-primary/10 text-primary border-primary/20 text-[7px] font-black px-1.5 py-0 rounded-sm">REQUIRED</Badge>}
                    </div>
                    <div className="relative group/designation">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/designation:text-primary transition-colors">
                            <Laptop className="w-5 h-5" />
                        </div>
                        <Input
                            value={formData.projectName}
                            onChange={e => updateField('projectName', e.target.value)}
                            placeholder="CORTEXA"
                            className="h-16 pl-14 text-xl bg-muted/20 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-foreground transition-all rounded-2xl font-black tracking-tight shadow-inner"
                            autoFocus
                        />
                    </div>
                </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="flex justify-between items-center px-1 mb-2">
                        <InputLabel className="mb-0">Domain Vertical</InputLabel>
                        {!formData.industry && <Badge className="bg-primary/10 text-primary border-primary/20 text-[7px] font-black px-1.5 py-0 rounded-sm">REQUIRED</Badge>}
                    </div>
                    {!showCategoryInput ? (
                        <div className="relative group/select">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-muted-foreground pointer-events-none">
                                <Target className="w-5 h-5" />
                            </div>
                            <Select
                                value={formData.industry}
                                onValueChange={(v) => {
                                    if (v === 'add-new') {
                                        setShowCategoryInput(true);
                                    } else {
                                        updateField('industry', v);
                                    }
                                }}
                            >
                                <SelectTrigger className="h-14 pl-12 bg-muted border-border rounded-xl text-foreground shadow-sm hover:bg-muted/80 transition-all text-sm font-bold focus:border-primary">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border rounded-xl shadow-2xl text-foreground">
                                    {projectCategories.map(i => (
                                        <SelectItem key={i} value={i} className="focus:bg-muted focus:text-foreground transition-all cursor-pointer">
                                            {i}
                                        </SelectItem>
                                    ))}
                                    <div className="h-[1px] bg-border my-1 mx-2" />
                                    <SelectItem value="add-new" className="font-bold text-primary bg-primary/10 rounded-lg flex items-center gap-2 cursor-pointer">
                                        Build New +
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {/* In-line delete for custom categories */}
                            {formData.industry && !PROJECT_TYPES_DEFAULT.includes(formData.industry) && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteCustomCategory(formData.industry); }}
                                    className="absolute right-10 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-red-400 hover:bg-muted rounded-lg transition-all opacity-0 group-hover/select:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                            <Input
                                value={customCategoryInput}
                                onChange={(e) => setCustomCategoryInput(e.target.value)}
                                placeholder="Core domain..."
                                className="h-14 rounded-xl border-primary/50 focus:border-primary bg-muted shadow-xl px-6 text-foreground"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') addCustomCategory();
                                    if (e.key === 'Escape') setShowCategoryInput(false);
                                }}
                            />
                            <Button onClick={addCustomCategory} size="icon" className="h-14 w-14 shrink-0 rounded-xl bg-primary hover:bg-primary/90"><CheckCircle2 className="w-5 h-5" /></Button>
                            <Button variant="ghost" onClick={() => setShowCategoryInput(false)} size="icon" className="h-14 w-14 shrink-0 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"><Plus className="w-5 h-5 rotate-45" /></Button>
                        </div>
                    )}
                </div>
                <div>
                    <div className="flex justify-between items-center px-1 mb-2">
                        <InputLabel className="mb-0">Resource Estimate</InputLabel>
                        {!formData.size && <Badge className="bg-primary/10 text-primary border-primary/20 text-[7px] font-black px-1.5 py-0 rounded-sm">REQUIRED</Badge>}
                    </div>
                    <Select value={formData.size} onValueChange={v => updateField('size', v)}>
                        <SelectTrigger className="h-14 bg-muted border-border rounded-xl text-foreground shadow-sm hover:bg-muted/80 transition-all text-sm font-bold focus:border-primary">
                            <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border rounded-2xl text-foreground">
                            {['1-10', '11-50', '51-200', '200+'].map(s => <SelectItem key={s} value={s} className="focus:bg-muted cursor-pointer">{s} Specialists</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>


        </div>
    );

    const renderStepGoals = () => (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Timeline Status HUD */}
            {(!formData.timeline.start || !formData.timeline.end || (new Date(formData.timeline.end) < new Date(formData.timeline.start))) && (
                <div className={cn(
                    "p-4 rounded-[2rem] border backdrop-blur-md animate-in slide-in-from-top-4 duration-700 flex items-center justify-between px-8",
                    (!formData.timeline.start || !formData.timeline.end) ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                )}>
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "p-2 rounded-xl",
                            (!formData.timeline.start || !formData.timeline.end) ? "bg-amber-500/20" : "bg-red-500/20"
                        )}>
                            {(!formData.timeline.start || !formData.timeline.end) ? <CalendarDays className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        </div>
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-widest">Temporal Protocol</h4>
                            <p className="text-[10px] font-bold opacity-70 uppercase tracking-tighter mt-0.5">
                                {(!formData.timeline.start || !formData.timeline.end)
                                    ? "Strategic timeline mapping required for system synchronization."
                                    : "Time Inversion detected. Please rectify operational end date."}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <div className="space-y-2">
                <h2 className="text-3xl font-black text-foreground tracking-tighter">Strategic Alignment</h2>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Define objective-centric project vectors</p>
                </div>
            </div>
            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1 ml-1 px-1">
                        <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            <InputLabel className="mb-0">Core Objective</InputLabel>
                        </div>
                        {!formData.goals && <Badge className="bg-primary/10 text-primary border-primary/20 text-[7px] font-black px-1.5 py-0 rounded-sm">REQUIRED</Badge>}
                    </div>
                    <Textarea
                        value={formData.goals}
                        onChange={e => updateField('goals', e.target.value)}
                        placeholder="What is the primary success metric? (e.g. Launch MVP by Q3...)"
                        className="min-h-[120px] bg-muted border-border rounded-2xl resize-none focus:border-primary p-6 text-foreground font-medium text-base shadow-sm placeholder:text-muted-foreground"
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 ml-1">
                        <CalendarDays className="w-5 h-5 text-primary" />
                        <InputLabel className="mb-0">Timeline Architecture</InputLabel>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 slice-in-from-left duration-500">
                            <div className="flex justify-between items-center px-1 mb-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-[9px]">Launch Start</Label>
                                {!formData.timeline.start && <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[7px] font-black px-1.5 py-0 rounded-sm">REQUIRED</Badge>}
                            </div>
                            <Input
                                type="date"
                                value={formData.timeline.start}
                                onChange={e => setFormData(p => ({ ...p, timeline: { ...p.timeline, start: e.target.value } }))}
                                className={cn(
                                    "h-14 bg-muted border-border rounded-xl focus:border-primary px-6 font-medium text-foreground color-scheme-dark transition-all shadow-inner",
                                    step === 2 && !formData.timeline.start && "border-amber-500/30 bg-amber-500/5 focus:border-amber-500"
                                )}
                            />
                        </div>
                        <div className="space-y-1.5 slice-in-from-right duration-500">
                            <div className="flex justify-between items-center px-1 mb-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-[9px]">Target End Date</Label>
                                {!formData.timeline.end && <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[7px] font-black px-1.5 py-0 rounded-sm">REQUIRED</Badge>}
                            </div>
                            <Input
                                type="date"
                                value={formData.timeline.end}
                                onChange={e => setFormData(p => ({ ...p, timeline: { ...p.timeline, end: e.target.value } }))}
                                className={cn(
                                    "h-14 bg-muted border-border rounded-xl focus:border-primary px-6 font-medium text-foreground color-scheme-dark transition-all shadow-inner",
                                    step === 2 && !formData.timeline.end && "border-amber-500/30 bg-amber-500/5 focus:border-amber-500"
                                )}
                            />
                        </div>
                    </div>
                    {step === 2 && formData.timeline.start && formData.timeline.end && new Date(formData.timeline.end) >= new Date(formData.timeline.start) && (
                        <div className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-500">
                            <div className="flex items-center gap-3">
                                <CalendarDays className="w-4 h-4 text-emerald-500" />
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Architecture Duration</span>
                            </div>
                            <span className="text-xs font-black text-foreground">
                                {(() => {
                                    const diff = new Date(formData.timeline.end).getTime() - new Date(formData.timeline.start).getTime();
                                    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                    const months = Math.round(days / 30);
                                    return months <= 1 ? `${days} DAYS` : `~ ${months} MONTHS`;
                                })()}
                            </span>
                        </div>
                    )}

                    {step === 2 && (!formData.timeline.start || !formData.timeline.end) ? (
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] ml-1 mt-2 animate-pulse flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" /> Professional timeline mapping required
                        </p>
                    ) : (step === 2 && new Date(formData.timeline.end) < new Date(formData.timeline.start)) && (
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] ml-1 mt-2 animate-bounce flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3" /> Time Inversion: End date must be after start date
                        </p>
                    )}

                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 ml-1">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            <InputLabel className="mb-0">Identify Risks</InputLabel>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateField('risks', [...formData.risks, ''])}
                            className="text-primary hover:bg-muted h-8 px-3 rounded-full font-bold text-xs transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Add Risk
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {formData.risks.map((risk, idx) => (
                            <div key={idx} className="flex gap-2 group">
                                <Input
                                    value={risk}
                                    onChange={e => {
                                        const newRisks = [...formData.risks];
                                        newRisks[idx] = e.target.value;
                                        updateField('risks', newRisks);
                                    }}
                                    placeholder="e.g. Budget constraints, technical debt..."
                                    className="h-14 bg-muted border-border rounded-xl focus:border-primary px-6 font-medium text-foreground placeholder:text-muted-foreground"
                                />
                                {formData.risks.length > 1 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => updateField('risks', formData.risks.filter((_, i) => i !== idx))}
                                        className="h-14 w-14 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-muted"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStepStructure = () => (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="space-y-2">
                <div className="flex justify-between items-center pr-4">
                    <h2 className="text-3xl font-black text-foreground tracking-tighter">Squad Topology</h2>
                    {!formData.structure && <Badge className="bg-primary/10 text-primary border-primary/20 text-[7px] font-black px-2 py-0.5 rounded-sm">REQUIRED</Badge>}
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Map foundational team architecture</p>
                </div>
            </div>
            {/* Structure Selection */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 ml-1">
                    <LayoutGrid className="w-5 h-5 text-primary" />
                    <InputLabel className="mb-0">Team Architecture</InputLabel>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <div
                        className={cn(
                            "flex-1 h-14 flex items-center justify-center rounded-xl border cursor-pointer transition-all font-bold text-sm select-none",
                            formData.structure === 'single'
                                ? "bg-primary/10 border-primary text-primary shadow-sm"
                                : "bg-muted border-border text-muted-foreground hover:border-primary/20 hover:bg-muted/80"
                        )}
                        onClick={() => updateField('structure', 'single')}
                    >
                        Unified Matrix
                    </div>
                    <div
                        className={cn(
                            "flex-1 h-14 flex items-center justify-center rounded-xl border cursor-pointer transition-all font-bold text-sm select-none",
                            formData.structure === 'multi'
                                ? "bg-primary/10 border-primary text-primary shadow-sm"
                                : "bg-muted border-border text-muted-foreground hover:border-primary/20 hover:bg-muted/80"
                        )}
                        onClick={() => updateField('structure', 'multi')}
                    >
                        Squad-Based Segments
                    </div>
                </div>

                {formData.structure === 'single' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-500 mt-2 px-1">
                        <div className="relative group/teamname">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary/20 group-focus-within/teamname:bg-primary transition-colors rounded-full" />
                            <Input
                                value={formData.unifiedTeamName}
                                onChange={(e) => updateField('unifiedTeamName', e.target.value)}
                                placeholder="e.g. Core Team"
                                className="h-14 pl-10 bg-black/20 border-border/50 rounded-xl focus:border-primary/50 font-bold text-sm tracking-tight"
                            />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2 ml-1 opacity-60">Identity designation for unified team matrix</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Squad Definition (Conditional) */}
            {formData.structure === 'multi' && (
                <div className="space-y-4 bg-muted/50 p-6 rounded-[2rem] border border-border animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-2">
                        <InputLabel className="mb-0">Define Specialist Squads</InputLabel>
                        <Button variant="ghost" size="sm" onClick={() => updateField('squads', [...formData.squads, { name: '', targetDate: '' }])} className="text-primary hover:bg-muted rounded-full font-bold text-xs transition-colors">
                            <Plus className="w-4 h-4 mr-1" /> Add Squad
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {formData.squads.map((squad, idx) => (
                            <div key={idx} className="flex gap-2">
                                <Input
                                    value={squad.name}
                                    onChange={(e) => {
                                        const newSquads = [...formData.squads];
                                        newSquads[idx].name = e.target.value;
                                        updateField('squads', newSquads);
                                    }}
                                    placeholder={`e.g. Frontend Core`}
                                    className="flex-1 h-14 bg-muted border-border rounded-xl focus:border-primary px-6 font-medium text-foreground placeholder:text-muted-foreground"
                                />
                                {formData.timeline.type === 'separated' && (
                                    <Input
                                        type="date"
                                        value={squad.targetDate}
                                        onChange={(e) => {
                                            const newSquads = [...formData.squads];
                                            newSquads[idx].targetDate = e.target.value;
                                            updateField('squads', newSquads);
                                        }}
                                        className="w-40 h-14 bg-muted border-border rounded-xl focus:border-primary px-4 font-medium text-foreground color-scheme-dark"
                                    />
                                )}
                                {formData.squads.length > 1 && (
                                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-muted" onClick={() => updateField('squads', formData.squads.filter((_, i) => i !== idx))}>
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Mode */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 ml-1">
                    <Bot className="w-5 h-5 text-primary" />
                    <InputLabel className="mb-0">AI Operating Model</InputLabel>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { id: 'assist', label: 'Assist', icon: Sparkles, desc: 'AI suggests' },
                        { id: 'semi', label: 'Semi-Auto', icon: BrainCircuit, desc: 'AI plans' },
                        { id: 'auto', label: 'Full Auto', icon: Rocket, desc: 'AI executes' },
                    ].map((mode) => (
                        <div
                            key={mode.id}
                            className={cn(
                                "border rounded-[1.5rem] p-4 cursor-pointer transition-all text-center group shadow-sm flex flex-col items-center justify-center h-32",
                                formData.aiMode === mode.id ? "bg-primary/10 border-primary text-primary shadow-xl shadow-primary/20 scale-105" : "bg-muted border-border text-muted-foreground hover:border-primary/20 hover:bg-muted/80"
                            )}
                            onClick={() => updateField('aiMode', mode.id as AiMode)}
                        >
                            <mode.icon className={cn("w-6 h-6 mb-3 transition-colors", formData.aiMode === mode.id ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                            <div className={cn("font-black text-sm uppercase tracking-tight", formData.aiMode === mode.id ? "text-primary-foreground" : "text-foreground")}>{mode.label}</div>
                            <div className={cn("text-[9px] uppercase tracking-widest mt-1 opacity-60 font-bold", formData.aiMode === mode.id ? "text-primary-foreground" : "text-muted-foreground")}>{mode.desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStepTeams = () => {
        // Helper to get invites for a specific squad
        const getSquadInvites = (squadName: string) => formData.invites.filter(i => i.squad === squadName);

        // Helper to add invite to a squad
        const addInviteToSquad = (squadName: string) => {
            updateField('invites', [
                ...formData.invites,
                { email: '', role: 'Editor', skills: [], squad: squadName }
            ]);
        };

        // Helper to update a specific invite
        const updateInvite = (index: number, field: keyof Invite, value: any) => {
            const newInvites = [...formData.invites];
            newInvites[index] = { ...newInvites[index], [field]: value };
            updateField('invites', newInvites);
        };

        // Helper to remove invite
        const removeInvite = (index: number) => {
            const newInvites = formData.invites.filter((_, i) => i !== index);
            updateField('invites', newInvites);
        };

        // All derived logic moved to main component scope for global accessibility


        return (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {/* Global Status Banner - TOP LEVEL ALERT */}
                {(!isStrongTeam || !allInvitesComplete) && !isScanning && (
                    <div className={cn(
                        "p-4 rounded-[2rem] border backdrop-blur-md animate-in slide-in-from-top-4 duration-700 flex items-center justify-between px-8",
                        anySquadEmpty || !allInvitesComplete ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                    )}>
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "p-2 rounded-xl",
                                anySquadEmpty || !allInvitesComplete ? "bg-red-500/20" : "bg-amber-500/20"
                            )}>
                                {anySquadEmpty || !allInvitesComplete ? <AlertCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest">Deployment Warning</h4>
                                <p className="text-[10px] font-bold opacity-70 uppercase tracking-tighter mt-0.5">
                                    {anySquadEmpty
                                        ? "One or more squads have zero units. Deployment cannot proceed."
                                        : !allInvitesComplete
                                            ? "All specialist units require complete data profiles (Email, Role, Skills)."
                                            : "All squads must reach the 5-unit professional minimum."}
                                </p>
                            </div>
                        </div>
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">Protocol</span>
                            <span className="text-[10px] font-black uppercase tracking-tighter">SEC_LVL_CRITICAL</span>
                        </div>
                    </div>
                )}

                {/* Visual Unit Board */}
                <div className="bg-black/30 border border-white/[0.05] rounded-[3rem] p-8 pt-10 relative overflow-hidden group/board shadow-2xl">
                    <div className="absolute top-4 right-8 flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">System Log</span>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">UNIT_DEPLOYMENT</span>
                        </div>
                    </div>

                    {isScanning && (
                        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-500">
                            <div className="relative">
                                <Activity className="w-12 h-12 text-primary animate-pulse" />
                                <div className="absolute inset-x-0 -bottom-8 flex justify-center">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-bounce">Scanning Units...</span>
                                </div>
                            </div>
                            <div className="mt-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-primary animate-shimmer bg-[length:200%_auto]" style={{ width: '100%' }} />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        {/* Card 1: Capacity */}
                        <div className="bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10 rounded-[2rem] p-6 hover:bg-blue-500/10 transition-all group/card1 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                                    <Users2 className="w-6 h-6" />
                                </div>
                                <div className="border border-blue-500/20 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest text-blue-400/80">
                                    CAPACITY
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Active Specialist Units</Label>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-white tracking-tighter">
                                        <Counter value={isScanning ? 0 : totalInvites} />
                                    </span>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Units</span>
                                </div>
                                <div className="w-12 h-1 bg-blue-500/20 rounded-full mt-4 overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${isScanning ? 0 : Math.min(100, totalInvites * 20)}%` }} />
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Logic Core */}
                        <div className={cn(
                            "bg-black/40 backdrop-blur-xl border rounded-[2.5rem] p-8 flex flex-col items-center justify-center relative group/logic overflow-hidden transition-all duration-700",
                            isStrongTeam && allInvitesComplete ? "border-primary/30 shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)]" : "border-white/[0.03] opacity-60"
                        )}>
                            <div className={cn(
                                "p-4 rounded-2xl mb-6 transition-all duration-700",
                                isStrongTeam && allInvitesComplete ? "bg-primary/20 text-primary scale-110 rotate-[360deg]" : "bg-muted text-muted-foreground/30"
                            )}>
                                <Cpu className="w-8 h-8" />
                            </div>
                            <div className="text-center space-y-1">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Competency</Label>
                                <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Logic Core</h4>
                            </div>
                            <div className="mt-8 text-center w-full px-4">
                                {isStrongTeam && allInvitesComplete ? (
                                    <div className="space-y-4 animate-in fade-in zoom-in duration-700">
                                        <div className="flex flex-wrap justify-center gap-1.5 max-h-20 overflow-hidden">
                                            {distinctSkills.slice(0, 6).map(skill => (
                                                <span key={skill} className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-md text-[7px] font-black text-primary uppercase tracking-tighter">
                                                    {skill}
                                                </span>
                                            ))}
                                            {distinctSkills.length > 6 && (
                                                <span className="px-2 py-0.5 bg-primary/5 border border-primary/10 rounded-md text-[7px] font-black text-muted-foreground uppercase">
                                                    +{distinctSkills.length - 6}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-2xl font-black text-primary tracking-tighter">SYNCED</div>
                                            <div className="text-[8px] font-bold text-emerald-400 uppercase tracking-[0.2em] mt-1">Protocol Active</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="text-4xl font-black text-muted-foreground/10 tracking-tighter italic select-none">PROTO...</div>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                                            {!isStrongTeam ? "Waiting for specialist data" :
                                                !allInvitesHaveValidEmail ? "Email verification required" :
                                                    hasDuplicateEmail ? "Duplicate Identities Detected" :
                                                        !allInvitesHaveRoles ? "Specialist roles required" :
                                                            "Competency mapping incomplete"}
                                        </p>
                                        <div className="flex justify-center gap-1.5 opacity-30">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Card 2: Health */}
                        <div className={cn(
                            "bg-gradient-to-br border rounded-[2rem] p-6 transition-all duration-700 group/card2 relative overflow-hidden",
                            statusColor === "emerald" ? "from-emerald-500/5 to-transparent border-emerald-500/10 hover:bg-emerald-500/10" :
                                statusColor === "amber" ? "from-amber-500/5 to-transparent border-amber-500/15 hover:bg-amber-500/10" :
                                    "from-red-500/5 to-transparent border-red-500/10"
                        )}>
                            <div className="flex justify-between items-start mb-6">
                                <div className={cn(
                                    "p-3 rounded-2xl transition-all duration-500",
                                    statusColor === "emerald" ? "bg-emerald-500/10 text-emerald-400" :
                                        statusColor === "amber" ? "bg-amber-500/10 text-amber-500" :
                                            "bg-red-500/10 text-red-400"
                                )}>
                                    {isStrongTeam && allInvitesComplete ? <Activity className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6 animate-pulse" />}
                                </div>
                                <div className={cn(
                                    "border rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all duration-500",
                                    statusColor === "emerald" ? "border-emerald-500/20 text-emerald-400/80" :
                                        statusColor === "amber" ? "border-amber-500/30 text-amber-500/80" :
                                            "border-red-500/30 text-red-500/80"
                                )}>
                                    UNIT HEALTH
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Readiness Index</Label>
                                    {(!isStrongTeam || !allInvitesComplete) && !isScanning ? (
                                        <div className={cn(
                                            "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter",
                                            statusColor === "amber" ? "bg-amber-500/20 text-amber-500" : "bg-red-500/20 text-red-500"
                                        )}>
                                            <AlertTriangle className="w-2.5 h-2.5 animate-pulse" /> UNDERSTAFFED
                                        </div>
                                    ) : isStrongTeam && allInvitesComplete && !isScanning && (
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter bg-emerald-500/20 text-emerald-400">
                                            <ShieldCheck className="w-2.5 h-2.5 animate-pulse" /> STRONG_SQUAD
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className={cn(
                                        "text-5xl font-black tracking-tighter transition-colors duration-500",
                                        statusColor === "emerald" ? "text-white" :
                                            statusColor === "amber" ? "text-amber-100" : "text-red-100"
                                    )}>
                                        <Counter value={isScanning ? 0 : readiness} suffix="%" />
                                    </span>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sync</span>
                                </div>
                                <div className="flex gap-1.5 mt-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={cn("flex-1 h-1.5 rounded-full transition-all duration-700",
                                            !isScanning && totalInvites >= i
                                                ? (statusColor === "emerald" ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]" :
                                                    statusColor === "amber" ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]" :
                                                        "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]")
                                                : "bg-white/5"
                                        )} style={{ transitionDelay: `${i * 150}ms` }} />
                                    ))}
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                    <p className={cn(
                                        "text-[9px] font-black uppercase tracking-[0.15em] transition-colors duration-500",
                                        statusColor === "emerald" ? "text-emerald-500/80" :
                                            statusColor === "amber" ? "text-amber-500/80" : "text-red-500/80"
                                    )}>
                                        {isScanning ? "BOOTING_LOGIC" :
                                            isStrongTeam && allInvitesComplete ? "SYSTEM_OPTIMIZED" :
                                                anySquadEmpty ? "SQUAD_DEPLOYMENT_CRITICAL" :
                                                    !allInvitesComplete ? "DATA_INTEGRITY_FAILED" : "RESOURCES_CRITICAL"}
                                    </p>
                                    {anySquadEmpty && !isScanning && (
                                        <div className="flex items-center gap-1.5 mt-2 text-[8px] font-black text-red-500 animate-pulse uppercase tracking-tighter">
                                            <AlertCircle className="w-3 h-3" /> EMPTY_SQUADS_DETECTED
                                        </div>
                                    )}
                                    {anySquadUnderstaffed && !anySquadEmpty && !isScanning && (
                                        <div className="flex items-center gap-1.5 mt-2 text-[8px] font-black text-amber-500 animate-pulse uppercase tracking-tighter">
                                            <AlertTriangle className="w-3 h-3" /> SQUAD_STRENGTH_LOW
                                        </div>
                                    )}
                                    {!allInvitesHaveValidEmail && !isScanning && (
                                        <div className="flex items-center gap-1.5 mt-2 text-[8px] font-black text-red-500 animate-pulse uppercase tracking-tighter">
                                            <Mail className="w-3 h-3" /> INVALID_UNIT_EMAILS
                                        </div>
                                    )}
                                    {!allInvitesHaveSkills && !isScanning && (
                                        <div className="flex items-center gap-1.5 mt-2 text-[8px] font-black text-red-500 animate-pulse uppercase tracking-tighter">
                                            <ShieldAlert className="w-3 h-3" /> SKILL_MAPPING_REQUIRED
                                        </div>
                                    )}
                                    {!isStrongTeam && !isScanning && (
                                        <span className="text-[8px] font-mono text-muted-foreground/40 animate-pulse flex mt-2">
                                            {isStrongTeam ? "PROTOCOL_NOMINAL" : "SYNC_REQUIRED"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="flex justify-between items-end mb-8 pt-4 border-t border-border/40">
                    <div className="space-y-3">
                        <h2 className="text-4xl font-black text-foreground tracking-tighter">Specialist Deployment</h2>
                        <div className="flex items-center gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)] animate-pulse" />
                            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.25em] opacity-70">Unit allocation by Squad topology</p>
                        </div>
                    </div>
                    {/* Structure Toggle */}
                    <div className="flex bg-muted/20 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => updateField('structure', 'single')}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                                formData.structure === 'single' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Unified Team
                        </button>
                        <button
                            onClick={() => {
                                updateField('structure', 'multi');
                                if (formData.squads.length === 0) {
                                    updateField('squads', [{ name: 'Alpha Squad' }, { name: 'Beta Squad' }]);
                                }
                            }}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                                formData.structure === 'multi' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Multi-Squad
                        </button>
                    </div>
                </div>

                {formData.structure === 'single' ? (
                    // Unified View
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <InputLabel className="mb-0">{formData.unifiedTeamName || 'CORE TEAM'}</InputLabel>
                            <Button variant="ghost" size="sm" onClick={() => addInviteToSquad(formData.unifiedTeamName || 'CORE TEAM')} className="text-primary hover:bg-muted rounded-full font-bold text-xs transition-colors">
                                <Plus className="w-4 h-4 mr-1" /> Add Specialist
                            </Button>
                        </div>
                        {formData.invites.map((invite, idx) => (
                            <InviteRow
                                key={idx}
                                invite={invite}
                                index={idx}
                                updateInvite={updateInvite}
                                removeInvite={removeInvite}
                                skillOptions={skillOptions}
                                roleOptions={roleOptions}
                                squadOptions={formData.squads.map(s => s.name)}
                                onAddCustomSkill={addCustomSkill}
                                onAddCustomRole={addCustomRole}
                                isDuplicate={invite.email.length > 0 && formData.invites.filter(i => i.squad === invite.squad && i.email.toLowerCase().trim() === invite.email.toLowerCase().trim()).length > 1}
                            />
                        ))}
                    </div>
                ) : (
                    // Squad View
                    <div className="space-y-8">
                        {formData.squads.map((squad, sIdx) => {
                            const squadInvites = getSquadInvites(squad.name);
                            const squadLength = squadInvites.length;
                            const isSquadStrong = squadLength >= 5;

                            return (
                                <div key={squad.name} className="space-y-4 bg-card/10 p-6 rounded-[2.5rem] border border-white/[0.03] hover:border-white/[0.08] transition-all relative group/squad">
                                    <div className="flex justify-between items-center border-b border-border/40 pb-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-3 group/title">
                                                <span className={cn(
                                                    "w-2.5 h-6 rounded-full transition-colors duration-500",
                                                    squadLength === 0 ? "bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" :
                                                        squadLength < 5 ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
                                                            "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                                )} />
                                                <Input
                                                    value={squad.name}
                                                    onChange={(e) => {
                                                        const newSquads = [...formData.squads];
                                                        // Update squad name reference in invites too if needed? 
                                                        // Ideally complex but for now just rename the view. 
                                                        // Actually need to update invites that point to this squad.
                                                        const oldName = newSquads[sIdx].name;
                                                        const newName = e.target.value;
                                                        newSquads[sIdx].name = newName;
                                                        updateField('squads', newSquads);

                                                        // Auto-migrate invites
                                                        const newInvites = formData.invites.map(inv =>
                                                            inv.squad === oldName ? { ...inv, squad: newName } : inv
                                                        );
                                                        updateField('invites', newInvites);
                                                    }}
                                                    className="bg-transparent border-transparent text-lg font-black text-foreground focus-visible:ring-0 p-0 h-auto w-auto min-w-[100px]"
                                                />
                                                <Button variant="ghost" size="icon" onClick={() => {
                                                    const newSquads = formData.squads.filter((_, i) => i !== sIdx);
                                                    updateField('squads', newSquads);
                                                    // Remove invites for this squad? Or move to unassigned?
                                                    // Let's remove for cleaner UX for now, as asked.
                                                    const newInvites = formData.invites.filter(inv => inv.squad !== squad.name);
                                                    updateField('invites', newInvites);
                                                }} className="opacity-0 group-hover/title:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 h-6 w-6">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                {squadLength === 0 ? (
                                                    <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                                                        <AlertTriangle className="w-2.5 h-2.5 mr-1" /> CRITICAL: NO_UNITS
                                                    </Badge>
                                                ) : squadLength < 5 ? (
                                                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                                                        UNDERSTAFFED: {5 - squadLength} MORE REQUIRED
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                                                        <ShieldCheck className="w-2.5 h-2.5 mr-1" /> SQUAD_READY
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => addInviteToSquad(squad.name)} className="text-primary hover:bg-muted rounded-full font-bold text-xs transition-colors border border-primary/20 hover:border-primary/50">
                                            <Plus className="w-4 h-4 mr-1" /> Deploy Unit
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {squadInvites.map((invite) => {
                                            const originalIndex = formData.invites.indexOf(invite);
                                            return (
                                                <InviteRow
                                                    key={originalIndex}
                                                    invite={invite}
                                                    index={originalIndex}
                                                    updateInvite={updateInvite}
                                                    removeInvite={removeInvite}
                                                    skillOptions={skillOptions}
                                                    roleOptions={roleOptions}
                                                    squadOptions={formData.squads.map(s => s.name)}
                                                    onAddCustomSkill={addCustomSkill}
                                                    onAddCustomRole={addCustomRole}
                                                    isDuplicate={invite.email.length > 0 && squadInvites.filter(i => i.email.toLowerCase().trim() === invite.email.toLowerCase().trim()).length > 1}
                                                />
                                            );
                                        })}
                                        {squadLength === 0 && (
                                            <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-3xl border border-dashed border-border/50 text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in zoom-in group/empty hover:bg-red-500/5 transition-all">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Users2 className="w-8 h-8 text-muted-foreground/20 group-hover/empty:text-red-400/30 transition-colors" />
                                                    <span>No specialists assigned to {squad.name} yet.</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Add Squad Button */}
                        <div onClick={() => {
                            const newSquadName = `Squad ${String.fromCharCode(65 + formData.squads.length)}`; // Squad A, B, C...
                            updateField('squads', [...formData.squads, { name: newSquadName }]);
                        }} className="rounded-[2.5rem] border border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 p-8 flex flex-col items-center justify-center cursor-pointer transition-all group min-h-[150px]">
                            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Plus className="w-6 h-6" />
                            </div>
                            <p className="font-bold text-sm text-foreground">Initialize New Squad Protocol</p>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-50">Configurable Unit Topology</p>
                        </div>
                    </div>
                )}
            </div >
        );
    };

    const renderStepEnvironment = () => (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="space-y-2">
                <h2 className="text-3xl font-black text-foreground tracking-tighter">Tooling Ecosystem</h2>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Select active operational infrastructure</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TOOLS.map((tool) => {
                    const isActive = formData.tools[tool.id as keyof typeof formData.tools];
                    return (
                        <div
                            key={tool.id}
                            className={cn(
                                "p-8 rounded-[2.5rem] border cursor-pointer transition-all duration-500 group relative overflow-hidden flex flex-col min-h-[220px]",
                                isActive
                                    ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20 shadow-[0_32px_64px_-16px_rgba(var(--primary-rgb),0.15)]"
                                    : "bg-muted/10 border-white/[0.05] hover:border-primary/30 hover:bg-muted/20 shadow-xl"
                            )}
                            onClick={() => updateTool(tool.id as any)}
                        >
                            {isActive && (
                                <div className="absolute top-4 right-6 p-2 animate-in fade-in zoom-in duration-500">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full border border-primary/20 shadow-sm backdrop-blur-md">
                                        <span className="flex h-1.5 w-1.5 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                                        </span>
                                        <span className="text-[9px] font-black text-primary uppercase tracking-widest font-mono">SYNCING</span>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start justify-between mb-6">
                                <div className={cn("p-4 rounded-2xl transition-all duration-700 shadow-xl",
                                    isActive
                                        ? "bg-primary text-primary-foreground scale-110 shadow-primary/30 border border-white/20"
                                        : "bg-muted/30 text-muted-foreground group-hover:bg-muted/50 border border-white/5 opacity-80"
                                )}>
                                    <tool.icon className={cn("w-7 h-7", isActive && "animate-pulse")} />
                                </div>
                            </div>
                            <h4 className={cn("text-xl font-black mb-1.5 transition-colors tracking-tight", isActive ? "text-primary" : "text-foreground")}>{tool.label}</h4>
                            <p className="text-[10px] text-muted-foreground leading-relaxed font-black uppercase tracking-[0.15em] opacity-40 mb-4">{tool.desc}</p>

                            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05] mt-auto">
                                <Activity className={cn("w-3.5 h-3.5 transition-colors", isActive ? "text-primary animate-pulse" : "text-muted-foreground/30")} />
                                <div className="h-1 flex-1 bg-muted/30 rounded-full overflow-hidden border border-white/5">
                                    <div className={cn("h-full transition-all duration-1500 ease-in-out bg-gradient-to-r from-primary to-blue-500 bg-[length:200%_auto] animate-shimmer shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]", isActive ? "w-full" : "w-0")} />
                                </div>
                                <ShieldCheck className={cn("w-3.5 h-3.5 transition-colors", isActive ? "text-emerald-400" : "text-muted-foreground/30")} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Live Infrastructure Feed */}
            <div className="bg-muted/30 border border-border/50 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Global Infrastructure Status</p>
                        <p className="text-xs font-bold text-foreground mt-1 tracking-tight">All Operations Nominal • High Performance Grid Active</p>
                    </div>
                </div>
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                            <Network className="w-3 h-3 text-muted-foreground" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground font-sans">
            {/* Background Texture - Reused */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none fixed"></div>
            <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />


            <div className="container mx-auto max-w-3xl px-6 py-12 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-16">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-2 h-10 px-4 rounded-xl transition-all font-bold text-xs uppercase tracking-widest" onClick={() => navigate('/welcome')}>
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                            <Rocket className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-xl tracking-tight leading-none">Cortexa Initializer</span>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">Project System Mapping v1.0</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-12 relative group/nav">
                    <div className="flex justify-between mb-4 px-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Deployment Step</span>
                            <span className="text-lg font-black text-primary leading-none">{step.toString().padStart(2, '0')}</span>
                            <span className="text-xs font-bold text-muted-foreground/50 tracking-widest">/ {totalSteps.toString().padStart(2, '0')}</span>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                            {ELITE_LOGS[Math.min(step - 1, ELITE_LOGS.length - 1)]}
                        </Badge>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-primary via-emerald-500 to-primary rounded-full transition-all duration-700 ease-out shadow-[0_0_16px_rgba(var(--primary-rgb),0.4)] animate-shimmer bg-[length:200%_auto]"
                            style={{ width: `${(step / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Step Content */}
                <div className="space-y-8">
                    {step === 1 && renderStepBasics()}
                    {step === 2 && renderStepGoals()}
                    {step === 3 && renderStepTeam()}
                    {step === 4 && renderStepTools()}
                    {step === 5 && renderStepAuth()}
                    {step === 6 && renderStepReview()}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-16 gap-4">
                    {step > 1 && (
                        <Button
                            variant="outline"
                            onClick={() => setStep(step - 1)}
                            className="h-14 px-8 rounded-2xl border-border/50 text-foreground hover:bg-muted/50 hover:border-primary/50 transition-all font-bold text-xs uppercase tracking-widest gap-2 shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" /> Previous
                        </Button>
                    )}
                    {step < totalSteps ? (
                        <Button
                            onClick={() => setStep(step + 1)}
                            disabled={!isStepValid()}
                            className="ml-auto h-14 px-10 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 disabled:shadow-none gap-2"
                        >
                            Continue <ArrowLeft className="w-4 h-4 rotate-180" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={!isStepValid() || isLoading}
                            className="ml-auto h-16 px-12 rounded-2xl bg-gradient-to-r from-primary via-emerald-500 to-primary bg-[length:200%_auto] animate-shimmer text-primary-foreground hover:shadow-2xl hover:shadow-primary/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:animate-none transition-all font-black text-sm uppercase tracking-[0.2em] gap-3 shadow-xl shadow-primary/30"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                    Initializing...
                                </>
                            ) : (
                                <>
                                    <Rocket className="w-5 h-5" /> Init Workspace
                                </>
                            )}
                        </Button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ProjectWorkspaceRegistration;
