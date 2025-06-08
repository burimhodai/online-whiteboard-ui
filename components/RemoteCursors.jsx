import { Brush, Eraser, Type, Square, Circle, Minus } from "lucide-react";

const getToolIcon = (toolName) => {
  switch (toolName) {
    case "brush":
      return <Brush className="w-3 h-3" />;
    case "eraser":
      return <Eraser className="w-3 h-3" />;
    case "text":
      return <Type className="w-3 h-3" />;
    case "rectangle":
      return <Square className="w-3 h-3" />;
    case "circle":
      return <Circle className="w-3 h-3" />;
    case "line":
      return <Minus className="w-3 h-3" />;
    default:
      return <Brush className="w-3 h-3" />;
  }
};

export default function RemoteCursors({ cursors }) {
  return (
    <>
      {Array.from(cursors.entries()).map(([userId, cursor]) => (
        <div
          key={userId}
          className="absolute pointer-events-none z-40 flex items-center gap-1"
          style={{
            left: cursor.x + "px",
            top: cursor.y + "px",
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
            {getToolIcon(cursor.tool)}
            <span>{cursor.username}</span>
          </div>
        </div>
      ))}
    </>
  );
}
