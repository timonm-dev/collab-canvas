"use client";

import { useRef, useState } from "react";

const defaultCards = [
  {
    id: "1",
    title: "Titel 1",
    text: "Text 1",
    color: "bg-blue-100",
    x: 288,
    y: 128,
  },
  {
    id: "2",
    title: "Titel 2",
    text: "Text 2",
    color: "bg-green-100",
    x: 448,
    y: 224,
  },
  {
    id: "3",
    title: "Titel 3",
    text: "Titel 3",
    color: "bg-amber-100",
    x: 704,
    y: 176,
  },
];

export default function Home() {
  const tools = ["Auswählen", "Neuer Eintrag", "Verbinden", "Löschen"];

  const [activeTool, setActiveTool] = useState("Auswählen");
  const [cards, setCards] = useState(defaultCards);
  const [editing, setEditing] = useState<{ id: string; field: "title" | "text" } | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const mainRef = useRef<HTMLElement>(null);
  const movedWhileDragging = useRef(false);

  const users = [
    { initial: "A", color: "bg-blue-500" },
    { initial: "B", color: "bg-green-500" },
    { initial: "C", color: "bg-amber-500" },
  ];

  function patchCard(id: string, field: "title" | "text", value: string) {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  }

  function stopEditing() {
    setEditing(null);
  }

  const isEditing = (id: string, field: "title" | "text") =>
    editing?.id === id && editing.field === field;

  function startDrag(e: React.MouseEvent, cardId: string) {
    if (activeTool !== "Auswählen" || editing) return;

    const main = mainRef.current;
    if (!main) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const rect = main.getBoundingClientRect();

    // Offset merken, damit die Karte beim Klicken nicht springt
    setDragging({
      id: cardId,
      offsetX: e.clientX - rect.left - card.x,
      offsetY: e.clientY - rect.top - card.y,
    });
    movedWhileDragging.current = false;
  }

  function onCanvasMouseMove(e: React.MouseEvent) {
    if (!dragging || !mainRef.current) return;

    movedWhileDragging.current = true;
    const rect = mainRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragging.offsetX;
    const y = e.clientY - rect.top - dragging.offsetY;

    setCards((prev) =>
      prev.map((c) => (c.id === dragging.id ? { ...c, x, y } : c))
    );
  }

  function stopDrag() {
    // Drag-State zurücksetzen
    setDragging(null);
  }

  function tryEdit(id: string, field: "title" | "text") {
    if (movedWhileDragging.current) {
      movedWhileDragging.current = false;
      return;
    }
    setEditing({ id, field });
  }

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
        ref={mainRef}
        className="relative flex-1 overflow-hidden"
        onMouseMove={onCanvasMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        <aside className="absolute top-6 left-6 z-10 bg-white rounded-xl shadow-md border border-slate-200 p-3 w-40">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
            Tools
          </p>
          {tools.map((tool) => (
            <button
              key={tool}
              onClick={() => setActiveTool(tool)}
              className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                activeTool === tool
                  ? "bg-blue-100 text-blue-800 font-medium"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {tool}
            </button>
          ))}
        </aside>

        {cards.map((card) => (
          <div
            key={card.id}
            style={{ left: card.x, top: card.y }}
            onMouseDown={(e) => startDrag(e, card.id)}
            className={`absolute w-56 ${card.color} rounded-xl shadow-md p-4 border border-white/60 select-none ${
              activeTool === "Auswählen" ? "cursor-grab active:cursor-grabbing" : ""
            } ${dragging?.id === card.id ? "cursor-grabbing shadow-lg" : ""}`}
          >
            {/* quick inline edit */}
            {isEditing(card.id, "title") ? (
              <input
                autoFocus
                value={card.title}
                onChange={(e) => patchCard(card.id, "title", e.target.value)}
                onBlur={stopEditing}
                onKeyDown={(e) => e.key === "Enter" && stopEditing()}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-full font-semibold text-slate-800 mb-1 bg-white/60 rounded px-1 outline-none ring-1 ring-blue-300"
              />
            ) : (
              <h3
                onClick={() => tryEdit(card.id, "title")}
                className="font-semibold text-slate-800 mb-1 cursor-text hover:ring-1 hover:ring-blue-200 rounded px-1 -mx-1"
              >
                {card.title}
              </h3>
            )}

            {isEditing(card.id, "text") ? (
              <textarea
                autoFocus
                value={card.text}
                onChange={(e) => patchCard(card.id, "text", e.target.value)}
                onBlur={stopEditing}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    stopEditing();
                  }
                }}
                onMouseDown={(e) => e.stopPropagation()}
                rows={3}
                className="w-full text-sm text-slate-600 leading-relaxed bg-white/60 rounded px-1 outline-none ring-1 ring-blue-300 resize-none"
              />
            ) : (
              <p
                onClick={() => tryEdit(card.id, "text")}
                className="text-sm text-slate-600 leading-relaxed cursor-text hover:ring-1 hover:ring-blue-200 rounded px-1 -mx-1"
              >
                {card.text}
              </p>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}
