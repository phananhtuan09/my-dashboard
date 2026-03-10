'use client';

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/common/Table';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { CalendarRange, ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock, XCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type TaskStatus = 'Todo' | 'Doing' | 'Done' | 'Skip';

interface DailyLog {
  id?: string;
  date: string;
  slot_id: string;
  task_id: string;
  status: TaskStatus;
  note: string;
  progress: string;
  // joined fields for UI
  start?: string;
  end?: string;
  job?: string;
  order_index?: number;
}

const STATUS_CONFIG: Record<TaskStatus, { color: 'default' | 'success' | 'warning' | 'info' | 'secondary', icon: React.ElementType }> = {
  Done: { color: 'success', icon: CheckCircle2 },
  Doing: { color: 'info', icon: Clock },
  Todo: { color: 'warning', icon: Circle },
  Skip: { color: 'secondary', icon: XCircle },
};

export function DailyChecklistView() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Basic date handling for "Today"
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const fetchLogs = async (targetDate: Date) => {
    setLoading(true);
    const dateStr = targetDate.toLocaleDateString('en-CA'); // YYYY-MM-DD local format
    let dayOfWeek = targetDate.getDay();
    dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

    // Fetch dependencies
    const [tasksRes, slotsRes, scheduleRes, logsRes] = await Promise.all([
      supabase.from('tasks').select('*'),
      supabase.from('time_slots').select('*').order('start_time', { ascending: true }),
      supabase.from('weekly_schedule').select('*').eq('day_of_week', dayOfWeek),
      supabase.from('daily_logs').select('*').eq('date', dateStr)
    ]);

    const tasks = tasksRes.data || [];
    const slots = slotsRes.data || [];
    const schedule = scheduleRes.data || [];
    let existingLogs = logsRes.data || [];

    const taskMap = new Map(tasks.map(t => [t.id, t]));
    const slotMap = new Map(slots.map(s => [s.id, s]));

    const isPristine = (log: DailyLog) => log.status === 'Todo' && !log.note && log.progress == null;
    const scheduleSlotIds = new Set(schedule.map(s => s.slot_id));
    
    // 1. Delete pristine logs that are no longer in the schedule
    const logsToDelete = existingLogs.filter(log => !scheduleSlotIds.has(log.slot_id) && isPristine(log));
    if (logsToDelete.length > 0) {
      await supabase.from('daily_logs').delete().in('id', logsToDelete.map(l => l.id));
      existingLogs = existingLogs.filter(log => !logsToDelete.find(d => d.id === log.id));
    }

    // 2. Identify missing logs and logs that need a task_id update
    const newLogsToInsert: DailyLog[] = [];
    const logsToUpsert: DailyLog[] = [];

    const existingLogsBySlot = new Map<string, DailyLog[]>();
    existingLogs.forEach(l => {
        if (!existingLogsBySlot.has(l.slot_id)) existingLogsBySlot.set(l.slot_id, []);
        existingLogsBySlot.get(l.slot_id)!.push(l);
    });

    for (const sch of schedule) {
      const logsForSlot = existingLogsBySlot.get(sch.slot_id) || [];
      const exactMatch = logsForSlot.find(l => l.task_id === sch.task_id);
      
      if (!exactMatch) {
         const pristineLog = logsForSlot.find(l => isPristine(l));
         if (pristineLog) {
            pristineLog.task_id = sch.task_id;
            logsToUpsert.push(pristineLog);
         } else {
            newLogsToInsert.push({
              date: dateStr,
              slot_id: sch.slot_id,
              task_id: sch.task_id,
              status: 'Todo',
              note: '',
              progress: ''
            });
         }
      }
    }

    if (logsToUpsert.length > 0) {
      await supabase.from('daily_logs').upsert(logsToUpsert.map(l => ({
        id: l.id,
        date: l.date,
        slot_id: l.slot_id,
        task_id: l.task_id,
        status: l.status,
        note: l.note,
        progress: l.progress
      })));
    }

    if (newLogsToInsert.length > 0) {
      const { data: insertedLogs } = await supabase
        .from('daily_logs')
        .insert(newLogsToInsert)
        .select();
      
      if (insertedLogs) {
        existingLogs = [...existingLogs, ...insertedLogs];
      }
    }

    // Build the UI logs array
    const uiLogs: DailyLog[] = existingLogs.map(log => {
      const slot = slotMap.get(log.slot_id);
      const task = taskMap.get(log.task_id);
      return {
        id: log.id,
        date: log.date,
        slot_id: log.slot_id,
        task_id: log.task_id,
        status: log.status || 'Todo',
        note: log.note || '',
        progress: log.progress != null ? String(log.progress) : '',
        start: slot?.start_time?.substring(0, 5) || '',
        end: slot?.end_time?.substring(0, 5) || '',
        job: task?.name || 'Unknown Task',
        order_index: slot ? parseInt(slot.start_time.replace(':', '')) : 0 
      };
    }).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    setLogs(uiLogs);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs(currentDate);
  }, [currentDate]);

  const handleUpdate = async (updatedLog: DailyLog) => {
    setSaving(true);
    let progressVal: number | null = parseInt(updatedLog.progress);
    if (isNaN(progressVal)) progressVal = null;
    else if (updatedLog.progress.includes('%')) {
        progressVal = parseInt(updatedLog.progress.replace(/\D/g, ''));
    }

    const { error } = await supabase
      .from('daily_logs')
      .update({
        status: updatedLog.status,
        note: updatedLog.note,
        progress: progressVal
      })
      .eq('id', updatedLog.id);

    if (!error) {
      setLogs(logs.map(log => log.id === updatedLog.id ? updatedLog : log));
      setEditingLog(null);
    } else {
      alert('Failed to update log');
    }
    setSaving(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="h1-title">Daily Work Checklist</h1>
          <p className="text-sm text-gray-500 mt-1">Track work completed today.</p>
        </div>
        
        <div className="flex items-center bg-surface border border-border-default rounded-lg p-1 shadow-sm">
          <Button variant="ghost" size="sm" className="px-2" onClick={() => {
            const next = new Date(currentDate);
            next.setDate(next.getDate() - 1);
            setCurrentDate(next);
          }}>
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </Button>
          <div className="flex items-center px-4 font-medium text-sm text-gray-900">
            <CalendarRange className="w-4 h-4 mr-2" />
            {currentDate.toLocaleDateString('en-CA') === new Date().toLocaleDateString('en-CA') ? 'Today' : currentDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
          </div>
          <Button variant="ghost" size="sm" className="px-2" onClick={() => {
            const next = new Date(currentDate);
            next.setDate(next.getDate() + 1);
            setCurrentDate(next);
          }}>
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading daily tasks...</div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Start</TableHead>
                  <TableHead className="w-[100px]">End</TableHead>
                  <TableHead className="w-[250px]">Job</TableHead>
                  <TableHead className="w-[130px]">Status</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const statusConfig = STATUS_CONFIG[log.status] || STATUS_CONFIG.Todo;
                  const StatusIcon = statusConfig.icon;
                  
                  const statusBorderClass = log.status === 'Done' ? 'border-emerald-500' 
                    : log.status === 'Doing' ? 'border-accent' 
                    : log.status === 'Todo' ? 'border-stone-300' 
                    : 'border-border-default';

                  return (
                    <TableRow 
                      key={log.id} 
                      className="cursor-pointer"
                      onClick={() => setEditingLog(log)}
                    >
                      <TableCell className={cn("font-medium text-text-secondary border-l-2", statusBorderClass)}>{log.start}</TableCell>
                      <TableCell className="font-medium text-text-secondary">{log.end}</TableCell>
                      <TableCell className="font-medium text-text-primary">{log.job}</TableCell>
                      <TableCell>
                        <Badge variant={statusConfig.color} className="flex w-max items-center">
                          <StatusIcon className="w-3.5 h-3.5 mr-1" />
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-text-secondary text-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            {log.note || <span className="opacity-50 italic">No notes</span>}
                          </div>
                          {log.progress && (
                            <div className="w-16 h-1.5 bg-border-subtle rounded-full overflow-hidden" title={`${log.progress}%`}>
                               <div className="h-full bg-accent transition-all" style={{ width: `${log.progress}%` }} />
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500 italic">
                      No tasks scheduled for this day. Go to Weekly Schedule to add tasks.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {logs.map(log => {
              const statusConfig = STATUS_CONFIG[log.status] || STATUS_CONFIG.Todo;
              const StatusIcon = statusConfig.icon;
              
              return (
                <Card 
                  key={log.id} 
                  className="p-4 cursor-pointer hover:border-blue-300 transition-colors"
                  onClick={() => setEditingLog(log)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900">{log.job}</h3>
                    <Badge variant={statusConfig.color} className="flex items-center">
                      <StatusIcon className="w-3.5 h-3.5 mr-1" />
                      {log.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-3 font-medium">
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    {log.start} - {log.end}
                  </div>

                  {(log.note || log.progress) && (
                    <div className="bg-gray-50 rounded p-3 text-sm text-gray-600 border border-gray-100">
                      <div className="flex justify-between items-start">
                        <p>{log.note || <span className="italic opacity-50">No note for this task.</span>}</p>
                        {log.progress && <span className="text-xs font-semibold px-2 py-0.5 bg-white border border-gray-200 rounded">{log.progress}%</span>}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
            
            {logs.length === 0 && (
               <div className="text-center py-8 text-gray-500 italic bg-white rounded-xl shadow-sm border border-gray-200">
                 No tasks scheduled for this day.
               </div>
            )}
          </div>
        </>
      )}

      {/* Edit Modal (Simple overlay implementation) */}
      {editingLog && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity" onClick={() => !saving && setEditingLog(null)}>
           <div 
             className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
             onClick={(e) => e.stopPropagation()}
           >
             <div className="flex justify-between items-center p-4 border-b border-gray-100">
               <h3 className="font-semibold text-gray-900 border-l-4 border-blue-500 pl-2">Edit Progress</h3>
               <button onClick={() => !saving && setEditingLog(null)} className="text-gray-400 hover:text-gray-600 transition-colors" disabled={saving}>
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="p-5 space-y-5">
               <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Task</div>
                  <div className="font-semibold text-gray-900">{editingLog.job}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{editingLog.start} - {editingLog.end}</div>
               </div>
               
               <div className="space-y-4">
                 <div className="space-y-1.5">
                   <label className="text-sm font-medium text-gray-700">Status</label>
                   <Select 
                     value={editingLog.status} 
                     onChange={(e) => setEditingLog({...editingLog, status: e.target.value as TaskStatus})}
                     disabled={saving}
                   >
                     <option value="Todo">Todo</option>
                     <option value="Doing">Doing</option>
                     <option value="Done">Done</option>
                     <option value="Skip">Skip</option>
                   </Select>
                 </div>

                 <div className="space-y-1.5">
                   <label className="text-sm font-medium text-gray-700">Progress (%)</label>
                   <Input 
                     type="number"
                     min="0"
                     max="100"
                     value={editingLog.progress} 
                     onChange={(e) => setEditingLog({...editingLog, progress: e.target.value})}
                     placeholder="e.g. 50"
                     disabled={saving}
                   />
                 </div>

                 <div className="space-y-1.5">
                   <label className="text-sm font-medium text-gray-700">Note</label>
                   <textarea 
                     value={editingLog.note} 
                     onChange={(e) => setEditingLog({...editingLog, note: e.target.value})}
                     className="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:outline-none disabled:opacity-50"
                     placeholder="Add your notes here..."
                     disabled={saving}
                   />
                 </div>
               </div>
             </div>

             <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
               <Button variant="ghost" onClick={() => setEditingLog(null)} disabled={saving}>Cancel</Button>
               <Button onClick={() => handleUpdate(editingLog)} disabled={saving}>
                 {saving ? 'Saving...' : 'Save Changes'}
               </Button>
             </div>
           </div>
         </div>
      )}
    </div>
  );
}
