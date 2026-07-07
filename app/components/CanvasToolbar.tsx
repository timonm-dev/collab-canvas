import { TOOLS, type ToolMode } from "../types";

type CanvasToolbarProps = {
  activeTool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
};

export function CanvasToolbar({ activeTool, onToolChange }: CanvasToolbarProps) {
  return (
    <aside className="absolute top-6 left-6 z-20 bg-white rounded-xl shadow-md border border-slate-200 p-3 w-44">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
        Tools
      </p>
      {TOOLS.map(({ mode, label }) => (
        <button
          key={mode}
          onClick={() => onToolChange(mode)}
          className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
            activeTool === mode
              ? "bg-blue-100 text-blue-800 font-medium"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          {label}
        </button>
      ))}
    </aside>
  );
}
