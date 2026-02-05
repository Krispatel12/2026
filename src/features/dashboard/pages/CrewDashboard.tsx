import { useEffect, useState } from "react";
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Loader2,
  Calendar,
  Zap,
  Target
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/shared/contexts/AppContext";
import { apiClient } from "@/shared/lib/api";
import { socketClient } from "@/shared/lib/socket";
import { format, isToday, parseISO } from "date-fns";
import { cn } from "@/shared/lib/utils";

interface Task {
  _id: string;
  title: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  dueDate: string | null;
}



const CrewDashboard = () => {
  const navigate = useNavigate();
  const { user, currentWorkspace, workspaces, loading: appLoading } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completed: 0,
    inProgress: 0,
    productivity: 0,
  });

  useEffect(() => {
    if (!currentWorkspace) return;

    const fetchTasks = async () => {
      try {
        setLoading(true);
        const result = await apiClient.getMyTasks(currentWorkspace._id);
        setTasks(result.tasks);

        // Calculate stats
        const completed = result.tasks.filter((t: Task) => t.status === 'done').length;
        const inProgress = result.tasks.filter((t: Task) => t.status === 'in_progress').length;
        const total = result.tasks.length;
        const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;

        setStats({ completed, inProgress, productivity });
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [currentWorkspace]);

  // Redirect to Welcome if no workspaces exist (Day 0 experience)
  useEffect(() => {
    if (!loading && workspaces.length === 0) {
      navigate('/welcome');
    }
  }, [loading, workspaces, navigate]);

  // Listen for real-time task updates
  useEffect(() => {
    const handleTaskCreated = (data: any) => {
      if (data.task && data.task.workspaceId === currentWorkspace._id) {
        setTasks((prev) => {
          const exists = prev.some((t) => t._id === data.task._id);
          if (exists) return prev;
          const updated = [...prev, data.task];
          // Recalculate stats
          const completed = updated.filter((t: Task) => t.status === 'done').length;
          const inProgress = updated.filter((t: Task) => t.status === 'in_progress').length;
          const total = updated.length;
          const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;
          setStats({ completed, inProgress, productivity });
          return updated;
        });
      }
    };

    const handleTaskUpdated = (data: any) => {
      if (data.task && data.task.workspaceId === currentWorkspace._id) {
        setTasks((prev) => {
          const updated = prev.map((t) => t._id === data.task._id ? data.task : t);
          // Recalculate stats
          const completed = updated.filter((t: Task) => t.status === 'done').length;
          const inProgress = updated.filter((t: Task) => t.status === 'in_progress').length;
          const total = updated.length;
          const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;
          setStats({ completed, inProgress, productivity });
          return updated;
        });
      }
    };

    socketClient.on('task:created', handleTaskCreated);
    socketClient.on('task:updated', handleTaskUpdated);

    return () => {
      socketClient.off('task:created', handleTaskCreated);
      socketClient.off('task:updated', handleTaskUpdated);
    };
  }, [currentWorkspace]);

  const getTodaysTasks = () => {
    return tasks
      .filter((task) => {
        if (task.status === 'done') return false;
        if (!task.dueDate) return false;
        try {
          return isToday(parseISO(task.dueDate));
        } catch {
          return false;
        }
      })
      .slice(0, 3);
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    try {
      const date = parseISO(dateString);
      return format(date, 'h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (!currentWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] animate-in fade-in zoom-in-95 duration-700">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-pulse-slow" />
          <div className="relative w-24 h-24 rounded-[28px] bg-white/60 backdrop-blur-xl border border-white flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
            <Sparkles className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg animate-bounce">
            <Target className="w-5 h-5" />
          </div>
        </div>

        <div className="text-center max-w-md px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Ready to begin your mission?</h2>
          <p className="text-slate-500 text-lg mb-8 leading-relaxed">
            Select a workspace from the sidebar to access your team, tasks, and AI deployment center.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/40 border border-white/60 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
                <MessageSquare className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-tighter">Collab</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/40 border border-white/60 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                <CheckSquare className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-tighter">Deliver</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const todaysTasks = getTodaysTasks();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}! <span className="animate-wave inline-block">👋</span>
          </h1>
          <p className="text-slate-500 text-lg">
            You have <span className="font-semibold text-slate-800">{tasks.filter(t => t.status !== 'done').length} active tasks</span>. Let's make today productive.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white/40 border border-white/60 text-sm font-medium text-slate-600 flex items-center gap-2 shadow-sm backdrop-blur-sm">
            <Calendar className="w-4 h-4 text-violet-500" />
            {format(new Date(), 'EEE, MMM d')}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">

          {/* Hero Card - cortexa Chatbot */}
          <Link to="/app/chatbot" className="block group">
            <div className="relative overflow-hidden rounded-[32px] p-8 aspect-[3/1] md:aspect-[4/1] bg-gradient-to-br from-[#4f46e5] via-[#7c3aed] to-[#2563eb] shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 border border-white/20 group-hover:scale-[1.01]">
              {/* Animated Background Elements */}
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:translate-x-1/3 transition-transform duration-1000" />
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-900/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 group-hover:-translate-x-1/4 transition-transform duration-1000" />

              <div className="relative z-10 flex items-center gap-6 h-full">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner shrink-0 group-hover:rotate-6 transition-transform duration-500">
                  <Sparkles className="w-8 h-8 text-white drop-shadow-md" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Your AI Teammate is Ready</h3>
                  <p className="text-indigo-100 text-base md:text-lg opacity-90 font-medium">
                    Ask questions, generate code, or get a quick sitrep of your projects.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-lg group-hover:translate-x-2 transition-transform duration-300">
                  <ArrowRight className="w-5 h-5 font-bold" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </Link>

          {/* Quick Stats Grid - Only visible on Mobile/Tablet typically, but good for summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:hidden">
            {/* ... simplified stats for mobile ... */}
          </div>

          {/* Today's Focus Card */}
          <div className="glass-premium rounded-[28px] border-white/50 p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100/50 flex items-center justify-center text-violet-600">
                  <Target className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Today's Priorities</h2>
              </div>
              <Link to="/app/tasks">
                <Button variant="ghost" size="sm" className="hover:bg-violet-50 hover:text-violet-600 rounded-xl transition-colors">
                  View All Tasks <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
              </div>
            ) : todaysTasks.length === 0 ? (
              <div className="py-12 text-center bg-violet-50/30 rounded-2xl border border-violet-100/50 border-dashed">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 text-green-600">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <p className="text-slate-600 font-medium">All caught up for today!</p>
                <p className="text-sm text-slate-400 mt-1">Enjoy your free time or pick up something from the backlog.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysTasks.map((task, i) => (
                  <div
                    key={task._id}
                    className={cn(
                      "group flex items-center gap-4 p-4 rounded-2xl bg-white/40 border border-white/60 hover:border-violet-200 hover:bg-white/80 hover:shadow-md transition-all duration-300 cursor-pointer",
                      "animate-fade-in-up"
                    )}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <button className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      task.status === "in_progress"
                        ? "border-amber-400 bg-amber-50 text-amber-500"
                        : "border-slate-300 text-transparent hover:border-violet-500"
                    )}>
                      {task.status === "in_progress" && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "font-semibold text-slate-800 truncate group-hover:text-violet-700 transition-colors",
                        task.status === 'done' && "line-through text-slate-400"
                      )}>{task.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatTime(task.dueDate)}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={cn(
                        "border-0 font-bold px-2.5 py-0.5 rounded-lg",
                        task.priority === 'P0' ? "bg-rose-100 text-rose-600" :
                          task.priority === 'P1' ? "bg-amber-100 text-amber-700" :
                            task.priority === 'P2' ? "bg-blue-100 text-blue-700" :
                              "bg-slate-100 text-slate-600"
                      )}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Grid */}
          <div className="grid sm:grid-cols-2 gap-5">
            <Link to="/app/chat" className="group">
              <div className="p-5 rounded-[24px] bg-white/40 border border-white/60 hover:bg-white/70 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-1">Team Chat</h3>
                <p className="text-sm text-slate-500 font-medium">Catch up on 5 unread messages</p>
              </div>
            </Link>
            <Link to="/app/tasks" className="group">
              <div className="p-5 rounded-[24px] bg-white/40 border border-white/60 hover:bg-white/70 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-1">My Tasks</h3>
                <p className="text-sm text-slate-500 font-medium">{tasks.length} total tasks assigned</p>
              </div>
            </Link>
          </div>

        </div>

        {/* Right Sidebar - Stats & Wellbeing */}
        <div className="space-y-6">

          {/* Weekly Velocity Card */}
          <div className="glass-premium rounded-[28px] border-white/50 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800">Weekly Velocity</h3>
            </div>

            <div className="space-y-5">
              <StatRow
                label="Tasks Completed"
                value={stats.completed.toString()}
                subtext="This week"
                color="emerald"
              />
              <StatRow
                label="In Progress"
                value={stats.inProgress.toString()}
                color="blue"
              />

              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-slate-600">Productivity Score</span>
                  <span className="text-lg font-bold text-violet-600">{stats.productivity}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-1000"
                    style={{ width: `${stats.productivity}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Daily Mood */}
          <div className="glass-premium rounded-[28px] border-white/50 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-[40px] -mr-10 -mt-10" />

            <h3 className="font-bold text-slate-800 mb-4 relative z-10">How are you feeling?</h3>
            <div className="grid grid-cols-3 gap-3 relative z-10">
              {["🔥", "🙂", "😴"].map(emoji => (
                <button key={emoji} className="aspect-square rounded-2xl bg-white/50 border border-white/60 hover:bg-white hover:scale-105 hover:shadow-md transition-all text-2xl flex items-center justify-center shadow-sm">
                  {emoji}
                </button>
              ))}
            </div>
            <p className="text-xs font-medium text-slate-400 text-center mt-4 relative z-10">Your input helps optimize team workload</p>
          </div>

          {/* Reminders List */}
          {(tasks.some(t => t.priority === 'P0') || tasks.some(t => t.dueDate && parseISO(t.dueDate) < new Date())) && (
            <div className="p-5 rounded-[24px] bg-rose-50/50 border border-rose-100">
              <h4 className="font-bold text-rose-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Attention Needed
              </h4>
              <div className="space-y-2">
                {tasks.filter(t => t.priority === 'P0').slice(0, 2).map(t => (
                  <div key={t._id} className="text-sm bg-white/60 p-2 rounded-lg text-rose-700 font-medium border border-rose-100/50">
                    Create high priority task: {t.title}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const StatRow = ({ label, value, subtext, color = "violet" }: any) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-slate-500">{label}</span>
    <div className="text-right">
      <div className={cn("text-xl font-bold font-mono tracking-tight", `text-${color}-600`)}>{value}</div>
      {subtext && <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{subtext}</div>}
    </div>
  </div>
);

export default CrewDashboard;
