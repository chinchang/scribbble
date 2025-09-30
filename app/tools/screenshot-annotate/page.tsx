"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Upload,
  Pen,
  Square,
  ArrowRight,
  Download,
  RotateCcw,
  Trash2,
  Type,
  Image as ImageIcon,
  FileText,
  Palette,
  Undo,
  Redo,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Tool = "pen" | "rectangle" | "arrow" | "text" | "background";

interface Point {
  x: number;
  y: number;
}

interface DrawingElement {
  type: Tool;
  points: Point[];
  color: string;
  strokeWidth: number;
  text?: string;
  fontSize?: number;
}

interface BackgroundState {
  color: string | null;
}

interface TooltipState {
  show: boolean;
  content: string;
  x: number;
  y: number;
}

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

interface HistoryState {
  drawings: DrawingElement[];
  backgroundState: BackgroundState;
}

export default function ScreenshotAnnotate() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [currentTool, setCurrentTool] = useState<Tool>("pen");
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawings, setDrawings] = useState<DrawingElement[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 24 }); // Start centered top
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState<Point | null>(null);
  const [isTextInputActive, setIsTextInputActive] = useState(false);
  const [backgroundState, setBackgroundState] = useState<BackgroundState>({
    color: null,
  });
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    content: "",
    x: 0,
    y: 0,
  });
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const backgroundColors = [
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#64748b", // slate
    "#000000", // black
    "#ffffff", // white
  ];

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setDrawings([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            handleImageUpload(file);
          }
          break;
        }
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [handlePaste]);

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current;
    const toolbar = toolbarRef.current;
    if (!container || !toolbar) return;

    const containerRect = container.getBoundingClientRect();
    const toolbarRect = toolbar.getBoundingClientRect();

    setHasDragged(true);
    setDragOffset({
      x: e.clientX - toolbarRect.left,
      y: e.clientY - toolbarRect.top,
    });
    setToolbarPosition({
      x: toolbarRect.left - containerRect.left,
      y: toolbarRect.top - containerRect.top,
    });
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const container = containerRef.current;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const newX = e.clientX - containerRect.left - dragOffset.x;
          const newY = e.clientY - containerRect.top - dragOffset.y;

          // Keep toolbar within container bounds
          const maxX = container.clientWidth - 300; // toolbar width
          const maxY = container.clientHeight - 60; // toolbar height

          setToolbarPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY)),
          });
        }
      }
    },
    [isDragging, dragOffset]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts if text input is active
      if (isTextInputActive) return;

      // Check for Ctrl+C or Cmd+C
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && !e.shiftKey) {
        e.preventDefault();
        copyToClipboard();
        return;
      }

      // Check for Ctrl+Z or Cmd+Z (Undo)
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Check for Ctrl+Y or Cmd+Y (Redo)
      if ((e.ctrlKey || e.metaKey) && e.key === "y" && !e.shiftKey) {
        e.preventDefault();
        redo();
        return;
      }

      switch (e.key) {
        case "p":
        case "P":
          setCurrentTool("pen");
          break;
        case "r":
        case "R":
          setCurrentTool("rectangle");
          break;
        case "a":
        case "A":
          setCurrentTool("arrow");
          break;
        case "t":
        case "T":
          setCurrentTool("text");
          break;
        case "b":
        case "B":
          setCurrentTool("background");
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTextInputActive]);

  // Focus text input when it becomes active
  useEffect(() => {
    if (isTextInputActive && textInputRef.current) {
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 50); // Small delay to ensure input is rendered
    }
  }, [isTextInputActive]);

  // Redraw canvas when drawings change
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const image = imageRef.current;

    if (!ctx || !canvas || !image) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get stored image dimensions and position
    const imageDisplayWidth = parseFloat(
      canvas.dataset.imageDisplayWidth || "0"
    );
    const imageDisplayHeight = parseFloat(
      canvas.dataset.imageDisplayHeight || "0"
    );
    const offsetX = parseFloat(canvas.dataset.imageOffsetX || "0");
    const offsetY = parseFloat(canvas.dataset.imageOffsetY || "0");

    // Apply background color if set
    if (backgroundState.color) {
      ctx.fillStyle = backgroundState.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw image at fixed size and position with rounded corners
    const borderRadius = 12; // 12px rounded corners

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(offsetX, offsetY, imageDisplayWidth, imageDisplayHeight, borderRadius);
    ctx.clip();

    ctx.drawImage(
      image,
      offsetX,
      offsetY,
      imageDisplayWidth,
      imageDisplayHeight
    );

    ctx.restore();

    console.log("Redrawing canvas with drawings:", drawings);

    // Redraw all drawings with image offset
    // const offsetX = parseFloat(canvas.dataset.imageOffsetX || '0');
    // const offsetY = parseFloat(canvas.dataset.imageOffsetY || '0');
    drawings.forEach((drawing) => {
      ctx.strokeStyle = drawing.color;
      ctx.lineWidth = drawing.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (drawing.type === "pen") {
        ctx.beginPath();
        drawing.points.forEach((point, i) => {
          if (i === 0) {
            ctx.moveTo(point.x + offsetX, point.y + offsetY);
          } else {
            ctx.lineTo(point.x + offsetX, point.y + offsetY);
          }
        });
        ctx.stroke();
      } else if (drawing.type === "rectangle") {
        const startPoint = drawing.points[0];
        const endPoint = drawing.points[drawing.points.length - 1];
        ctx.strokeRect(
          startPoint.x + offsetX,
          startPoint.y + offsetY,
          endPoint.x - startPoint.x,
          endPoint.y - startPoint.y
        );
      } else if (drawing.type === "arrow") {
        const startPoint = drawing.points[0];
        const endPoint = drawing.points[drawing.points.length - 1];
        drawArrow(
          ctx,
          startPoint.x + offsetX,
          startPoint.y + offsetY,
          endPoint.x + offsetX,
          endPoint.y + offsetY
        );
      } else if (drawing.type === "text" && drawing.text) {
        const point = drawing.points[0];
        console.log("Rendering text:", drawing.text, "at position:", point);

        ctx.fillStyle = drawing.color;
        ctx.font = `bold ${drawing.fontSize || 20}px Arial`;
        ctx.textBaseline = "top";

        // Add text outline for better visibility
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.strokeText(drawing.text, point.x + offsetX, point.y + offsetY);

        // Fill the text
        ctx.fillStyle = drawing.color;
        ctx.fillText(drawing.text, point.x + offsetX, point.y + offsetY);
      }
    });
  }, [drawings, backgroundState.color]);

  // Effect to handle canvas resizing when background state changes
  useEffect(() => {
    if (uploadedImage) {
      handleImageLoad();
    }
  }, [backgroundState.color]);


  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const offsetX = parseFloat(canvas.dataset.imageOffsetX || "0");
    const offsetY = parseFloat(canvas.dataset.imageOffsetY || "0");

    // Convert canvas coordinates to image coordinates
    return {
      x: e.clientX - rect.left - offsetX,
      y: e.clientY - rect.top - offsetY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === "text") {
      const point = getMousePos(e);
      setTextPosition(point);
      setIsTextInputActive(true);
      return;
    }

    if (currentTool === "background") {
      setShowColorPalette(true);
      return;
    }

    setIsDrawing(true);
    const point = getMousePos(e);
    setCurrentPath([point]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const point = getMousePos(e);
    setCurrentPath((prev) => [...prev, point]);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    redrawCanvas();

    // Draw current path
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (currentTool === "pen") {
      ctx.beginPath();
      currentPath.concat([point]).forEach((p, i) => {
        if (i === 0) {
          ctx.moveTo(p.x, p.y);
        } else {
          ctx.lineTo(p.x, p.y);
        }
      });
      ctx.stroke();
    } else if (currentTool === "rectangle") {
      const startPoint = currentPath[0];
      ctx.strokeRect(
        startPoint.x,
        startPoint.y,
        point.x - startPoint.x,
        point.y - startPoint.y
      );
    } else if (currentTool === "arrow") {
      const startPoint = currentPath[0];
      drawArrow(ctx, startPoint.x, startPoint.y, point.x, point.y);
    }
  };

  const stopDrawing = () => {
    if (!isDrawing || currentPath.length === 0) return;

    setIsDrawing(false);

    const newDrawing: DrawingElement = {
      type: currentTool,
      points: [...currentPath],
      color: "#ef4444",
      strokeWidth: 2,
    };

    // Save current state before adding new drawing
    saveToHistory();
    setDrawings((prev) => [...prev, newDrawing]);
    setCurrentPath([]);
  };

  const handleTextSubmit = (text: string) => {
    if (!textPosition || !text.trim()) {
      setIsTextInputActive(false);
      setTextInput("");
      setTextPosition(null);
      return;
    }

    const newDrawing: DrawingElement = {
      type: "text",
      points: [textPosition],
      color: "#ef4444",
      strokeWidth: 4,
      text: text.trim(),
      fontSize: 20,
    };

    console.log("Adding text drawing:", newDrawing);
    // Save current state before adding new text
    saveToHistory();
    setDrawings((prev) => {
      const updated = [...prev, newDrawing];
      console.log("Updated drawings array:", updated);
      return updated;
    });
    setIsTextInputActive(false);
    setTextInput("");
    setTextPosition(null);
  };

  const handleBackgroundColorSelect = (color: string) => {
    saveToHistory();
    setBackgroundState({ color });
    setShowColorPalette(false);
  };

  const clearBackground = () => {
    saveToHistory();
    setBackgroundState({ color: null });
    setShowColorPalette(false);
  };

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const currentState: HistoryState = {
      drawings: [...drawings],
      backgroundState: { ...backgroundState },
    };

    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentState);

    // Limit history to 50 states to prevent memory issues
    const limitedHistory = newHistory.slice(-50);

    setHistory(limitedHistory);
    setHistoryIndex(limitedHistory.length - 1);
  }, [drawings, backgroundState, history, historyIndex]);

  // Effect to save initial state to history when image is uploaded
  useEffect(() => {
    if (uploadedImage && history.length === 0) {
      saveToHistory();
    }
  }, [uploadedImage, history.length, saveToHistory]);

  // Undo function
  const undo = () => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setDrawings(previousState.drawings);
      setBackgroundState(previousState.backgroundState);
      setHistoryIndex(historyIndex - 1);
    }
  };

  // Redo function
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setDrawings(nextState.drawings);
      setBackgroundState(nextState.backgroundState);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Check if undo/redo is available
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const showTooltip = (content: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      content,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  const hideTooltip = () => {
    setTooltip((prev) => ({ ...prev, show: false }));
  };

  const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    className = "",
  }) => {
    return (
      <div
        className={`relative ${className}`}
        onMouseEnter={(e) => showTooltip(content, e)}
        onMouseLeave={hideTooltip}
      >
        {children}
      </div>
    );
  };

  const copyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      toast({
        title: "Nothing to copy",
        description: "Upload and annotate an image before copying.",
        variant: "destructive",
      });
      return;
    }

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((result) => resolve(result), "image/png")
      );

      if (!blob) {
        throw new Error("Canvas blob generation failed");
      }

      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);

      toast({
        title: "Copied to clipboard",
        description: "Annotated screenshot is ready to paste.",
      });
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      toast({
        title: "Copy failed",
        description: "Allow clipboard permissions and try again.",
        variant: "destructive",
      });
    }
  };

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ) => {
    const headLength = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    // Draw line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const image = imageRef.current;

    if (!ctx || !canvas || !image) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get stored image dimensions and position
    const imageDisplayWidth = parseFloat(
      canvas.dataset.imageDisplayWidth || "0"
    );
    const imageDisplayHeight = parseFloat(
      canvas.dataset.imageDisplayHeight || "0"
    );
    const offsetX = parseFloat(canvas.dataset.imageOffsetX || "0");
    const offsetY = parseFloat(canvas.dataset.imageOffsetY || "0");

    // Apply background color if set
    if (backgroundState.color) {
      ctx.fillStyle = backgroundState.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw image at fixed size and position with rounded corners
    const borderRadius = 12; // 12px rounded corners

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(offsetX, offsetY, imageDisplayWidth, imageDisplayHeight, borderRadius);
    ctx.clip();

    ctx.drawImage(
      image,
      offsetX,
      offsetY,
      imageDisplayWidth,
      imageDisplayHeight
    );

    ctx.restore();

    console.log("Redrawing canvas with drawings:", drawings);

    // Redraw all drawings with image offset
    drawings.forEach((drawing) => {
      ctx.strokeStyle = drawing.color;
      ctx.lineWidth = drawing.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (drawing.type === "pen") {
        ctx.beginPath();
        drawing.points.forEach((point, i) => {
          if (i === 0) {
            ctx.moveTo(point.x + offsetX, point.y + offsetY);
          } else {
            ctx.lineTo(point.x + offsetX, point.y + offsetY);
          }
        });
        ctx.stroke();
      } else if (drawing.type === "rectangle") {
        const startPoint = drawing.points[0];
        const endPoint = drawing.points[drawing.points.length - 1];
        ctx.strokeRect(
          startPoint.x + offsetX,
          startPoint.y + offsetY,
          endPoint.x - startPoint.x,
          endPoint.y - startPoint.y
        );
      } else if (drawing.type === "arrow") {
        const startPoint = drawing.points[0];
        const endPoint = drawing.points[drawing.points.length - 1];
        drawArrow(
          ctx,
          startPoint.x + offsetX,
          startPoint.y + offsetY,
          endPoint.x + offsetX,
          endPoint.y + offsetY
        );
      } else if (drawing.type === "text" && drawing.text) {
        const point = drawing.points[0];
        console.log("Rendering text:", drawing.text, "at position:", point);

        ctx.fillStyle = drawing.color;
        ctx.font = `bold ${drawing.fontSize || 20}px Arial`;
        ctx.textBaseline = "top";

        // Add text outline for better visibility
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.strokeText(drawing.text, point.x + offsetX, point.y + offsetY);

        // Fill the text
        ctx.fillStyle = drawing.color;
        ctx.fillText(drawing.text, point.x + offsetX, point.y + offsetY);
      }
    });
  };

  const handleImageLoad = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    const container = containerRef.current;

    if (!canvas || !image || !container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const padding = backgroundState.color ? 40 : 0;

    const imageAspectRatio = image.naturalWidth / image.naturalHeight;

    // Calculate optimal image size that fits in container (ignoring padding for now)
    const maxWidth = containerWidth - padding * 2;
    const maxHeight = containerHeight - padding * 2;

    let imageDisplayWidth, imageDisplayHeight;

    if (imageAspectRatio > maxWidth / maxHeight) {
      imageDisplayWidth = maxWidth;
      imageDisplayHeight = maxWidth / imageAspectRatio;
    } else {
      imageDisplayHeight = maxHeight;
      imageDisplayWidth = maxHeight * imageAspectRatio;
    }

    // Canvas size includes padding
    const canvasWidth = imageDisplayWidth + padding * 2;
    const canvasHeight = imageDisplayHeight + padding * 2;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Store image rendering info for coordinate calculations
    canvas.dataset.imageDisplayWidth = imageDisplayWidth.toString();
    canvas.dataset.imageDisplayHeight = imageDisplayHeight.toString();
    canvas.dataset.imageOffsetX = padding.toString();
    canvas.dataset.imageOffsetY = padding.toString();

    redrawCanvas();
  };

  const clearDrawings = () => {
    saveToHistory();
    setDrawings([]);
    redrawCanvas();
  };

  const downloadAnnotatedImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "annotated-screenshot.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Scribbble Screenshot Annotator
          </h1>
        </div>

        {!uploadedImage ? (
          <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
            <div className="p-12 text-center">
              <Upload className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
              <p className="text-muted-foreground mb-6">
                Select an image file or paste from clipboard (Ctrl+V / Cmd+V)
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="mb-4"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-sm text-muted-foreground">
                Supports: JPG, PNG, GIF, WebP
              </p>
            </div>
          </Card>
        ) : (
          <div className="relative">
            {/* Canvas Area */}
            <Card className="p-4">
              <div
                ref={containerRef}
                className="relative w-full h-[80vh] flex items-center justify-center bg-muted/20 rounded-lg overflow-hidden"
                style={{
                  cursor:
                    currentTool === "pen"
                      ? "crosshair"
                      : currentTool === "text"
                      ? "text"
                      : currentTool === "background"
                      ? "pointer"
                      : "default",
                }}
              >
                <img
                  ref={imageRef}
                  src={uploadedImage}
                  alt="Uploaded screenshot"
                  className="hidden"
                  onLoad={handleImageLoad}
                />
                <div className="relative  ">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="max-w-full max-h-full border border-border rounded-lg"
                  />

                  {/* Text Input Overlay */}
                  {isTextInputActive && textPosition && (
                    <input
                      ref={textInputRef}
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleTextSubmit(textInput);
                        } else if (e.key === "Escape") {
                          setIsTextInputActive(false);
                          setTextInput("");
                          setTextPosition(null);
                        }
                      }}
                      onBlur={() => {
                        if (textInput.trim()) {
                          handleTextSubmit(textInput);
                        } else {
                          setIsTextInputActive(false);
                          setTextInput("");
                          setTextPosition(null);
                        }
                      }}
                      className="absolute bg-transparent border-2 border-red-400 rounded px-2 py-1 text-red-400 font-bold text-lg outline-none"
                      style={{
                        left: textPosition.x,
                        top: textPosition.y,
                        minWidth: "100px",
                        zIndex: 9999,
                      }}
                      placeholder="Enter text..."
                    />
                  )}

                  {/* Background Color Palette */}
                  {showColorPalette && (
                    <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/10 z-50">
                      <div className="mb-3">
                        <h3 className="text-white text-sm font-medium mb-2">
                          Background Colors
                        </h3>
                        <div className="grid grid-cols-5 gap-2">
                          {backgroundColors.map((color) => (
                            <button
                              key={color}
                              onClick={() => handleBackgroundColorSelect(color)}
                              className="w-8 h-8 rounded-lg border-2 border-white/20 hover:border-white/50 transition-colors hover:scale-110 transform"
                              style={{ backgroundColor: color }}
                              title={`Background: ${color}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={clearBackground}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => setShowColorPalette(false)}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {/* Floating Toolbar - Redesigned & Draggable */}
                <div
                  ref={toolbarRef}
                  className={`absolute ${
                    isDragging ? "" : "transition-all duration-300"
                  } ${
                    isDrawing ? "opacity-95 pointer-events-none" : "opacity-100"
                  } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                  style={{
                    left:
                      !hasDragged && toolbarPosition.x === 0
                        ? "50%"
                        : `${toolbarPosition.x}px`,
                    top: `${toolbarPosition.y}px`,
                    transform:
                      !hasDragged && toolbarPosition.x === 0
                        ? "translateX(-50%)"
                        : "none",
                  }}
                >
                  <div className="bg-slate-900/80 backdrop-blur-lg rounded-2xl px-4 py-3 shadow-2xl border border-white/10">
                    <div className="flex items-center space-x-4">
                      {/* Visual Drag Handle */}
                      <Tooltip content="Drag to move toolbar">
                        <div
                          className="flex flex-col space-y-1 cursor-grab active:cursor-grabbing p-2 rounded-lg hover:bg-white/10 transition-colors"
                          onMouseDown={handleMouseDown}
                        >
                          <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                          <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                          <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                        </div>
                      </Tooltip>

                      {/* Separator */}
                      <div className="w-px h-8 bg-white/20"></div>

                      {/* Text Tool */}
                      <Tooltip content="Text tool - Add text to your image (Press T)">
                        <button
                          onClick={() => setCurrentTool("text")}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                            currentTool === "text"
                              ? "bg-blue-500/80"
                              : "bg-white/10 hover:bg-white/20"
                          }`}
                        >
                          <Type className="w-6 h-6" />
                        </button>
                      </Tooltip>

                      {/* Pen Tool */}
                      <Tooltip content="Pen tool - Draw freehand lines (Press P)">
                        <button
                          onClick={() => setCurrentTool("pen")}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                            currentTool === "pen"
                              ? "bg-blue-500/80"
                              : "bg-white/10 hover:bg-white/20"
                          }`}
                        >
                          <Pen className="w-6 h-6" />
                        </button>
                      </Tooltip>

                      {/* Rectangle Tool */}
                      <Tooltip content="Rectangle tool - Draw rectangles (Press R)">
                        <button
                          onClick={() => setCurrentTool("rectangle")}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                            currentTool === "rectangle"
                              ? "bg-blue-500/80"
                              : "bg-white/10 hover:bg-white/20"
                          }`}
                        >
                          <Square className="w-6 h-6" />
                        </button>
                      </Tooltip>

                      {/* Arrow Tool */}
                      <Tooltip content="Arrow tool - Draw arrows (Press A)">
                        <button
                          onClick={() => setCurrentTool("arrow")}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                            currentTool === "arrow"
                              ? "bg-blue-500/80"
                              : "bg-white/10 hover:bg-white/20"
                          }`}
                        >
                          <ArrowRight className="w-6 h-6" />
                        </button>
                      </Tooltip>

                      {/* Background Tool */}
                      <Tooltip content="Background tool - Add colored backgrounds (Press B)">
                        <button
                          onClick={() => setCurrentTool("background")}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                            currentTool === "background"
                              ? "bg-blue-500/80"
                              : "bg-white/10 hover:bg-white/20"
                          }`}
                        >
                          <Palette className="w-6 h-6" />
                        </button>
                      </Tooltip>

                      {/* Separator */}
                      <div className="w-px h-8 bg-white/20"></div>

                      {/* Undo Button */}
                      <Tooltip content="Undo - Undo last action (Ctrl+Z / Cmd+Z)">
                        <button
                          onClick={undo}
                          disabled={!canUndo}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                            canUndo
                              ? "bg-white/10 hover:bg-white/20"
                              : "bg-white/5 text-white/30 cursor-not-allowed"
                          }`}
                        >
                          <Undo className="w-6 h-6" />
                        </button>
                      </Tooltip>

                      {/* Redo Button */}
                      <Tooltip content="Redo - Redo last undone action (Ctrl+Y / Cmd+Y)">
                        <button
                          onClick={redo}
                          disabled={!canRedo}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                            canRedo
                              ? "bg-white/10 hover:bg-white/20"
                              : "bg-white/5 text-white/30 cursor-not-allowed"
                          }`}
                        >
                          <Redo className="w-6 h-6" />
                        </button>
                      </Tooltip>

                      {/* Separator */}
                      <div className="w-px h-8 bg-white/20"></div>

                      {/* Clear All Button */}
                      <Tooltip content="Clear all drawings - Remove all annotations">
                        <button
                          onClick={() => clearDrawings()}
                          className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
                        >
                          <RotateCcw className="w-6 h-6" />
                        </button>
                      </Tooltip>

                      {/* Download Button */}
                      <Tooltip content="Download image - Save annotated screenshot">
                        <button
                          onClick={() => downloadAnnotatedImage()}
                          className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
                        >
                          <Download className="w-6 h-6" />
                        </button>
                      </Tooltip>

                      {/* New Image Button */}
                      <Tooltip content="New image - Upload a different screenshot">
                        <button
                          onClick={() => setUploadedImage(null)}
                          className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Global Tooltip */}
        {tooltip.show && (
          <div
            className="fixed z-[9999] px-3 py-2 text-sm text-white bg-slate-900/95 backdrop-blur-lg rounded-lg shadow-xl border border-white/10 pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{
              left: tooltip.x,
              top: tooltip.y,
            }}
          >
            {tooltip.content}
            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900/95"></div>
          </div>
        )}
      </div>
    </div>
  );
}
