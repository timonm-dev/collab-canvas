import { noteAnchor } from "../utils/geometry";
import type { Connection, Note } from "../types";

type Point = { x: number; y: number };

type ConnectionLayerProps = {
  notes: Note[];
  connections: Connection[];
  previewLine: { from: Point; to: Point } | null;
};

export function ConnectionLayer({
  notes,
  connections,
  previewLine,
}: ConnectionLayerProps) {
  const noteMap = new Map(notes.map((n) => [n.id, n]));

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
      {connections.map((conn) => {
        const from = noteMap.get(conn.fromNoteId);
        const to = noteMap.get(conn.toNoteId);
        if (!from || !to) return null;

        const start = noteAnchor(from);
        const end = noteAnchor(to);

        return (
          <line
            key={conn.id}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="#64748b"
            strokeWidth={2}
            strokeLinecap="round"
          />
        );
      })}

      {previewLine && (
        <line
          x1={previewLine.from.x}
          y1={previewLine.from.y}
          x2={previewLine.to.x}
          y2={previewLine.to.y}
          stroke="#94a3b8"
          strokeWidth={2}
          strokeDasharray="6 4"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
