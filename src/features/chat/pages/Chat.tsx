import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp } from "@/shared/contexts/AppContext";
import { apiClient } from "@/shared/lib/api";
import { socketClient } from "@/shared/lib/socket";
import { toast } from "sonner";
import { ConversationList } from "@/features/chat/components/ConversationList";
import { ChatArea } from "@/features/chat/components/ChatArea";
import { RecipientSelector } from "@/features/chat/components/RecipientSelector";

const Chat = () => {
  const { currentWorkspace, user } = useApp();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);

  // fetch members for select
  useEffect(() => {
    if (currentWorkspace?._id) {
      apiClient.getWorkspaceMembers(currentWorkspace._id)
        .then(res => setWorkspaceMembers([...res.members, ...res.omnis]))
        .catch(console.error);
    }
  }, [currentWorkspace]);

  // 1. Fetch Conversations (Inbox)
  const fetchConversations = useCallback(async () => {
    try {
      const res = await apiClient.getConversations();
      setConversations(res.conversations);

      // Auto-select first if none selected
      if (!activeConversation && res.conversations.length > 0) {
        setActiveConversation(res.conversations[0]);
      }
    } catch (err: any) {
      console.error("Failed to load inbox", err);
    }
  }, [activeConversation]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  // 2. Fetch Messages for Active Chat
  useEffect(() => {
    if (!activeConversation) return;

    // Join Socket Room
    // Using generic emit since methods like joinChannel are specific to V1
    socketClient.emit('join_room', `chat:${activeConversation._id}`);

    const loadHistory = async () => {
      try {
        const res = await apiClient.getConversationMessages(activeConversation._id);
        setMessages(res.messages.map((m: any) => ({
          ...m,
          isOwn: m.senderId._id === user?._id,
          senderName: m.senderId.name
        })));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    };
    loadHistory();

    const handleNewMessage = (data: any) => {
      if (data.conversationId === activeConversation._id) {
        setMessages(prev => {
          const exists = prev.some(m => m._id === data.message._id);
          if (exists) return prev;
          return [...prev, {
            ...data.message,
            isOwn: data.message.senderId === user?._id, // note: senderId might be string in real-time payload
            senderName: 'Incoming...' // Payload might need Populate, or we infer?
          }];
        });
        // Also refresh inbox to jump to top
        fetchConversations();
      }
    };

    socketClient.on('new_message', handleNewMessage);

    return () => {
      socketClient.off('new_message', handleNewMessage);
    };

  }, [activeConversation, user, fetchConversations]);

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden">
      <ConversationList
        conversations={conversations}
        activeId={activeConversation?._id || null}
        onSelect={setActiveConversation}
        onNewChat={() => setIsNewChatOpen(true)}
      />

      <ChatArea
        conversation={activeConversation}
        messages={messages}
        onSendMessage={async (text) => {
          if (!activeConversation) return;
          try {
            const res = await apiClient.sendMessage(activeConversation._id, text);
            // Optimistic update done by socket usually, but let's add locally too if needed
            // setMessages(prev => [...prev, { ...res.message, isOwn: true, senderName: user?.name }]);
          } catch (e) {
            toast.error("Failed to send");
          }
        }}
        currentUserId={user?._id || ''}
      />

      <RecipientSelector
        open={isNewChatOpen}
        onOpenChange={setIsNewChatOpen}
        workspaceMembers={workspaceMembers}
        onSelect={async (ids, scope) => {
          try {
            const res = await apiClient.startChat({
              participantIds: ids,
              scope: scope as any,
              orgId: (currentWorkspace as any)?.orgId, // Type assertion for now if missing
              projectId: currentWorkspace?._id
            });
            setConversations(prev => [res.conversation, ...prev]);
            setActiveConversation(res.conversation);
          } catch (e: any) {
            toast.error(e.message);
          }
        }}
      />
    </div>
  );
};

export default Chat;
