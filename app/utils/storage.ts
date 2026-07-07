import type { Connection, Note } from "../types";

export const STORAGE_KEY = "collab_canvas_data";

export type CanvasStorage = {
  notes: Note[];
  connections: Connection[];
};

function isNote(value: unknown): value is Note {
  if (!value || typeof value !== "object") return false;
  const n = value as Record<string, unknown>;
  return (
    typeof n.id === "string" &&
    typeof n.x === "number" &&
    typeof n.y === "number" &&
    typeof n.title === "string" &&
    typeof n.description === "string"
  );
}

function isConnection(value: unknown): value is Connection {
  if (!value || typeof value !== "object") return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.fromNoteId === "string" &&
    typeof c.toNoteId === "string"
  );
}

export function loadCanvasData(): CanvasStorage | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const data = parsed as Record<string, unknown>;
    const notes = Array.isArray(data.notes)
      ? data.notes.filter(isNote)
      : [];
    const connections = Array.isArray(data.connections)
      ? data.connections.filter(isConnection)
      : [];

    return { notes, connections };
  } catch {
    return null;
  }
}

export function saveCanvasData(data: CanvasStorage): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
