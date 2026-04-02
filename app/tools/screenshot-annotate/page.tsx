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
  EyeOff,
  Hash,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Tool = "pen" | "rectangle" | "arrow" | "text" | "background" | "blur" | "step";

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
  stepNumber?: number;
}

type BackgroundType = "solid" | "gradient" | "image";

interface BackgroundState {
  type: BackgroundType | null;
  color: string | null;
  gradient?: { from: string; to: string; angle: number };
  imageSrc?: string;
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
    type: null,
    color: null,
  });
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [bgTab, setBgTab] = useState<BackgroundType>("solid");
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

  const backgroundGradients = [
    { from: "#667eea", to: "#764ba2", angle: 135 },
    { from: "#f093fb", to: "#f5576c", angle: 135 },
    { from: "#4facfe", to: "#00f2fe", angle: 135 },
    { from: "#43e97b", to: "#38f9d7", angle: 135 },
    { from: "#fa709a", to: "#fee140", angle: 135 },
    { from: "#a18cd1", to: "#fbc2eb", angle: 135 },
    { from: "#fccb90", to: "#d57eeb", angle: 135 },
    { from: "#e0c3fc", to: "#8ec5fc", angle: 135 },
    { from: "#f5f7fa", to: "#c3cfe2", angle: 135 },
    { from: "#0c0c0c", to: "#434343", angle: 135 },
  ];

  const backgroundImages = Array.from({ length: 13 }, (_, i) => `/bgs/wp-${i + 1}.avif`);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const stepCounterRef = useRef<number>(1);
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setDrawings([]);
        stepCounterRef.current = 1;
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
        case "x":
        case "X":
          setCurrentTool("blur");
          break;
        case "s":
        case "S":
          setCurrentTool("step");
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTextInputActive]);

  // Show/hide background palette when switching to/from background tool
  useEffect(() => {
    if (currentTool === "background") {
      setShowColorPalette(true);
    } else {
      setShowColorPalette(false);
    }
  }, [currentTool]);

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

    // Apply background
    drawBackground(ctx, canvas.width, canvas.height);

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
      } else if (drawing.type === "blur") {
        const startPoint = drawing.points[0];
        const endPoint = drawing.points[drawing.points.length - 1];
        drawPixelatedRegion(
          ctx,
          startPoint.x + offsetX,
          startPoint.y + offsetY,
          endPoint.x - startPoint.x,
          endPoint.y - startPoint.y
        );
      } else if (drawing.type === "step" && drawing.stepNumber) {
        const point = drawing.points[0];
        drawStepMarker(ctx, point.x + offsetX, point.y + offsetY, drawing.stepNumber, drawing.color);
      }
    });
  }, [drawings, backgroundState]);

  // Effect to handle canvas resizing when background state changes
  useEffect(() => {
    if (uploadedImage) {
      handleImageLoad();
    }
  }, [backgroundState]);


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
      return;
    }

    if (currentTool === "step") {
      const point = getMousePos(e);
      saveToHistory();
      const newDrawing: DrawingElement = {
        type: "step",
        points: [point],
        color: "#ef4444",
        strokeWidth: 4,
        stepNumber: stepCounterRef.current++,
      };
      setDrawings((prev) => [...prev, newDrawing]);
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

    // Get image offset for preview drawing
    const offsetX = parseFloat(canvas.dataset.imageOffsetX || '0');
    const offsetY = parseFloat(canvas.dataset.imageOffsetY || '0');

    // Draw current path with correct offset
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (currentTool === "pen") {
      ctx.beginPath();
      currentPath.concat([point]).forEach((p, i) => {
        if (i === 0) {
          ctx.moveTo(p.x + offsetX, p.y + offsetY);
        } else {
          ctx.lineTo(p.x + offsetX, p.y + offsetY);
        }
      });
      ctx.stroke();
    } else if (currentTool === "rectangle") {
      const startPoint = currentPath[0];
      ctx.strokeRect(
        startPoint.x + offsetX,
        startPoint.y + offsetY,
        point.x - startPoint.x,
        point.y - startPoint.y
      );
    } else if (currentTool === "arrow") {
      const startPoint = currentPath[0];
      drawArrow(ctx, startPoint.x + offsetX, startPoint.y + offsetY, point.x + offsetX, point.y + offsetY);
    } else if (currentTool === "blur") {
      const startPoint = currentPath[0];
      // Draw dashed rectangle preview
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        startPoint.x + offsetX,
        startPoint.y + offsetY,
        point.x - startPoint.x,
        point.y - startPoint.y
      );
      ctx.setLineDash([]);
    }
  };

  const stopDrawing = () => {
    if (!isDrawing || currentPath.length === 0) return;

    setIsDrawing(false);

    const newDrawing: DrawingElement = {
      type: currentTool,
      points: [...currentPath],
      color: "#ef4444",
      strokeWidth: 4,
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
      strokeWidth: 6,
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
    setBackgroundState({ type: "solid", color });
  };

  const handleBackgroundGradientSelect = (gradient: { from: string; to: string; angle: number }) => {
    saveToHistory();
    setBackgroundState({ type: "gradient", color: null, gradient });
  };

  const handleBackgroundImageSelect = (src: string) => {
    saveToHistory();
    const img = new Image();
    img.src = src;
    img.onload = () => {
      bgImageRef.current = img;
      setBackgroundState({ type: "image", color: null, imageSrc: src });
    };
  };

  const clearBackground = () => {
    saveToHistory();
    bgImageRef.current = null;
    setBackgroundState({ type: null, color: null });
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

  const restoreBgImage = (state: BackgroundState) => {
    if (state.type === "image" && state.imageSrc) {
      const img = new Image();
      img.src = state.imageSrc;
      img.onload = () => {
        bgImageRef.current = img;
        redrawCanvas();
      };
    } else {
      bgImageRef.current = null;
    }
  };

  const recalcStepCounter = (drawingsList: DrawingElement[]) => {
    const maxStep = drawingsList.reduce((max, d) => {
      return d.type === "step" && d.stepNumber ? Math.max(max, d.stepNumber) : max;
    }, 0);
    stepCounterRef.current = maxStep + 1;
  };

  // Undo function
  const undo = () => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setDrawings(previousState.drawings);
      setBackgroundState(previousState.backgroundState);
      setHistoryIndex(historyIndex - 1);
      recalcStepCounter(previousState.drawings);
      restoreBgImage(previousState.backgroundState);
    }
  };

  // Redo function
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setDrawings(nextState.drawings);
      setBackgroundState(nextState.backgroundState);
      setHistoryIndex(historyIndex + 1);
      recalcStepCounter(nextState.drawings);
      restoreBgImage(nextState.backgroundState);
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

  const drawBackground = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    if (!backgroundState.type) return;

    if (backgroundState.type === "solid" && backgroundState.color) {
      ctx.fillStyle = backgroundState.color;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else if (backgroundState.type === "gradient" && backgroundState.gradient) {
      const { from, to, angle } = backgroundState.gradient;
      const rad = (angle * Math.PI) / 180;
      const cx = canvasWidth / 2;
      const cy = canvasHeight / 2;
      const len = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight) / 2;
      const x0 = cx - Math.cos(rad) * len;
      const y0 = cy - Math.sin(rad) * len;
      const x1 = cx + Math.cos(rad) * len;
      const y1 = cy + Math.sin(rad) * len;
      const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
      gradient.addColorStop(0, from);
      gradient.addColorStop(1, to);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else if (backgroundState.type === "image" && bgImageRef.current) {
      const bgImg = bgImageRef.current;
      const bgAspect = bgImg.naturalWidth / bgImg.naturalHeight;
      const canvasAspect = canvasWidth / canvasHeight;
      let sx = 0, sy = 0, sw = bgImg.naturalWidth, sh = bgImg.naturalHeight;
      if (bgAspect > canvasAspect) {
        sw = bgImg.naturalHeight * canvasAspect;
        sx = (bgImg.naturalWidth - sw) / 2;
      } else {
        sh = bgImg.naturalWidth / canvasAspect;
        sy = (bgImg.naturalHeight - sh) / 2;
      }
      ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, canvasWidth, canvasHeight);
    }
  };

  const drawPixelatedRegion = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    // Normalize negative dimensions
    const rx = width < 0 ? x + width : x;
    const ry = height < 0 ? y + height : y;
    const rw = Math.abs(width);
    const rh = Math.abs(height);

    if (rw < 1 || rh < 1) return;

    const pixelSize = 10;
    const imageData = ctx.getImageData(rx, ry, rw, rh);
    const data = imageData.data;

    for (let py = 0; py < rh; py += pixelSize) {
      for (let px = 0; px < rw; px += pixelSize) {
        // Sample center pixel of block
        const sampleX = Math.min(px + Math.floor(pixelSize / 2), rw - 1);
        const sampleY = Math.min(py + Math.floor(pixelSize / 2), rh - 1);
        const idx = (sampleY * rw + sampleX) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(
          rx + px,
          ry + py,
          Math.min(pixelSize, rw - px),
          Math.min(pixelSize, rh - py)
        );
      }
    }
  };

  const drawStepMarker = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    stepNumber: number,
    color: string
  ) => {
    const radius = 16;

    // Dark border
    ctx.beginPath();
    ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
    ctx.fillStyle = "#000000";
    ctx.fill();

    // Colored circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Number text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(stepNumber), x, y);

    // Reset text alignment
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
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

    // Apply background
    drawBackground(ctx, canvas.width, canvas.height);

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
      } else if (drawing.type === "blur") {
        const startPoint = drawing.points[0];
        const endPoint = drawing.points[drawing.points.length - 1];
        drawPixelatedRegion(
          ctx,
          startPoint.x + offsetX,
          startPoint.y + offsetY,
          endPoint.x - startPoint.x,
          endPoint.y - startPoint.y
        );
      } else if (drawing.type === "step" && drawing.stepNumber) {
        const point = drawing.points[0];
        drawStepMarker(ctx, point.x + offsetX, point.y + offsetY, drawing.stepNumber, drawing.color);
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
    const padding = backgroundState.type ? 40 : 0;

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
                    currentTool === "pen" || currentTool === "blur" || currentTool === "step"
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

                  {/* Background Palette */}
                  {showColorPalette && (
                    <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/10 z-50 w-72">
                      {/* Tabs */}
                      <div className="flex gap-1 mb-3 bg-white/5 rounded-lg p-1">
                        {(["solid", "gradient", "image"] as BackgroundType[]).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setBgTab(tab)}
                            className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                              bgTab === tab
                                ? "bg-white/20 text-white"
                                : "text-white/50 hover:text-white/80"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>

                      {/* Solid Colors */}
                      {bgTab === "solid" && (
                        <div className="grid grid-cols-5 gap-2">
                          {backgroundColors.map((color) => (
                            <button
                              key={color}
                              onClick={() => handleBackgroundColorSelect(color)}
                              className={`w-10 h-10 rounded-lg border-2 transition-colors hover:scale-110 transform ${
                                backgroundState.type === "solid" && backgroundState.color === color
                                  ? "border-blue-400"
                                  : "border-white/20 hover:border-white/50"
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Gradients */}
                      {bgTab === "gradient" && (
                        <div className="grid grid-cols-5 gap-2">
                          {backgroundGradients.map((g, i) => (
                            <button
                              key={i}
                              onClick={() => handleBackgroundGradientSelect(g)}
                              className={`w-10 h-10 rounded-lg border-2 transition-colors hover:scale-110 transform ${
                                backgroundState.type === "gradient" &&
                                backgroundState.gradient?.from === g.from &&
                                backgroundState.gradient?.to === g.to
                                  ? "border-blue-400"
                                  : "border-white/20 hover:border-white/50"
                              }`}
                              style={{
                                background: `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})`,
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Images */}
                      {bgTab === "image" && (
                        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                          {backgroundImages.map((src) => (
                            <button
                              key={src}
                              onClick={() => handleBackgroundImageSelect(src)}
                              className={`w-14 h-14 rounded-lg border-2 transition-colors hover:scale-105 transform overflow-hidden ${
                                backgroundState.type === "image" && backgroundState.imageSrc === src
                                  ? "border-blue-400"
                                  : "border-white/20 hover:border-white/50"
                              }`}
                            >
                              <img src={src} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Clear button */}
                      <div className="mt-3">
                        <button
                          onClick={clearBackground}
                          className="w-full px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                        >
                          Clear Background
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

                      {/* Step Marker Tool */}
                      <Tooltip content="Step marker - Add numbered annotations (Press S)">
                        <button
                          onClick={() => setCurrentTool("step")}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                            currentTool === "step"
                              ? "bg-blue-500/80"
                              : "bg-white/10 hover:bg-white/20"
                          }`}
                        >
                          <Hash className="w-6 h-6" />
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

                      {/* Blur Tool */}
                      <Tooltip content="Blur tool - Pixelate areas to redact (Press X)">
                        <button
                          onClick={() => setCurrentTool("blur")}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                            currentTool === "blur"
                              ? "bg-blue-500/80"
                              : "bg-white/10 hover:bg-white/20"
                          }`}
                        >
                          <EyeOff className="w-6 h-6" />
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
