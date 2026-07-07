"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CanvasToolbar } from "./components/CanvasToolbar";
import { ConnectionLayer } from "./components/ConnectionLayer";
import { StickyNote } from "./components/StickyNote";
import {
  getCanvasPoint,
  noteAnchor,
  noteIdFromElement,
} from "./utils/geometry";
import { loadCanvasData, saveCanvasData } from "./utils/storage";
import {
  type Connection,
  type EditingField,
  type Note,
  type ToolMode,
} from "./types";

const DEFAULT_NOTES: Note[] = [
  {
    id: "1",
    x: 280,
    y: 120,
    title: "MVP",
    description: "Erstmal Notes + Verbindungen. Rest später.",
  },
  {
    id: "2",
    x: 480,
    y: 220,
    title: "Drag testen",
    description: "Window-Level mouseup, damit nichts kleben bleibt.",
  },
  {
    id: "3",
    x: 680,
    y: 160,
    title: "Sync?",
    description: "Supabase vielleicht. @Timon fragen.",
  },
];

type DragState = {
  noteId: string;
  offsetX: number;
  offsetY: number;
};

export default function Home() {
  const [activeTool, setActiveTool] = useState<ToolMode>("select");
  const [notes, setNotes] = useState<Note[]>(DEFAULT_NOTES);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
  const [snapTargetId, setSnapTargetId] = useState<string | null>(null);
  const [previewEnd, setPreviewEnd] = useState<{ x: number; y: number } | null>(
    null
  );

  const canvasRef = useRef<HTMLElement>(null);
  const draggingRef = useRef<DragState | null>(null);
  const connectingFromRef = useRef<string | null>(null);
  const snapTargetRef = useRef<string | null>(null);
  const notesRef = useRef(notes);
  const movedWhileDragging = useRef(false);

  draggingRef.current = dragging;
  connectingFromRef.current = connectingFromId;
  snapTargetRef.current = snapTargetId;
  notesRef.current = notes;

  // Beim Mount: gespeicherte Daten aus localStorage laden (nur Client)
  useEffect(() => {
    const saved = loadCanvasData();
    if (saved) {
      setNotes(saved.notes);
      setConnections(saved.connections);
    }
    setIsHydrated(true);
  }, []);

  // Änderungen persistieren – leicht debounced, damit Drag nicht ständig schreibt
  useEffect(() => {
    if (!isHydrated) return;

    const timeout = setTimeout(() => {
      saveCanvasData({ notes, connections });
    }, 300);

    return () => clearTimeout(timeout);
  }, [notes, connections, isHydrated]);

  const users = [
    { initial: "A", color: "bg-blue-500" },
    { initial: "B", color: "bg-green-500" },
    { initial: "C", color: "bg-amber-500" },
  ];

  const patchNote = useCallback((id: string, patch: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...patch } : n))
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setConnections((prev) =>
      prev.filter((c) => c.fromNoteId !== id && c.toNoteId !== id)
    );
    setEditingField((current) =>
      current?.noteId === id ? null : current
    );
  }, []);

  const addConnection = useCallback((fromNoteId: string, toNoteId: string) => {
    if (fromNoteId === toNoteId) return;

    setConnections((prev) => {
      const exists = prev.some(
        (c) =>
          (c.fromNoteId === fromNoteId && c.toNoteId === toNoteId) ||
          (c.fromNoteId === toNoteId && c.toNoteId === fromNoteId)
      );
      if (exists) return prev;

      return [
        ...prev,
        { id: crypto.randomUUID(), fromNoteId, toNoteId },
      ];
    });
  }, []);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (activeTool !== "create" || e.target !== e.currentTarget) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasPoint(e, canvas);
    const id = crypto.randomUUID();

    setNotes((prev) => [
      ...prev,
      { id, x, y, title: "", description: "" },
    ]);
    setEditingField({ noteId: id, field: "title" });
  };

  const handleNoteMouseDown = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    if (activeTool !== "select" || editingField) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasPoint(e, canvas);
    setDragging({
      noteId: note.id,
      offsetX: x - note.x,
      offsetY: y - note.y,
    });
    movedWhileDragging.current = false;
  };

  const handleAnchorMouseDown = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();

    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    const anchor = noteAnchor(note);
    setConnectingFromId(noteId);
    setPreviewEnd(anchor);
    setSnapTargetId(null);
  };

  // Window-Listener für Drag & Connect – mouseup feuert überall zuverlässig
  useEffect(() => {
    if (!dragging && !connectingFromId) return;

    const onMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const point = getCanvasPoint(e, canvas);
      const activeDrag = draggingRef.current;

      if (activeDrag) {
        movedWhileDragging.current = true;
        patchNote(activeDrag.noteId, {
          x: point.x - activeDrag.offsetX,
          y: point.y - activeDrag.offsetY,
        });
        return;
      }

      const fromId = connectingFromRef.current;
      if (!fromId) return;

      const hoveredId = noteIdFromElement(document.elementFromPoint(e.clientX, e.clientY));
      const hoveredNote = hoveredId
        ? notesRef.current.find((n) => n.id === hoveredId)
        : null;

      if (hoveredNote && hoveredId !== fromId) {
        setSnapTargetId(hoveredId);
        setPreviewEnd(noteAnchor(hoveredNote));
      } else {
        setSnapTargetId(null);
        setPreviewEnd(point);
      }
    };

    const onUp = () => {
      if (draggingRef.current) {
        setDragging(null);
      }

      const fromId = connectingFromRef.current;
      if (fromId) {
        const toId = snapTargetRef.current;
        if (toId && toId !== fromId) {
          addConnection(fromId, toId);
        }

        setConnectingFromId(null);
        setSnapTargetId(null);
        setPreviewEnd(null);
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, connectingFromId, patchNote, addConnection]);

  const tryStartEdit = (noteId: string, field: "title" | "description") => {
    if (activeTool !== "select") return;
    if (movedWhileDragging.current) {
      movedWhileDragging.current = false;
      return;
    }
    setEditingField({ noteId, field });
  };

  const fromNote = connectingFromId
    ? notes.find((n) => n.id === connectingFromId)
    : null;

  const previewLine =
    fromNote && previewEnd
      ? { from: noteAnchor(fromNote), to: previewEnd }
      : null;

  const shouldShowAnchor = (noteId: string) =>
    activeTool === "connect" ||
    connectingFromId !== null ||
    snapTargetId === noteId;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <span className="font-bold text-slate-900 text-lg tracking-tight">
          CollabCanvas
        </span>
        <div className="flex -space-x-2">
          {users.map((user) => (
            <div
              key={user.initial}
              className={`w-8 h-8 rounded-full ${user.color} flex items-center justify-center text-white text-xs font-medium ring-2 ring-white`}
            >
              {user.initial}
            </div>
          ))}
        </div>
      </nav>

      <main
        ref={canvasRef}
        className={`relative flex-1 overflow-hidden ${
          activeTool === "create" ? "cursor-crosshair" : ""
        }`}
        onMouseDown={handleCanvasMouseDown}
      >
        <CanvasToolbar activeTool={activeTool} onToolChange={setActiveTool} />

        <ConnectionLayer
          notes={notes}
          connections={connections}
          previewLine={previewLine}
        />

        {notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            activeTool={activeTool}
            isDragging={dragging?.noteId === note.id}
            editingField={editingField}
            showAnchor={shouldShowAnchor(note.id)}
            isSnapTarget={snapTargetId === note.id}
            onMouseDown={(e) => handleNoteMouseDown(e, note)}
            onAnchorMouseDown={(e) => handleAnchorMouseDown(e, note.id)}
            onDelete={() => deleteNote(note.id)}
            onTitleChange={(title) => patchNote(note.id, { title })}
            onDescriptionChange={(description) =>
              patchNote(note.id, { description })
            }
            onStartEdit={(field) => tryStartEdit(note.id, field)}
            onStopEdit={() => setEditingField(null)}
          />
        ))}
      </main>
    </div>
  );
}
