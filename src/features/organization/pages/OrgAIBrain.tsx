import { useState } from "react";
import { useAiChat } from "@/shared/hooks/useAiChat";
import { AiContextSidebar } from "@/features/ai/components/AiContextSidebar";
import { ChatCanvas } from "@/features/ai/components/ChatCanvas";
import { AiInputBar } from "@/features/ai/components/AiInputBar";
import { useApp } from "@/shared/contexts/AppContext";
import { Button } from "@/shared/components/ui/button";
import { PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const OrgAIBrain = () => {
    // In Org Admin, we might use the organization ID or a specific context
    // For now, we reuse the hook but this file allows for Org-specific AI customization
    const { currentWorkspace } = useApp();
    const { messages, isStreaming, sendMessage, sessions, createNewChat, loadSession, currentSessionId, deleteSession } = useAiChat(currentWorkspace?._id);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex h-full bg-transparent overflow-hidden text-foreground selection:bg-primary/20 relative">
            {/* Org Specific Header / Context Indicator */}
            <div className="absolute top-4 right-6 z-50 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2 backdrop-blur-md">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span className="text-xs font-medium text-indigo-300">Organization Architect</span>
            </div>

            {/* Background Ambience - Slightly different hue for Org */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[20%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-[150px] animate-pulse-soft" />
            </div>

            <div className="relative z-10 flex w-full max-w-[1920px] mx-auto shadow-2xl overflow-hidden h-full">
                {/* LEFT PANEL - Collapsible */}
                <div className={cn(
                    "relative transition-all duration-300 ease-in-out border-r border-white/10 bg-white/30 backdrop-blur-xl h-full flex flex-col",
                    isSidebarOpen ? "w-[320px] opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-full overflow-hidden border-none"
                )}>
                    {/* Sidebar Content Wrapper */}
                    <div className="w-[320px]">
                        <AiContextSidebar
                            sessions={sessions}
                            currentSessionId={currentSessionId}
                            onNewChat={createNewChat}
                            onLoadSession={loadSession}
                            onDeleteSession={deleteSession}
                        />
                    </div>
                </div>

                {/* SIDEBAR TOGGLE BUTTON - Floating */}
                <div className="absolute top-4 left-4 z-50">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={cn(
                            "h-8 w-8 rounded-full bg-white/40 hover:bg-white/60 backdrop-blur-md shadow-sm border border-white/20 text-muted-foreground transition-all duration-300",
                            isSidebarOpen ? "left-[300px]" : "left-0"
                        )}
                        title={isSidebarOpen ? "Close Sidebar" : "Open Context"}
                    >
                        {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                    </Button>
                </div>

                {/* CENTER CANVAS */}
                <div className="flex-1 flex flex-col relative min-w-0 bg-transparent">
                    <ChatCanvas messages={messages} isStreaming={isStreaming} />
                    <AiInputBar onSend={sendMessage} isStreaming={isStreaming} />
                </div>
            </div>
        </div>
    );
};

export default OrgAIBrain;
