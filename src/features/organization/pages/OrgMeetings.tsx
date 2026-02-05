import { useState } from "react";
import {
    Video,
    Plus,
    Calendar as CalendarIcon,
    Clock,
    Users,
    Building2,
    User,
    LayoutGrid
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter
} from "@/shared/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { CalendarView } from "@/features/meetings/components/CalendarView";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

// Mock Data
const MOCK_MEETINGS = [
    {
        _id: 'm1',
        title: "Weekly All Hands",
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        status: 'scheduled',
        organizer: { name: "Kris Patel", email: "kris@orbix.ai" },
        participants: [],
        createdAt: new Date().toISOString(),
        recordingIds: []
    },
    {
        _id: 'm2',
        title: "Frontend Sync",
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 90000000).toISOString(),
        status: 'upcoming',
        organizer: { name: "Sarah Jones", email: "sarah@orbix.ai" },
        participants: [],
        createdAt: new Date().toISOString(),
        recordingIds: []
    }
];

const MOCK_GROUPS = ["Frontend", "Backend", "AI Team", "Design", "Marketing"];
const MOCK_MEMBERS = ["Sarah Jones", "Alex Chen", "Mike Ross", "Emily White"];

type MeetingType = 'one_on_one' | 'group' | 'all_hands';

export default function OrgMeetings() {
    const [meetings, setMeetings] = useState<any[]>(MOCK_MEETINGS);
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [meetingType, setMeetingType] = useState<MeetingType>('one_on_one');

    // Form State
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [selectedEntity, setSelectedEntity] = useState(""); // Person ID or Group ID

    const handleCreateMeeting = () => {
        if (!title || !date || !time) {
            toast.error("Please fill in all required fields");
            return;
        }

        const newMeeting = {
            _id: Math.random().toString(36).substr(2, 9),
            title,
            startTime: new Date(`${date}T${time}`).toISOString(),
            endTime: new Date(`${date}T${time}`).toISOString(), // Mock end time
            status: 'upcoming',
            organizer: { name: "You", email: "you@orbix.ai" },
            participants: [],
            createdAt: new Date().toISOString(),
            recordingIds: []
        };

        setMeetings([...meetings, newMeeting]);
        setIsScheduleOpen(false);
        toast.success("Meeting scheduled successfully");

        // Reset form
        setTitle("");
        setDate("");
        setTime("");
        setSelectedEntity("");
    };

    return (
        <div className="p-8 h-full flex flex-col max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between mb-8 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <Video className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Organization Meetings</h1>
                        <p className="text-muted-foreground">Schedule and manage meetings organization-wide.</p>
                    </div>
                </div>

                <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
                    <DialogTrigger asChild>
                        <Button variant="gradient" className="shadow-lg hover:shadow-xl">
                            <Plus className="w-4 h-4 mr-2" />
                            Schedule Meeting
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] gap-0 p-0 overflow-hidden rounded-2xl">
                        <DialogHeader className="p-6 pb-4 bg-muted/30">
                            <DialogTitle className="text-xl">Schedule New Meeting</DialogTitle>
                            <DialogDescription>
                                Create a meeting for individuals, groups, or the entire organization.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <Label>Meeting Type</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => setMeetingType('one_on_one')}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2",
                                            meetingType === 'one_on_one' ? "bg-primary/10 border-primary text-primary" : "bg-card border-border hover:bg-muted"
                                        )}
                                    >
                                        <User className="w-5 h-5" />
                                        <span className="text-xs font-medium">1:1</span>
                                    </button>
                                    <button
                                        onClick={() => setMeetingType('group')}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2",
                                            meetingType === 'group' ? "bg-primary/10 border-primary text-primary" : "bg-card border-border hover:bg-muted"
                                        )}
                                    >
                                        <LayoutGrid className="w-5 h-5" />
                                        <span className="text-xs font-medium">Group</span>
                                    </button>
                                    <button
                                        onClick={() => setMeetingType('all_hands')}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2",
                                            meetingType === 'all_hands' ? "bg-primary/10 border-primary text-primary" : "bg-card border-border hover:bg-muted"
                                        )}
                                    >
                                        <Building2 className="w-5 h-5" />
                                        <span className="text-xs font-medium">All Hands</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Meeting Title</Label>
                                <Input
                                    placeholder="e.g., Weekly Sync"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            {/* Dynamic Recipient Field */}
                            {meetingType !== 'all_hands' && (
                                <div className="space-y-2">
                                    <Label>{meetingType === 'one_on_one' ? "Select Person" : "Select Group"}</Label>
                                    <Select onValueChange={setSelectedEntity}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={meetingType === 'one_on_one' ? "Choose member..." : "Choose group..."} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {meetingType === 'one_on_one'
                                                ? MOCK_MEMBERS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)
                                                : MOCK_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Time</Label>
                                    <Input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-6 pt-2 bg-muted/30">
                            <Button variant="outline" onClick={() => setIsScheduleOpen(false)}>Cancel</Button>
                            <Button variant="gradient" onClick={handleCreateMeeting}>Schedule Meeting</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex-1 bg-card/50 rounded-2xl border border-border overflow-hidden flex flex-col">
                {/* Reusing the Calendar View Component */}
                <div className="flex-1 p-4 overflow-hidden">
                    <CalendarView
                        meetings={meetings}
                        onSelectMeeting={(m) => toast.info(`Selected meeting: ${m.title}`)}
                    />
                </div>
            </div>
        </div>
    );
}
