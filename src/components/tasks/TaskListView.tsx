'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export type TaskColor = 'red' | 'amber' | 'blue' | 'green' | 'purple' | 'gray';

export interface Task {
  id: string;
  name: string;
  color: TaskColor;
}

const TASK_COLORS: Record<TaskColor, { label: string, bg: string, text: string, ring: string, indicator: string }> = {
  red:    { label: 'Red',    bg: 'bg-[rgba(254,226,226,0.8)]',   text: 'text-[#B91C1C]',   ring: 'ring-1 ring-inset ring-red-200/60', indicator: 'bg-red-500' },
  amber:  { label: 'Yellow', bg: 'bg-[rgba(254,243,199,0.8)]', text: 'text-[#B45309]', ring: 'ring-1 ring-inset ring-amber-200/60', indicator: 'bg-amber-500' },
  blue:   { label: 'Blue',   bg: 'bg-[rgba(219,234,254,0.8)]',  text: 'text-[#1D4ED8]', ring: 'ring-1 ring-inset ring-blue-200/60', indicator: 'bg-blue-500' },
  green:  { label: 'Green',  bg: 'bg-[rgba(209,250,229,0.8)]', text: 'text-[#065F46]', ring: 'ring-1 ring-inset ring-emerald-200/60', indicator: 'bg-green-500' },
  purple: { label: 'Purple', bg: 'bg-[rgba(237,233,254,0.8)]',text: 'text-[#6D28D9]', ring: 'ring-1 ring-inset ring-violet-200/60', indicator: 'bg-purple-500' },
  gray:   { label: 'Gray',   bg: 'bg-[rgba(241,245,249,0.8)]',  text: 'text-[#475569]',  ring: 'ring-1 ring-inset ring-slate-200/60', indicator: 'bg-gray-500' },
};

export function TaskListView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [draftName, setDraftName] = useState('');
  const [draftColor, setDraftColor] = useState<TaskColor>('blue');

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true });
      
    if (!error && data) {
      setTasks(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    fetchTasks();
  }, []);

  const openCreateModal = () => {
    setEditingTask(null);
    setDraftName('');
    setDraftColor('blue');
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setDraftName(task.name);
    setDraftColor(task.color);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (!error) {
        setTasks(tasks.filter(t => t.id !== id));
      } else {
        alert('Failed to delete task.');
      }
    }
  };

  const handleSave = async () => {
    if (!draftName.trim()) return;
    setSaving(true);
    
    if (editingTask) {
      // Update existing
      const { error, data } = await supabase
        .from('tasks')
        .update({ name: draftName, color: draftColor })
        .eq('id', editingTask.id)
        .select()
        .single();
        
      if (!error && data) {
        setTasks(tasks.map(t => t.id === editingTask.id ? data : t));
        setIsModalOpen(false);
      } else {
        alert('Failed to update task.');
      }
    } else {
      // Create new
      const { error, data } = await supabase
        .from('tasks')
        .insert({ name: draftName, color: draftColor })
        .select()
        .single();
        
      if (!error && data) {
        setTasks([...tasks, data]);
        setIsModalOpen(false);
      } else {
        alert('Failed to create task.');
      }
    }
    setSaving(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="h1-title">Task Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage your available tasks.</p>
        </div>
        
        <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading tasks...</div>
      ) : (
        <>
          {/* Task List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map(task => {
              const colorConfig = TASK_COLORS[task.color] || TASK_COLORS.gray;
              return (
                <Card key={task.id} className="relative group p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${colorConfig.indicator}`} />
                      <h3 className="font-medium text-text-primary leading-tight">{task.name}</h3>
                    </div>
                    
                    {/* Actions - visible on hover for desktop, always visible on mobile */}
                    <div className="flex flex-col gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(task)} 
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(task.id)} 
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
            
            {/* Empty State */}
            {tasks.length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
                 <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-gray-50 mb-4">
                   <Plus className="w-6 h-6 text-gray-400" />
                 </div>
                 <h3 className="text-sm font-medium text-gray-900">No tasks created</h3>
                 <p className="mt-1 text-sm text-gray-500 mb-4">Get started by creating a new task.</p>
                 <Button onClick={openCreateModal} variant="secondary" size="sm">Create Task</Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal for Create/Edit Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity" onClick={() => !saving && setIsModalOpen(false)}>
          <div 
            className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
             <div className="flex justify-between items-center p-4 border-b border-gray-100">
               <h3 className="font-semibold text-gray-900">
                 {editingTask ? 'Edit Task' : 'Create Task'}
               </h3>
               <button onClick={() => !saving && setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors" disabled={saving}>
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="p-5 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Task Name</label>
                  <Input 
                    value={draftName} 
                    onChange={(e) => setDraftName(e.target.value)}
                    placeholder="e.g. English Listening"
                    autoFocus
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tag Color</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(TASK_COLORS) as TaskColor[]).map((color) => {
                      const cfg = TASK_COLORS[color];
                      const isSelected = draftColor === color;
                      return (
                        <button
                          key={color}
                          type="button"
                          disabled={saving}
                          onClick={() => setDraftColor(color)}
                          className={`flex items-center justify-center py-1.5 px-2 rounded-md border text-xs font-medium transition-all ${
                            isSelected 
                              ? `border-blue-500 ring-1 ring-blue-500 ${cfg.bg} ${cfg.text}` 
                              : `border-transparent ${cfg.bg} ${cfg.text} ${cfg.ring} hover:opacity-80`
                          } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
             </div>

             <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
               <Button variant="ghost" onClick={() => !saving && setIsModalOpen(false)} disabled={saving}>Cancel</Button>
               <Button onClick={handleSave} disabled={!draftName.trim() || saving}>
                 {saving ? 'Saving...' : (editingTask ? 'Save' : 'Create')}
               </Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
