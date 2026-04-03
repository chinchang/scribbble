"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  Rotate3d,
  Stamp,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Tool =
  | "pen"
  | "rectangle"
  | "arrow"
  | "text"
  | "background"
  | "blur"
  | "step";

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

// --- Programmatic sound effects via Web Audio API ---
let audioCtx: AudioContext | null = null;
const getAudioCtx = () => {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
};

const sfx = {
  // Short click for tool selection
  click: () => {
    const ctx = getAudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.setValueAtTime(800, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.05);
  },

  // Pop for placing annotations (step marker, text)
  pop: () => {
    const ctx = getAudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.setValueAtTime(400, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.1);
  },

  // Drawing complete - soft rising tone
  done: () => {
    const ctx = getAudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.setValueAtTime(500, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.12);
  },

  // Undo - descending swoosh
  undo: () => {
    const ctx = getAudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.setValueAtTime(600, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.12);
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.12);
  },

  // Redo - ascending swoosh
  redo: () => {
    const ctx = getAudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.setValueAtTime(300, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.12);
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.12);
  },

  // Copy/download - camera shutter two-tone
  shutter: () => {
    const ctx = getAudioCtx();
    [0, 0.06].forEach((delay, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square";
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.setValueAtTime(i === 0 ? 1200 : 900, ctx.currentTime + delay);
      g.gain.setValueAtTime(0.08, ctx.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.04);
      o.start(ctx.currentTime + delay);
      o.stop(ctx.currentTime + delay + 0.04);
    });
  },

  // Clear/delete - noise burst
  clear: () => {
    const ctx = getAudioCtx();
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    src.buffer = buffer;
    src.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    src.start(ctx.currentTime);
  },

  // Toggle on - two ascending notes
  toggleOn: () => {
    const ctx = getAudioCtx();
    [0, 0.07].forEach((delay, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.setValueAtTime(i === 0 ? 500 : 700, ctx.currentTime + delay);
      g.gain.setValueAtTime(0.15, ctx.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.06);
      o.start(ctx.currentTime + delay);
      o.stop(ctx.currentTime + delay + 0.06);
    });
  },

  // Toggle off - two descending notes
  toggleOff: () => {
    const ctx = getAudioCtx();
    [0, 0.07].forEach((delay, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.setValueAtTime(i === 0 ? 700 : 500, ctx.currentTime + delay);
      g.gain.setValueAtTime(0.15, ctx.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.06);
      o.start(ctx.currentTime + delay);
      o.stop(ctx.currentTime + delay + 0.06);
    });
  },

  // Tick for +/- adjustments
  tick: (up: boolean) => {
    const ctx = getAudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.setValueAtTime(up ? 1000 : 800, ctx.currentTime);
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.03);
  },

  // Welcome chime for image upload
  chime: () => {
    const ctx = getAudioCtx();
    [0, 0.1, 0.2].forEach((delay, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.setValueAtTime([523, 659, 784][i], ctx.currentTime + delay);
      g.gain.setValueAtTime(0.12, ctx.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.15);
      o.start(ctx.currentTime + delay);
      o.stop(ctx.currentTime + delay + 0.15);
    });
  },
};

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
  const [brushSize, setBrushSize] = useState(4);
  const [bgPadding, setBgPadding] = useState(40);
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const [watermarkText, setWatermarkText] = useState("");
  const [showWatermarkInput, setShowWatermarkInput] = useState(false);

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

  const backgroundImages = Array.from(
    { length: 13 },
    (_, i) => `/bgs/wp-${i + 1}.avif`,
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const stepCounterRef = useRef<number>(1);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const bgPaletteRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setDrawings([]);
        stepCounterRef.current = 1;
        setTiltEnabled(false);
        setTiltX(0);
        setTiltY(0);
        sfx.chime();
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
    [isDragging, dragOffset],
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
      if (isTextInputActive || showWatermarkInput) return;

      // Check for Ctrl+C or Cmd+C
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && !e.shiftKey) {
        e.preventDefault();
        copyToClipboard();
        return;
      }

      // Check for Ctrl+S or Cmd+S (Download)
      if ((e.ctrlKey || e.metaKey) && e.key === "s" && !e.shiftKey) {
        e.preventDefault();
        downloadAnnotatedImage();
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

      // Arrow keys for 3D tilt
      if (tiltEnabled && !e.ctrlKey && !e.metaKey) {
        switch (e.key) {
          case "ArrowUp":
            e.preventDefault();
            setTiltX((prev) => Math.min(prev + 5, 30));
            sfx.tick(true);
            return;
          case "ArrowDown":
            e.preventDefault();
            setTiltX((prev) => Math.max(prev - 5, -30));
            sfx.tick(false);
            return;
          case "ArrowLeft":
            e.preventDefault();
            setTiltY((prev) => Math.max(prev - 5, -30));
            sfx.tick(false);
            return;
          case "ArrowRight":
            e.preventDefault();
            setTiltY((prev) => Math.min(prev + 5, 30));
            sfx.tick(true);
            return;
          case "Delete":
          case "Backspace":
            e.preventDefault();
            setTiltX(0);
            setTiltY(0);
            sfx.clear();
            return;
        }
      }

      if (e.key === "=" || e.key === "+") {
        e.preventDefault();
        if (currentTool === "background") {
          setBgPadding((prev) => Math.min(prev + 10, 200));
        } else {
          setBrushSize((prev) => Math.min(prev + 2, 20));
        }
        sfx.tick(true);
        return;
      }
      if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        if (currentTool === "background") {
          setBgPadding((prev) => Math.max(prev - 10, 10));
        } else {
          setBrushSize((prev) => Math.max(prev - 2, 2));
        }
        sfx.tick(false);
        return;
      }

      switch (e.key) {
        case "p":
        case "P":
          setCurrentTool("pen");
          sfx.click();
          break;
        case "r":
        case "R":
          setCurrentTool("rectangle");
          sfx.click();
          break;
        case "a":
        case "A":
          setCurrentTool("arrow");
          sfx.click();
          break;
        case "t":
        case "T":
          setCurrentTool("text");
          sfx.click();
          break;
        case "b":
        case "B":
          setCurrentTool("background");
          sfx.click();
          break;
        case "x":
        case "X":
          setCurrentTool("blur");
          sfx.click();
          break;
        case "s":
        case "S":
          setCurrentTool("step");
          sfx.click();
          break;
        case "g":
        case "G":
          if (tiltEnabled) {
            setTiltEnabled(false);
            setTiltX(0);
            setTiltY(0);
            sfx.toggleOff();
          } else {
            setTiltEnabled(true);
            sfx.toggleOn();
          }
          break;
        case "w":
        case "W":
          setShowWatermarkInput((prev) => !prev);
          sfx.click();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTextInputActive, currentTool, tiltEnabled, showWatermarkInput]);

  // Show/hide background palette when switching to/from background tool
  useEffect(() => {
    if (currentTool === "background") {
      setShowColorPalette(true);
    } else {
      setShowColorPalette(false);
    }
    setShowWatermarkInput(false);
  }, [currentTool]);

  // Focus background palette when it opens
  useEffect(() => {
    if (showColorPalette && bgPaletteRef.current) {
      bgPaletteRef.current.focus();
    }
  }, [showColorPalette]);

  // Focus text input when it becomes active
  useEffect(() => {
    if (isTextInputActive && textInputRef.current) {
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 50); // Small delay to ensure input is rendered
    }
  }, [isTextInputActive]);

  // Redraw canvas when drawings or tilt change
  useEffect(() => {
    redrawCanvas();
  }, [drawings, backgroundState, tiltEnabled, tiltX, tiltY, watermarkText]);

  // Effect to handle canvas resizing when background state or padding changes
  useEffect(() => {
    if (uploadedImage) {
      handleImageLoad();
    }
  }, [backgroundState, bgPadding, tiltEnabled, tiltX, tiltY]);

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
        strokeWidth: brushSize,
        stepNumber: stepCounterRef.current++,
      };
      setDrawings((prev) => [...prev, newDrawing]);
      sfx.pop();
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
    const offsetX = parseFloat(canvas.dataset.imageOffsetX || "0");
    const offsetY = parseFloat(canvas.dataset.imageOffsetY || "0");

    // Draw current path with correct offset
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = brushSize;
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
        point.y - startPoint.y,
      );
    } else if (currentTool === "arrow") {
      const startPoint = currentPath[0];
      drawArrow(
        ctx,
        startPoint.x + offsetX,
        startPoint.y + offsetY,
        point.x + offsetX,
        point.y + offsetY,
      );
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
        point.y - startPoint.y,
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
      strokeWidth: brushSize,
    };

    // Save current state before adding new drawing
    saveToHistory();
    setDrawings((prev) => [...prev, newDrawing]);
    setCurrentPath([]);
    sfx.done();
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
      strokeWidth: brushSize + 2,
      text: text.trim(),
      fontSize: Math.max(16, brushSize * 5),
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
    sfx.pop();
    setTextPosition(null);
  };

  const handleBackgroundColorSelect = (color: string) => {
    saveToHistory();
    setBackgroundState({ type: "solid", color });
    sfx.pop();
  };

  const handleBackgroundGradientSelect = (gradient: {
    from: string;
    to: string;
    angle: number;
  }) => {
    saveToHistory();
    setBackgroundState({ type: "gradient", color: null, gradient });
    sfx.pop();
  };

  const handleBackgroundImageSelect = (src: string) => {
    saveToHistory();
    const img = new Image();
    img.src = src;
    img.onload = () => {
      bgImageRef.current = img;
      setBackgroundState({ type: "image", color: null, imageSrc: src });
      sfx.pop();
    };
  };

  const clearBackground = () => {
    saveToHistory();
    bgImageRef.current = null;
    setBackgroundState({ type: null, color: null });
    sfx.clear();
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
      return d.type === "step" && d.stepNumber
        ? Math.max(max, d.stepNumber)
        : max;
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
      sfx.undo();
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
      sfx.redo();
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
        canvas.toBlob((result) => resolve(result), "image/png"),
      );

      if (!blob) {
        throw new Error("Canvas blob generation failed");
      }

      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);

      sfx.shutter();
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

  const drawBackground = (
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
  ) => {
    if (!backgroundState.type) return;

    if (backgroundState.type === "solid" && backgroundState.color) {
      ctx.fillStyle = backgroundState.color;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else if (
      backgroundState.type === "gradient" &&
      backgroundState.gradient
    ) {
      const { from, to, angle } = backgroundState.gradient;
      const rad = (angle * Math.PI) / 180;
      const cx = canvasWidth / 2;
      const cy = canvasHeight / 2;
      const len =
        Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight) / 2;
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
      let sx = 0,
        sy = 0,
        sw = bgImg.naturalWidth,
        sh = bgImg.naturalHeight;
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
    height: number,
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
          Math.min(pixelSize, rh - py),
        );
      }
    }
  };

  const drawStepMarker = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    stepNumber: number,
    color: string,
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

  const FOCAL_LENGTH = 1500;

  const getProjectedSize = (
    srcW: number,
    srcH: number,
    tiltXDeg: number,
    tiltYDeg: number,
  ): { width: number; height: number } => {
    let w = srcW;
    let h = srcH;

    if (tiltYDeg !== 0) {
      const angle = (tiltYDeg * Math.PI) / 180;
      const centerX = srcW / 2;
      let totalW = 0;
      let maxScale = 0;
      for (let x = 0; x < srcW; x++) {
        const depth = FOCAL_LENGTH + (x - centerX) * Math.sin(angle);
        const scale = FOCAL_LENGTH / depth;
        totalW += scale;
        maxScale = Math.max(maxScale, scale);
      }
      w = totalW;
      h = srcH * maxScale;
    }

    if (tiltXDeg !== 0) {
      const angle = (tiltXDeg * Math.PI) / 180;
      const centerY = h / 2;
      let totalH = 0;
      let maxScale = 0;
      for (let y = 0; y < Math.ceil(h); y++) {
        const depth = FOCAL_LENGTH + (y - centerY) * Math.sin(angle);
        const scale = FOCAL_LENGTH / depth;
        totalH += scale;
        maxScale = Math.max(maxScale, scale);
      }
      h = totalH;
      w = w * maxScale;
    }

    return { width: Math.ceil(w), height: Math.ceil(h) };
  };

  const drawTiltedImage = (
    ctx: CanvasRenderingContext2D,
    sourceCanvas: HTMLCanvasElement,
    canvasW: number,
    canvasH: number,
    tiltXDeg: number,
    tiltYDeg: number,
    outputScale: number = 1,
  ) => {
    const srcW = sourceCanvas.width;
    const srcH = sourceCanvas.height;

    let currentSource: HTMLCanvasElement = sourceCanvas;

    // Apply Y-tilt (vertical strips)
    if (tiltYDeg !== 0) {
      const angle = (tiltYDeg * Math.PI) / 180;
      const projected = getProjectedSize(srcW, srcH, 0, tiltYDeg);
      const intermediate = document.createElement("canvas");
      intermediate.width = projected.width;
      intermediate.height = projected.height;
      const intCtx = intermediate.getContext("2d")!;

      const centerX = srcW / 2;
      let drawX = 0;

      for (let x = 0; x < srcW; x++) {
        const depth = FOCAL_LENGTH + (x - centerX) * Math.sin(angle);
        const scale = FOCAL_LENGTH / depth;
        const stripH = srcH * scale;
        const stripW = scale;
        const yOffset = (projected.height - stripH) / 2;

        intCtx.drawImage(
          currentSource,
          x,
          0,
          1,
          srcH,
          drawX,
          yOffset,
          stripW + 0.5,
          stripH + 0.5,
        );
        drawX += stripW;
      }
      currentSource = intermediate;
    }

    // Apply X-tilt (horizontal strips)
    if (tiltXDeg !== 0) {
      const angle = (tiltXDeg * Math.PI) / 180;
      const prevW = currentSource.width;
      const prevH = currentSource.height;
      const projected = getProjectedSize(prevW, prevH, tiltXDeg, 0);
      const final = document.createElement("canvas");
      final.width = projected.width;
      final.height = projected.height;
      const finCtx = final.getContext("2d")!;

      const centerY = prevH / 2;
      let drawY = 0;

      for (let y = 0; y < prevH; y++) {
        const depth = FOCAL_LENGTH + (y - centerY) * Math.sin(angle);
        const scale = FOCAL_LENGTH / depth;
        const stripW = prevW * scale;
        const stripH = scale;
        const xOffset = (projected.width - stripW) / 2;

        finCtx.drawImage(
          currentSource,
          0,
          y,
          prevW,
          1,
          xOffset,
          drawY,
          stripW + 0.5,
          stripH + 0.5,
        );
        drawY += stripH;
      }
      currentSource = final;
    }

    // Draw centered on main canvas, scaling down if rendered at higher res
    const destW = currentSource.width / outputScale;
    const destH = currentSource.height / outputScale;
    ctx.drawImage(
      currentSource,
      (canvasW - destW) / 2,
      (canvasH - destH) / 2,
      destW,
      destH,
    );
  };

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
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
      toY - headLength * Math.sin(angle - Math.PI / 6),
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6),
    );
    ctx.stroke();
  };

  // Shared function: render image + annotations onto a given context
  const renderFlatContent = (
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    imageDisplayWidth: number,
    imageDisplayHeight: number,
    offsetX: number,
    offsetY: number,
  ) => {
    const borderRadius = 12;

    // Image with rounded corners
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(
      offsetX,
      offsetY,
      imageDisplayWidth,
      imageDisplayHeight,
      borderRadius,
    );
    ctx.clip();
    ctx.drawImage(
      image,
      offsetX,
      offsetY,
      imageDisplayWidth,
      imageDisplayHeight,
    );
    ctx.restore();

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
          endPoint.y - startPoint.y,
        );
      } else if (drawing.type === "arrow") {
        const startPoint = drawing.points[0];
        const endPoint = drawing.points[drawing.points.length - 1];
        drawArrow(
          ctx,
          startPoint.x + offsetX,
          startPoint.y + offsetY,
          endPoint.x + offsetX,
          endPoint.y + offsetY,
        );
      } else if (drawing.type === "text" && drawing.text) {
        const point = drawing.points[0];
        ctx.fillStyle = drawing.color;
        ctx.font = `bold ${drawing.fontSize || 20}px Arial`;
        ctx.textBaseline = "top";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.strokeText(drawing.text, point.x + offsetX, point.y + offsetY);
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
          endPoint.y - startPoint.y,
        );
      } else if (drawing.type === "step" && drawing.stepNumber) {
        const point = drawing.points[0];
        drawStepMarker(
          ctx,
          point.x + offsetX,
          point.y + offsetY,
          drawing.stepNumber,
          drawing.color,
        );
      }
    });
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const image = imageRef.current;

    if (!ctx || !canvas || !image) return;

    const imageDisplayWidth = parseFloat(
      canvas.dataset.imageDisplayWidth || "0",
    );
    const imageDisplayHeight = parseFloat(
      canvas.dataset.imageDisplayHeight || "0",
    );
    const offsetX = parseFloat(canvas.dataset.imageOffsetX || "0");
    const offsetY = parseFloat(canvas.dataset.imageOffsetY || "0");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(ctx, canvas.width, canvas.height);

    if (tiltEnabled && (tiltX !== 0 || tiltY !== 0)) {
      // Render flat content at 2x for sharper tilt output
      const scale = 2;
      const offscreen = document.createElement("canvas");
      offscreen.width = imageDisplayWidth * scale;
      offscreen.height = imageDisplayHeight * scale;
      const offCtx = offscreen.getContext("2d")!;
      offCtx.scale(scale, scale);
      renderFlatContent(offCtx, image, imageDisplayWidth, imageDisplayHeight, 0, 0);

      // Draw shadow: apply shadow to the tilted image drawImage call
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
      ctx.shadowBlur = 40;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 12;
      drawTiltedImage(ctx, offscreen, canvas.width, canvas.height, tiltX, tiltY, scale);
      ctx.restore();
    } else {
      // Draw shadow behind flat image
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
      ctx.shadowBlur = 40;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 12;
      ctx.beginPath();
      ctx.roundRect(offsetX, offsetY, imageDisplayWidth, imageDisplayHeight, 12);
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.fill();
      ctx.restore();

      renderFlatContent(ctx, image, imageDisplayWidth, imageDisplayHeight, offsetX, offsetY);
    }

    // Watermarks
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 13px sans-serif";
    ctx.textBaseline = "bottom";

    // "Made with Scribbble" - always shown, bottom-left
    ctx.textAlign = "left";
    ctx.fillText("MADE WITH SCRIBBBLE", 20, canvas.height - 16);

    // Custom watermark - bottom-right
    if (watermarkText) {
      ctx.textAlign = "right";
      ctx.fillText(watermarkText.toUpperCase(), canvas.width - 20, canvas.height - 16);
    }

    ctx.restore();
  };

  const handleImageLoad = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    const container = containerRef.current;

    if (!canvas || !image || !container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const padding = backgroundState.type ? bgPadding : 0;

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

    // Canvas size includes padding and tilt projection
    let canvasWidth, canvasHeight;
    if (tiltEnabled && (tiltX !== 0 || tiltY !== 0)) {
      const proj = getProjectedSize(
        imageDisplayWidth,
        imageDisplayHeight,
        tiltX,
        tiltY,
      );
      // Extra space for shadow bleed
      canvasWidth = proj.width + padding * 2 + 60;
      canvasHeight = proj.height + padding * 2 + 60;
    } else {
      canvasWidth = imageDisplayWidth + padding * 2;
      canvasHeight = imageDisplayHeight + padding * 2;
    }

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
    sfx.clear();
  };

  const downloadAnnotatedImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    sfx.shutter();

    const link = document.createElement("a");
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, "_");
    const time = now.toTimeString().slice(0, 8).replace(/:/g, "_");
    link.download = `scribbble-screenshot-${date}-${time}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const isToolActive = (tool: Tool) =>
    currentTool === tool && !showWatermarkInput;

  const selectTool = (tool: Tool) => {
    setCurrentTool(tool);
    sfx.click();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Scribbble&apos;s</span> Screenshot Annotator
          </h1>
        </div>

        {!uploadedImage ? (
          <div className="flex items-center justify-center" style={{ minHeight: "70vh" }}>
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
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex justify-center">
              <div
                ref={toolbarRef}
                className={`relative ${
                  isDrawing ? "opacity-95 pointer-events-none" : "opacity-100"
                }`}
              >
                <div className="bg-slate-900/80 backdrop-blur-lg rounded-2xl px-4 py-3 shadow-2xl border border-white/10">
                  <div className="flex items-center space-x-4">

                    {/* Text Tool */}
                    <Tooltip content="Text tool - Add text to your image (Press T)">
                      <button
                        onClick={() => selectTool("text")}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                          isToolActive("text")
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
                        onClick={() => selectTool("step")}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                          isToolActive("step")
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
                        onClick={() => selectTool("pen")}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                          isToolActive("pen")
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
                        onClick={() => selectTool("rectangle")}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                          isToolActive("rectangle")
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
                        onClick={() => selectTool("arrow")}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                          isToolActive("arrow")
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
                        onClick={() => selectTool("background")}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                          isToolActive("background")
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
                        onClick={() => selectTool("blur")}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                          isToolActive("blur")
                            ? "bg-blue-500/80"
                            : "bg-white/10 hover:bg-white/20"
                        }`}
                      >
                        <EyeOff className="w-6 h-6" />
                      </button>
                    </Tooltip>

                    {/* Tilt Toggle */}
                    <Tooltip content="3D Tilt - Rotate screenshot with arrow keys (Press G)">
                      <button
                        onClick={() => {
                          if (tiltEnabled) {
                            setTiltEnabled(false);
                            setTiltX(0);
                            setTiltY(0);
                            sfx.toggleOff();
                          } else {
                            setTiltEnabled(true);
                            sfx.toggleOn();
                          }
                        }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                          tiltEnabled
                            ? "bg-blue-500/80"
                            : "bg-white/10 hover:bg-white/20"
                        }`}
                      >
                        <Rotate3d className="w-6 h-6" />
                      </button>
                    </Tooltip>

                    {/* Watermark */}
                    <Tooltip content="Watermark - Add custom text (Press W)">
                      <button
                        onClick={() => { setShowWatermarkInput((prev) => !prev); sfx.click(); }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                          showWatermarkInput || watermarkText
                            ? "bg-blue-500/80"
                            : "bg-white/10 hover:bg-white/20"
                        }`}
                      >
                        <Stamp className="w-6 h-6" />
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
                    <Tooltip content="Download image - Save annotated screenshot (Ctrl+S / Cmd+S)">
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
                {/* Watermark Input Dropdown */}
                {showWatermarkInput && (
                  <div className="absolute top-full right-0 mt-2 bg-slate-900/90 backdrop-blur-lg rounded-xl p-3 shadow-2xl border border-white/10 w-56 z-50">
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === "Escape") {
                          setShowWatermarkInput(false);
                        }
                        e.stopPropagation();
                      }}
                      placeholder="e.g. @username"
                      autoFocus
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/40 outline-none focus:border-blue-400"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Canvas Area */}
            <div
              ref={containerRef}
              className="relative w-full flex-1 flex items-center justify-center overflow-hidden"
              style={{
                minHeight: "70vh",
                cursor:
                  currentTool === "pen" ||
                  currentTool === "blur" ||
                  currentTool === "step"
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
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="max-w-full max-h-full rounded-lg"
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
              </div>
            </div>
          </div>
        )}

        {/* Background Palette - Fixed on right side */}
        {showColorPalette && (
          <div ref={bgPaletteRef} tabIndex={-1} className="fixed top-1/2 right-4 -translate-y-1/2 bg-slate-900/90 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/10 z-50 w-72 outline-none">
            {/* Tabs */}
            <div className="flex gap-1 mb-3 bg-white/5 rounded-lg p-1">
              {(["solid", "gradient", "image"] as BackgroundType[]).map(
                (tab) => (
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
                ),
              )}
            </div>

            {/* Solid Colors */}
            {bgTab === "solid" && (
              <div className="grid grid-cols-5 gap-2">
                {backgroundColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleBackgroundColorSelect(color)}
                    className={`w-10 h-10 rounded-lg border-2 transition-colors hover:scale-110 transform ${
                      backgroundState.type === "solid" &&
                      backgroundState.color === color
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
                      backgroundState.type === "image" &&
                      backgroundState.imageSrc === src
                        ? "border-blue-400"
                        : "border-white/20 hover:border-white/50"
                    }`}
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
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

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground/60 py-6">
          Brought to you by <a href="/" className="gradient-text font-semibold hover:underline">Scribbble</a> — the beautiful screen annotator for MacOS
        </p>

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
