"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import LoginModal from "../components/LoginModal";
import TextInputModal from "../components/TextInputModal";
import OnlineUsers from "../components/OnlineUsers";
import Chat from "../components/Chat";
import Sidebar from "../components/Sidebar";
import Canvas from "../components/Canvas";
import RemoteCursors from "../components/RemoteCursors";

const socket = io("http://localhost:4000");

export default function App() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const overlayCtxRef = useRef(null);
  const drawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);

  // State for enhanced features
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [username, setUsername] = useState("");
  const [showLogin, setShowLogin] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [cursors, setCursors] = useState(new Map());
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // New tool states
  const [currentTool, setCurrentTool] = useState("brush");

  // Text tool states
  const [isAddingText, setIsAddingText] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [textValue, setTextValue] = useState("");
  const [fontSize, setFontSize] = useState(16);

  // Shape drawing states
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [shapeStart, setShapeStart] = useState({ x: 0, y: 0 });
  const [shapePreview, setShapePreview] = useState(null);

  // Image states
  const [images, setImages] = useState([]);

  // Chat functionality
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [isChatFocused, setIsChatFocused] = useState(false);

  // Initialize canvas and socket listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!canvas || !overlayCanvas) return;

    canvas.width = window.innerWidth - 320;
    canvas.height = window.innerHeight;
    overlayCanvas.width = canvas.width;
    overlayCanvas.height = canvas.height;

    const ctx = canvas.getContext("2d");
    const overlayCtx = overlayCanvas.getContext("2d");
    if (!ctx || !overlayCtx) return;

    ctx.lineCap = "round";
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = color;
    ctxRef.current = ctx;
    overlayCtxRef.current = overlayCtx;

    // Draw grid lines for notebook effect
    drawGridLines(ctx, canvas.width, canvas.height);

    // Only save initial state if history is empty
    if (history.length === 0) {
      saveState();
    }

    // Socket event listeners
    socket.on("drawing", ({ x0, y0, x1, y1, color, size, tool }) => {
      if (tool === "eraser") {
        eraseArea(x0, y0, x1, y1, size, false);
      } else {
        drawLine(x0, y0, x1, y1, color, size, false);
      }
    });

    socket.on("shape", ({ type, x0, y0, x1, y1, color, size }) => {
      drawShape(type, x0, y0, x1, y1, color, size, false);
    });

    socket.on("text", ({ x, y, text, color, fontSize }) => {
      drawText(x, y, text, color, fontSize, false);
    });

    socket.on("image", ({ id, x, y, width, height, imageData }) => {
      addImageToCanvas(id, x, y, width, height, imageData, false);
    });

    socket.on("cursor", ({ userId, x, y, username: cursorUsername, tool }) => {
      setCursors((prev) => {
        const newCursors = new Map(prev);
        newCursors.set(userId, { x, y, username: cursorUsername, tool });
        return newCursors;
      });
    });

    socket.on("userJoined", ({ users }) => {
      setOnlineUsers(users);
    });

    socket.on("userLeft", ({ users }) => {
      setOnlineUsers(users);
      setCursors((prev) => {
        const newCursors = new Map(prev);
        const userIds = users.map((u) => u.id);
        for (const [id] of newCursors) {
          if (!userIds.includes(id)) {
            newCursors.delete(id);
          }
        }
        return newCursors;
      });
    });

    socket.on("canvasHistory", (data) => {
      // Clear canvas and redraw everything
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGridLines(ctx, canvas.width, canvas.height);

      // Reset images array
      setImages([]);

      data.forEach((item) => {
        if (item.type === "drawing") {
          if (item.tool === "eraser") {
            eraseArea(item.x0, item.y0, item.x1, item.y1, item.size, false);
          } else {
            drawLine(
              item.x0,
              item.y0,
              item.x1,
              item.y1,
              item.color,
              item.size,
              false
            );
          }
        } else if (item.type === "shape") {
          drawShape(
            item.shapeType,
            item.x0,
            item.y0,
            item.x1,
            item.y1,
            item.color,
            item.size,
            false
          );
        } else if (item.type === "text") {
          drawText(item.x, item.y, item.text, item.color, item.fontSize, false);
        } else if (item.type === "image") {
          addImageToCanvas(
            item.id,
            item.x,
            item.y,
            item.width,
            item.height,
            item.imageData,
            false
          );
        }
      });
    });

    socket.on("canvasCleared", () => {
      clearCanvas();
    });

    socket.on("chatMessage", (message) => {
      setChatMessages((prev) => [...prev, message]);
    });

    socket.on("chatHistory", (messages) => {
      setChatMessages(messages);
    });

    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      if (
        isChatFocused ||
        isAddingText ||
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" || e.key === "Z") {
          e.preventDefault();
          undo();
        } else if (e.key === "y" || e.key === "Y") {
          e.preventDefault();
          redo();
        }
      }

      // Tool shortcuts
      if (e.key === "b" || e.key === "B") setCurrentTool("brush");
      if (e.key === "e" || e.key === "E") setCurrentTool("eraser");
      if (e.key === "t" || e.key === "T") setCurrentTool("text");
      if (e.key === "r" || e.key === "R") setCurrentTool("rectangle");
      if (e.key === "c" || e.key === "C") setCurrentTool("circle");
      if (e.key === "l" || e.key === "L") setCurrentTool("line");
    };

    document.addEventListener("keydown", handleKeyDown);

    // Handle window resize
    const handleResize = () => {
      if (canvas && overlayCanvas) {
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempCtx.drawImage(canvas, 0, 0);

        canvas.width = window.innerWidth - 320;
        canvas.height = window.innerHeight;
        overlayCanvas.width = canvas.width;
        overlayCanvas.height = canvas.height;

        drawGridLines(ctx, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
        redrawImages();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      socket.off("drawing");
      socket.off("shape");
      socket.off("text");
      socket.off("image");
      socket.off("cursor");
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("canvasHistory");
      socket.off("canvasCleared");
      socket.off("chatMessage");
      socket.off("chatHistory");
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Redraw overlay when shape preview changes
  useEffect(() => {
    const overlayCtx = overlayCtxRef.current;
    if (!overlayCtx) return;

    overlayCtx.clearRect(
      0,
      0,
      overlayCtx.canvas.width,
      overlayCtx.canvas.height
    );

    // Draw shape preview
    if (shapePreview && isDrawingShape) {
      overlayCtx.save();
      overlayCtx.strokeStyle = color;
      overlayCtx.lineWidth = brushSize;
      overlayCtx.setLineDash([5, 5]);
      overlayCtx.beginPath();

      const { type, x0, y0, x1, y1 } = shapePreview;
      if (type === "rectangle") {
        overlayCtx.rect(x0, y0, x1 - x0, y1 - y0);
      } else if (type === "circle") {
        const radius = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
        overlayCtx.arc(x0, y0, radius, 0, 2 * Math.PI);
      } else if (type === "line") {
        overlayCtx.moveTo(x0, y0);
        overlayCtx.lineTo(x1, y1);
      }

      overlayCtx.stroke();
      overlayCtx.restore();
    }
  }, [shapePreview, color, brushSize, isDrawingShape]);

  // Redraw images when images array changes
  useEffect(() => {
    redrawImages();
  }, [images]);

  // Update canvas context when color/size changes - but don't reinitialize
  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = color;
      ctxRef.current.lineWidth = brushSize;
      ctxRef.current.font = `${fontSize}px Arial`;
      ctxRef.current.fillStyle = color;
    }
  }, [color, brushSize, fontSize]);

  // Draw grid lines for notebook effect
  const drawGridLines = (ctx, width, height) => {
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#e6e6e6";
    ctx.lineWidth = 1;
    const gridSize = 20;
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  };

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL();
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyStep + 1);
      newHistory.push(dataURL);
      return newHistory;
    });
    setHistoryStep((prev) => prev + 1);
  }, [historyStep]);

  const undo = useCallback(() => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      restoreState(history[newStep]);
    }
  }, [historyStep, history]);

  const redo = useCallback(() => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      restoreState(history[newStep]);
    }
  }, [historyStep, history]);

  const restoreState = (dataURL) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGridLines(ctx, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      redrawImages();
    };
    img.src = dataURL;
  };

  const getCanvasCoordinates = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const drawLine = (
    x0,
    y0,
    x1,
    y1,
    lineColor = color,
    lineSize = brushSize,
    emit = false
  ) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const prevColor = ctx.strokeStyle;
    const prevSize = ctx.lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineSize;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();
    ctx.strokeStyle = prevColor;
    ctx.lineWidth = prevSize;
    if (emit) {
      socket.emit("drawing", {
        x0,
        y0,
        x1,
        y1,
        color: lineColor,
        size: lineSize,
        tool: "brush",
      });
    }
  };

  const eraseArea = (x0, y0, x1, y1, size, emit = false) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.restore();
    if (emit) {
      socket.emit("drawing", {
        x0,
        y0,
        x1,
        y1,
        color: "#ffffff",
        size,
        tool: "eraser",
      });
    }
  };

  const drawShape = (
    type,
    x0,
    y0,
    x1,
    y1,
    shapeColor = color,
    shapeSize = brushSize,
    emit = false
  ) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.save();
    ctx.strokeStyle = shapeColor;
    ctx.lineWidth = shapeSize;
    ctx.beginPath();

    if (type === "rectangle") {
      ctx.rect(x0, y0, x1 - x0, y1 - y0);
    } else if (type === "circle") {
      const radius = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
      ctx.arc(x0, y0, radius, 0, 2 * Math.PI);
    } else if (type === "line") {
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
    }

    ctx.stroke();
    ctx.restore();

    if (emit) {
      socket.emit("shape", {
        type,
        x0,
        y0,
        x1,
        y1,
        color: shapeColor,
        size: shapeSize,
      });
    }
  };

  const drawText = (
    x,
    y,
    text,
    textColor = color,
    textSize = fontSize,
    emit = false
  ) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.save();
    ctx.fillStyle = textColor;
    ctx.font = `${textSize}px Arial`;
    ctx.fillText(text, x, y);
    ctx.restore();
    if (emit) {
      socket.emit("text", { x, y, text, color: textColor, fontSize: textSize });
    }
  };

  const addImageToCanvas = (
    id,
    x,
    y,
    width,
    height,
    imageData,
    emit = false
  ) => {
    const newImage = { id, x, y, width, height, imageData };
    setImages((prev) => [...prev, newImage]);

    if (emit) {
      socket.emit("image", { id, x, y, width, height, imageData });
    }
  };

  const redrawImages = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    images.forEach((image) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(img, image.x, image.y, image.width, image.height);
      };
      img.src = image.imageData;
    });
  };

  const handleMouseDown = (e) => {
    if (showLogin) return;
    const coords = getCanvasCoordinates(e);

    if (currentTool === "text") {
      setIsAddingText(true);
      setTextPosition(coords);
      setTimeout(() => textInputRef.current?.focus(), 100);
      return;
    }

    if (["rectangle", "circle", "line"].includes(currentTool)) {
      setIsDrawingShape(true);
      setShapeStart(coords);
      setShapePreview({
        type: currentTool,
        x0: coords.x,
        y0: coords.y,
        x1: coords.x,
        y1: coords.y,
      });
      return;
    }

    drawing.current = true;
    lastPos.current = coords;
  };

  const handleMouseMove = (e) => {
    const coords = getCanvasCoordinates(e);

    if (!showLogin) {
      socket.emit("cursor", { x: coords.x, y: coords.y, tool: currentTool });
    }

    if (isDrawingShape) {
      setShapePreview({
        type: currentTool,
        x0: shapeStart.x,
        y0: shapeStart.y,
        x1: coords.x,
        y1: coords.y,
      });
      return;
    }

    if (!drawing.current || showLogin) return;

    const { x: lastX, y: lastY } = lastPos.current;

    if (currentTool === "eraser") {
      eraseArea(lastX, lastY, coords.x, coords.y, brushSize, true);
    } else if (currentTool === "brush") {
      drawLine(lastX, lastY, coords.x, coords.y, color, brushSize, true);
    }

    lastPos.current = coords;
  };

  const handleMouseUp = (e) => {
    if (isDrawingShape) {
      const coords = getCanvasCoordinates(e);
      drawShape(
        currentTool,
        shapeStart.x,
        shapeStart.y,
        coords.x,
        coords.y,
        color,
        brushSize,
        true
      );
      setIsDrawingShape(false);
      setShapePreview(null);
      saveState();
      return;
    }

    if (drawing.current) {
      drawing.current = false;
      saveState();
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textValue.trim()) {
      drawText(
        textPosition.x,
        textPosition.y,
        textValue,
        color,
        fontSize,
        true
      );
      setTextValue("");
      setIsAddingText(false);
      saveState();
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const maxWidth = 300;
        const maxHeight = 300;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        const x = (canvas.width - width) / 2;
        const y = (canvas.height - height) / 2;
        const id = Date.now().toString();

        addImageToCanvas(id, x, y, width, height, event.target?.result, true);
        saveState();
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      socket.emit("userJoin", { username: username.trim() });
      setShowLogin(false);
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas to combine main canvas and images
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    // Draw main canvas
    tempCtx.drawImage(canvas, 0, 0);

    // Draw images on top
    images.forEach((image) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        tempCtx.drawImage(img, image.x, image.y, image.width, image.height);
      };
      img.src = image.imageData;
    });

    const link = document.createElement("a");
    link.download = `drawing-${Date.now()}.png`;
    link.href = tempCanvas.toDataURL();
    link.click();
  };

  const clearCanvas = () => {
    const ctx = ctxRef.current;
    const overlayCtx = overlayCtxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas || !overlayCtx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    overlayCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawGridLines(ctx, canvas.width, canvas.height);
    setImages([]);
    saveState();
  };

  const handleClearCanvas = () => {
    if (
      window.confirm("Clear the entire canvas? This will affect all users.")
    ) {
      socket.emit("clearCanvas");
      clearCanvas();
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      const messageData = {
        userId: socket.id,
        username,
        text: chatInput.trim(),
        timestamp: new Date().toISOString(),
      };
      socket.emit("chatMessage", messageData);
      setChatMessages((prev) => [...prev, messageData]);
      setChatInput("");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Login Modal */}
      {showLogin && (
        <LoginModal
          username={username}
          setUsername={setUsername}
          onLogin={handleLogin}
        />
      )}

      {/* Text Input Modal */}
      {isAddingText && (
        <TextInputModal
          textValue={textValue}
          setTextValue={setTextValue}
          onSubmit={handleTextSubmit}
          onCancel={() => setIsAddingText(false)}
          textInputRef={textInputRef}
        />
      )}

      {/* Canvas Container */}
      <div className="flex-1 relative overflow-hidden">
        {/* Online Users */}
        <OnlineUsers users={onlineUsers} currentUserId={socket.id} />

        {/* Canvas */}
        <Canvas
          canvasRef={canvasRef}
          overlayCanvasRef={overlayCanvasRef}
          currentTool={currentTool}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Remote Cursors */}
        <RemoteCursors cursors={cursors} />

        {/* Chat */}
        <Chat
          messages={chatMessages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          onSendMessage={handleSendMessage}
          currentUserId={socket.id}
          isChatFocused={isChatFocused}
          setIsChatFocused={setIsChatFocused}
          showChat={showChat}
          setShowChat={setShowChat}
          showLogin={showLogin}
        />
      </div>

      {/* Sidebar */}
      <Sidebar
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        color={color}
        setColor={setColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        fontSize={fontSize}
        setFontSize={setFontSize}
        historyStep={historyStep}
        historyLength={history.length}
        onUndo={undo}
        onRedo={redo}
        onImageUpload={handleImageUpload}
        onDownload={downloadCanvas}
        onClearCanvas={handleClearCanvas}
        images={images}
        fileInputRef={fileInputRef}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />
    </div>
  );
}
