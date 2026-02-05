import { useState } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from "date-fns";
import { ChevronLeft, ChevronRight, Clock, Video } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/components/ui/badge";

interface Meeting {
    _id: string;
    title: string;
    agenda?: string;
    organizer: { name: string; email: string };
    status: 'scheduled' | 'in_progress' | 'ended' | 'cancelled' | 'upcoming';
    startTime: string | null;
    endTime: string | null;
    participants: any[];
    createdAt: string;
    recordingIds: string[];
    aiSummaryId?: string;
}

interface CalendarViewProps {
    meetings: Meeting[];
    onSelectMeeting: (meeting: Meeting) => void;
}

export const CalendarView = ({ meetings, onSelectMeeting }: CalendarViewProps) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const getMeetingsForDay = (date: Date) => {
        return meetings.filter(meeting => {
            if (!meeting.startTime) return false;
            return isSameDay(new Date(meeting.startTime), date);
        }).sort((a, b) => {
            if (!a.startTime || !b.startTime) return 0;
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        });
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    return (
        <div className="flex flex-col h-full glass-card rounded-[24px] border border-white/10 shadow-sm overflow-hidden animate-fade-in">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                        {format(currentDate, "MMMM yyyy")}
                    </h2>
                    <Badge variant="outline" className="text-xs font-medium border-white/10 bg-white/5 text-muted-foreground px-2.5 py-0.5">
                        {meetings.filter(m => m.startTime && isSameMonth(new Date(m.startTime), currentDate)).length} meetings
                    </Badge>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 rounded-lg p-1 border border-white/5">
                    <Button variant="ghost" size="sm" onClick={goToToday} className="h-7 text-xs font-semibold hover:bg-white/10 rounded-md">
                        Today
                    </Button>
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <Button variant="ghost" size="icon" onClick={prevMonth} className="h-7 w-7 hover:bg-white/10 rounded-md">
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7 hover:bg-white/10 rounded-md">
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.01]">
                {weekDays.map(day => (
                    <div key={day} className="py-3 text-center text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[2px]">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-transparent">
                {days.map((day, dayIdx) => {
                    const dayMeetings = getMeetingsForDay(day);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isDayToday = isToday(day);

                    return (
                        <div
                            key={day.toString()}
                            className={cn(
                                "min-h-[120px] p-2 border-b border-r border-white/5 relative group transition-all duration-300 hover:bg-white/[0.02]",
                                !isCurrentMonth && "bg-black/20 text-muted-foreground/50",
                                isDayToday && "bg-primary/5 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]"
                            )}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span
                                    className={cn(
                                        "text-xs font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-all",
                                        isDayToday
                                            ? "bg-primary text-white shadow-lg shadow-primary/30"
                                            : "text-muted-foreground/80 group-hover:text-foreground group-hover:bg-white/5"
                                    )}
                                >
                                    {format(day, "d")}
                                </span>
                                {dayMeetings.length > 0 && (
                                    <span className="text-[10px] font-bold text-muted-foreground/50 lg:hidden">
                                        {dayMeetings.length}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1.5 overflow-y-auto max-h-[100px] custom-scrollbar pr-1">
                                {dayMeetings.map(meeting => (
                                    <button
                                        key={meeting._id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectMeeting(meeting);
                                        }}
                                        className={cn(
                                            "w-full text-left text-[11px] py-1.5 px-2 rounded-lg border mb-0.5 truncate flex items-center gap-1.5 transition-all duration-200 group/item",
                                            meeting.status === 'in_progress'
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                                : meeting.status === 'ended'
                                                    ? "bg-white/5 text-muted-foreground border-white/5 line-through decoration-white/20 opacity-60 hover:opacity-100"
                                                    : "bg-white/5 text-foreground/90 border-white/5 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full shrink-0 shadow-sm",
                                            meeting.status === 'in_progress' ? "bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]" : "bg-primary"
                                        )} />
                                        <span className="truncate font-medium flex-1">{meeting.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
