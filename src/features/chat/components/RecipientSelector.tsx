import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Check, User, Building2, Hash, Handshake, Search } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface RecipientSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (userIds: string[], scope: string) => void;
    // Data props would ideally be fetched here or passed down
    workspaceMembers: any[];
}

export const RecipientSelector: React.FC<RecipientSelectorProps> = ({
    open,
    onOpenChange,
    onSelect,
    workspaceMembers
}) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("internal");

    // Mock filtering logic - replaces with real API calls in production
    const filteredUsers = workspaceMembers.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleUser = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleStart = () => {
        // Determine scope based on tab or selection
        let scope = 'ORG_INTERNAL';
        if (activeTab === 'project') scope = 'PROJECT_TEAM';
        if (activeTab === 'partner') scope = 'CROSS_ORG_PARTNER';

        // Direct Message override
        if (selectedIds.length === 1 && scope === 'ORG_INTERNAL') {
            scope = 'GLOBAL_DM';
        }

        onSelect(selectedIds, scope);
        setSelectedIds([]);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">
                <DialogHeader className="p-4 border-b border-border bg-card/50">
                    <DialogTitle>New Message</DialogTitle>
                </DialogHeader>

                <div className="p-4 bg-muted/30 border-b border-border">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search people, teams, or partners..."
                            className="pl-9 bg-background border-border/50"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Tabs defaultValue="internal" className="w-full" onValueChange={setActiveTab}>
                    <div className="px-4 pt-2">
                        <TabsList className="w-full grid grid-cols-3">
                            <TabsTrigger value="internal" className="gap-2"><Building2 className="w-3.5 h-3.5" /> Internal</TabsTrigger>
                            <TabsTrigger value="project" className="gap-2"><Hash className="w-3.5 h-3.5" /> Project</TabsTrigger>
                            <TabsTrigger value="partner" className="gap-2"><Handshake className="w-3.5 h-3.5" /> Partner</TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="h-[300px] p-4">
                        <div className="space-y-1">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">Suggested</h4>
                            {filteredUsers.map(user => (
                                <button
                                    key={user._id}
                                    onClick={() => toggleUser(user._id)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors",
                                        selectedIds.includes(user._id) && "bg-primary/5 hover:bg-primary/10"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                                            {user.name[0]}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.role || 'Member'}</p>
                                        </div>
                                    </div>
                                    {selectedIds.includes(user._id) && (
                                        <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                            <Check className="w-3 h-3" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </Tabs>

                <div className="p-4 border-t border-border flex justify-between items-center bg-card/50">
                    <p className="text-xs text-muted-foreground">
                        {selectedIds.length} recipients selected
                    </p>
                    <Button onClick={handleStart} disabled={selectedIds.length === 0}>
                        Start Chat
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
