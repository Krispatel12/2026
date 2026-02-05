import { useState, useEffect } from "react";
import { useApp } from "@/shared/contexts/AppContext";
import { apiClient } from "@/shared/lib/api";
import {
    MessageSquare,
    Users,
    Building2,
    Search,
    Hash,
    MoreVertical,
    Phone,
    Video,
    Send,
    Paperclip,
    Smile
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";

export default function OrgChat() {
    const { currentWorkspace, user } = useApp();
    const [activeChannel, setActiveChannel] = useState<{ type: 'dm' | 'group' | 'org', id: string, name: string }>({ type: 'org', id: 'general', name: 'General' });
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    const [channels, setChannels] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);

    // Professional: Auto-Provisioned Channel Sync
    useEffect(() => {
        if (!currentWorkspace?._id) return;

        const syncChatEnvironment = async () => {
            try {
                // 1. Fetch Topology
                const [channelsRes, membersRes] = await Promise.all([
                    apiClient.getChannels(currentWorkspace._id),
                    apiClient.getWorkspaceMembers(currentWorkspace._id)
                ]);

                // 2. Hydrate State
                setChannels(channelsRes.channels);
                setMembers(membersRes.members);

                // 3. Logic: Auto-Select Squad Channel
                // Identify if I'm in a specific squad channel (non-general)
                const mySquadChannel = channelsRes.channels.find((c: any) =>
                    c.memberIds?.includes(user?._id) &&
                    c.slug !== 'general' &&
                    !c.slug.includes(currentWorkspace.slug)
                );

                if (mySquadChannel) {
                    setActiveChannel({
                        type: 'group',
                        id: mySquadChannel._id,
                        name: mySquadChannel.displayName
                    });
                }

                // 4. Load Initial Messages for the selected channel
                const targetChannelId = mySquadChannel ? mySquadChannel._id : channelsRes.channels[0]?._id;
                if (targetChannelId) {
                    const msgs = await apiClient.getMessages(currentWorkspace._id, targetChannelId);
                    setMessages(msgs.messages || []);
                }

            } catch (err) {
                console.error("Failed to sync chat environment", err);
            }
        };

        syncChatEnvironment();
    }, [currentWorkspace?._id]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !currentWorkspace) return;

        const optimisticMsg = {
            id: Date.now(),
            sender: user?.name || "You",
            content: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: activeChannel.type
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setMessage("");

        // Persist
        try {
            if (activeChannel.type === 'group' || activeChannel.type === 'org') {
                await apiClient.createMessage(currentWorkspace._id, activeChannel.id, {
                    content: optimisticMsg.content
                });
            }
        } catch (err) {
            console.error("Failed to send", err);
        }
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden rounded-tl-[32px]">
            {/* Sidebar - Channels/Contacts */}
            <div className="w-80 bg-card/50 border-r border-border flex flex-col">
                <div className="p-4 border-b border-border">

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search people or groups..." className="pl-9 bg-muted/50" />
                    </div>
                </div>

                <ScrollArea className="flex-1 px-3 py-4">
                    {/* Organization Channels */}
                    <div className="mb-6">
                        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Organization</h3>
                        <button
                            onClick={() => setActiveChannel({ type: 'org', id: 'general', name: 'General' })}
                            className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group", activeChannel.id === 'general' ? "bg-primary/10 text-primary" : "hover:bg-muted")}
                        >
                            <div className="p-1.5 rounded-md bg-muted group-hover:bg-background transition-colors">
                                <Building2 className="w-4 h-4" />
                            </div>
                            <span className="font-medium">Entire Organization</span>
                        </button>
                    </div>

                    {/* Groups */}
                    <div className="mb-6">
                        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">My Teams</h3>
                        {channels.filter(c => c.slug !== 'general').map(group => (
                            <button
                                key={group._id}
                                onClick={() => setActiveChannel({ type: 'group', id: group._id, name: group.displayName })}
                                className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-1", activeChannel.id === group._id ? "bg-primary/10 text-primary" : "hover:bg-muted")}
                            >
                                <Hash className="w-4 h-4 opacity-50" />
                                <span className="font-medium truncate">{group.displayName}</span>
                            </button>
                        ))}
                    </div>

                    {/* Direct Messages */}
                    <div className="mb-6">
                        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Direct Messages</h3>
                        {members.filter(m => m.userId !== user?._id).map(member => (
                            <button
                                key={member._id}
                                onClick={() => setActiveChannel({ type: 'dm', id: member.userId, name: member.name || "Member" })}
                                className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-1", activeChannel.id === member.userId ? "bg-primary/10 text-primary" : "hover:bg-muted")}
                            >
                                <div className="relative">
                                    <Avatar className="h-7 w-7">
                                        <AvatarFallback>{(member.name || "?").charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className={cn("absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background",
                                        member.status === 'active' ? "bg-green-500" : "bg-gray-400"
                                    )} />
                                </div>
                                <div className="flex-1 text-left overflow-hidden">
                                    <span className="font-medium text-sm block truncate">{member.name || `User ${member.userId.substring(0, 4)}`}</span>
                                    <span className="text-xs text-muted-foreground truncate">{member.specialization || member.role}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-background/50">
                {/* Header */}
                <header className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0 bg-card/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        {activeChannel.type === 'org' ? <Building2 className="w-5 h-5 text-muted-foreground" /> :
                            activeChannel.type === 'group' ? <Hash className="w-5 h-5 text-muted-foreground" /> :
                                <div className="relative">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{activeChannel.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </div>
                        }
                        <div>
                            <h2 className="font-bold text-foreground">{activeChannel.name}</h2>
                            <p className="text-xs text-muted-foreground">
                                {activeChannel.type === 'org' ? "All 128 Members" :
                                    activeChannel.type === 'group' ? "8 Members" : "Active Now"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <Phone className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <Video className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <MoreVertical className="w-5 h-5" />
                        </Button>
                    </div>
                </header>

                {/* Messages */}
                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6">
                        {/* Date Separator */}
                        <div className="flex items-center justify-center my-6">
                            <Separator className="w-20" />
                            <span className="mx-4 text-xs text-muted-foreground font-medium">Today</span>
                            <Separator className="w-20" />
                        </div>

                        {messages.map((msg) => (
                            <div key={msg.id} className={cn("flex gap-4 max-w-3xl", msg.sender === 'You' ? "ml-auto flex-row-reverse" : "")}>
                                <Avatar className="h-8 w-8 mt-1">
                                    <AvatarFallback>{msg.sender.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className={cn("group flex flex-col", msg.sender === 'You' ? "items-end" : "items-start")}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-semibold">{msg.sender}</span>
                                        <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                                    </div>
                                    <div className={cn(
                                        "px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm",
                                        msg.sender === 'You'
                                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                                            : "bg-card border border-border rounded-tl-sm"
                                    )}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t border-border bg-card/30 backdrop-blur-sm">
                    <div className="relative flex items-center gap-2 bg-muted/50 p-2 rounded-xl border border-transparent focus-within:border-primary/50 transition-colors">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 rounded-lg">
                            <Paperclip className="w-5 h-5" />
                        </Button>
                        <form onSubmit={handleSendMessage} className="flex-1">
                            <input
                                className="w-full bg-transparent border-none focus:outline-none text-sm placeholder:text-muted-foreground p-1"
                                placeholder={`Message ${activeChannel.name}...`}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </form>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 rounded-lg">
                            <Smile className="w-5 h-5" />
                        </Button>
                        <Button
                            onClick={handleSendMessage}
                            size="icon"
                            className={cn("h-8 w-8 rounded-lg shrink-0 transition-all", message.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground pointer-events-none")}
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-muted-foreground">
                            Enter to send, Shift + Enter for new line
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
