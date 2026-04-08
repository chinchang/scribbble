"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  Pen,
  Square,
  ArrowRight,
  Download,
  RotateCcw,
  Trash2,
  Type,
  Palette,
  Undo,
  Redo,
  EyeOff,
  Hash,
  Rotate3d,
  Stamp,
  Focus,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { blurCanvas as webglBlur } from "./webgl-blur";

type Tool =
  | "pen"
  | "rectangle"
  | "arrow"
  | "text"
  | "background"
  | "blur"
  | "step"
  | "depthOfField";

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

interface MeshBlob {
  x: number; // 0-100 (% of width)
  y: number; // 0-100 (% of height)
  r: number; // 0-100 (% radius for transparency falloff)
  color: string;
}

interface MeshGradient {
  base: string;
  blobs: MeshBlob[];
}

interface BackgroundState {
  type: BackgroundType | null;
  color: string | null;
  gradient?: MeshGradient;
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
  dofIntensity: number;
  dofXOffset: number;
  dofBandWidth: number;
  tiltX: number;
  tiltY: number;
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

// Animated side panel wrapper — handles mount/unmount animation
interface SidePanelProps {
  isOpen: boolean;
  children: React.ReactNode;
  width?: string;
  innerRef?: React.RefObject<HTMLDivElement | null>;
  tabIndex?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

const SidePanel = ({
  isOpen,
  children,
  width = "w-56",
  innerRef,
  tabIndex,
  onKeyDown,
}: SidePanelProps) => {
  // Keep rendering during the close animation
  const [closing, setClosing] = useState(false);
  const prevIsOpen = useRef(isOpen);

  useEffect(() => {
    if (prevIsOpen.current && !isOpen) {
      setClosing(true);
      const t = setTimeout(() => setClosing(false), 200);
      prevIsOpen.current = isOpen;
      return () => clearTimeout(t);
    }
    prevIsOpen.current = isOpen;
  }, [isOpen]);

  if (!isOpen && !closing) return null;

  return (
    <div
      ref={innerRef}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      className={`fixed top-1/2 right-3 bg-[#1a1a1f]/95 backdrop-blur-xl rounded-xl p-3 shadow-lg shadow-black/30 border border-white/[0.06] z-50 ${width} outline-none transition-[opacity,transform] duration-200 ease-out`}
      style={{
        transform: isOpen
          ? "translateY(-50%) translateX(0)"
          : "translateY(-50%) translateX(1rem)",
        opacity: isOpen ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
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
  const [brushSize, setBrushSize] = useState(8);
  const [bgPadding, setBgPadding] = useState(80);
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const [watermarkText, setWatermarkText] = useState("");
  const [showWatermarkInput, setShowWatermarkInput] = useState(false);
  const [dofIntensity, setDofIntensity] = useState(0);
  const [dofXOffset, setDofXOffset] = useState(50);
  const [dofBandWidth, setDofBandWidth] = useState(10);
  const [showDofPanel, setShowDofPanel] = useState(false);

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

  const backgroundGradients: MeshGradient[] = [
    // 1. Pink / purple / blue
    {
      base: "#7c5cff",
      blobs: [
        { x: 15, y: 20, r: 70, color: "#ff7ab6" },
        { x: 80, y: 30, r: 70, color: "#6a8bff" },
        { x: 50, y: 90, r: 80, color: "#b06bff" },
      ],
    },
    // 3. Deep navy
    {
      base: "#0a1238",
      blobs: [
        { x: 25, y: 30, r: 65, color: "#3a3f9e" },
        { x: 75, y: 70, r: 65, color: "#1f2a78" },
        { x: 90, y: 15, r: 50, color: "#5b6cff" },
      ],
    },
    // 5. Coral / orange
    {
      base: "#ff7a5c",
      blobs: [
        { x: 20, y: 30, r: 70, color: "#ffb27a" },
        { x: 80, y: 80, r: 70, color: "#ff5577" },
        { x: 60, y: 20, r: 55, color: "#ffd28a" },
      ],
    },
    // 7. Magenta / purple / orange
    {
      base: "#7a3cff",
      blobs: [
        { x: 20, y: 75, r: 70, color: "#ff4fa3" },
        { x: 80, y: 25, r: 70, color: "#ff9a3c" },
        { x: 50, y: 50, r: 55, color: "#b04dff" },
      ],
    },
    // 8. Soft yellow / peach / pink
    {
      base: "#ffd6a5",
      blobs: [
        { x: 20, y: 30, r: 70, color: "#fff1b8" },
        { x: 80, y: 70, r: 70, color: "#ffadc7" },
        { x: 60, y: 20, r: 55, color: "#ffc18a" },
      ],
    },
    // 11. Sky → meadow → blossom (the reference image)
    {
      base: "#3aa0ff",
      blobs: [
        { x: 50, y: 10, r: 60, color: "#5ec8ff" },
        { x: 92, y: 50, r: 55, color: "#7be0c0" },
        { x: 80, y: 92, r: 55, color: "#ffb37a" },
        { x: 18, y: 88, r: 55, color: "#ff7ab0" },
        { x: 8, y: 45, r: 50, color: "#c89aff" },
      ],
    },
    // 12. Twilight — indigo / violet / rose
    {
      base: "#1b1448",
      blobs: [
        { x: 20, y: 20, r: 60, color: "#5b3fd1" },
        { x: 85, y: 30, r: 60, color: "#c060d6" },
        { x: 75, y: 90, r: 60, color: "#ff7ab0" },
        { x: 15, y: 85, r: 55, color: "#3a2a8a" },
      ],
    },
    // 13. Sunset glow — coral / amber / plum
    {
      base: "#f4a261",
      blobs: [
        { x: 18, y: 22, r: 60, color: "#ffd6a5" },
        { x: 85, y: 30, r: 60, color: "#ff8c6b" },
        { x: 80, y: 88, r: 60, color: "#e76f51" },
        { x: 20, y: 85, r: 55, color: "#9a4e8a" },
      ],
    },
    // 14. Forest dawn — sage / teal / sand
    {
      base: "#2a5d6b",
      blobs: [
        { x: 20, y: 22, r: 60, color: "#9cd1c8" },
        { x: 85, y: 28, r: 60, color: "#7fb89e" },
        { x: 80, y: 90, r: 60, color: "#e9d8a6" },
        { x: 18, y: 88, r: 55, color: "#3d7c7a" },
      ],
    },
  ];

  const meshGradientToCss = (m: MeshGradient) =>
    [
      ...m.blobs.map(
        (b) =>
          `radial-gradient(circle at ${b.x}% ${b.y}%, ${b.color} 0%, transparent ${b.r}%)`,
      ),
      `linear-gradient(${m.base}, ${m.base})`,
    ].join(", ");

  const hexToRgba = (hex: string, alpha: number) => {
    const h = hex.replace("#", "");
    const v =
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h;
    const r = parseInt(v.substring(0, 2), 16);
    const g = parseInt(v.substring(2, 4), 16);
    const b = parseInt(v.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  const backgroundImages = Array.from(
    { length: 18 },
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
  const dofPanelRef = useRef<HTMLDivElement>(null);
  const dofRafRef = useRef<number>(0);
  const tiltSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

      // Delete/Backspace — reset the currently open panel
      if ((e.key === "Delete" || e.key === "Backspace") && !e.ctrlKey && !e.metaKey) {
        if (tiltEnabled && (tiltX !== 0 || tiltY !== 0)) {
          e.preventDefault();
          setTiltX(0);
          setTiltY(0);
          saveToHistory({ tiltX: 0, tiltY: 0 });
          sfx.clear();
          return;
        }
        if (showColorPalette && backgroundState.type) {
          e.preventDefault();
          clearBackground();
          return;
        }
        if (showDofPanel && dofIntensity > 0) {
          e.preventDefault();
          setDofIntensity(0);
          setDofXOffset(50);
          setDofBandWidth(10);
          saveToHistory({ dofIntensity: 0, dofXOffset: 50, dofBandWidth: 10 });
          sfx.clear();
          return;
        }
      }

      // Arrow keys for 3D tilt
      if (tiltEnabled && !e.ctrlKey && !e.metaKey) {
        const scheduleTiltSave = (nextX: number, nextY: number) => {
          if (tiltSaveTimerRef.current) clearTimeout(tiltSaveTimerRef.current);
          tiltSaveTimerRef.current = setTimeout(() => {
            saveToHistory({ tiltX: nextX, tiltY: nextY });
          }, 400);
        };
        switch (e.key) {
          case "ArrowUp": {
            e.preventDefault();
            const next = Math.min(tiltX + 5, 60);
            setTiltX(next);
            scheduleTiltSave(next, tiltY);
            sfx.tick(true);
            return;
          }
          case "ArrowDown": {
            e.preventDefault();
            const next = Math.max(tiltX - 5, -60);
            setTiltX(next);
            scheduleTiltSave(next, tiltY);
            sfx.tick(false);
            return;
          }
          case "ArrowLeft": {
            e.preventDefault();
            const next = Math.max(tiltY - 5, -60);
            setTiltY(next);
            scheduleTiltSave(tiltX, next);
            sfx.tick(false);
            return;
          }
          case "ArrowRight": {
            e.preventDefault();
            const next = Math.min(tiltY + 5, 60);
            setTiltY(next);
            scheduleTiltSave(tiltX, next);
            sfx.tick(true);
            return;
          }
        }
      }

      if (e.key === "=" || e.key === "+") {
        e.preventDefault();
        if (currentTool === "background") {
          setBgPadding((prev) => Math.min(prev + 10, 400));
        } else if (currentTool === "depthOfField") {
          setDofIntensity((prev) => Math.min(prev + 2, 50));
        } else {
          setBrushSize((prev) => Math.min(prev + 2, 20));
        }
        sfx.tick(true);
        return;
      }
      if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        if (currentTool === "background") {
          setBgPadding((prev) => Math.max(prev - 10, 0));
        } else if (currentTool === "depthOfField") {
          setDofIntensity((prev) => Math.max(prev - 2, 0));
        } else {
          setBrushSize((prev) => Math.max(prev - 2, 2));
        }
        sfx.tick(false);
        return;
      }

      switch (e.key) {
        case "p":
        case "P":
          selectTool("pen");
          break;
        case "r":
        case "R":
          selectTool("rectangle");
          break;
        case "a":
        case "A":
          selectTool("arrow");
          break;
        case "t":
        case "T":
          selectTool("text");
          break;
        case "b":
        case "B":
          selectTool("background");
          break;
        case "x":
        case "X":
          selectTool("blur");
          break;
        case "s":
        case "S":
          selectTool("step");
          break;
        case "d":
        case "D":
          selectTool("depthOfField");
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
            setShowWatermarkInput(false);
            setShowColorPalette(false);
            sfx.toggleOn();
          }
          break;
        case "w":
        case "W":
          e.preventDefault();
          setShowWatermarkInput((prev) => !prev);
          sfx.click();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTextInputActive, currentTool, tiltEnabled, tiltX, tiltY, showWatermarkInput, showColorPalette, showDofPanel, backgroundState.type, dofIntensity]);

  // Show/hide background palette / DoF panel when switching tools
  useEffect(() => {
    if (currentTool === "background") {
      setShowColorPalette(true);
    } else {
      setShowColorPalette(false);
    }
    if (currentTool === "depthOfField") {
      setShowDofPanel(true);
      if (dofIntensity === 0) setDofIntensity(25);
    } else {
      setShowDofPanel(false);
    }
    setShowWatermarkInput(false);
  }, [currentTool]);

  // Focus first focusable element inside a panel when it opens
  const focusFirst = (root: HTMLDivElement | null) => {
    if (!root) return;
    const first = root.querySelector<HTMLElement>(
      "button, input, [tabindex]:not([tabindex='-1'])",
    );
    (first ?? root).focus();
  };

  useEffect(() => {
    if (showColorPalette) focusFirst(bgPaletteRef.current);
  }, [showColorPalette]);

  useEffect(() => {
    if (showDofPanel) focusFirst(dofPanelRef.current);
  }, [showDofPanel]);

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
  }, [drawings, backgroundState, tiltEnabled, tiltX, tiltY, watermarkText, dofIntensity, dofXOffset, dofBandWidth]);

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

    if (currentTool === "background" || currentTool === "depthOfField") {
      return;
    }

    if (currentTool === "step") {
      const point = getMousePos(e);
      const newDrawing: DrawingElement = {
        type: "step",
        points: [point],
        color: "#ef4444",
        strokeWidth: brushSize,
        stepNumber: stepCounterRef.current++,
      };
      const newDrawings = [...drawings, newDrawing];
      setDrawings(newDrawings);
      saveToHistory({ drawings: newDrawings });
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

    const newDrawings = [...drawings, newDrawing];
    setDrawings(newDrawings);
    saveToHistory({ drawings: newDrawings });
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

    const newDrawings = [...drawings, newDrawing];
    setDrawings(newDrawings);
    saveToHistory({ drawings: newDrawings });
    setIsTextInputActive(false);
    setTextInput("");
    sfx.pop();
    setTextPosition(null);
  };

  const handleBackgroundColorSelect = (color: string) => {
    const newBg: BackgroundState = { type: "solid", color };
    setBackgroundState(newBg);
    saveToHistory({ backgroundState: newBg });
    sfx.pop();
  };

  const handleBackgroundGradientSelect = (gradient: MeshGradient) => {
    const newBg: BackgroundState = { type: "gradient", color: null, gradient };
    setBackgroundState(newBg);
    saveToHistory({ backgroundState: newBg });
    sfx.pop();
  };

  const handleBackgroundImageSelect = (src: string) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      bgImageRef.current = img;
      const newBg: BackgroundState = { type: "image", color: null, imageSrc: src };
      setBackgroundState(newBg);
      saveToHistory({ backgroundState: newBg });
      sfx.pop();
    };
  };

