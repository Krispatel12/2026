import { useState, useEffect, useRef } from "react";
import { useApp } from "@/shared/contexts/AppContext";
import { apiClient } from "@/shared/lib/api";
import { socketClient } from "@/shared/lib/socket";
import {
    MessageSquare,
    Search,
    ChevronRight,
    Search as SearchIcon,
    Plus,
    X,
    Filter,
    Building2,
    Users,
    ShieldCheck,
    Globe,
    Send,
    AtSign,
    Smile,
    Paperclip,
    MoreHorizontal,
    PhoneCall,
    VideoIcon
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import "@/shared/components/chat/chat.css";

export default function OrganizationChat() {
    const { user } = useApp();
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeConversation, setActiveConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load Conversations
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setLoading(true);
                const res = await apiClient.getConversations();
                setConversations(res.conversations || []);
                if (res.conversations?.length > 0) {
                    setActiveConversation(res.conversations[0]);
                }
            } catch (err) {
                console.error("Failed to load enterprise conversations", err);
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, []);

    // Load Messages for Active Conversation
    useEffect(() => {
        if (!activeConversation?._id) return;

        const loadMessages = async () => {
            try {
                const res = await apiClient.getConversationMessages(activeConversation._id);
                setMessages(res.messages || []);
                socketClient.emit('join_room', `conversation:${activeConversation._id}`);
            } catch (err) {
                console.error("Failed to load conversation messages", err);
            }
        };

        loadMessages();

        const handleNewMessage = (data: any) => {
            if (data.conversationId === activeConversation._id) {
                setMessages(prev => [...prev, data.message]);
            }
        };

        socketClient.on('message:received', handleNewMessage);
        return () => {
            socketClient.off('message:received', handleNewMessage);
        };
    }, [activeConversation?._id]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !activeConversation) return;

        const content = message;
        setMessage("");

        try {
            await apiClient.sendMessage(activeConversation._id, content);
        } catch (err) {
            console.error("Failed to send enterprise message", err);
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-[#f8fafc] dark:bg-[#020617] overflow-hidden rounded-tl-[40px] border-t border-l border-slate-200 dark:border-white/5">
            {/* Sidebar */}
            <div className="w-[380px] border-r border-slate-200 dark:border-white/5 flex flex-col bg-white dark:bg-[#0a0a0f]/40 backdrop-blur-xl">
                <div className="p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Badge variant="outline" className="px-2 py-0 h-4 rounded-full border-2 border-violet-500/20 bg-violet-500/5 text-violet-600 dark:text-violet-400 font-black text-[9px] uppercase tracking-widest">
                                Grand Command
                            </Badge>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Dialogue</h1>
                        </div>
                        <Button size="icon" variant="ghost" className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <Plus className="w-5 h-5 text-violet-600" />
                        </Button>
                    </div>

                    <div className="relative group">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                        <Input
                            placeholder="Search nodes & personnel..."
                            className="pl-12 h-14 bg-slate-50 dark:bg-white/5 border-0 rounded-[20px] text-sm font-bold uppercase focus-visible:ring-2 focus-visible:ring-violet-500/50"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 space-y-6 pb-20">
                    <div className="space-y-2">
                        <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional Threads</h3>
                        <div className="space-y-1">
                            {conversations.map((conv) => (
                                <button
                                    key={conv._id}
                                    onClick={() => setActiveConversation(conv)}
                                    className={cn(
                                        "w-full flex items-center gap-4 p-4 rounded-[28px] transition-all duration-300",
                                        activeConversation?._id === conv._id
                                            ? "bg-white dark:bg-white/5 shadow-2xl shadow-violet-600/5 ring-1 ring-slate-200 dark:ring-white/10"
                                            : "hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                                    )}
                                >
                                    <div className="relative">
                                        <Avatar className="h-12 w-12 rounded-2xl border-2 border-slate-100 dark:border-white/10 shadow-lg">
                                            <AvatarFallback className="bg-violet-600/10 text-violet-600 font-black">
                                                {conv.name?.[0] || 'G'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#0a0a0f] rounded-full shadow-lg" />
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase truncate">{conv.name || "Personnel Link"}</h4>
                                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight italic">Secure Uplink Established</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#050510] relative">
                {activeConversation ? (
                    <>
                        <header className="h-24 bg-white dark:bg-[#0a0a0f]/40 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-10 relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-xl shadow-violet-600/30">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{activeConversation.name || "Grand Command Link"}</h2>
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                            <ShieldCheck className="w-3 h-3" /> P2P Encrypted
                                        </span>
                                        <span className="text-slate-300 dark:text-slate-700">•</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latency: 12ms</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl border-2 border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10">
                                    <PhoneCall className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl border-2 border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10">
                                    <VideoIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl border-2 border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10">
                                    <MoreHorizontal className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                </Button>
                            </div>
                        </header>

                        <ScrollArea className="flex-1 p-10 relative z-10">
                            <div className="max-w-4xl mx-auto space-y-10 pb-20">
                                {messages.map((msg, i) => {
                                    const isOwn = msg.senderId === user?._id || msg.sender?._id === user?._id;
                                    return (
                                        <div key={msg._id} className={cn("flex gap-6", isOwn ? "flex-row-reverse" : "flex-row")}>
                                            <Avatar className="h-12 w-12 rounded-2xl border-2 border-white dark:border-white/10 shadow-lg shrink-0">
                                                <AvatarFallback className="bg-slate-200 dark:bg-white/5 font-black text-sm uppercase">
                                                    {(msg.sender?.name || user?.name)?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className={cn("space-y-3 max-w-[70%]", isOwn ? "items-end text-right" : "items-start text-left")}>
                                                <div className="flex items-center gap-3 px-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{msg.sender?.name || user?.name}</span>
                                                    <span className="text-[9px] font-bold text-slate-300 dark:text-slate-700 tracking-tighter">
                                                        {new Date(msg.createdAt).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <div className={cn(
                                                    "p-6 rounded-[32px] text-sm font-medium leading-relaxed shadow-sm transition-all hover:shadow-xl",
                                                    isOwn
                                                        ? "bg-violet-600 text-white rounded-tr-none shadow-violet-600/20"
                                                        : "bg-white dark:bg-[#0a0a0f] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-tl-none"
                                                )}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        <div className="p-10 relative z-10">
                            <div className="max-w-4xl mx-auto">
                                <form onSubmit={handleSendMessage} className="relative bg-white dark:bg-[#0a0a0f] border-2 border-slate-200 dark:border-white/10 rounded-[32px] p-2 transition-all focus-within:border-violet-500/50 shadow-2xl">
                                    <div className="flex items-center px-4">
                                        <Button type="button" variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5">
                                            <Paperclip className="w-5 h-5" />
                                        </Button>
                                        <input
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Secure message..."
                                            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 text-sm h-16 px-4"
                                        />
                                        <div className="flex items-center gap-1">
                                            <Button type="button" variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5">
                                                <AtSign className="w-5 h-5" />
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={!message.trim()}
                                                className={cn(
                                                    "h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] ml-2 transition-all",
                                                    message.trim() ? "bg-violet-600 text-white shadow-xl shadow-violet-600/30" : "bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-slate-800"
                                                )}
                                            >
                                                Relay <Send className="ml-2 w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
                        <div className="w-24 h-24 rounded-[40px] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-2xl flex items-center justify-center rotate-6">
                            <Globe className="w-12 h-12 text-slate-200 dark:text-white/10" />
                        </div>
                        <div className="text-center space-y-3">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Enterprise Infrastructure</h3>
                            <p className="text-slate-500 font-medium max-w-xs px-8">Initialize a secure dialogue or bridge to orchestrate global operations.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
