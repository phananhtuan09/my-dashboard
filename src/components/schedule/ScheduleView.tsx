'use client';

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/common/Table';
import { Button } from '@/components/common/Button';
import { Plus, Settings, CalendarRange } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Task, TaskColor } from '@/components/tasks/TaskListView';
import { TimeSlot } from '@/components/time-slots/TimeSlotListView';

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
  red: 'text-red-700 bg-red-100',
  amber: 'text-amber-700 bg-amber-100',
  blue: 'text-blue-700 bg-blue-100',
  green: 'text-green-700 bg-green-100',
  purple: 'text-purple-700 bg-purple-100',
  gray: 'text-gray-700 bg-gray-100',
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
      scheduleRes.data.forEach((item: any) => {
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
          <h1 className="text-2xl font-semibold text-gray-900">Weekly Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">Plan tasks for each time slot during the week.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" className="hidden sm:flex bg-white hover:bg-gray-50 border-gray-200 text-gray-700 shadow-sm" onClick={() => window.location.href='/tasks'}>
            <Settings className="w-4 h-4 mr-2" />
            Manage Tasks
          </Button>
          <Button variant="secondary" size="sm" className="hidden sm:flex bg-white hover:bg-gray-50 border-gray-200 text-gray-700 shadow-sm" onClick={() => window.location.href='/daily'}>
            <CalendarRange className="w-4 h-4 mr-2" />
            Open Today
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={() => window.location.href='/time-slots'}>
            <Plus className="w-4 h-4 mr-2" />
            Add Time Slot
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading schedule...</div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F8FAFC]">
                  <TableHead className="w-[120px] font-semibold text-gray-900 border-b border-gray-200">Time</TableHead>
                  {DAYS.map(day => (
                    <TableHead key={day.id} className="min-w-[140px] font-semibold text-gray-900 border-b border-gray-200">
                      {day.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeSlots.map(slot => (
                  <TableRow key={slot.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="font-medium text-gray-700 bg-[#F8FAFC]/50 whitespace-nowrap">
                      {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                    </TableCell>
                    {DAYS.map(day => {
                      const assignmentKey = `${slot.id}_${day.id}`;
                      const currentTaskId = schedule[assignmentKey]?.taskId || '';
                      
                      return (
                        <TableCell key={day.id} className="p-2 border-l border-gray-100/50">
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
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
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
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider bg-gray-50 px-3 py-2 border-l-4 border-blue-500 rounded-r-md">
                  {day.name}
                </h2>
                <div className="space-y-3 pl-1">
                  {timeSlots.map(slot => {
                    const assignmentKey = `${slot.id}_${day.id}`;
                    const currentTaskId = schedule[assignmentKey]?.taskId || '';
                    
                    return (
                      <div key={slot.id} className="flex flex-col bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-2">
                        <span className="text-sm font-medium text-gray-600 flex items-center">
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
                    <div className="text-sm text-gray-500 italic p-2">No time slots</div>
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
        className={`w-full appearance-none rounded-md border py-2 pl-3 pr-8 text-[13px] font-medium transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer ${
          selectedTask 
            ? colorClass + ' border-transparent shadow-sm' 
            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 shadow-sm hover:border-gray-300'
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
