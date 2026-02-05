import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Building2,
  LayoutGrid,
  Users,
  UserPlus,
  Settings,
  Plus,
  ArrowRight,
  Sparkles,
  Handshake,
  MessageSquare,
  Search,
  X,
  Hash,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "@/shared/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

interface Organization {
  _id: string;
  name: string;
  createdBy: string;
  createdAt: string;
}

interface Workspace {
  _id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  role: string;
  omniCount?: number;
  crewCount?: number;
  totalMembers?: number;
  hasProjectProfile?: boolean;
}

const OrgAdminDashboard = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [messageTab, setMessageTab] = useState<'internal' | 'project' | 'partner'>('internal');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      loadWorkspaces(selectedOrg._id);
    }
  }, [selectedOrg]);

  const loadOrganizations = async () => {
    try {
      const result = await apiClient.getOrganizations();
      setOrganizations(result.organizations);
      if (result.organizations.length > 0) {
        setSelectedOrg(result.organizations[0]);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  const loadWorkspaces = async (orgId: string) => {
    try {
      // Fetch all workspaces for the current user
      const result = await apiClient.getWorkspaces();
      setWorkspaces(result.workspaces || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load workspaces");
    }
  };

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim() || !workspaceDescription.trim()) {
      toast.error("Workspace name and description are required");
      return;
    }

    if (!selectedOrg) {
      toast.error("Please select an organization first");
      return;
    }

    try {
      const result = await apiClient.createWorkspace({
        name: workspaceName,
        description: workspaceDescription,
        orgId: selectedOrg._id,
      });
      toast.success("Workspace created successfully!");
      setShowCreateWorkspace(false);
      setWorkspaceName("");
      setWorkspaceDescription("");
      await loadWorkspaces(selectedOrg._id);
      // Navigate to Project Definition Wizard
      navigate(`/project-wizard/${result.workspace._id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create workspace");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>No Organizations</CardTitle>
              <CardDescription>
                You don't have any organizations yet. Create one to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/welcome")}>
                <Plus className="w-4 h-4 mr-2" />
                Create Organization
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Organization Admin</h1>
              <p className="text-muted-foreground">
                Manage your organization and workspaces
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/app/chatbot">
                <Button variant="gradient" className="shadow-lg hover:shadow-xl transition-shadow">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Orbix Chatbot
                </Button>
              </Link>
              <Button variant="outline" onClick={() => setShowNewMessage(true)}>
                <MessageSquare className="w-4 h-4 mr-2" />
                New Message
              </Button>
              <Button variant="outline" onClick={() => navigate("/register/org")}>
                <Handshake className="w-4 h-4 mr-2" />
                Partner Collaboration
              </Button>
              <Button onClick={() => navigate("/register/project")}>
                <Plus className="w-4 h-4 mr-2" />
                Create Workspace
              </Button>
            </div>
          </div>
        </div>

        {/* Organization Selector */}
        {organizations.length > 1 && (
          <div className="mb-6">
            <Label>Select Organization</Label>
            <div className="flex gap-2 mt-2">
              {organizations.map((org) => (
                <Button
                  key={org._id}
                  variant={selectedOrg?._id === org._id ? "default" : "outline"}
                  onClick={() => setSelectedOrg(org)}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  {org.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Workspaces Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <Card key={workspace._id} className="hover:border-primary/50 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="mb-1">{workspace.name}</CardTitle>
                    <CardDescription>{workspace.description}</CardDescription>
                  </div>
                  <LayoutGrid className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Omnis</span>
                    <span className="font-medium">{workspace.omniCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Crew</span>
                    <span className="font-medium">{workspace.crewCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Members</span>
                    <span className="font-medium">{workspace.totalMembers || 1}</span>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Project Profile</span>
                      <span className={workspace.hasProjectProfile ? "text-green-600" : "text-yellow-600"}>
                        {workspace.hasProjectProfile ? "Complete" : "Pending"}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/app?workspace=${workspace._id}`)}
                    >
                      View Workspace
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {workspaces.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <LayoutGrid className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Workspaces Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first workspace to get started
              </p>
              <Button onClick={() => navigate("/register/project")}>
                <Plus className="w-4 h-4 mr-2" />
                Create Workspace
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Workspace Dialog */}

        {/* New Message Dialog */}
        <Dialog open={showNewMessage} onOpenChange={setShowNewMessage}>
          <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-xl border-white/10">
            <DialogHeader className="border-b border-white/10 pb-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold">New Message</DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setShowNewMessage(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search people, teams, or partners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 bg-background/50 border-primary/20 focus:border-primary/40 rounded-2xl text-base"
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-2 p-1.5 bg-muted/30 rounded-2xl">
                <button
                  onClick={() => setMessageTab('internal')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${messageTab === 'internal'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <FileText className="w-4 h-4" />
                  Internal
                </button>
                <button
                  onClick={() => setMessageTab('project')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${messageTab === 'project'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <Hash className="w-4 h-4" />
                  Project
                </button>
                <button
                  onClick={() => setMessageTab('partner')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${messageTab === 'partner'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <Handshake className="w-4 h-4" />
                  Partner
                </button>
              </div>

              {/* Suggested Contacts */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Suggested</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {/* Example contacts - replace with actual data */}
                  {workspaces.slice(0, 3).map((workspace) => (
                    <button
                      key={workspace._id}
                      onClick={() => {
                        if (selectedRecipients.includes(workspace._id)) {
                          setSelectedRecipients(selectedRecipients.filter(id => id !== workspace._id));
                        } else {
                          setSelectedRecipients([...selectedRecipients, workspace._id]);
                        }
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedRecipients.includes(workspace._id)
                          ? 'bg-primary/10 border-2 border-primary'
                          : 'hover:bg-muted/50 border-2 border-transparent'
                        }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                        {workspace.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-sm">{workspace.name}</p>
                        <p className="text-xs text-muted-foreground">omni</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <p className="text-sm text-muted-foreground">
                {selectedRecipients.length} recipient{selectedRecipients.length !== 1 ? 's' : ''} selected
              </p>
              <Button
                disabled={selectedRecipients.length === 0}
                onClick={() => {
                  toast.success('Chat started!');
                  setShowNewMessage(false);
                  setSelectedRecipients([]);
                  navigate('/app/org-admin/chat');
                }}
                className="px-8"
              >
                Start Chat
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default OrgAdminDashboard;
