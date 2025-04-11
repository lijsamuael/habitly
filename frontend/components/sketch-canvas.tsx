"use client";

import type React from "react";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Eraser,
  Pencil,
  Save,
  Trash2,
  ImageIcon,
  Download,
  X,
  Check,
} from "lucide-react";
import { format } from "date-fns";

interface Point {
  x: number;
  y: number;
}

interface Line {
  points: Point[];
  color: string;
  width: number;
}

interface SavedSketch {
  id: string;
  name: string;
  date: string;
  lines: Line[];
  thumbnail?: string;
}

export function SketchCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [currentLine, setCurrentLine] = useState<Line | null>(null);
  const [color, setColor] = useState("#ffffff");
  const [brushWidth, setBrushWidth] = useState(5);
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil");
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [savedSketches, setSavedSketches] = useState<SavedSketch[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [sketchName, setSketchName] = useState("");
  const [selectedSketch, setSelectedSketch] = useState<SavedSketch | null>(
    null
  );
  const [notification, setNotification] = useState<string | null>(null);

  // Show a temporary notification
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2000);
  };

  // Load saved sketches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("habitly_sketches");
    if (saved) {
      try {
        setSavedSketches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved sketches", e);
      }
    }
  }, []);

  // Set up canvas size on mount and resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const container = canvas.parentElement;
      if (!container) return;

      const { width, height } = container.getBoundingClientRect();

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Update canvas size state without triggering a redraw
      setCanvasSize({ width, height });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty dependency array - only run on mount and unmount

  // Draw all lines whenever lines state changes or canvas size changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image
    const img = new Image();
    // img.src = "/images/writing-cartoon.png";
    img.crossOrigin = "anonymous";

    const drawLines = () => {
      // Draw all lines
      lines.forEach((line) => {
        if (line.points.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(line.points[0].x, line.points[0].y);

        for (let i = 1; i < line.points.length; i++) {
          ctx.lineTo(line.points[i].x, line.points[i].y);
        }

        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      });
    };

    img.onload = () => {
      // Draw image with some transparency
      ctx.globalAlpha = 0.2;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1.0;
      drawLines();
    };

    // If image fails to load, still draw the lines
    img.onerror = () => {
      drawLines();
    };

    // If image is already loaded, draw immediately
    if (img.complete) {
      ctx.globalAlpha = 0.2;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1.0;
      drawLines();
    }
  }, [lines, canvasSize]); // Redraw when lines or canvas size changes

  const getCanvasPoint = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ("touches" in e && e.touches.length > 0) {
      // Touch event
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else if ("clientX" in e) {
      // Mouse event
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    } else {
      return null;
    }

    return { x, y };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault(); // Prevent scrolling on touch devices

    const point = getCanvasPoint(e);
    if (!point) return;

    setIsDrawing(true);

    const newLine: Line = {
      points: [point],
      color: tool === "eraser" ? "#000000" : color,
      width: tool === "eraser" ? brushWidth * 2 : brushWidth,
    };

    setCurrentLine(newLine);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault(); // Prevent scrolling on touch devices

    if (!isDrawing || !currentLine) return;

    const point = getCanvasPoint(e);
    if (!point) return;

    // Update the current line with the new point
    const updatedLine = {
      ...currentLine,
      points: [...currentLine.points, point],
    };

    setCurrentLine(updatedLine);

    // Draw the current line segment
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const points = updatedLine.points;
    const lastPoint = points[points.length - 2];
    const currentPoint = points[points.length - 1];

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.strokeStyle = updatedLine.color;
    ctx.lineWidth = updatedLine.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const endDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault(); // Prevent scrolling on touch devices

    if (!isDrawing || !currentLine) return;

    // Only add the line if it has at least 2 points
    if (currentLine.points.length >= 2) {
      // Important: Create a new array with the current line added
      setLines((prevLines) => [...prevLines, currentLine]);
    }

    setIsDrawing(false);
    setCurrentLine(null);
  };

  const createThumbnail = (): string => {
    const canvas = canvasRef.current;
    if (!canvas) return "";

    try {
      return canvas.toDataURL("image/png");
    } catch (e) {
      console.error("Failed to create thumbnail", e);
      return "";
    }
  };

  const handleSaveClick = () => {
    setSketchName(`Sketch ${format(new Date(), "MMM d, yyyy h:mm a")}`);
    setShowSaveDialog(true);
  };

  const handleSave = () => {
    if (!sketchName.trim()) {
      showNotification("Please enter a name for your sketch");
      return;
    }

    const newSketch: SavedSketch = {
      id: Date.now().toString(),
      name: sketchName.trim(),
      date: new Date().toISOString(),
      lines: [...lines],
      thumbnail: createThumbnail(),
    };

    const updatedSketches = [...savedSketches, newSketch];
    setSavedSketches(updatedSketches);
    localStorage.setItem("habitly_sketches", JSON.stringify(updatedSketches));

    setShowSaveDialog(false);
    showNotification("Sketch saved!");
  };

  const handleClear = () => {
    setLines([]);
    setSelectedSketch(null);
  };

  const handleLoadSketch = (sketch: SavedSketch) => {
    setLines(sketch.lines);
    setSelectedSketch(sketch);
    showNotification(`Loaded: ${sketch.name}`);
  };

  const handleDeleteSketch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const updatedSketches = savedSketches.filter((sketch) => sketch.id !== id);
    setSavedSketches(updatedSketches);
    localStorage.setItem("habitly_sketches", JSON.stringify(updatedSketches));

    if (selectedSketch?.id === id) {
      setSelectedSketch(null);
      setLines([]);
    }

    showNotification("Sketch deleted");
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${selectedSketch?.name || "sketch"}.png`;
      link.href = dataUrl;
      link.click();
      showNotification("Sketch downloaded");
    } catch (e) {
      console.error("Failed to download sketch", e);
      showNotification("Failed to download sketch");
    }
  };

  const colors = [
    "#ffffff",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
  ];

  return (
    <div className="flex flex-col h-full relative">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className="absolute top-0 left-0 right-0 bg-green-500 text-white py-2 px-4 text-center z-50"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Button
            variant={tool === "pencil" ? "default" : "outline"}
            size="icon"
            onClick={() => setTool("pencil")}
            className="rounded-full"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === "eraser" ? "default" : "outline"}
            size="icon"
            onClick={() => setTool("eraser")}
            className="rounded-full"
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSaveClick}
            className="rounded-full"
          >
            <Save className="h-4 w-4" />
          </Button>
          {selectedSketch && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleDownload}
              className="rounded-full"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={handleClear}
            className="rounded-full text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Color Selection */}
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        {colors.map((c) => (
          <motion.button
            key={c}
            className={`w-8 h-8 rounded-full flex-shrink-0`}
            style={{
              backgroundColor: c,
              border: color === c ? "2px solid white" : "none",
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setColor(c)}
          />
        ))}

        <div className="ml-2 flex items-center">
          <span className="text-xs text-gray-400 mr-2">Size:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={brushWidth}
            onChange={(e) => setBrushWidth(Number.parseInt(e.target.value))}
            className="w-20"
          />
        </div>
      </div>

      {/* Canvas and Saved Sketches */}
      <div className="grid grid-cols-1 gap-4">
        {/* Canvas Container */}
        <div
          className="md:col-span-2 bg-black opacity-100 rounded-lg overflow-hidden relative"
          style={{ height: "400px" }}
        >
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={endDrawing}
          />
        </div>

        {/* Saved Sketches */}
        <div className="h-[300px] overflow-y-auto bg-gray-900 rounded-lg p-2">
          <h3 className="text-sm font-medium mb-2 text-gray-400">
            Saved Sketches
          </h3>

          {savedSketches.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No saved sketches yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedSketches.map((sketch) => (
                <div
                  key={sketch.id}
                  className={`p-2 rounded-lg cursor-pointer relative ${
                    selectedSketch?.id === sketch.id
                      ? "bg-purple-900/30 border border-purple-500/50"
                      : "bg-gray-800"
                  }`}
                  onClick={() => handleLoadSketch(sketch)}
                >
                  <div className="flex items-center">
                    {sketch.thumbnail ? (
                      <div className="w-12 h-12 bg-black rounded overflow-hidden mr-2 flex-shrink-0">
                        <img
                          src={sketch.thumbnail || "/placeholder.svg"}
                          alt={sketch.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-black rounded overflow-hidden mr-2 flex-shrink-0 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 opacity-50" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {sketch.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(sketch.date), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-950/30 absolute right-1 top-1"
                      onClick={(e) => handleDeleteSketch(sketch.id, e)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-gray-900">
            <div className="p-4">
              <h3 className="text-lg font-medium mb-4">Save Sketch</h3>
              <Input
                value={sketchName}
                onChange={(e) => setSketchName(e.target.value)}
                placeholder="Enter sketch name"
                className="mb-4 bg-gray-800 border-gray-700"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                }}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Check className="mr-2 h-4 w-4" /> Save
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
