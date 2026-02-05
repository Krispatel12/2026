import { useState, useEffect, useRef } from "react";
import {
    Sparkles,
    ChevronRight,
    Maximize2,
    Mic,
    Volume2,
    VolumeX,
    Zap,
    Bot,
    ArrowUpRight,
    Loader2,
    X
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { socketClient } from "@/shared/lib/socket";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/shared/contexts/AppContext";

interface AiDockProps {
    className?: string;
    collapsed?: boolean;
}

const AVATAR_URL = "/ai-avatar.png";

export const AiDock = ({ className, collapsed }: AiDockProps) => {
    const navigate = useNavigate();
    const { currentWorkspace } = useApp();
    const [query, setQuery] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamContent, setStreamContent] = useState("");
    const [showPreview, setShowPreview] = useState(true);

    // Mock streaming effect for internal dock state
    useEffect(() => {
        if (!isStreaming) return;

        // Simulate incoming tokens if standard socket not hooked up yet
        const words = "I'm analyzing the latest project updates. It seems we're on track for the Q4 release, but the authentication module needs review.".split(" ");
        let i = 0;
        setStreamContent("");

        const interval = setInterval(() => {
            if (i >= words.length) {
                clearInterval(interval);
                setIsStreaming(false);
                return;
            }
            setStreamContent(prev => prev + (i === 0 ? "" : " ") + words[i]);
            i++;
        }, 150);

        return () => clearInterval(interval);
    }, [isStreaming]);

    // Handle actual socket events
    useEffect(() => {
        const handleToken = (data: { token: string }) => {
            setIsStreaming(true);
            setShowPreview(true);
            setStreamContent(prev => prev + data.token);
        };

        socketClient.on('ai:stream:token', handleToken);

        return () => {
            socketClient.off('ai:stream:token', handleToken);
        };
    }, []);

    const handleAsk = () => {
        if (!query.trim()) return;

        // Switch to streaming state
        setIsStreaming(true);
        setStreamContent("");

        // Emit event if backend is ready
        if (socketClient.isConnected() && currentWorkspace) {
            socketClient.emit('ai:ask', {
                workspaceId: currentWorkspace._id,
                query
            });
        }

        setQuery("");
    };

    const handleOpenFull = () => {
        if (currentWorkspace) {
            navigate(`/app/ai/${currentWorkspace._id}`);
        } else {
            navigate('/app/chatbot');
        }
    };

    if (collapsed) {
        return (
            <div className={cn("px-2 py-4 flex flex-col items-center gap-3 border-t border-white/5", className)}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="relative w-10 h-10 rounded-full glass-premium flex items-center justify-center group hover:bg-primary/10 transition-all duration-300"
                        >
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 group-hover:opacity-100 opacity-50 transition-opacity" />
                            <img src={AVATAR_URL} className="w-6 h-6 object-cover rounded-full z-10" alt="AI" />
                            {isStreaming && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 flex">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                                </span>
                            )}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Ask Cortexa</TooltipContent>
                </Tooltip>
            </div>
        );
    }

    return (
        <div className={cn(
            "relative flex flex-col border-t border-white/5 bg-glass-premium backdrop-blur-2xl transition-all duration-500 overflow-hidden group/dock shadow-[0_-8px_32px_rgba(0,0,0,0.1)]",
            isExpanded ? "h-[360px]" : "h-[140px]",
            className
        )}>
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

            {/* Glassy Glow Top */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent opacity-80" />

            {/* Header */}
            <div className="px-5 pt-4 pb-2 flex items-center justify-between shrink-0 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 group-hover/dock:scale-105 transition-transform duration-500">
                        <img src={AVATAR_URL} className="w-full h-full rounded-full object-cover shadow-lg ring-1 ring-white/20" alt="Cortexa" />
                        {isStreaming && <div className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-pulse" />}
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#1a1b26] animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[13px] font-bold tracking-wide bg-gradient-to-r from-indigo-300 via-white to-indigo-100 bg-clip-text text-transparent">
                            Cortexa AI
                        </span>
                        <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider opacity-0 group-hover/dock:opacity-100 transition-opacity -mt-0.5">
                            Active
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover/dock:opacity-100 transition-opacity duration-300">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-white/10 text-muted-foreground/70 hover:text-white"
                        onClick={() => setIsMuted(!isMuted)}
                    >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-white/10 text-muted-foreground/70 hover:text-white"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? <X className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 px-5 relative flex flex-col min-h-0 z-10">
                {isStreaming || streamContent ? (
                    <div className="flex-1 overflow-hidden relative group/text mt-1">
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-indigo-500/50 to-transparent rounded-full" />
                        <p className="text-[13px] leading-relaxed text-indigo-100/90 font-light pl-3 subpixel-antialiased line-clamp-5 selection:bg-indigo-500/30">
                            {streamContent}
                            {isStreaming && <span className="inline-block w-1.5 h-3.5 ml-1 align-middle bg-indigo-400 animate-pulse rounded-[1px]" />}
                        </p>

                        {/* Expand overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0f111a]/80 to-transparent flex items-end justify-center pb-2 opacity-0 group-hover/text:opacity-100 transition-all duration-300">
                            <button
                                onClick={handleOpenFull}
                                className="text-[10px] bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-100 px-3 py-1.5 rounded-full backdrop-blur-md border border-indigo-500/30 flex items-center gap-1.5 transition-all hover:scale-105 hover:shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                            >
                                <Maximize2 className="w-3 h-3" />
                                Maximize
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-center opacity-40 group-hover/dock:opacity-60 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 animate-pulse-slow">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Awaiting Command</p>
                    </div>
                )}
            </div>

            {/* Input Area (Visible when expanded or space allows) */}
            <div className={cn(
                "p-3 mt-auto bg-black/20 backdrop-blur-xl border-t border-white/5 transition-all duration-500 relative z-20",
                !isExpanded && "border-transparent bg-transparent opacity-50 group-hover/dock:opacity-100"
            )}>
                <div className="relative group/input">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-xl opacity-0 group-hover/input:opacity-100 transition-opacity blur-md" />
                    <div className="relative flex items-center bg-[#0a0a0f]/60 border border-white/10 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-inner">
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                            placeholder="Type instructions..."
                            className="h-10 border-0 bg-transparent text-sm placeholder:text-muted-foreground/40 focus-visible:ring-0 px-3.5"
                        />
                        <button
                            onClick={handleAsk}
                            disabled={!query.trim()}
                            className="p-2.5 mr-1 text-indigo-400 hover:text-indigo-300 disabled:opacity-30 disabled:hover:text-indigo-400 transition-colors"
                        >
                            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                        </button>
                    </div>
                </div>

                {isExpanded && (
                    <div className="mt-2.5 flex items-center justify-between px-1.5 animate-fade-in">
                        <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-white/10 text-muted-foreground bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                                Project Context
                            </Badge>
                        </div>
                        <button onClick={handleOpenFull} className="text-[10px] text-indigo-400/80 hover:text-indigo-300 flex items-center gap-1 transition-colors group/link">
                            Open Chat <ChevronRight className="w-2.5 h-2.5 group-hover/link:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
