export type ToolMode = "select" | "create" | "connect";

export type Note = {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string;
};

export type Connection = {
  id: string;
  fromNoteId: string;
  toNoteId: string;
};

export type EditingField = {
  noteId: string;
  field: "title" | "description";
};

export const NOTE_SIZE = 160;

export const TOOLS: { mode: ToolMode; label: string }[] = [
  { mode: "select", label: "Auswählen" },
  { mode: "create", label: "Erstellen" },
  { mode: "connect", label: "Verbinden" },
];
