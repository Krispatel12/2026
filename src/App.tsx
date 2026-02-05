import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "@/features/landing/pages/Landing";
import Auth from "@/features/auth/pages/Auth";
import OrganizationLogin from "@/features/organization/pages/Login";
import ProjectLogin from "@/features/project/pages/Login";
import Welcome from "@/features/onboarding/pages/Welcome";
import JoinWorkspace from "@/features/workspace/pages/JoinWorkspace";
import EmptyDashboard from "@/features/dashboard/pages/EmptyDashboard";
import ProjectLayout from "@/features/project/layouts/ProjectLayout";
import OrganizationLayout from "@/features/organization/layouts/OrganizationLayout";
import OrganizationRegistration from "@/features/organization/pages/Registration";
import ProjectWorkspaceRegistration from "@/features/project/pages/Registration";
import ProjectDashboard from "@/features/project/pages/ProjectDashboard";
import OrganizationDashboard from "@/features/organization/pages/OrganizationDashboard";
import OrgChat from "@/features/organization/pages/OrgChat";
import OrgTasks from "@/features/organization/pages/OrgTasks";
import OrgMeetings from "@/features/organization/pages/OrgMeetings";
import OrgAIBrain from "@/features/organization/pages/OrgAIBrain";
import OrgUpdates from "@/features/organization/pages/OrgUpdates";
import OrgSettings from "@/features/organization/pages/OrgSettings";
import Chat from "@/features/chat/pages/Chat";
import Tasks from "@/features/tasks/pages/Tasks";
import AIBrain from "@/features/ai/pages/AIBrain";
import Team from "@/features/team/pages/Team";
import Profile from "@/features/user/pages/Profile";
import NotFound from "@/shared/pages/NotFound";
import ProjectUpdates from "@/features/project/pages/ProjectUpdates";
import Meetings from "@/features/meetings/pages/Meetings";
import MeetingRoom from "@/features/meetings/pages/MeetingRoom";
import AuthCallback from "@/features/auth/pages/AuthCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login/organization" element={<OrganizationLogin />} />
          <Route path="/login/project" element={<ProjectLogin />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/invite/:code" element={<Welcome />} />
          <Route path="/register/organization" element={<OrganizationRegistration />} />
          <Route path="/register/project" element={<ProjectWorkspaceRegistration />} />
          <Route path="/join-workspace" element={<JoinWorkspace />} />
          <Route path="/empty-dashboard" element={<EmptyDashboard />} />

          {/* Organization Admin Routes */}
          <Route path="/app/org-admin" element={<OrganizationLayout />}>
            <Route index element={<OrganizationDashboard />} />
            <Route path="chat" element={<Chat />} />
            <Route path="tasks" element={<OrgTasks />} />
            <Route path="meetings" element={<OrgMeetings />} />
            <Route path="chatbot" element={<OrgAIBrain />} />
            <Route path="updates" element={<OrgUpdates />} />
            <Route path="settings" element={<OrgSettings />} />
            {/* Add more org admin routes here like settings */}
          </Route>

          {/* Project Workspace Routes */}
          <Route path="/app" element={<ProjectLayout />}>
            <Route index element={<ProjectDashboard />} />
            <Route path="chat" element={<OrgChat />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="chatbot" element={<AIBrain />} />
            <Route path="team" element={<Team />} />
            <Route path="updates" element={<ProjectUpdates />} />
            <Route path="meetings" element={<Meetings />} />
            <Route path="settings" element={<Profile />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
          <Route path="/oauth-callback" element={<AuthCallback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
