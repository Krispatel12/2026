import { useState, useEffect, useRef } from "react";
import { useApp } from "@/shared/contexts/AppContext";
import { apiClient } from "@/shared/lib/api";
import { socketClient } from "@/shared/lib/socket";
import {
    MessageSquare,
    Search,
    Hash,
    MoreVertical,
    Phone,
    Video,
    Send,
    Paperclip,
    Smile,
    Zap,
    Lock,
    Cpu,
    Radio,
    Terminal,
    Shield,
    Activity,
    ChevronDown,
    Plus,
    Maximize2
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import "@/shared/components/chat/chat.css"; // We'll keep the shared css for animations but localize the component

export default function ProjectChat() {
    const { currentWorkspace, user } = useApp();
    const [activeChannel, setActiveChannel] = useState<any>(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    const [channels, setChannels] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Sync Environment
    useEffect(() => {
        if (!currentWorkspace?._id) return;

        const syncChat = async () => {
            try {
                setLoading(true);
                const [channelsRes, membersRes] = await Promise.all([
                    apiClient.getChannels(currentWorkspace._id),
                    apiClient.getWorkspaceMembers(currentWorkspace._id)
                ]);

                setChannels(channelsRes.channels);
                setMembers(membersRes.members);

                if (channelsRes.channels.length > 0) {
                    const general = channelsRes.channels.find((c: any) => c.slug === 'general');
                    setActiveChannel(general || channelsRes.channels[0]);
                }
            } catch (err) {
                console.error("Failed to sync project chat", err);
            } finally {
                setLoading(false);
            }
        };

        syncChat();
    }, [currentWorkspace?._id]);

    // Load Messages
    useEffect(() => {
        if (!currentWorkspace?._id || !activeChannel?._id) return;

        const loadMessages = async () => {
            try {
                const res = await apiClient.getMessages(currentWorkspace._id, activeChannel._id);
                setMessages(res.messages || []);
                socketClient.emit('join_room', `channel:${activeChannel._id}`);
            } catch (err) {
                console.error("Failed to load messages", err);
            }
        };

        loadMessages();

        const handleNewMessage = (data: any) => {
            if (data.channelId === activeChannel._id) {
                setMessages(prev => [...prev, data.message]);
            }
        };

        socketClient.on('message:received', handleNewMessage);
        return () => {
            socketClient.off('message:received', handleNewMessage);
        };
    }, [currentWorkspace?._id, activeChannel?._id]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !currentWorkspace || !activeChannel) return;

        const content = message;
        setMessage("");

        try {
            await apiClient.createMessage(currentWorkspace._id, activeChannel._id, { content });
        } catch (err) {
            console.error("Failed to send", err);
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-[#05050a] text-slate-300 overflow-hidden font-code">
            {/* --- CYBER SIDEBAR --- */}
            <div className="w-[320px] flex flex-col border-r border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl relative z-10">
                <div className="p-6 border-b border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1">Elite Navigator</span>
                            <h1 className="text-xl font-black text-white tracking-tight uppercase">Network</h1>
                        </div>
                        <Button variant="ghost" size="icon" className="h-9 w-9 bg-white/5 rounded-xl border border-white/5 hover:bg-white/1) transition-all">
                            <Search className="w-4 h-4 text-slate-400" />
                        </Button>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Radio className="w-3 h-3 text-indigo-500" /> Frequency
                            </span>
                            <span className="text-[9px] font-mono text-indigo-400">98.4 MHz</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 w-[65%] animate-shimmer bg-[length:200%_100%]" />
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-1 px-4 py-6">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="px-2 flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Project Nodes</h3>
                                <Plus className="w-3.5 h-3.5 text-slate-600 cursor-pointer hover:text-white transition-colors" />
                            </div>
                            <div className="space-y-1">
                                {channels.map(channel => (
                                    <button
                                        key={channel._id}
                                        onClick={() => setActiveChannel(channel)}
                                        className={cn(
                                            "w-full group relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300",
                                            activeChannel?._id === channel._id
                                                ? "bg-indigo-500/10 border border-indigo-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                                                : "hover:bg-white/[0.03] border border-transparent"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-1.5 rounded-lg transition-colors",
                                            activeChannel?._id === channel._id ? "bg-indigo-500 text-white" : "bg-white/5 text-slate-500"
                                        )}>
                                            <Hash className="w-4 h-4" />
                                        </div>
                                        <span className={cn("text-[13px] font-bold tracking-tight truncate", activeChannel?._id === channel._id ? "text-white" : "text-slate-400")}>
                                            {channel.displayName || channel.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="px-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Crew Terminals</h3>
                            <div className="space-y-1">
                                {members.map(member => (
                                    <div key={member._id} className="flex items-center gap-3 px-4 py-2.5 rounded-2xl hover:bg-white/[0.03] group transition-all cursor-default">
                                        <Avatar className="h-8 w-8 rounded-xl ring-1 ring-white/10">
                                            <AvatarFallback className="bg-white/5 text-[10px] font-bold">{member.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[13px] font-bold text-slate-300 truncate block">{member.name}</span>
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-white/5 bg-black/40">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                <Shield className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-white tracking-widest uppercase">Safe Mode</span>
                                <span className="text-[8px] font-mono text-indigo-400">Node_Connected</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN TERMINAL --- */}
            <div className="flex-1 flex flex-col bg-[#05050a] relative">
                <div className="absolute inset-0 bg-engineer-grid opacity-[0.03] pointer-events-none" />

                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md relative z-10">
                    <div className="flex items-center gap-4">
                        <Hash className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-lg font-black text-white uppercase tracking-tight">
                            {activeChannel?.displayName || activeChannel?.name || "Initializing..."}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 gap-2">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-mono text-emerald-400">14ms</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-white rounded-xl">
                            <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-white rounded-xl">
                            <Video className="w-4 h-4" />
                        </Button>
                    </div>
                </header>

                <ScrollArea className="flex-1 px-8 py-6 relative z-10">
                    <div className="space-y-8 max-w-5xl mx-auto pb-20">
                        {messages.map((msg, i) => {
                            const isOwn = msg.senderId === user?._id || msg.sender?._id === user?._id;
                            return (
                                <div key={msg._id} className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
                                    <div className={cn("flex items-center gap-3 mb-2", isOwn ? "flex-row-reverse" : "")}>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            {isOwn ? "Local" : (msg.sender?.name || "Unknown")}
                                        </span>
                                        <span className="text-[9px] font-mono text-slate-700">
                                            [{new Date(msg.createdAt).toLocaleTimeString([], { hour12: false })}]
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "max-w-[80%] rounded-[24px] px-6 py-4 transition-all",
                                        isOwn
                                            ? "bg-indigo-600 text-white rounded-tr-none border border-indigo-400/20 shadow-[0_4px_20px_rgba(99,102,241,0.2)]"
                                            : "bg-[#0f0f15] text-slate-200 border border-white/5 rounded-tl-none"
                                    )}>
                                        <p className="text-[14px] leading-relaxed font-medium">
                                            {msg.content}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                <div className="p-8 relative z-10">
                    <div className="max-w-5xl mx-auto">
                        <form onSubmit={handleSendMessage} className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-rose-500/20 rounded-[28px] blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-[#0a0a0f]/80 backdrop-blur-2xl border border-white/10 rounded-[28px] p-2">
                                <div className="flex items-center gap-1 px-4">
                                    <Button type="button" size="icon" variant="ghost" className="h-10 w-10 text-slate-500 hover:text-white">
                                        <Paperclip className="w-5 h-5" />
                                    </Button>
                                    <input
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Enter command..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-200 placeholder:text-slate-600 text-sm h-14"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={!message.trim()}
                                        className={cn(
                                            "h-11 w-11 rounded-2xl ml-2",
                                            message.trim() ? "bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]" : "bg-white/5 text-slate-700"
                                        )}
                                    >
                                        <Send className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
