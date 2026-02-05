import React, { useRef, useEffect } from 'react';
import { Send, Paperclip, MoreVertical, Phone, Video, Info } from 'lucide-react';
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { format } from "date-fns";

interface Message {
    _id: string;
    senderId: string;
    content: string;
    createdAt: string;
    isOwn: boolean;
    senderName?: string;
}

interface ChatAreaProps {
    conversation: any;
    messages: Message[];
    onSendMessage: (text: string) => void;
    currentUserId: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
    conversation,
    messages,
    onSendMessage,
    currentUserId
}) => {
    const [inputText, setInputText] = React.useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        onSendMessage(inputText);
        setInputText("");
    };

    if (!conversation) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background/50 text-muted-foreground flex-col gap-4">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 opacity-50" />
                </div>
                <p>Select a conversation to start messaging</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-background/30 backdrop-blur-sm">
            {/* Header */}
            <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-card/30">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {conversation.name ? conversation.name[0] : '#'}
                    </div>
                    <div>
                        <h3 className="font-bold flex items-center gap-2">
                            {conversation.name || 'Conversation'}
                            {conversation.scope === 'CROSS_ORG_PARTNER' && (
                                <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-wider">
                                    Partner Bridge
                                </span>
                            )}
                        </h3>
                        <p className="text-xs text-muted-foreground pt-0.5">
                            {conversation.participants?.length || 0} Members • {conversation.scope}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost"><Phone className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost"><Video className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost"><Info className="w-4 h-4" /></Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
                {messages.map((msg) => (
                    <div key={msg._id} className={cn("flex gap-4", msg.isOwn ? "flex-row-reverse" : "")}>
                        {!msg.isOwn && (
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                                {msg.senderName?.[0] || 'U'}
                            </div>
                        )}
                        <div className={cn(
                            "max-w-[70%] rounded-2xl px-5 py-3 shadow-sm",
                            msg.isOwn
                                ? "bg-primary text-primary-foreground rounded-tr-sm"
                                : "bg-card border border-border/50 rounded-tl-sm"
                        )}>
                            {!msg.isOwn && (
                                <p className="text-[10px] font-bold opacity-50 mb-1 uppercase tracking-wider">{msg.senderName}</p>
                            )}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            <p className={cn("text-[9px] mt-2 text-right opacity-60 font-medium", msg.isOwn ? "text-primary-foreground" : "text-muted-foreground")}>
                                {format(new Date(msg.createdAt), 'h:mm a')}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card/30">
                <form onSubmit={handleSend} className="relative flex items-center gap-2">
                    <Button type="button" size="icon" variant="ghost" className="shrink-0 text-muted-foreground">
                        <Paperclip className="w-5 h-5" />
                    </Button>
                    <Input
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-secondary/50 border-0 h-11 rounded-xl px-4 focus-visible:ring-1"
                    />
                    <Button type="submit" size="icon" disabled={!inputText.trim()} className={cn("shrink-0 transition-all", inputText.trim() ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0 w-0 p-0 overflow-hidden")}>
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
};

// Start Icon
import { MessageSquare } from 'lucide-react';
