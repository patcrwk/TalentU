"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { GoalNote } from "@/lib/supabase/types";

export function GoalNotes({ userId, initialNotes }: { userId: string; initialNotes: GoalNote[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isPending, startTransition] = useTransition();

  function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;

    startTransition(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("goal_notes")
        .insert({ user_id: userId, note_text: newNote.trim() })
        .select()
        .single();

      if (data) setNotes((prev) => [data, ...prev]);
      setNewNote("");
    });
  }

  function startEdit(note: GoalNote) {
    setEditingId(note.id);
    setEditingText(note.note_text);
  }

  function saveEdit(id: string) {
    if (!editingText.trim()) return;

    startTransition(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("goal_notes")
        .update({ note_text: editingText.trim() })
        .eq("id", id)
        .select()
        .single();

      if (data) setNotes((prev) => prev.map((n) => (n.id === id ? data : n)));
      setEditingId(null);
    });
  }

  function deleteNote(id: string) {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.from("goal_notes").delete().eq("id", id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    });
  }

  return (
    <div>
      <form onSubmit={addNote} className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="new-note" className="sr-only">
          Add a goal note
        </label>
        <textarea
          id="new-note"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a goal or note..."
          rows={2}
          className="flex-1 rounded-lg border border-black/15 px-3 py-2 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-brand-red px-4 py-2 font-semibold text-white hover:bg-brand-red-dark transition-colors disabled:opacity-60"
        >
          Add
        </button>
      </form>

      <ul className="mt-6 space-y-3">
        {notes.map((note) => (
          <li key={note.id} className="rounded-lg border border-black/10 bg-white p-4">
            {editingId === note.id ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  rows={2}
                  className="rounded-lg border border-black/15 px-3 py-2 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(note.id)}
                    className="rounded-lg bg-brand-navy px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-navy-dark"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-lg border border-black/15 px-3 py-1.5 text-sm font-semibold hover:bg-black/5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <p className="whitespace-pre-wrap text-sm text-black/80">{note.note_text}</p>
                <div className="flex shrink-0 gap-3 text-sm">
                  <button
                    onClick={() => startEdit(note)}
                    className="font-medium text-brand-navy hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="font-medium text-brand-red hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
        {notes.length === 0 && (
          <li className="text-sm text-black/50">No notes yet — add your first goal above.</li>
        )}
      </ul>
    </div>
  );
}
