import React from 'react';
import { Search, Plus, Hash, Lock, Users, Handshake, MessageSquare } from 'lucide-react';
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface Conversation {
    _id: string;
    name?: string;
    scope: 'GLOBAL_DM' | 'ORG_INTERNAL' | 'PROJECT_TEAM' | 'CROSS_ORG_PARTNER';
    type: 'DIRECT' | 'GROUP' | 'BROADCAST';
    participants: any[];
    lastMessageAt: string;
}

interface ConversationListProps {
    conversations: Conversation[];
    activeId: string | null;
    onSelect: (conv: Conversation) => void;
    onNewChat: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    activeId,
    onSelect,
    onNewChat
}) => {
    // Grouping Logic
    const groups = {
        internal: conversations.filter(c => c.scope === 'ORG_INTERNAL'),
        projects: conversations.filter(c => c.scope === 'PROJECT_TEAM'),
        partners: conversations.filter(c => c.scope === 'CROSS_ORG_PARTNER'),
        dms: conversations.filter(c => c.scope === 'GLOBAL_DM')
    };

    const getIcon = (conv: Conversation) => {
        if (conv.scope === 'CROSS_ORG_PARTNER') return <Handshake className="w-4 h-4" />;
        if (conv.scope === 'PROJECT_TEAM') return <Hash className="w-4 h-4" />;
        if (conv.type === 'DIRECT') return <MessageSquare className="w-4 h-4" />;
        return <Users className="w-4 h-4" />;
    };

    const getDisplayName = (conv: Conversation) => {
        if (conv.name) return conv.name;
        if (conv.type === 'DIRECT') {
            // Logic to find other participant name would go here
            return `DM: ${conv.participants.length} Members`;
        }
        return 'Untitled Chat';
    };

    return (
        <div className="w-full md:w-72 border-r border-border bg-card/50 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-border flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-lg">Messages</h2>
                    <Button size="icon" variant="ghost" onClick={onNewChat}>
                        <Plus className="w-5 h-5" />
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search messages..." className="pl-9 bg-secondary/50 border-0" />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-auto p-3 space-y-6">

                {groups.projects.length > 0 && (
                    <div className="space-y-1">
                        <h3 className="px-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Projects</h3>
                        {groups.projects.map(c => (
                            <ChatItem key={c._id} conv={c} active={activeId === c._id} onClick={() => onSelect(c)} icon={getIcon(c)} name={getDisplayName(c)} />
                        ))}
                    </div>
                )}

                {groups.internal.length > 0 && (
                    <div className="space-y-1">
                        <h3 className="px-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Organization</h3>
                        {groups.internal.map(c => (
                            <ChatItem key={c._id} conv={c} active={activeId === c._id} onClick={() => onSelect(c)} icon={getIcon(c)} name={getDisplayName(c)} />
                        ))}
                    </div>
                )}

                {groups.partners.length > 0 && (
                    <div className="space-y-1">
                        <h3 className="px-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Partner Bridges</h3>
                        {groups.partners.map(c => (
                            <ChatItem key={c._id} conv={c} active={activeId === c._id} onClick={() => onSelect(c)} icon={getIcon(c)} name={getDisplayName(c)} />
                        ))}
                    </div>
                )}

                <div className="space-y-1">
                    <h3 className="px-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Direct Messages</h3>
                    {groups.dms.map(c => (
                        <ChatItem key={c._id} conv={c} active={activeId === c._id} onClick={() => onSelect(c)} icon={getIcon(c)} name={getDisplayName(c)} />
                    ))}
                </div>

            </div>
        </div>
    );
};

const ChatItem = ({ conv, active, onClick, icon, name }: any) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            active ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        )}
    >
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", active ? "bg-white/20" : "bg-primary/10 text-primary")}>
            {icon}
        </div>
        <div className="flex-1 text-left truncate">
            {name}
        </div>
    </button>
);
