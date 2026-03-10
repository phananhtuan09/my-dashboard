'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Plus, Pencil, Trash2, X, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  order_index: number;
}

export function TimeSlotListView() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [draftStart, setDraftStart] = useState('');
  const [draftEnd, setDraftEnd] = useState('');

  const fetchSlots = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .order('order_index', { ascending: true });
      
    if (!error && data) {
      setSlots(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    fetchSlots();
  }, []);

  const openCreateModal = () => {
    setEditingSlot(null);
    setDraftStart('');
    setDraftEnd('');
    setIsModalOpen(true);
  };

  const openEditModal = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setDraftStart(slot.start_time);
    setDraftEnd(slot.end_time);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this time slot?')) {
      const { error } = await supabase.from('time_slots').delete().eq('id', id);
      if (!error) {
        setSlots(slots.filter(s => s.id !== id));
      } else {
        alert('Failed to delete time slot.');
      }
    }
  };

  const handleSave = async () => {
    if (!draftStart || !draftEnd) return;
    setSaving(true);

    if (editingSlot) {
      const { data, error } = await supabase
        .from('time_slots')
        .update({ start_time: draftStart, end_time: draftEnd })
        .eq('id', editingSlot.id)
        .select()
        .single();
        
      if (!error && data) {
        setSlots(slots.map(s => s.id === editingSlot.id ? data : s));
        setIsModalOpen(false);
      } else {
        alert('Failed to update time slot.');
      }
    } else {
      const newOrderIndex = slots.length > 0 ? Math.max(...slots.map(s => s.order_index)) + 1 : 1;
      const { data, error } = await supabase
        .from('time_slots')
        .insert({ start_time: draftStart, end_time: draftEnd, order_index: newOrderIndex })
        .select()
        .single();
        
      if (!error && data) {
        setSlots([...slots, data]);
        setIsModalOpen(false);
      } else {
        alert('Failed to create time slot.');
      }
    }
    setSaving(false);
  };

  const moveSlot = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === slots.length - 1) return;

    const newSlots = [...slots];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap order indices
    const tempOrder = newSlots[index].order_index;
    newSlots[index].order_index = newSlots[swapIndex].order_index;
    newSlots[swapIndex].order_index = tempOrder;

    // Sort by new order locally immediately for good UX
    setSlots([...newSlots].sort((a, b) => a.order_index - b.order_index));

    // Update in DB
    await Promise.all([
      supabase.from('time_slots').update({ order_index: newSlots[index].order_index }).eq('id', newSlots[index].id),
      supabase.from('time_slots').update({ order_index: newSlots[swapIndex].order_index }).eq('id', newSlots[swapIndex].id)
    ]);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="h1-title">Time Slot Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the daily blocks of time for your schedule.</p>
        </div>
        
        <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Time Slot
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-text-muted">Loading time slots...</div>
      ) : (
        /* Slots List */
        <Card className="overflow-hidden">
          <div className="flex flex-col">
            {slots.map((slot, index) => (
              <div 
                key={slot.id} 
                className={`flex items-center justify-between p-4 bg-surface transition-colors group ${
                  index !== slots.length - 1 ? 'border-b border-border-default' : ''
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col text-stone-300">
                    <button 
                      onClick={() => moveSlot(index, 'up')}
                      disabled={index === 0}
                      className="p-0.5 hover:text-accent disabled:opacity-30 disabled:hover:text-stone-300 transition-colors"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => moveSlot(index, 'down')}
                      disabled={index === slots.length - 1}
                      className="p-0.5 hover:text-accent disabled:opacity-30 disabled:hover:text-stone-300 transition-colors"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-light text-accent">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary tabular-nums">
                        {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                      </h3>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEditModal(slot)} 
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(slot.id)} 
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {slots.length === 0 && (
              <div className="py-12 text-center">
                 <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-stone-50 mb-4">
                   <Clock className="w-6 h-6 text-stone-400" />
                 </div>
                 <h3 className="text-sm font-medium text-text-primary">No time slots configured</h3>
                 <p className="mt-1 text-sm text-text-secondary mb-4">Create your first time block to get started.</p>
                 <Button onClick={openCreateModal} variant="secondary" size="sm">Add Time Slot</Button>
              </div>
            )}
          </div>
        </Card>
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
                 {editingSlot ? 'Edit Time Slot' : 'Add Time Slot'}
               </h3>
               <button onClick={() => !saving && setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors" disabled={saving}>
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Start Time</label>
                    <Input 
                      type="time"
                      value={draftStart.substring(0, 5)} 
                      onChange={(e) => setDraftStart(e.target.value)}
                      className="w-full tabular-nums"
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">End Time</label>
                    <Input 
                      type="time"
                      value={draftEnd.substring(0, 5)} 
                      onChange={(e) => setDraftEnd(e.target.value)}
                      className="w-full tabular-nums"
                      disabled={saving}
                    />
                  </div>
                </div>
             </div>

             <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
               <Button variant="ghost" onClick={() => !saving && setIsModalOpen(false)} disabled={saving}>Cancel</Button>
               <Button onClick={handleSave} disabled={!draftStart || !draftEnd || saving}>
                 {saving ? 'Saving...' : (editingSlot ? 'Save' : 'Add')}
               </Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
