import { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Filter,
  Search,
  Clock,
  Calendar,
  MoreHorizontal,
  ChevronDown,
  User,
  Flag,
  ArrowUpRight,
  Brain,
  Loader2
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { useApp } from "@/shared/contexts/AppContext";
import { apiClient } from "@/shared/lib/api";
import { socketClient } from "@/shared/lib/socket";
import { toast } from "sonner";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  assignee: {
    _id: string;
    name: string;
    email: string;
  } | null;
  creator: {
    _id: string;
    name: string;
    email: string;
  };
  relatedMessageId: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  "todo": "bg-secondary text-muted-foreground",
  "in_progress": "bg-info/10 text-info",
  "blocked": "bg-destructive/10 text-destructive",
  "done": "bg-success/10 text-success",
};

const statusLabels: Record<string, string> = {
  "todo": "To Do",
  "in_progress": "In Progress",
  "blocked": "Blocked",
  "done": "Done",
};

const Tasks = () => {
  const { currentWorkspace, user } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<any[]>([]); // Team members for filter
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "P2" as "P0" | "P1" | "P2" | "P3",
    assigneeId: "",
    dueDate: "",
  });

  useEffect(() => {
    if (!currentWorkspace) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [tasksResult, membersResult] = await Promise.all([
          apiClient.getTasks(currentWorkspace._id),
          apiClient.getWorkspaceMembers(currentWorkspace._id)
        ]);
        setTasks(tasksResult.tasks);
        setMembers(membersResult.members || []);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for task updates
    const handleTaskCreated = (data: any) => {
      if (data.task.workspaceId === currentWorkspace._id) {
        setTasks((prev) => [data.task, ...prev]);
      }
    };

    const handleTaskUpdated = (data: any) => {
      if (data.task.workspaceId === currentWorkspace._id) {
        setTasks((prev) =>
          prev.map((t) => (t._id === data.task._id ? data.task : t))
        );
      }
    };

    socketClient.on('task:created', handleTaskCreated);
    socketClient.on('task:updated', handleTaskUpdated);

    return () => {
      socketClient.off('task:created', handleTaskCreated);
      socketClient.off('task:updated', handleTaskUpdated);
    };
  }, [currentWorkspace]);

  useEffect(() => {
    let filtered = tasks;

    // Filter by tab
    if (activeTab === "my-tasks") {
      filtered = filtered.filter((t) => t.assignee?._id === user?._id);
    } else if (activeTab === "assigned") {
      filtered = filtered.filter((t) => t.assignee?._id === user?._id && t.status !== 'done');
    } else if (activeTab === "due-soon") {
      filtered = filtered.filter((t) => {
        if (!t.dueDate) return false;
        const due = parseISO(t.dueDate);
        const now = new Date();
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 2 && diffDays >= 0;
      });
    } else if (activeTab === "completed") {
      filtered = filtered.filter((t) => t.status === 'done');
    }

    // Filter by Assignee Dropdown
    if (filterAssignee !== "all") {
      filtered = filtered.filter(t => t.assignee?._id === filterAssignee);
    }

    // Filter by Priority Dropdown
    if (filterPriority !== "all") {
      filtered = filtered.filter(t => t.priority === filterPriority);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, activeTab, searchQuery, filterAssignee, filterPriority, user]);

  const handleCreateTask = async () => {
    if (!currentWorkspace || !newTask.title || !newTask.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await apiClient.createTask(currentWorkspace._id, {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        assigneeId: newTask.assigneeId || undefined,
        dueDate: newTask.dueDate || undefined,
      });
      toast.success('Task created successfully');
      setCreateDialogOpen(false);
      setNewTask({
        title: "",
        description: "",
        priority: "P2",
        assigneeId: "",
        dueDate: "",
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    if (!currentWorkspace) return;

    try {
      await apiClient.updateTask(currentWorkspace._id, taskId, {
        status: newStatus,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task');
    }
  };

  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      const date = parseISO(dateString);
      if (isToday(date)) return "Today";
      if (isTomorrow(date)) return "Tomorrow";
      return format(date, "MMM d");
    } catch {
      return null;
    }
  };

  const getTabCounts = () => {
    const myTasks = tasks.filter((t) => t.assignee?._id === user?._id).length;
    const assigned = tasks.filter((t) => t.assignee?._id === user?._id && t.status !== 'done').length;
    const dueSoon = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const due = parseISO(t.dueDate);
      const now = new Date();
      const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 2 && diffDays >= 0;
    }).length;
    const completed = tasks.filter((t) => t.status === 'done').length;
    return { myTasks, assigned, dueSoon, completed };
  };

  const counts = getTabCounts();

  const tabs = [
    { id: "all", label: "All Tasks", count: tasks.length },
    { id: "my-tasks", label: "My Tasks", count: counts.myTasks },
    { id: "assigned", label: "Assigned to Me", count: counts.assigned },
    { id: "due-soon", label: "Due Soon", count: counts.dueSoon },
    { id: "completed", label: "Completed", count: counts.completed },
  ];

  if (!currentWorkspace) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-muted-foreground">Please select a workspace</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header - Glass */}
      <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-r from-transparent via-white/5 to-transparent backdrop-blur-sm sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tight">Tasks</h1>
            <p className="text-muted-foreground/80 font-medium">Manage and track your mission objectives</p>
          </div>
          <Button className="h-11 px-6 bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300 transform hover:scale-105" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            <span className="font-semibold tracking-wide">New Task</span>
          </Button>
        </div>

        {/* Tabs - Pill Style */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 border",
                activeTab === tab.id
                  ? "bg-primary/20 text-primary border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:text-foreground hover:border-white/10"
              )}
            >
              {tab.label}
              <span className={cn(
                "ml-2.5 px-2 py-0.5 rounded-full text-[10px]",
                activeTab === tab.id ? "bg-primary text-white" : "bg-white/10 text-muted-foreground"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 md:px-8 py-5 border-b border-white/5 flex flex-wrap items-center gap-5 bg-white/[0.02]">
        <div className="relative flex-1 min-w-[200px] max-w-md group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 transition-colors group-hover:text-primary/70" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-white/5 border-white/5 focus:bg-white/10 focus:border-primary/30 transition-all font-medium placeholder:text-muted-foreground/40"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="w-[180px] h-10 rounded-xl bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 transition-all focus:ring-0">
              <div className="flex items-center truncate text-sm">
                <User className="w-3.5 h-3.5 mr-2.5 text-muted-foreground/70" />
                <SelectValue placeholder="Assignee" />
              </div>
            </SelectTrigger>
            <SelectContent className="glass-card border-white/10">
              <SelectItem value="all">All Members</SelectItem>
              {members.map((m: any) => (
                <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[150px] h-10 rounded-xl bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 transition-all focus:ring-0">
              <div className="flex items-center text-sm">
                <Flag className="w-3.5 h-3.5 mr-2.5 text-muted-foreground/70" />
                <SelectValue placeholder="Priority" />
              </div>
            </SelectTrigger>
            <SelectContent className="glass-card border-white/10">
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="P0">P0 - Critical</SelectItem>
              <SelectItem value="P1">P1 - High</SelectItem>
              <SelectItem value="P2">P2 - Medium</SelectItem>
              <SelectItem value="P3">P3 - Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <CheckSquare className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-medium text-foreground">No tasks found</p>
            <p className="text-sm text-muted-foreground/60 max-w-xs mt-1">
              Create a new task to get started or adjust your filters.
            </p>
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className="group p-5 rounded-[20px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/5 flex items-start gap-5 relative overflow-hidden"
              >
                {/* Checkbox */}
                <button
                  onClick={() => {
                    const newStatus = task.status === 'done' ? 'todo' : 'done';
                    handleStatusChange(task._id, newStatus);
                  }}
                  className={cn(
                    "w-6 h-6 rounded-lg border-2 mt-0.5 shrink-0 flex items-center justify-center transition-all duration-300 z-10",
                    task.status === "done"
                      ? "bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                      : "border-white/20 hover:border-primary hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] bg-transparent"
                  )}
                >
                  {task.status === "done" && (
                    <CheckSquare className="w-3.5 h-3.5 text-white" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0 z-10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <h3 className={cn(
                          "font-semibold text-[15px] truncate transition-colors",
                          task.status === "done" ? "text-muted-foreground line-through decoration-white/20" : "text-foreground group-hover:text-primary/90"
                        )}>
                          {task.title}
                        </h3>
                      </div>
                      <p className={cn(
                        "text-sm mb-3 break-words leading-relaxed line-clamp-2",
                        task.status === "done" ? "text-muted-foreground/60" : "text-muted-foreground"
                      )}>{task.description}</p>

                      {task.relatedMessageId && (
                        <Badge variant="outline" className="text-[10px] gap-1.5 mb-3 px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                          <ArrowUpRight className="w-3 h-3" />
                          Linked Task
                        </Badge>
                      )}
                    </div>

                    {/* Right side info */}
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge className={cn(
                        "text-[10px] px-2.5 py-0.5 rounded-full border-0 font-bold tracking-wide",
                        task.priority === 'P0' ? "bg-red-500/20 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]" :
                          task.priority === 'P1' ? "bg-orange-500/20 text-orange-500" :
                            "bg-blue-500/10 text-blue-400"
                      )}>
                        {task.priority}
                      </Badge>
                      <div className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        statusColors[task.status]
                      )}>
                        {statusLabels[task.status]}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex flex-wrap items-center gap-5 mt-2 pt-3 border-t border-white/5 text-xs text-muted-foreground/70">
                    {task.assignee && (
                      <div className="flex items-center gap-2 bg-white/5 rounded-full px-2.5 py-1">
                        <User className="w-3 h-3" />
                        <span className="truncate max-w-[100px]">{task.assignee.name}</span>
                      </div>
                    )}
                    {task.dueDate && (
                      <div className={cn(
                        "flex items-center gap-2 rounded-full px-2.5 py-1 transition-colors",
                        isToday(parseISO(task.dueDate)) ? "bg-orange-500/10 text-orange-400" : "bg-white/5"
                      )}>
                        <Calendar className="w-3 h-3" />
                        <span className={isToday(parseISO(task.dueDate)) ? "font-bold" : ""}>
                          {formatDueDate(task.dueDate)}
                        </span>
                      </div>
                    )}
                    <span className="ml-auto text-[10px] opacity-50 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Updated {new Date(task.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="relative z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" className="h-8 w-8 hover:bg-white/10 rounded-lg">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-card border-white/10">
                      <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                        Delete Task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to track work in your workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Task description"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P0">P0 - Critical</SelectItem>
                    <SelectItem value="P1">P1 - High</SelectItem>
                    <SelectItem value="P2">P2 - Medium</SelectItem>
                    <SelectItem value="P3">P3 - Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask} disabled={!newTask.title || !newTask.description}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;
