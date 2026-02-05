// NO_OP_Placeholder
// I will split this into two calls. First update NewChatModal, then Chat.tsx
import { useState, useEffect } from "react";
import { Users, X, Search, Loader2, Hash, Lock, Globe } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { cn } from "@/shared/lib/utils";
import { useApp } from "@/shared/contexts/AppContext";
import { apiClient } from "@/shared/lib/api";
import { toast } from "sonner";

interface NewChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string;
  onChatCreated?: (chat: { type: 'dm' | 'channel'; id: string }) => void;
  defaultTab?: "message" | "channel";
}

interface Member {
  _id: string;
  name: string;
  email?: string;
  role: string;
  specialization?: string | null;
}

export const NewChatModal = ({ open, onOpenChange, workspaceId, onChatCreated, defaultTab = "message" }: NewChatModalProps) => {
  const { currentWorkspace, user } = useApp();
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Reset tab when opening
  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
    }
  }, [open, defaultTab]);

  // Channel Creation State
  const [channelName, setChannelName] = useState("");
  const [channelPrivacy, setChannelPrivacy] = useState<"public" | "private">("public");

  const effectiveWorkspaceId = workspaceId || currentWorkspace?._id;

  useEffect(() => {
    if (open && effectiveWorkspaceId) {
      fetchMembers();
    }
  }, [open, effectiveWorkspaceId]);

  const fetchMembers = async () => {
    if (!effectiveWorkspaceId) return;
    try {
      setLoading(true);
      const result = await apiClient.getWorkspaceMembers(effectiveWorkspaceId);
      // Filter out current user
      const others = result.members.filter((m: Member) => m._id !== user?._id);
      setWorkspaceMembers(others);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = workspaceMembers.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.email && m.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleParticipant = (memberId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCreateChat = async () => {
    if (selectedParticipants.length === 0) {
      toast.error('Please select at least one participant');
      return;
    }

    try {
      setCreating(true);
      const result = await apiClient.createNewChat({
        participants: selectedParticipants,
        workspaceId: effectiveWorkspaceId,
      });

      toast.success('Conversation started');
      onChatCreated?.({
        type: 'dm',
        id: result.dm?._id || result.channel?._id || '',
      });
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create chat');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateChannel = async () => {
    if (!channelName.trim()) {
      toast.error('Channel name is required');
      return;
    }

    try {
      setCreating(true);
      const result = await apiClient.createChannel(effectiveWorkspaceId!, {
        name: channelName,
        type: channelPrivacy === 'private' ? 'private_channel' : 'channel',
        initialMembers: channelPrivacy === 'private' ? selectedParticipants : [],
      });

      toast.success('Channel created');
      onChatCreated?.({
        type: 'channel',
        id: result.channel._id,
      });
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create channel');
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    if (!creating) {
      setSelectedParticipants([]);
      setSearchQuery("");
      setChannelName("");
      setChannelPrivacy("public");
      onOpenChange(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg overflow-hidden p-0 gap-0">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
            <DialogDescription>
              Start a chat or create a new channel for your team.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <div className="px-6 border-b border-border">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="message">Direct Message</TabsTrigger>
              <TabsTrigger value="channel">Create Channel</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 pt-4">
            <TabsContent value="message" className="space-y-4 mt-0">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Selected Participants */}
              {selectedParticipants.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-secondary/50 rounded-lg">
                  <span className="text-xs text-muted-foreground self-center">Selected:</span>
                  {selectedParticipants.map((id) => {
                    const member = workspaceMembers.find((m) => m._id === id);
                    if (!member) return null;
                    return (
                      <Badge key={id} variant="secondary" className="gap-1">
                        {member.name}
                        <button
                          onClick={() => toggleParticipant(id)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* Members List */}
              <div className="border rounded-lg max-h-[280px] overflow-auto">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No members found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredMembers.map((member) => {
                      const isSelected = selectedParticipants.includes(member._id);
                      return (
                        <button
                          key={member._id}
                          onClick={() => toggleParticipant(member._id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left",
                            isSelected && "bg-primary/10"
                          )}
                        >
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs shrink-0">
                            {getInitials(member.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-sm">{member.name}</p>
                            {member.role === 'omni' && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-2">Omni</span>}
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                              <X className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="channel" className="space-y-6 mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Channel Name</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. project-updates"
                      className="pl-9"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Lowercase, no spaces.</p>
                </div>

                <div className="space-y-3">
                  <Label>Privacy</Label>
                  <RadioGroup value={channelPrivacy} onValueChange={(v: any) => setChannelPrivacy(v)} className="grid grid-cols-2 gap-4">
                    <div>
                      <RadioGroupItem value="public" id="public" className="peer sr-only" />
                      <Label
                        htmlFor="public"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Globe className="mb-3 h-6 w-6 text-muted-foreground" />
                        <span className="text-sm font-medium">Public Channel</span>
                        <span className="text-xs text-muted-foreground text-center mt-1">Anyone in workspace can join</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="private" id="private" className="peer sr-only" />
                      <Label
                        htmlFor="private"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Lock className="mb-3 h-6 w-6 text-muted-foreground" />
                        <span className="text-sm font-medium">Private Channel</span>
                        <span className="text-xs text-muted-foreground text-center mt-1">Only invited members can join</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {channelPrivacy === 'private' && (
                  <div className="space-y-2">
                    <Label>Add Members</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search to add members..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="border rounded-md max-h-[150px] overflow-auto mt-2">
                      {/* Reusing member list logic simplified */}
                      {filteredMembers.map((member) => (
                        <div
                          key={member._id}
                          onClick={() => toggleParticipant(member._id)}
                          className={cn(
                            "flex items-center gap-2 p-2 hover:bg-muted cursor-pointer text-sm",
                            selectedParticipants.includes(member._id) && "bg-primary/10"
                          )}
                        >
                          <div className={cn("w-4 h-4 rounded border flex items-center justify-center", selectedParticipants.includes(member._id) ? "bg-primary border-primary" : "border-muted-foreground")}>
                            {selectedParticipants.includes(member._id) && <X className="w-3 h-3 text-primary-foreground" />}
                          </div>
                          <span>{member.name}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{selectedParticipants.length} members selected</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="p-6 pt-0">
          <Button variant="outline" onClick={handleClose} disabled={creating}>
            Cancel
          </Button>
          <Button
            onClick={activeTab === 'message' ? handleCreateChat : handleCreateChannel}
            disabled={creating || (activeTab === 'message' && selectedParticipants.length === 0) || (activeTab === 'channel' && !channelName)}
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {activeTab === 'message' ? 'Creating...' : 'Creating Channel...'}
              </>
            ) : (
              <>
                {activeTab === 'message' ? 'Start Chat' : 'Create Channel'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
