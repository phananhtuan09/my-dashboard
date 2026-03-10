'use client';

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/common/Table';
import { Button } from '@/components/common/Button';
import { Plus, Settings, CalendarRange } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Task, TaskColor } from '@/components/tasks/TaskListView';
import { TimeSlot } from '@/components/time-slots/TimeSlotListView';
import { cn } from '@/lib/utils';

const DAYS = [
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' },
  { id: 7, name: 'Sunday', short: 'Sun' },
];

const TASK_COLORS: Record<TaskColor, string> = {
  red: 'text-[#B91C1C] bg-[rgba(254,226,226,0.8)] ring-1 ring-inset ring-red-200/60',
  amber: 'text-[#B45309] bg-[rgba(254,243,199,0.8)] ring-1 ring-inset ring-amber-200/60',
  blue: 'text-[#1D4ED8] bg-[rgba(219,234,254,0.8)] ring-1 ring-inset ring-blue-200/60',
  green: 'text-[#065F46] bg-[rgba(209,250,229,0.8)] ring-1 ring-inset ring-emerald-200/60',
  purple: 'text-[#6D28D9] bg-[rgba(237,233,254,0.8)] ring-1 ring-inset ring-violet-200/60',
  gray: 'text-[#475569] bg-[rgba(241,245,249,0.8)] ring-1 ring-inset ring-slate-200/60',
};

export function ScheduleView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [schedule, setSchedule] = useState<Record<string, { id: string, taskId: string }>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    
    const [tasksRes, slotsRes, scheduleRes] = await Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: true }),
      supabase.from('time_slots').select('*').order('start_time', { ascending: true }),
      supabase.from('weekly_schedule').select('*')
    ]);

    if (tasksRes.data) setTasks(tasksRes.data);
    if (slotsRes.data) setTimeSlots(slotsRes.data);
    
    if (scheduleRes.data) {
      const scheduleMap: Record<string, { id: string, taskId: string }> = {};
      scheduleRes.data.forEach((item: { id: string, task_id: string, slot_id: string, day_of_week: number }) => {
        scheduleMap[`${item.slot_id}_${item.day_of_week}`] = { id: item.id, taskId: item.task_id };
      });
      setSchedule(scheduleMap);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (slotId: string, dayId: number, taskId: string) => {
    const assignmentKey = `${slotId}_${dayId}`;
    const existing = schedule[assignmentKey];
    
    // Optimistic UI updates could be added here, but doing it safely with waiting for DB response.
    if (taskId) {
       if (existing) {
          // update
          const { error } = await supabase.from('weekly_schedule').update({ task_id: taskId }).eq('id', existing.id);
          if (!error) setSchedule(p => ({ ...p, [assignmentKey]: { ...existing, taskId } }));
          else alert('Failed to update schedule');
       } else {
          // insert
          const { data, error } = await supabase.from('weekly_schedule').insert({ slot_id: slotId, day_of_week: dayId, task_id: taskId }).select().single();
          if (!error && data) setSchedule(p => ({ ...p, [assignmentKey]: { id: data.id, taskId: data.task_id } }));
          else alert('Failed to assign task');
       }
    } else {
       if (existing) {
          // delete
          const { error } = await supabase.from('weekly_schedule').delete().eq('id', existing.id);
          if (!error) {
             const newSch = { ...schedule };
             delete newSch[assignmentKey];
             setSchedule(newSch);
          } else alert('Failed to remove assignment');
       }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="h1-title">Weekly Schedule</h1>
          <p className="text-sm text-slate-500 mt-1">Plan tasks for each time slot during the week.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" className="hidden sm:flex" onClick={() => window.location.href='/tasks'}>
            <Settings className="w-4 h-4 mr-2" />
            Manage Tasks
          </Button>
          <Button variant="secondary" size="sm" className="hidden sm:flex" onClick={() => window.location.href='/daily'}>
            <CalendarRange className="w-4 h-4 mr-2" />
            Open Today
          </Button>
          <Button size="sm" onClick={() => window.location.href='/time-slots'}>
            <Plus className="w-4 h-4 mr-2" />
            Add Time Slot
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading schedule...</div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Time</TableHead>
                  {DAYS.map(day => {
                    const isToday = day.id === (new Date().getDay() || 7);
                    return (
                      <TableHead key={day.id} className={cn("min-w-[140px]", isToday ? "bg-accent-light text-accent-dark font-bold" : "")}>
                        {day.name}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeSlots.map(slot => (
                  <TableRow key={slot.id}>
                    <TableCell className="font-medium text-text-secondary bg-surface-hover/50 whitespace-nowrap border-r border-border-default">
                      {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                    </TableCell>
                    {DAYS.map(day => {
                      const assignmentKey = `${slot.id}_${day.id}`;
                      const currentTaskId = schedule[assignmentKey]?.taskId || '';
                      
                      return (
                        <TableCell key={day.id} className="p-2 border-l border-[rgba(148,163,184,0.1)]">
                           <TaskSelect 
                             value={currentTaskId} 
                             onChange={(val) => handleAssign(slot.id, day.id, val)}
                             tasks={tasks}
                           />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
                {timeSlots.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                      No time slots available. Add time slots to start scheduling.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-8">
            {DAYS.map(day => (
              <div key={day.id} className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider bg-blue-50/80 px-3 py-2 border-l-4 border-blue-600 rounded-r-md">
                  {day.name}
                </h2>
                <div className="space-y-3 pl-1">
                  {timeSlots.map(slot => {
                    const assignmentKey = `${slot.id}_${day.id}`;
                    const currentTaskId = schedule[assignmentKey]?.taskId || '';
                    
                    return (
                      <div key={slot.id} className="flex flex-col bg-white p-4 rounded-2xl frost-shadow border border-[rgba(148,163,184,0.2)] gap-2">
                        <span className="text-sm font-medium text-slate-600 flex items-center">
                          <CalendarRange className="w-3.5 h-3.5 mr-1.5 opacity-60" />
                          {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                        </span>
                        <TaskSelect 
                          value={currentTaskId} 
                          onChange={(val) => handleAssign(slot.id, day.id, val)}
                          tasks={tasks}
                        />
                      </div>
                    );
                  })}
                  {timeSlots.length === 0 && (
                    <div className="text-sm text-slate-500 italic p-2">No time slots</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TaskSelect({ value, onChange, tasks }: { value: string, onChange: (val: string) => void, tasks: Task[] }) {
  const selectedTask = tasks.find(t => t.id === value);
  const colorClass = selectedTask ? (TASK_COLORS[selectedTask.color] || TASK_COLORS.gray) : '';
  
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none rounded-full py-1.5 pl-3 pr-8 text-[13px] font-medium transition-all focus:ring-2 focus:ring-accent focus:outline-none cursor-pointer ${
          selectedTask 
            ? colorClass
            : 'bg-transparent text-text-muted hover:border-dashed border border-transparent hover:border-border-default'
        }`}
      >
        <option value="" className="text-gray-900 bg-white">Select Task</option>
        {tasks.map(task => (
           <option key={task.id} value={task.id} className="text-gray-900 bg-white shadow-sm">
             {task.name}
           </option>
        ))}
      </select>
      <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${selectedTask ? 'text-current opacity-70' : 'text-gray-400'}`}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
