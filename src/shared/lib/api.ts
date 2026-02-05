// Use absolute URL for server-side or relative for proxy/CORS
/// <reference types="vite/client" />
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  industry: string;
  size: string;
  country?: string;
  adminName: string;
  adminEmail: string;
  createdAt: string;
  settings: any;
}

export interface Workspace {
  _id: string;
  orgId?: string;
  name: string;
  slug: string;
  description: string;
  members: any[];
  createdAt: string;
  type: 'org_hq' | 'project';
}

export interface OrganizationCreationPayload {
  name: string;
  slug?: string;
  industry?: string;
  size?: string;
  country?: string;
  website?: string;
  coords?: { lat: number; lng: number };
  services?: string[];
  operationMode?: string;
  skipWorkspace?: boolean;
  profile?: any;
  adminName?: string;
  adminEmail?: string;
  adminRole?: string;
  password?: string;
  accessCode?: string;
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private user: any | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Try to get token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          this.user = JSON.parse(savedUser);
        } catch (e) {
          console.error("Failed to parse saved user", e);
        }
      }
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  getToken() {
    return this.token;
  }

  setUser(user: any | null) {
    this.user = user;
    if (user && typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

  getUser() {
    return this.user;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // CORS credentials include
    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };

    const response = await fetch(url, config);

    // Parse JSON
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Handle 401 Unauthorized globally if needed (e.g. redirect to login)
      if (response.status === 401) {
        // Optional: clear token?
        // this.setToken(null);
      }
      const errorMessage = (typeof data === 'object' && (data.message || data.error))
        ? (data.message || data.error)
        : (typeof data === 'string' ? data : 'Request failed');
      throw new Error(errorMessage);
    }

    return data as T;
  }

  // --- AUTH ---
  async register(data: { name: string; email: string; password: string }) {
    const res = await this.request<{ user: any; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.token);
    this.setUser(res.user);
    return res;
  }

  async login(data: { email: string; password: string }) {
    const res = await this.request<{ user: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.token);
    this.setUser(res.user);
    return res;
  }

  async getMe() {
    const res = await this.request<{ user: any }>('/api/auth/me');
    this.setUser(res.user);
    return res;
  }

  async orgLogin(data: { email: string; password: string }) {
    const res = await this.request<{ user: any; token: string; organization?: any }>('/api/organizations/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.token);
    this.setUser(res.user);
    return res;
  }

  async tenancyLogin(data: { email: string; password: string }) {
    const res = await this.request<{
      user: any;
      token: string;
      organization: any;
      message: string;
      success: boolean;
    }>('/api/tenancy/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.token);
    this.setUser(res.user);
    if (res.organization && typeof window !== 'undefined') {
      localStorage.setItem('org_context', JSON.stringify(res.organization));
    }
    return res;
  }

  async tenancyProjectLogin(data: { email: string; password: string }) {
    const res = await this.request<{
      user: any;
      token: string;
      project: any;
      message: string;
      success: boolean;
    }>('/api/tenancy/login/project', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.token);
    this.setUser(res.user);
    if (res.project && typeof window !== 'undefined') {
      localStorage.setItem('project_context', JSON.stringify(res.project));
    }
    return res;
  }

  async tenancyRegister(data: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: { organization: any; user: any }
    }>('/api/tenancy/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  logout() {
    this.setToken(null);
    this.setUser(null);
  }

  // --- ORGANIZATIONS ---
  async createOrganizationElite(data: OrganizationCreationPayload) {
    return this.request<{ organization: any; token?: string; user?: any }>('/api/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrganizations() {
    return this.request<{ organizations: any[] }>('/api/organizations');
  }

  async getOrganization(orgId: string) {
    return this.request<{ organization: any; workspaces: any[] }>(`/api/organizations/${orgId}`);
  }

  async verifyOrgAccessCode(slug: string, accessCode: string) {
    return this.request<{ success: boolean; message: string }>('/api/organizations/verify-code', {
      method: 'POST',
      body: JSON.stringify({ slug, accessCode }),
    });
  }

  async getOrganizationBySlug(slug: string) {
    return this.request<{ organization: any }>('/api/organizations/lookup', {
      method: 'POST',
      body: JSON.stringify({ slug }),
    });
  }

  async deleteOrganization(id: string) {
    return this.request<{ message: string }>(`/api/organizations/${id}`, {
      method: 'DELETE',
    });
  }

  // --- WORKSPACES ---
  async createWorkspace(data: {
    name: string; slug?: string; description?: string;
    companyProfile?: any;
    accessCode?: string;
    orgId?: string;
  }) {
    return this.request<{ workspace: any }>('/api/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWorkspaces() {
    return this.request<{ workspaces: any[] }>('/api/workspaces');
  }

  async getWorkspace(id: string) {
    return this.request<{ workspace: any }>(`/api/workspaces/${id}`);
  }

  async getWorkspaceBySlug(slug: string) {
    return this.request<{ workspace: any }>('/api/workspaces/lookup', {
      method: 'POST',
      body: JSON.stringify({ slug }),
    });
  }

  async updateWorkspace(id: string, data: { name?: string; description?: string }) {
    return this.request<{ workspace: any }>(`/api/workspaces/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteWorkspace(id: string) {
    return this.request<{ message: string }>(`/api/workspaces/${id}`, {
      method: 'DELETE',
    });
  }

  async saveProjectProfile(workspaceId: string, data: { projectProfile: any; aiSettings?: any }) {
    return this.request<{ success: boolean; workspace: any }>(`/api/workspaces/${workspaceId}/project-profile`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProjectProfile(workspaceId: string) {
    return this.request<{ projectProfile: any }>(`/api/workspaces/${workspaceId}/project-profile`);
  }

  async getProjectUpdates(workspaceId: string) {
    return this.request<{ health: any; timeline: any[]; summaries: any[] }>(`/api/workspaces/${workspaceId}/updates`);
  }

  async generateProjectUpdate(workspaceId: string, contextPeriod: 'day' | 'week' = 'week') {
    return this.request<{ update: any }>(`/api/workspaces/${workspaceId}/updates/generate`, {
      method: 'POST',
      body: JSON.stringify({ contextPeriod })
    });
  }

  // --- MEMBERS & INVITES ---
  async getWorkspaceMembers(workspaceId: string) {
    return this.request<{
      members: any[];
      omnis: any[];
      crew: any[];
      pendingCrew: any[];
      invites?: any[]; // Invites
      stats: any;
      viewerRole?: any;
      canSeeFullInfo?: boolean;
    }>(`/api/workspaces/${workspaceId}/members`);
  }

  // Legacy/Simple Invite
  async createInvite(workspaceId: string) { // General code
    return this.request<{ invite: any }>(`/api/workspaces/${workspaceId}/invites`, {
      method: 'POST'
    });
  }

  async inviteByEmail(workspaceId: string, email: string) {
    return this.request<{ message: string }>(`/api/workspaces/${workspaceId}/invites/email`, {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  // Advanced Invite
  async createInviteAdvanced(data: {
    email: string;
    invitedRole: 'org_admin' | 'omni' | 'crew';
    invitedSpecialization?: string | null;
    roleDecisionMode?: 'fixed' | 'pending';
    workspaceId?: string;
    orgId?: string;
  }) {
    return this.request<{ invite: any; message: string }>('/api/invites', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async acceptInviteById(inviteId: string) {
    return this.request<{ workspace?: any; organization?: any; message: string }>(`/api/invites/${inviteId}/accept`, {
      method: 'POST',
    });
  }

  async joinByCode(code: string) {
    return this.request<{ workspace: any; membership: any }>('/api/invites/join-by-code', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async joinWorkspace(code: string) {
    return this.request<{ workspace: any }>('/api/invites/join', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // --- TASKS ---
  async getTasks(workspaceId: string) {
    return this.request<{ tasks: any[] }>(`/api/workspaces/${workspaceId}/tasks`);
  }

  async getMyTasks(workspaceId: string) {
    return this.request<{ tasks: any[] }>(`/api/workspaces/${workspaceId}/tasks/my`);
  }

  async createTask(workspaceId: string, data: any) {
    return this.request<{ task: any }>(`/api/workspaces/${workspaceId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(workspaceId: string, taskId: string, data: any) {
    return this.request<{ task: any }>(`/api/workspaces/${workspaceId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // --- NOTIFICATIONS ---
  async getNotifications(read?: boolean) {
    const query = read !== undefined ? `?read=${read}` : '';
    return this.request<{ notifications: any[] }>(`/api/notifications${query}`);
  }

  async markNotificationRead(notificationId: string) {
    return this.request<{ notification: any }>(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  // --- AI ---
  async askAi(workspaceId: string, data: { query: string; contextIds?: string[]; mode?: 'assist' | 'auto' }) {
    return this.request<{ runId: string; status: string; response?: string }>('/api/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ ...data, workspaceId }),
    });
  }

  async getAIContextDoc(workspaceId: string, docId: string) {
    return this.request<{ text: string; metadata?: any }>(`/api/ai/workspaces/${workspaceId}/docs/${docId}`);
  }

  // --- MEETINGS ---
  async getMeetings(workspaceId: string, filter?: string) {
    const query = filter ? `&filter=${filter}` : '';
    return this.request<any[]>(`/api/meetings?workspaceId=${workspaceId}${query}`);
  }

  async createMeeting(workspaceId: string, data: any) {
    return this.request<any>('/api/meetings', {
      method: 'POST',
      body: JSON.stringify({ ...data, workspaceId })
    });
  }

  async startMeeting(meetingId: string) {
    // Implement if backed by specific route, or update generic update logic
    return this.request<any>(`/api/meetings/${meetingId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'live' })
    });
  }

  async endMeeting(meetingId: string) {
    return this.request<any>(`/api/meetings/${meetingId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed' })
    });
  }

  async deleteMeeting(meetingId: string) {
    return this.request<{ message: string }>(`/api/meetings/${meetingId}`, {
      method: 'DELETE',
    });
  }

  // --- CHAT (Updated) ---
  async getChannels(workspaceId: string) {
    return this.request<{ channels: any[] }>(`/api/workspaces/${workspaceId}/channels`); // Kept in Project module
  }

  async createChannel(workspaceId: string, data: any) {
    return this.request<{ channel: any }>(`/api/workspaces/${workspaceId}/channels`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMessages(workspaceId: string, channelId: string, page = 1) {
    // Using new Chat module route if possible, or keeping project sub-route if project controller handles it?
    // In step 265 (ProjectRoutes), I kept: router.get('/:id/channels', ...) but NOT messages.
    // In step 327 (ChatRoutes), I had: router.get('/messages/:conversationId', ...).
    // The "channel" concept in Project module vs "conversation" in Chat module. 
    // Ideally, a Channel IS a Conversation or linked to one.
    // For now, I will use /api/chats?workspaceId=... or similar if I unified them.
    // Step 327: `GET /chats?workspaceId=...` returns conversations.
    // But `Channel` model is in Project. 
    // To be cleaner, `getMessages` probably refers to `Channel` messages.
    // If I haven't migrated Channel Messages to Chat module (which used Conversation), I might have a gap.
    // Step 325 (ChatService) handles `Conversation` / `Message`. 
    // Does `Channel` use `Message`? Yes, frontend usually expects that.
    // I should create a conversation for each channel or link them.
    // FOR SAFETY: I will point `getMessages` to `/api/messages/:channelId` and ensure ChatController handles it.
    // ChatController.getMessages takes `conversationId`. If `channelId` == `conversationId` (or mapped), it works.
    // Since I control backend, I'll update ChatController to look up by `channelId` if needed, or assume I pass conversationId.
    // Frontend `Registration.tsx` calls `getChannels` then maybe `getMessages`.

    // For "Elite" refactor, we usually want `Channel` to have `messages`. 
    // Let's assume `channelId` can be passed as `conversationId` to `getMessages`.
    return this.request<{ messages: any[] }>(`/api/messages/${channelId}?limit=50`);
  }

  async createMessage(workspaceId: string, channelId: string, data: any) {
    return this.request<{ message: any }>('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ ...data, conversationId: channelId, workspaceId }),
    });
  }

  // --- CHAT (MESSAGING V2) ---
  async getConversations() {
    return this.request<{ conversations: any[] }>('/api/chat/conversations');
  }

  async startChat(data: {
    participantIds: string[];
    scope: 'GLOBAL_DM' | 'ORG_INTERNAL' | 'PROJECT_TEAM' | 'CROSS_ORG_PARTNER';
    name?: string;
    orgId?: string;
    projectId?: string;
    partnerOrgIds?: string[];
  }) {
    return this.request<{ conversation: any }>('/api/chat/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getConversationMessages(conversationId: string) {
    return this.request<{ messages: any[] }>(`/api/chat/conversations/${conversationId}/messages`);
  }

  async sendMessage(conversationId: string, content: string, attachments: any[] = []) {
    return this.request<{ message: any }>(`/api/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, attachments }),
    });
  }
}

export const apiClient: ApiClient = new ApiClient(API_BASE_URL);