  const clearBackground = () => {
    bgImageRef.current = null;
    const newBg: BackgroundState = { type: null, color: null };
    setBackgroundState(newBg);
    saveToHistory({ backgroundState: newBg });
    sfx.clear();
  };

  // Save a state snapshot to history. Callers should pass the NEW state
  // (i.e. what's about to be rendered). Omitted fields fall back to the
  // current React state (appropriate when a field is unchanged).
  const saveToHistory = useCallback((override?: Partial<HistoryState>) => {
    const currentState: HistoryState = {
      drawings: override?.drawings ?? [...drawings],
      backgroundState: override?.backgroundState ?? { ...backgroundState },
      dofIntensity: override?.dofIntensity ?? dofIntensity,
      dofXOffset: override?.dofXOffset ?? dofXOffset,
      dofBandWidth: override?.dofBandWidth ?? dofBandWidth,
      tiltX: override?.tiltX ?? tiltX,
      tiltY: override?.tiltY ?? tiltY,
    };

    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentState);

    // Limit history to 50 states to prevent memory issues
    const limitedHistory = newHistory.slice(-50);

    setHistory(limitedHistory);
    setHistoryIndex(limitedHistory.length - 1);
  }, [drawings, backgroundState, dofIntensity, dofXOffset, dofBandWidth, tiltX, tiltY, history, historyIndex]);

