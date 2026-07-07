import { NOTE_SIZE, type Note } from "../types";

export type Point = { x: number; y: number };

/** Unterkante, zentriert – Ankerpunkt für Verbindungen */
export function noteAnchor(note: Note): Point {
  return {
    x: note.x + NOTE_SIZE / 2,
    y: note.y + NOTE_SIZE,
  };
}

export function getCanvasPoint(
  e: { clientX: number; clientY: number },
  canvas: HTMLElement
): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

export function noteIdFromElement(el: Element | null): string | null {
  return el?.closest("[data-note-id]")?.getAttribute("data-note-id") ?? null;
}
