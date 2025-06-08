"use client";

export default function Canvas({
  canvasRef,
  overlayCanvasRef,
  currentTool,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
}) {
  const getCursorClass = () => {
    switch (currentTool) {
      case "text":
        return "cursor-text";
      default:
        return "cursor-crosshair";
    }
  };

  return (
    <div className="flex-1 relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className={`border-r border-gray-300 shadow-inner ${getCursorClass()}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      />
      <canvas
        ref={overlayCanvasRef}
        className="absolute top-0 left-0 pointer-events-none"
        style={{ zIndex: 10 }}
      />
    </div>
  );
}
