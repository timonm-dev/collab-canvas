import { NOTE_SIZE, type EditingField, type Note, type ToolMode } from "../types";

type StickyNoteProps = {
  note: Note;
  activeTool: ToolMode;
  isDragging: boolean;
  editingField: EditingField | null;
  showAnchor: boolean;
  isSnapTarget: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onAnchorMouseDown: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStartEdit: (field: "title" | "description") => void;
  onStopEdit: () => void;
};

export function StickyNote({
  note,
  activeTool,
  isDragging,
  editingField,
  showAnchor,
  isSnapTarget,
  onMouseDown,
  onAnchorMouseDown,
  onDelete,
  onTitleChange,
  onDescriptionChange,
  onStartEdit,
  onStopEdit,
}: StickyNoteProps) {
  const isEditingTitle =
    editingField?.noteId === note.id && editingField.field === "title";
  const isEditingDescription =
    editingField?.noteId === note.id && editingField.field === "description";

  const cursorClass =
    activeTool === "select"
      ? "cursor-grab active:cursor-grabbing"
      : activeTool === "connect"
        ? "cursor-default"
        : "cursor-default";

  return (
    <div
      data-note-id={note.id}
      style={{ left: note.x, top: note.y, width: NOTE_SIZE, height: NOTE_SIZE }}
      onMouseDown={onMouseDown}
      className={`group absolute z-10 bg-yellow-200 shadow-md rounded-sm p-3 pb-4 select-none border border-yellow-300/60 flex flex-col ${cursorClass} ${
        isDragging ? "cursor-grabbing shadow-lg z-20" : ""
      } ${isSnapTarget ? "ring-2 ring-blue-400 ring-offset-1" : ""}`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute top-1.5 right-1.5 w-5 h-5 rounded text-slate-500 hover:text-slate-800 hover:bg-yellow-300/80 opacity-0 group-hover:opacity-100 transition-opacity text-xs leading-none flex items-center justify-center"
        aria-label="Note löschen"
      >
        ×
      </button>

      {isEditingTitle ? (
        <input
          autoFocus
          value={note.title}
          onChange={(e) => onTitleChange(e.target.value)}
          onBlur={onStopEdit}
          onKeyDown={(e) => e.key === "Enter" && onStopEdit()}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder="Titel..."
          className="w-full font-semibold text-sm text-slate-800 bg-white/60 rounded px-1 mb-1 outline-none ring-1 ring-blue-300"
        />
      ) : (
        <h3
          onClick={(e) => {
            e.stopPropagation();
            onStartEdit("title");
          }}
          className="font-semibold text-sm text-slate-800 mb-1 cursor-text hover:ring-1 hover:ring-blue-200 rounded px-0.5 truncate"
        >
          {note.title || (
            <span className="text-slate-500/70 font-normal">Titel...</span>
          )}
        </h3>
      )}

      {isEditingDescription ? (
        <textarea
          autoFocus
          value={note.description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          onBlur={onStopEdit}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder="Beschreibung..."
          rows={4}
          className="flex-1 w-full text-xs text-slate-700 bg-white/60 rounded px-1 outline-none ring-1 ring-blue-300 resize-none"
        />
      ) : (
        <p
          onClick={(e) => {
            e.stopPropagation();
            onStartEdit("description");
          }}
          className="flex-1 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap break-words cursor-text hover:ring-1 hover:ring-blue-200 rounded px-0.5 overflow-hidden"
        >
          {note.description || (
            <span className="text-slate-500/70">Beschreibung...</span>
          )}
        </p>
      )}

      {showAnchor && (
        <button
          type="button"
          data-anchor="true"
          aria-label="Verbindungspunkt"
          onMouseDown={onAnchorMouseDown}
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm z-30 transition-transform hover:scale-110 ${
            isSnapTarget
              ? "bg-blue-500 ring-2 ring-blue-300 scale-125"
              : "bg-slate-600 hover:bg-slate-700"
          }`}
        />
      )}
    </div>
  );
}
