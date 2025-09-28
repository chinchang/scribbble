'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
  Settings
} from "lucide-react"
import { toast } from '@/hooks/use-toast'

type Tool = 'pen' | 'rectangle' | 'arrow'

interface Point {
  x: number
  y: number
}

interface DrawingElement {
  type: Tool
  points: Point[]
  color: string
  strokeWidth: number
}

export default function ScreenshotAnnotate() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [currentTool, setCurrentTool] = useState<Tool>('pen')
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawings, setDrawings] = useState<DrawingElement[]>([])
  const [currentPath, setCurrentPath] = useState<Point[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 24 }) // Start centered top
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hasDragged, setHasDragged] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        setDrawings([])
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile()
          if (file) {
            handleImageUpload(file)
          }
          break
        }
      }
    }
  }, [])

  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [handlePaste])

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current
    const toolbar = toolbarRef.current
    if (!container || !toolbar) return

    const containerRect = container.getBoundingClientRect()
    const toolbarRect = toolbar.getBoundingClientRect()

    setHasDragged(true)
    setDragOffset({
      x: e.clientX - toolbarRect.left,
      y: e.clientY - toolbarRect.top
    })
    setToolbarPosition({
      x: toolbarRect.left - containerRect.left,
      y: toolbarRect.top - containerRect.top
    })
    setIsDragging(true)
    e.preventDefault()
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const container = containerRef.current
      if (container) {
        const containerRect = container.getBoundingClientRect()
        const newX = e.clientX - containerRect.left - dragOffset.x
        const newY = e.clientY - containerRect.top - dragOffset.y
        
        // Keep toolbar within container bounds
        const maxX = container.clientWidth - 300 // toolbar width
        const maxY = container.clientHeight - 60 // toolbar height
        
        setToolbarPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        })
      }
    }
  }, [isDragging, dragOffset])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+C or Cmd+C
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault()
        copyToClipboard()
        return
      }

      switch (e.key) {
        case 'p':
        case 'P':
          setCurrentTool('pen')
          break
        case 'r':
        case 'R':
          setCurrentTool('rectangle')
          break
        case 'a':
        case 'A':
          setCurrentTool('arrow')
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const point = getMousePos(e)
    setCurrentPath([point])
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    
    const point = getMousePos(e)
    setCurrentPath(prev => [...prev, point])
    
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    redrawCanvas()
    
    // Draw current path
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (currentTool === 'pen') {
      ctx.beginPath()
      currentPath.concat([point]).forEach((p, i) => {
        if (i === 0) {
          ctx.moveTo(p.x, p.y)
        } else {
          ctx.lineTo(p.x, p.y)
        }
      })
      ctx.stroke()
    } else if (currentTool === 'rectangle') {
      const startPoint = currentPath[0]
      ctx.strokeRect(
        startPoint.x,
        startPoint.y,
        point.x - startPoint.x,
        point.y - startPoint.y
      )
    } else if (currentTool === 'arrow') {
      const startPoint = currentPath[0]
      drawArrow(ctx, startPoint.x, startPoint.y, point.x, point.y)
    }
  }

  const stopDrawing = () => {
    if (!isDrawing || currentPath.length === 0) return
    
    setIsDrawing(false)
    
    const newDrawing: DrawingElement = {
      type: currentTool,
      points: [...currentPath],
      color: '#ef4444',
      strokeWidth: 2
    }
    
    setDrawings(prev => [...prev, newDrawing])
    setCurrentPath([])
  }

  const copyToClipboard = async () => {
    const canvas = canvasRef.current
    if (!canvas) {
      toast({
        title: 'Nothing to copy',
        description: 'Upload and annotate an image before copying.',
        variant: 'destructive'
      })
      return
    }

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((result) => resolve(result), 'image/png')
      )

      if (!blob) {
        throw new Error('Canvas blob generation failed')
      }

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])

      toast({
        title: 'Copied to clipboard',
        description: 'Annotated screenshot is ready to paste.'
      })
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      toast({
        title: 'Copy failed',
        description: 'Allow clipboard permissions and try again.',
        variant: 'destructive'
      })
    }
  }

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
    const headLength = 15
    const angle = Math.atan2(toY - fromY, toX - fromX)
    
    // Draw line
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.stroke()
    
    // Draw arrowhead
    ctx.beginPath()
    ctx.moveTo(toX, toY)
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    )
    ctx.moveTo(toX, toY)
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    )
    ctx.stroke()
  }

  const redrawCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const image = imageRef.current
    
    if (!ctx || !canvas || !image) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    
    // Redraw all drawings
    drawings.forEach(drawing => {
      ctx.strokeStyle = drawing.color
      ctx.lineWidth = drawing.strokeWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      if (drawing.type === 'pen') {
        ctx.beginPath()
        drawing.points.forEach((point, i) => {
          if (i === 0) {
            ctx.moveTo(point.x, point.y)
          } else {
            ctx.lineTo(point.x, point.y)
          }
        })
        ctx.stroke()
      } else if (drawing.type === 'rectangle') {
        const startPoint = drawing.points[0]
        const endPoint = drawing.points[drawing.points.length - 1]
        ctx.strokeRect(
          startPoint.x,
          startPoint.y,
          endPoint.x - startPoint.x,
          endPoint.y - startPoint.y
        )
      } else if (drawing.type === 'arrow') {
        const startPoint = drawing.points[0]
        const endPoint = drawing.points[drawing.points.length - 1]
        drawArrow(ctx, startPoint.x, startPoint.y, endPoint.x, endPoint.y)
      }
    })
  }

  const handleImageLoad = () => {
    const canvas = canvasRef.current
    const image = imageRef.current
    const container = containerRef.current
    
    if (!canvas || !image || !container) return

    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    
    const imageAspectRatio = image.naturalWidth / image.naturalHeight
    const containerAspectRatio = containerWidth / containerHeight
    
    let canvasWidth, canvasHeight
    
    if (imageAspectRatio > containerAspectRatio) {
      canvasWidth = containerWidth
      canvasHeight = containerWidth / imageAspectRatio
    } else {
      canvasHeight = containerHeight
      canvasWidth = containerHeight * imageAspectRatio
    }
    
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    
    redrawCanvas()
  }

  const clearDrawings = () => {
    setDrawings([])
    redrawCanvas()
  }

  const downloadAnnotatedImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = 'annotated-screenshot.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Scribbble Screenshot Annotator</h1>
        </div>

        {!uploadedImage ? (
          <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
            <div className="p-12 text-center">
              <Upload className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-4">Upload Screenshot</h3>
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
                style={{ cursor: currentTool === 'pen' ? 'crosshair' : 'default' }}
              >
                <img
                  ref={imageRef}
                  src={uploadedImage}
                  alt="Uploaded screenshot"
                  className="hidden"
                  onLoad={handleImageLoad}
                />
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="max-w-full max-h-full border border-border rounded-lg"
                />
                
                {/* Floating Toolbar - Redesigned & Draggable */}
                <div 
                  ref={toolbarRef}
                  className={`absolute ${
                    isDragging ? '' : 'transition-all duration-300'
                  } ${
                    isDrawing ? 'opacity-80 pointer-events-none' : 'opacity-100'
                  } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  style={{
                    left: !hasDragged && toolbarPosition.x === 0 ? '50%' : `${toolbarPosition.x}px`,
                    top: `${toolbarPosition.y}px`,
                    transform: !hasDragged && toolbarPosition.x === 0 ? 'translateX(-50%)' : 'none'
                  }}
                >
                  <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-2xl border border-white/10">
                    {/* Drag handle */}
                    <div 
                      className="absolute inset-0 rounded-2xl"
                      onMouseDown={handleMouseDown}
                      style={{ zIndex: -1 }}
                    />
                    <div className="flex items-center space-x-4">
                      {/* Text Tool */}
                      {/* <button
                        className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
                        title="Text tool"
                      >
                        <Type className="w-6 h-6" />
                      </button> */}
                      
                      {/* Pen Tool */}
                      <button
                        onClick={() => setCurrentTool('pen')}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                          currentTool === 'pen' ? 'bg-blue-500/80' : 'bg-white/10 hover:bg-white/20'
                        }`}
                        title="Pen tool (P)"
                      >
                        <Pen className="w-6 h-6" />
                      </button>
                      
                      {/* Rectangle Tool */}
                      <button
                        onClick={() => setCurrentTool('rectangle')}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                          currentTool === 'rectangle' ? 'bg-blue-500/80' : 'bg-white/10 hover:bg-white/20'
                        }`}
                        title="Rectangle tool (R)"
                      >
                        <Square className="w-6 h-6" />
                      </button>
                      
                      {/* Arrow Tool */}
                      <button
                        onClick={() => setCurrentTool('arrow')}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                          currentTool === 'arrow' ? 'bg-blue-500/80' : 'bg-white/10 hover:bg-white/20'
                        }`}
                        title="Arrow tool (A)"
                      >
                        <ArrowRight className="w-6 h-6" />
                      </button>
                      
                      {/* Separator */}
                      <div className="w-px h-8 bg-white/20"></div>
                      
                      {/* Settings Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setShowSettings(!showSettings)}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                            showSettings ? 'bg-blue-500/80' : 'bg-white/10 hover:bg-white/20'
                          }`}
                          title="Settings"
                        >
                          <Settings className="w-6 h-6" />
                        </button>
                        
                        {/* Settings dropdown */}
                        <div className={`absolute top-14 right-0 bg-slate-900/95 backdrop-blur-xl rounded-xl p-2 shadow-2xl border border-white/10 space-y-1 transition-all duration-200 ${
                          showSettings ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                        }`}>
                          <button
                            onClick={() => {
                              clearDrawings()
                              setShowSettings(false)
                            }}
                            className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-200"
                            title="Clear all"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              downloadAnnotatedImage()
                              setShowSettings(false)
                            }}
                            className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-200"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setUploadedImage(null)
                              setShowSettings(false)
                            }}
                            className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-200"
                            title="New image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

          </div>
        )}
      </div>
    </div>
  )
}