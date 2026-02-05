import { useState } from "react";
import {
    CheckSquare,
    Clock,
    Filter,
    Users,
    User,
    LayoutGrid,
    Search,
    CheckCircle2,
    Circle,
    AlertCircle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils";

// Mock Data
const MOCK_TASKS = [
    { id: 1, title: "Deploy Backend API", assignee: "Kris Patel", group: "Backend", status: "completed", due: new Date().toISOString(), field: "Backend" },
    { id: 2, title: "Fix Login Layout", assignee: "Sarah Jones", group: "Frontend", status: "in_progress", due: new Date().toISOString(), field: "Frontend" },
    { id: 3, title: "Train AI Model", assignee: "Alex Chen", group: "AI Team", status: "todo", due: new Date(Date.now() + 86400000).toISOString(), field: "AI" },
    { id: 4, title: "Database Migration", assignee: "Kris Patel", group: "Backend", status: "todo", due: new Date().toISOString(), field: "Backend" },
    { id: 5, title: "Update Homepage Hero", assignee: "Sarah Jones", group: "Frontend", status: "completed", due: new Date(Date.now() - 86400000).toISOString(), field: "Frontend" },
];

const MOCK_MEMBERS = [
    { id: "u1", name: "Kris Patel", role: "Omni" },
    { id: "u2", name: "Sarah Jones", role: "Crew" },
    { id: "u3", name: "Alex Chen", role: "Crew" },
];

const MOCK_GROUPS = ["Frontend", "Backend", "AI Team", "Design"];

export default function OrgTasks() {
    const [activeTab, setActiveTab] = useState("today");
    const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [fieldFilter, setFieldFilter] = useState<string | null>(null);

    // Filters
    const todayTasks = MOCK_TASKS.filter(t => new Date(t.due).toDateString() === new Date().toDateString());

    const personTasks = selectedPerson
        ? MOCK_TASKS.filter(t => t.assignee === MOCK_MEMBERS.find(m => m.id === selectedPerson)?.name)
        : [];

    const groupTasks = selectedGroup
        ? MOCK_TASKS.filter(t => t.group === selectedGroup && (!fieldFilter || t.field === fieldFilter))
        : [];

    const getProgress = (tasks: any[]) => {
        if (tasks.length === 0) return 0;
        const completed = tasks.filter(t => t.status === "completed").length;
        return Math.round((completed / tasks.length) * 100);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex items-center gap-3 mb-8 shrink-0">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <CheckSquare className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Organization Tasks</h1>
                    <p className="text-muted-foreground">Monitor progress across all workspaces.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-6 shrink-0">
                    <TabsList className="bg-muted/50 p-1 rounded-xl h-auto">
                        <TabsTrigger value="today" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            Today
                        </TabsTrigger>
                        <TabsTrigger value="person" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            Specific Person
                        </TabsTrigger>
                        <TabsTrigger value="group" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            Specific Group
                        </TabsTrigger>
                        <TabsTrigger value="all" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            Entire Team
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Today's Tasks */}
                <TabsContent value="today" className="flex-1 min-h-0">
                    <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
                        <div className="grid gap-4">
                            {todayTasks.map(task => (
                                <div key={task.id} className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("p-2 rounded-full", task.status === 'completed' ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground")}>
                                            {task.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h3 className={cn("font-medium", task.status === 'completed' && "line-through text-muted-foreground")}>{task.title}</h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{new Date(task.due).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                <span>•</span>
                                                <Badge variant="outline" className="text-[10px] h-5">{task.group}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <Avatar className="h-8 w-8 border border-border">
                                        <AvatarFallback className="text-xs">{task.assignee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                </div>
                            ))}
                            {todayTasks.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">No tasks due today.</div>
                            )}
                        </div>
                    </Card>
                </TabsContent>

                {/* Specific Person */}
                <TabsContent value="person" className="flex-1 min-h-0">
                    <div className="grid md:grid-cols-[300px_1fr] gap-6 h-full">
                        <Card className="h-full overflow-hidden flex flex-col">
                            <CardHeader className="pb-3 border-b border-border/50">
                                <CardTitle className="text-sm font-medium">Select Person</CardTitle>
                            </CardHeader>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {MOCK_MEMBERS.map(member => (
                                    <button
                                        key={member.id}
                                        onClick={() => setSelectedPerson(member.id)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                                            selectedPerson === member.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                                        )}
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{member.name}</p>
                                            <p className="text-xs opacity-70">{member.role}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Card>

                        <div className="space-y-6">
                            {selectedPerson ? (
                                <>
                                    <Card>
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-lg">Progress Overview</CardTitle>
                                                    <CardDescription>Completion status for {MOCK_MEMBERS.find(m => m.id === selectedPerson)?.name}</CardDescription>
                                                </div>
                                                <span className="text-2xl font-bold">{getProgress(personTasks)}%</span>
                                            </div>
                                            <Progress value={getProgress(personTasks)} className="h-2 mt-2" />
                                        </CardHeader>
                                    </Card>

                                    <div className="space-y-3">
                                        <h3 className="font-medium text-muted-foreground text-sm uppercase tracking-wider">Assigned Tasks</h3>
                                        {personTasks.map(task => (
                                            <div key={task.id} className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("w-2 h-2 rounded-full", task.status === 'completed' ? "bg-green-500" : "bg-orange-500")} />
                                                    <span className="font-medium">{task.title}</span>
                                                </div>
                                                <Badge variant="secondary">{task.status}</Badge>
                                            </div>
                                        ))}
                                        {personTasks.length === 0 && <p className="text-muted-foreground text-sm">No tasks assigned.</p>}
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
                                    Select a person to view details
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* Specific Group */}
                <TabsContent value="group" className="flex-1 min-h-0">
                    <div className="grid md:grid-cols-[300px_1fr] gap-6 h-full">
                        <Card className="h-full overflow-hidden flex flex-col">
                            <CardHeader className="pb-3 border-b border-border/50">
                                <CardTitle className="text-sm font-medium">Select Group</CardTitle>
                            </CardHeader>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {MOCK_GROUPS.map(group => (
                                    <button
                                        key={group}
                                        onClick={() => setSelectedGroup(group)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                                            selectedGroup === group ? "bg-primary/10 text-primary" : "hover:bg-muted"
                                        )}
                                    >
                                        <LayoutGrid className="w-5 h-5" />
                                        <span className="text-sm font-medium">{group}</span>
                                    </button>
                                ))}
                            </div>
                        </Card>

                        <div className="space-y-6">
                            {selectedGroup ? (
                                <>
                                    {/* Field Filters */}
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-muted-foreground mr-2" />
                                        {["Frontend", "Backend", "AI"].map(field => (
                                            <Badge
                                                key={field}
                                                variant={fieldFilter === field ? "default" : "outline"}
                                                className="cursor-pointer hover:bg-primary/20"
                                                onClick={() => setFieldFilter(fieldFilter === field ? null : field)}
                                            >
                                                {field}
                                            </Badge>
                                        ))}
                                    </div>

                                    <div className="space-y-3">
                                        {groupTasks.map(task => (
                                            <div key={task.id} className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-medium">{task.title}</span>
                                                    <Badge variant="outline" className="text-[10px]">{task.field}</Badge>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="text-[10px]">{task.assignee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm text-muted-foreground">{task.assignee}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {groupTasks.length === 0 && <p className="text-muted-foreground text-sm">No tasks found for this group/filter.</p>}
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
                                    Select a group to view details
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* Entire Team */}
                <TabsContent value="all">
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle></CardHeader>
                                <CardContent><div className="text-2xl font-bold">{MOCK_TASKS.length}</div></CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle></CardHeader>
                                <CardContent><div className="text-2xl font-bold text-green-600">{MOCK_TASKS.filter(t => t.status === 'completed').length}</div></CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle></CardHeader>
                                <CardContent><div className="text-2xl font-bold text-orange-600">{MOCK_TASKS.filter(t => t.status === 'in_progress').length}</div></CardContent>
                            </Card>
                        </div>

                        <div className="bg-card rounded-xl border border-border shadow-sm">
                            <div className="p-4 border-b border-border font-semibold">All Active Tasks</div>
                            <div className="divide-y divide-border">
                                {MOCK_TASKS.map(task => (
                                    <div key={task.id} className="p-4 flex items-center justify-between hover:bg-muted/5">
                                        <span className="font-medium">{task.title}</span>
                                        <div className="flex items-center gap-4">
                                            <Badge variant="secondary">{task.group}</Badge>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <User className="w-4 h-4" />
                                                {task.assignee}
                                            </div>
                                            <Badge variant={task.status === 'completed' ? 'success' : 'outline'}>{task.status}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