  // Effect to save initial state to history when image is uploaded
  useEffect(() => {
    if (uploadedImage && history.length === 0) {
      saveToHistory();
    }
  }, [uploadedImage, history.length, saveToHistory]);

  const recalcStepCounter = (drawingsList: DrawingElement[]) => {
    const maxStep = drawingsList.reduce((max, d) => {
      return d.type === "step" && d.stepNumber
        ? Math.max(max, d.stepNumber)
        : max;
    }, 0);
    stepCounterRef.current = maxStep + 1;
  };

  // Apply a history snapshot. If it contains an image background,
  // preload the image and set the ref BEFORE updating state, so the
  // subsequent redraw has the image available.
  const applyHistoryState = (state: HistoryState, newIndex: number) => {
    const doApply = () => {
      setDrawings(state.drawings);
      setBackgroundState(state.backgroundState);
      setDofIntensity(state.dofIntensity);
      setDofXOffset(state.dofXOffset);
      setDofBandWidth(state.dofBandWidth);
      setTiltX(state.tiltX);
      setTiltY(state.tiltY);
      setHistoryIndex(newIndex);
      recalcStepCounter(state.drawings);
    };

    if (state.backgroundState.type === "image" && state.backgroundState.imageSrc) {
      const img = new Image();
      img.src = state.backgroundState.imageSrc;
      const done = () => {
        bgImageRef.current = img;
        doApply();
      };
      if (img.complete && img.naturalWidth > 0) {
        done();
      } else {
        img.onload = done;
      }
    } else {
      bgImageRef.current = null;
      doApply();
    }
  };

