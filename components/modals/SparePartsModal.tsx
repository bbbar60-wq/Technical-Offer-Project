'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Pencil, Trash2, Search, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface SparePartNote {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  type: 'pre-commissioning' | 'two-year';
}

interface SparePartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'pre-commissioning' | 'two-year';
  projectId: string;
}

export default function SparePartsModal({ isOpen, onClose, type, projectId }: SparePartsModalProps) {
  const { user } = useAuthStore();
  const [notes, setNotes] = useState<SparePartNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNote, setEditingNote] = useState<SparePartNote | null>(null);

  // Load notes from localStorage
  useEffect(() => {
    if (isOpen) {
      const storedNotes = localStorage.getItem(`spare-parts-${projectId}-${type}`);
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      } else {
        setNotes([]);
      }
    }
  }, [isOpen, projectId, type]);

  // Save notes to localStorage
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem(`spare-parts-${projectId}-${type}`, JSON.stringify(notes));
    }
  }, [notes, projectId, type]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note =>
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [notes, searchTerm]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note: SparePartNote = {
      id: Date.now().toString(),
      author: user?.fullName || 'Unknown User',
      content: newNote,
      timestamp: new Date().toLocaleString(),
      type
    };

    setNotes(prev => [note, ...prev]);
    setNewNote('');
  };

  const handleEditNote = (note: SparePartNote) => {
    setEditingNote(note);
    setNewNote(note.content);
  };

  const handleUpdateNote = () => {
    if (!editingNote || !newNote.trim()) return;

    setNotes(prev => prev.map(note =>
      note.id === editingNote.id
        ? { ...note, content: newNote, timestamp: new Date().toLocaleString() }
        : note
    ));
    setEditingNote(null);
    setNewNote('');
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setNewNote('');
  };

  const title = type === 'pre-commissioning'
    ? 'Pre-commissioning and Commissioning Spare Parts'
    : 'Two-Year Spare Parts';

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} size="2xl">
      <div className="w-full max-w-4xl h-[70vh] flex flex-col">

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <Input
              placeholder="Search by content or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50"
            />
          </div>
        </div>

        {/* Add/Edit Note Section */}
        <div className="mb-6 p-4 border rounded-lg dark:border-slate-600 bg-muted/50 dark:bg-slate-700/50">
          <label className="block text-sm font-medium mb-2 dark:text-slate-300">
            {editingNote ? 'Edit Note' : 'Add New Note'}
          </label>
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Enter spare parts details, requirements, or notes..."
            rows={4}
            className="w-full mb-3 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50"
          />
          <div className="flex justify-end gap-2">
            {editingNote && (
              <Button variant="outline" onClick={handleCancelEdit} className="dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600">
                Cancel
              </Button>
            )}
            <Button
              onClick={editingNote ? handleUpdateNote : handleAddNote}
              disabled={!newNote.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              {editingNote ? 'Update Note' : 'Add Note'}
            </Button>
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto border rounded-lg dark:border-slate-600">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-neutral-500 dark:text-slate-400">
              <p className="text-sm">No notes found</p>
              <p className="text-xs mt-1">{searchTerm ? 'Try a different search term' : 'Add your first note above'}</p>
            </div>
          ) : (
            <div className="space-y-3 p-4">
              {filteredNotes.map((note) => (
                <div key={note.id} className="p-4 bg-white dark:bg-slate-700 rounded-lg border dark:border-slate-600">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium text-sm dark:text-slate-100">{note.author}</span>
                      <span className="text-xs text-neutral-500 dark:text-slate-400 ml-2">{note.timestamp}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNote(note)}
                        className="h-8 w-8 p-0 dark:text-slate-300 dark:hover:bg-slate-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                        className="h-8 w-8 p-0 text-red-500 dark:text-red-400 dark:hover:bg-slate-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm dark:text-slate-300 whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t dark:border-slate-600">
          <div className="text-sm text-neutral-600 dark:text-slate-400">
            {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} found
          </div>
          <Button variant="outline" onClick={onClose} className="dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600">
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}