  // Undo function
  const undo = () => {
    if (historyIndex > 0) {
      applyHistoryState(history[historyIndex - 1], historyIndex - 1);
      sfx.undo();
    }
  };

  // Redo function
  const redo = () => {
    if (historyIndex < history.length - 1) {
      applyHistoryState(history[historyIndex + 1], historyIndex + 1);
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
      y: rect.bottom + 8,
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
      const mesh = backgroundState.gradient;
      ctx.fillStyle = mesh.base;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      const diag = Math.sqrt(
        canvasWidth * canvasWidth + canvasHeight * canvasHeight,
      );
      for (const blob of mesh.blobs) {
        const cx = (blob.x / 100) * canvasWidth;
        const cy = (blob.y / 100) * canvasHeight;
        const radius = (blob.r / 100) * diag;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, hexToRgba(blob.color, 1));
        grad.addColorStop(1, hexToRgba(blob.color, 0));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
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

  const applyDepthOfField = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
  ) => {
    const w = canvas.width;
    const h = canvas.height;
    if (dofIntensity <= 0 || w <= 0 || h <= 0) return;

    const focusCenter = (dofXOffset / 100) * w;
    const bandHalf = (dofBandWidth / 100) * w * 0.5;

    // Snapshot the current sharp canvas content
    const sharpCanvas = document.createElement("canvas");
    sharpCanvas.width = w;
    sharpCanvas.height = h;
    const sharpCtx = sharpCanvas.getContext("2d")!;
    sharpCtx.drawImage(canvas, 0, 0);

    // GPU-accelerated blur via WebGL (may return a smaller canvas for large radii)
    const blurred = webglBlur(sharpCanvas, dofIntensity);

    // Draw blurred version over the entire canvas (stretch if downscaled)
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(blurred, 0, 0, w, h);

    // Re-snapshot the sharp original for masking
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = w;
    maskCanvas.height = h;
    const maskCtx = maskCanvas.getContext("2d")!;
    maskCtx.drawImage(sharpCanvas, 0, 0);

    // Build per-pixel alpha strip: 1 inside focus band, quadratic falloff outside
    const alphaCanvas = document.createElement("canvas");
    alphaCanvas.width = w;
    alphaCanvas.height = 1;
    const alphaCtx = alphaCanvas.getContext("2d")!;
    const alphaData = alphaCtx.createImageData(w, 1);

    // Transition zone: blur ramps to full over a distance equal to the band width
    const transitionDist = Math.max(bandHalf * 2, 1);

    for (let px = 0; px < w; px++) {
      let dist = 0;
      if (px < focusCenter - bandHalf) {
        dist = focusCenter - bandHalf - px;
      } else if (px > focusCenter + bandHalf) {
        dist = px - (focusCenter + bandHalf);
      }

      // Smoothstep-like falloff: sharp inside band, quickly fades to 0
      const t = Math.min(dist / transitionDist, 1);
      const smooth = t * t * (3 - 2 * t); // smoothstep
      const alpha = Math.round((1 - smooth) * 255);

      const i = px * 4;
      alphaData.data[i] = 255;
      alphaData.data[i + 1] = 255;
      alphaData.data[i + 2] = 255;
      alphaData.data[i + 3] = alpha;
    }
    alphaCtx.putImageData(alphaData, 0, 0);

    // Mask sharp content to only the focus band
    maskCtx.globalCompositeOperation = "destination-in";
    maskCtx.drawImage(alphaCanvas, 0, 0, w, 1, 0, 0, w, h);

    // Draw masked sharp content over the blurred base
    ctx.drawImage(maskCanvas, 0, 0);
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

    if (tiltX !== 0 || tiltY !== 0) {
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

    // Apply depth of field to canvas (bg + image + annotations) before watermarks
    if (dofIntensity > 0) {
      applyDepthOfField(canvas, ctx);
    }

    // Watermarks — always at the bottom corners of the full canvas
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 14px sans-serif";
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
    const hasTilt = tiltX !== 0 || tiltY !== 0;
    const shadowMargin = hasTilt ? 60 : 0;

    // Available space for the image, reserving room for padding + shadow
    let maxWidth = containerWidth - padding * 2 - shadowMargin;
    let maxHeight = containerHeight - padding * 2 - shadowMargin;

    let imageDisplayWidth, imageDisplayHeight;

    if (hasTilt) {
      // With tilt, the projected size is larger than the source image.
      // Start at natural size (clamped to available space), then let the
      // post-projection clamp below shrink further if needed.
      const initialScale = Math.min(
        1,
        maxWidth / image.naturalWidth,
        maxHeight / image.naturalHeight,
      );
      imageDisplayWidth = image.naturalWidth * initialScale;
      imageDisplayHeight = image.naturalHeight * initialScale;

      const proj = getProjectedSize(imageDisplayWidth, imageDisplayHeight, tiltX, tiltY);
      const canvasW = proj.width + padding * 2 + shadowMargin;
      const canvasH = proj.height + padding * 2 + shadowMargin;

      // If projected canvas exceeds container, scale down proportionally
      const scaleX = canvasW > containerWidth ? containerWidth / canvasW : 1;
      const scaleY = canvasH > containerHeight ? containerHeight / canvasH : 1;
      const scale = Math.min(scaleX, scaleY);

      if (scale < 1) {
        imageDisplayWidth *= scale;
        imageDisplayHeight *= scale;
      }

      const finalProj = getProjectedSize(imageDisplayWidth, imageDisplayHeight, tiltX, tiltY);
      canvas.width = finalProj.width + padding * 2 + shadowMargin;
      canvas.height = finalProj.height + padding * 2 + shadowMargin;
    } else {
      // Use natural size, scaled down only if it exceeds the available area.
      const scale = Math.min(
        1,
        maxWidth / image.naturalWidth,
        maxHeight / image.naturalHeight,
      );
      imageDisplayWidth = image.naturalWidth * scale;
      imageDisplayHeight = image.naturalHeight * scale;

      canvas.width = imageDisplayWidth + padding * 2;
      canvas.height = imageDisplayHeight + padding * 2;
    }

    // Store image rendering info for coordinate calculations
    canvas.dataset.imageDisplayWidth = imageDisplayWidth.toString();
    canvas.dataset.imageDisplayHeight = imageDisplayHeight.toString();
    canvas.dataset.imageOffsetX = padding.toString();
    canvas.dataset.imageOffsetY = padding.toString();

    redrawCanvas();
  };

  const clearDrawings = () => {
    setDrawings([]);
    saveToHistory({ drawings: [] });
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
    currentTool === tool && !showWatermarkInput && !tiltEnabled;

  // Spatial arrow-key navigation inside a panel — focuses the nearest
  // focusable element in the pressed direction.
  const handleSpatialNav = (
    e: React.KeyboardEvent<HTMLDivElement>,
    rootRef: React.RefObject<HTMLDivElement | null>,
  ) => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
    // Let range inputs handle Left/Right natively (value adjustment)
    const target = e.target as HTMLElement;
    if (
      target instanceof HTMLInputElement &&
      target.type === "range" &&
      (e.key === "ArrowLeft" || e.key === "ArrowRight")
    ) {
      e.stopPropagation();
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const root = rootRef.current;
    if (!root) return;
    const focusables = Array.from(
      root.querySelectorAll<HTMLElement>("button, input, [tabindex]:not([tabindex='-1'])"),
    ).filter((el) => {
      if (el === root) return false;
      if ((el as HTMLButtonElement | HTMLInputElement).disabled) return false;
      return el.offsetParent !== null;
    });
    if (focusables.length === 0) return;

    const current = (document.activeElement as HTMLElement) ?? null;
    const currentRect =
      current && root.contains(current)
        ? current.getBoundingClientRect()
        : focusables[0].getBoundingClientRect();
    const cx = currentRect.left + currentRect.width / 2;
    const cy = currentRect.top + currentRect.height / 2;

    let best: HTMLElement | null = null;
    let bestScore = Infinity;

    for (const el of focusables) {
      if (el === current) continue;
      const r = el.getBoundingClientRect();
      const bx = r.left + r.width / 2;
      const by = r.top + r.height / 2;
      const dx = bx - cx;
      const dy = by - cy;

      let inDir = false;
      let primary = 0;
      let secondary = 0;
      if (e.key === "ArrowRight") {
        inDir = dx > 1;
        primary = dx;
        secondary = Math.abs(dy);
      } else if (e.key === "ArrowLeft") {
        inDir = dx < -1;
        primary = -dx;
        secondary = Math.abs(dy);
      } else if (e.key === "ArrowDown") {
        inDir = dy > 1;
        primary = dy;
        secondary = Math.abs(dx);
      } else if (e.key === "ArrowUp") {
        inDir = dy < -1;
        primary = -dy;
        secondary = Math.abs(dx);
      }
      if (!inDir) continue;
      // Weight perpendicular distance heavier to prefer straight-line neighbors
      const score = primary + secondary * 2;
      if (score < bestScore) {
        bestScore = score;
        best = el;
      }
    }

    if (best) best.focus();
  };

  const selectTool = (tool: Tool) => {
    setTiltEnabled(false);
    setShowWatermarkInput(false);
    setShowColorPalette(tool === "background");
    setCurrentTool(tool);
    sfx.click();
  };

  const toolBtnClass = (active: boolean, disabled?: boolean) =>
    `w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 ${
      disabled
        ? "text-white/20 cursor-not-allowed"
        : active
          ? "bg-white/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          : "text-white/60 hover:text-white hover:bg-white/10"
    }`;

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {!uploadedImage ? (
        /* ── Upload Screen ── */
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-800 mb-1">
            Screenshot Annotator
          </h1>
          <p className="text-sm text-neutral-400 mb-10">
            by <a href="/" className="gradient-text hover:underline">Scribbble</a>
          </p>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="group relative w-full max-w-md aspect-[4/3] rounded-2xl border border-dashed border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50 transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-neutral-100 group-hover:bg-neutral-200 flex items-center justify-center transition-colors">
              <Upload className="w-5 h-5 text-neutral-400 group-hover:text-neutral-500 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-1 group-hover:scale-110" />
            </div>
            <div className="text-center">
              <p className="text-sm text-neutral-500 group-hover:text-neutral-600 transition-colors">
                Drop an image or click to upload
              </p>
              <p className="text-sm text-neutral-400 mt-1.5">
                or paste from clipboard
              </p>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex items-center gap-4 mt-8 text-sm text-neutral-300 uppercase tracking-widest">
            <span>JPG</span>
            <span className="w-px h-3 bg-neutral-200" />
            <span>PNG</span>
            <span className="w-px h-3 bg-neutral-200" />
            <span>GIF</span>
            <span className="w-px h-3 bg-neutral-200" />
            <span>WebP</span>
          </div>
        </div>
      ) : (
        /* ── Editor Screen ── */
        <div className="flex flex-col h-screen">
          {/* Toolbar */}
          <div className="flex justify-center pt-3 pb-2 px-4">
            <div
              ref={toolbarRef}
              className={`relative transition-opacity duration-150 ${
                isDrawing ? "opacity-80 pointer-events-none" : "opacity-100"
              }`}
            >
              <div className="bg-[#1a1a1f]/90 backdrop-blur-xl rounded-xl px-2.5 py-1.5 shadow-lg shadow-black/30 border border-white/[0.06] flex items-center gap-0.5">
                {/* Annotation Tools */}
                <Tooltip content="Text (T)">
                  <button onClick={() => selectTool("text")} className={toolBtnClass(isToolActive("text"))}>
                    <Type className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip content="Steps (S)">
                  <button onClick={() => selectTool("step")} className={toolBtnClass(isToolActive("step"))}>
                    <Hash className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip content="Pen (P)">
                  <button onClick={() => selectTool("pen")} className={toolBtnClass(isToolActive("pen"))}>
                    <Pen className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip content="Rectangle (R)">
                  <button onClick={() => selectTool("rectangle")} className={toolBtnClass(isToolActive("rectangle"))}>
                    <Square className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip content="Arrow (A)">
                  <button onClick={() => selectTool("arrow")} className={toolBtnClass(isToolActive("arrow"))}>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip content="Redact (X)">
                  <button onClick={() => selectTool("blur")} className={toolBtnClass(isToolActive("blur"))}>
                    <EyeOff className="w-4 h-4" />
                  </button>
                </Tooltip>

                <div className="w-px h-5 bg-white/[0.08] mx-1" />

                {/* Style Tools */}
                <Tooltip content="Background (B)">
                  <button onClick={() => selectTool("background")} className={toolBtnClass(isToolActive("background"))}>
                    <Palette className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip content="Depth of Field (D)">
                  <button onClick={() => selectTool("depthOfField")} className={toolBtnClass(isToolActive("depthOfField"))}>
                    <Focus className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip content="3D Tilt (G)">
                  <button
                    onClick={() => {
                      if (tiltEnabled) {
                        setTiltEnabled(false);
                        setTiltX(0);
                        setTiltY(0);
                        sfx.toggleOff();
                      } else {
                        setTiltEnabled(true);
                        setShowWatermarkInput(false);
                        setShowColorPalette(false);
                        sfx.toggleOn();
                      }
                    }}
                    className={toolBtnClass(tiltEnabled && !showWatermarkInput)}
                  >
                    <Rotate3d className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip content="Watermark (W)">
                  <button
                    onClick={() => { setShowWatermarkInput((prev) => !prev); sfx.click(); }}
                    className={toolBtnClass(showWatermarkInput)}
                  >
                    <Stamp className="w-4 h-4" />
                  </button>
                </Tooltip>

                <div className="w-px h-5 bg-white/[0.08] mx-1" />

                {/* History */}
                <Tooltip content="Undo (Cmd+Z)">
                  <button onClick={undo} disabled={!canUndo} className={toolBtnClass(false, !canUndo)}>
                    <Undo className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip content="Redo (Cmd+Y)">
                  <button onClick={redo} disabled={!canRedo} className={toolBtnClass(false, !canRedo)}>
                    <Redo className="w-4 h-4" />
                  </button>
                </Tooltip>

                <div className="w-px h-5 bg-white/[0.08] mx-1" />

                {/* Actions */}
                <Tooltip content="Clear All">
                  <button onClick={() => clearDrawings()} className={toolBtnClass(false)}>
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip content="Download (Cmd+S)">
                  <button onClick={() => downloadAnnotatedImage()} className={toolBtnClass(false)}>
                    <Download className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip content="New Image">
                  <button onClick={() => setUploadedImage(null)} className={toolBtnClass(false)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Tooltip>
              </div>

              {/* Watermark Input Dropdown */}
              {showWatermarkInput && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-[#1a1a1f]/95 backdrop-blur-xl rounded-lg p-2.5 shadow-lg shadow-black/30 border border-white/[0.06] w-52 z-50">
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
                    className="w-full bg-white/[0.06] border border-white/[0.08] rounded-md px-2.5 py-1.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Canvas Area */}
          <div
            ref={containerRef}
            className="relative flex-1 flex items-center justify-center overflow-hidden"
            style={{
              cursor:
                currentTool === "pen" ||
                currentTool === "blur" ||
                currentTool === "step"
                  ? "crosshair"
                  : currentTool === "text"
                    ? "text"
                    : currentTool === "background" || currentTool === "depthOfField"
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
                  placeholder="Type here..."
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-neutral-400 py-3">
            Brought to you by <a href="/" className="gradient-text font-semibold hover:underline">Scribbble</a> — the beautiful screen annotator for MacOS
          </p>
        </div>
      )}

      {/* Background Palette — right edge panel */}
      <SidePanel
        isOpen={showColorPalette && !showWatermarkInput}
        width="w-64"
        innerRef={bgPaletteRef}
        tabIndex={-1}
        onKeyDown={(e) => handleSpatialNav(e, bgPaletteRef)}
      >
        {/* Tabs */}
        <div className="flex gap-0.5 mb-3 bg-white/[0.04] rounded-lg p-0.5">
          {(["solid", "gradient", "image"] as BackgroundType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setBgTab(tab)}
              className={`flex-1 px-2 py-1 text-sm font-medium rounded-md transition-colors capitalize ${
                bgTab === tab
                  ? "bg-white/15 text-white"
                  : "text-white/35 hover:text-white/60"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content — re-keyed per tab for crossfade on switch */}
        <div key={bgTab} className="animate-in fade-in duration-150">
          {bgTab === "solid" && (
            <div className="grid grid-cols-4 gap-1.5">
              {backgroundColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleBackgroundColorSelect(color)}
                  className={`w-12 h-12 rounded-lg border-2 transition-all duration-150 hover:scale-105 ${
                    backgroundState.type === "solid" &&
                    backgroundState.color === color
                      ? "border-white/60 scale-110"
                      : "border-transparent hover:border-white/30"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}

          {bgTab === "gradient" && (
            <div className="grid grid-cols-4 gap-1.5">
              {backgroundGradients.map((g, i) => (
                <button
                  key={i}
                  onClick={() => handleBackgroundGradientSelect(g)}
                  className={`w-12 h-12 rounded-lg border-2 transition-all duration-150 hover:scale-105 ${
                    backgroundState.type === "gradient" &&
                    backgroundState.gradient?.base === g.base
                      ? "border-white/60 scale-110"
                      : "border-transparent hover:border-white/30"
                  }`}
                  style={{ background: meshGradientToCss(g) }}
                />
              ))}
            </div>
          )}

          {bgTab === "image" && (
            <div className="grid grid-cols-4 gap-1.5 max-h-44 overflow-y-auto">
              {backgroundImages.map((src) => (
                <button
                  key={src}
                  onClick={() => handleBackgroundImageSelect(src)}
                  className={`w-12 h-12 rounded-lg border-2 transition-all duration-150 hover:scale-105 overflow-hidden ${
                    backgroundState.type === "image" &&
                    backgroundState.imageSrc === src
                      ? "border-white/60 scale-105"
                      : "border-transparent hover:border-white/30"
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Padding hint */}
        <p className="mt-3 text-sm text-white/40 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/70">+</kbd> / <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/70">−</kbd> to adjust padding
        </p>

        {/* Clear button */}
        {backgroundState.type && (
          <button
            onClick={clearBackground}
            className="w-full mt-2.5 px-3 py-1.5 text-sm text-white/50 hover:text-white/80 hover:bg-white/[0.06] rounded-md transition-colors flex items-center justify-center gap-2"
          >
            Remove Background
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60 text-sm">del</kbd>
          </button>
        )}
      </SidePanel>

      {/* Depth of Field Panel — right edge panel */}
      <SidePanel
        isOpen={showDofPanel && !showWatermarkInput}
        innerRef={dofPanelRef}
        tabIndex={-1}
        onKeyDown={(e) => handleSpatialNav(e, dofPanelRef)}
      >
          <div className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">Depth of Field</div>

          <label className="flex items-center justify-between text-sm text-white/70 mb-1.5">
            <span>Intensity</span>
            <span className="text-white/40 tabular-nums">{dofIntensity}</span>
          </label>
          <input
            type="range"
            min={0}
            max={50}
            value={dofIntensity}
            onChange={(e) => { cancelAnimationFrame(dofRafRef.current); const v = Number(e.target.value); dofRafRef.current = requestAnimationFrame(() => setDofIntensity(v)); }}
            onPointerUp={() => saveToHistory()}
            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white/80 mb-4"
          />

          <label className="flex items-center justify-between text-sm text-white/70 mb-1.5">
            <span>Focus X-Offset</span>
            <span className="text-white/40 tabular-nums">{dofXOffset}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={dofXOffset}
            onChange={(e) => { cancelAnimationFrame(dofRafRef.current); const v = Number(e.target.value); dofRafRef.current = requestAnimationFrame(() => setDofXOffset(v)); }}
            onPointerUp={() => saveToHistory()}
            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white/80 mb-4"
          />

          <label className="flex items-center justify-between text-sm text-white/70 mb-1.5">
            <span>Band Width</span>
            <span className="text-white/40 tabular-nums">{dofBandWidth}%</span>
          </label>
          <input
            type="range"
            min={5}
            max={50}
            value={dofBandWidth}
            onChange={(e) => { cancelAnimationFrame(dofRafRef.current); const v = Number(e.target.value); dofRafRef.current = requestAnimationFrame(() => setDofBandWidth(v)); }}
            onPointerUp={() => saveToHistory()}
            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white/80 mb-2"
          />

          {dofIntensity > 0 && (
            <button
              onClick={() => {
                setDofIntensity(0);
                setDofXOffset(50);
                setDofBandWidth(10);
                saveToHistory({ dofIntensity: 0, dofXOffset: 50, dofBandWidth: 10 });
              }}
              className="w-full mt-2.5 px-3 py-1.5 text-sm text-white/50 hover:text-white/80 hover:bg-white/[0.06] rounded-md transition-colors flex items-center justify-center gap-2"
            >
              Remove Effect
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60 text-sm">del</kbd>
            </button>
          )}
      </SidePanel>

      {/* 3D Tilt Panel — right edge panel */}
      <SidePanel isOpen={tiltEnabled && !showWatermarkInput}>
        <div className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">3D Tilt</div>

        <div className="flex items-center justify-between text-sm text-white/70 mb-2">
          <span>Tilt X</span>
          <span className="text-white/40 tabular-nums">{tiltX}°</span>
        </div>
        <div className="flex items-center justify-between text-sm text-white/70 mb-3">
          <span>Tilt Y</span>
          <span className="text-white/40 tabular-nums">{tiltY}°</span>
        </div>

        <p className="text-sm text-white/40 text-center">
          Use <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/70">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/70">↓</kbd> <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/70">←</kbd> <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/70">→</kbd> to tilt
        </p>

        {(tiltX !== 0 || tiltY !== 0) && (
          <button
            onClick={() => { setTiltX(0); setTiltY(0); saveToHistory({ tiltX: 0, tiltY: 0 }); sfx.clear(); }}
            className="w-full mt-3 px-3 py-1.5 text-sm text-white/50 hover:text-white/80 hover:bg-white/[0.06] rounded-md transition-colors flex items-center justify-center gap-2"
          >
            Reset Tilt
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60 text-sm">del</kbd>
          </button>
        )}
      </SidePanel>

      {/* Global Tooltip */}
      {tooltip.show && (
        <div
          className="fixed z-[9999] px-2.5 py-1.5 text-sm text-white/80 bg-[#1a1a1f]/95 backdrop-blur-xl rounded-md shadow-lg border border-white/[0.06] pointer-events-none -translate-x-1/2"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          {tooltip.content}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-b-[4px] border-l-transparent border-r-transparent border-b-[#1a1a1f]"></div>
        </div>
      )}
    </div>
  );
}
