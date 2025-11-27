import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Line,
  Text as KText,
  Arrow as KArrow,
  Group as KGroup,
  Transformer,
  Path,
  Ellipse,
} from "react-konva";
import {
  Mouse,
  Hand,
  Type,
  Square,
  Circle as CircleIcon,
  Triangle,
  Minus,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
  Trash2,
  Download,
  Upload,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Layers,
  Grid3x3,
  Move,
  Settings,
  Pen,
  Eraser,
  Image as ImageIcon,
  MessageSquare,
  Link2,
  RotateCcw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Database,
  Shield,
  User,
  Users,
  FileText,
  Server,
  Cloud,
  LockKeyhole,
  Save,
  Loader,
} from "lucide-react";
import { Html } from "react-konva-utils";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  getDataMappingById,
  updateDataMapping,
  updateDiagramData,
  getSVGExport,
  saveDiagramSVG,
} from "../../services/DataMappingService";
import { useParams } from "react-router-dom";

/* ---------- Constants ---------- */
const STORAGE_KEY = "extensive_diagram_studio_v1";
const GRID_SIZE = 20;
const HISTORY_LIMIT = 50;
const SNAP_THRESHOLD = 5;

/* ---------- Utilities ---------- */
const uid = () =>
  `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const deepClone = (x) => JSON.parse(JSON.stringify(x));

const snapToGrid = (val, gridSize) => {
  return Math.round(val / gridSize) * gridSize;
};

const distance = (p1, p2) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

/* ---------- Shape helpers ---------- */
const getShapeCenter = (shape) => {
  if (!shape) return { x: 0, y: 0 };

  if (shape.type === "circle" || shape.type === "ellipse") {
    return {
      x: shape.x + (shape.width || shape.radiusX || 50) / 2,
      y: shape.y + (shape.height || shape.radiusY || 50) / 2,
    };
  }

  return {
    x: shape.x + (shape.width || 0) / 2,
    y: shape.y + (shape.height || 0) / 2,
  };
};

// Port positions: top and bottom for every shape
const getPortPositions = (shape) => {
  const center = getShapeCenter(shape);
  const halfW = Math.max((shape.width || 100) / 2, 10);
  const halfH = Math.max((shape.height || 60) / 2, 10);
  return {
    top: { x: center.x, y: center.y - halfH - 6 },
    bottom: { x: center.x, y: center.y + halfH + 6 },
  };
};

const getConnectionPoint = (shape, targetShape) => {
  // Keep this robust — it should return a point just outside the shape edge toward target
  if (!shape || !targetShape) return { x: 0, y: 0 };

  const center = getShapeCenter(shape);
  const targetCenter = getShapeCenter(targetShape);

  let dx = targetCenter.x - center.x;
  let dy = targetCenter.y - center.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 0.0001) {
    dx = 1;
    dy = 0;
  } else {
    dx /= dist;
    dy /= dist;
  }

  const halfW = Math.max((shape.width || 60) / 2, 10);
  const halfH = Math.max((shape.height || 60) / 2, 10);
  const padding = 6;

  const scale = Math.min(
    Math.abs(halfW / (dx || 0.0001)) || halfW,
    Math.abs(halfH / (dy || 0.0001)) || halfH
  );

  return {
    x: center.x + dx * (scale + padding),
    y: center.y + dy * (scale + padding),
  };
};

/* ---------- Main Component ---------- */
export default function ExtensiveDiagramStudio() {
  const readOnly =
    new URLSearchParams(window.location.search).get("view") === "1";

  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const layerRef = useRef(null);
  const fileInputRef = useRef(null);

  const { id } = useParams();
  const [flowMeta, setFlowMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  // Viewport state
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Stage transform
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  // Drawing state
  const [shapes, setShapes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [mode, setMode] = useState("select"); // select, hand, draw, text, shape-*, connector
  const [tool, setTool] = useState("select");

  // UI state
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGridEnabled, setSnapToGridEnabled] = useState(false);
  const [showLayersPanel, setShowLayersPanel] = useState(true);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);

  // Connector state (port-based)
  // connectingFrom: { shapeId, port: 'top'|'bottom', x, y } or null
  const [connectingFrom, setConnectingFrom] = useState(null);
  // tempConnector: { startX, startY, endX, endY } while dragging from a port
  const [tempConnector, setTempConnector] = useState(null);

  // Selection rectangle
  const [selectionRect, setSelectionRect] = useState(null);

  // History
  const historyRef = useRef({ past: [], future: [] });

  // Current style
  const [currentStyle, setCurrentStyle] = useState({
    fill: "#ffffff",
    stroke: "#000000",
    strokeWidth: 2,
    fontSize: 16,
    fontFamily: "Arial",
    opacity: 1,
  });

  const LucideIconMap = {
    user: User,
    users: Users,
    database: Database,
    cloud: Cloud,
    server: Server,
    file: FileText,
    shield: Shield,
    lock: LockKeyhole,
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load from storage
  // useEffect(() => {
  //   try {
  //     const stored = localStorage.getItem(STORAGE_KEY);
  //     if (stored) {
  //       const data = JSON.parse(stored);
  //       setShapes(data.shapes || []);
  //     }
  //   } catch (err) {
  //     console.warn("Failed to load:", err);
  //   }
  // }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDataMappingById(id);
        setFlowMeta(res.data?.dataMapping);

        const diagram = res.data?.dataMapping?.diagram_data;
        if (diagram && diagram.shapes) {
          setShapes(diagram.shapes);
        }
      } catch (err) {
        console.error("Failed to load diagram:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // // Save to storage
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     try {
  //       localStorage.setItem(
  //         STORAGE_KEY,
  //         JSON.stringify({
  //           shapes,
  //           timestamp: Date.now(),
  //         })
  //       );
  //     } catch (err) {
  //       console.warn("Failed to save:", err);
  //     }
  //   }, 1000);

  //   return () => clearTimeout(timer);
  // }, [shapes]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!id) return;
      if (!stageRef.current) return;

      // 1. Save diagram JSON
      await updateDataMapping(id, {
        diagram_data: { shapes },
      });

      // 2. Generate SVG and save
      // try {
      //   const svgString = stageRef.current.toSVG();
      //   if (svgString) {
      //     await saveDiagramSVG(id, svgString);
      //   }
      // } catch (err) {
      //   console.error("Auto-save SVG failed:", err);
      // }
    }, 5000);

    return () => clearInterval(interval);
  }, [id, shapes]);

  const handleExportPNG = () => {
    if (!stageRef.current) return;

    const uri = stageRef.current.toDataURL({
      pixelRatio: 3,
      mimeType: "image/png",
    });

    const a = document.createElement("a");
    a.href = uri;
    a.download = `${flowMeta?.name || "diagram"}.png`;
    a.click();
  };

  // History management
  const saveHistory = useCallback(() => {
    const state = { shapes: deepClone(shapes) };
    historyRef.current.past.push(state);
    if (historyRef.current.past.length > HISTORY_LIMIT) {
      historyRef.current.past.shift();
    }
    historyRef.current.future = [];
  }, [shapes]);

  const undo = useCallback(() => {
    const past = historyRef.current.past;
    if (past.length === 0) return;

    const current = { shapes: deepClone(shapes) };
    const previous = past.pop();

    historyRef.current.future.push(current);
    setShapes(previous.shapes);
    setSelectedIds([]);
  }, [shapes]);

  const redo = useCallback(() => {
    const future = historyRef.current.future;
    if (future.length === 0) return;

    const current = { shapes: deepClone(shapes) };
    const next = future.pop();

    historyRef.current.past.push(current);
    setShapes(next.shapes);
    setSelectedIds([]);
  }, [shapes]);

  // Coordinate transformations
  const getRelativePointerPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;

    const pos = stage.getPointerPosition();
    if (!pos) return null;

    return {
      x: (pos.x - stagePos.x) / stageScale,
      y: (pos.y - stagePos.y) / stageScale,
    };
  }, [stagePos, stageScale]);

  // Add shape
  const addShape = useCallback(
    (type, options = {}) => {
      const pos = options.position || {
        x: (dimensions.width / 2 - stagePos.x) / stageScale,
        y: (dimensions.height / 2 - stagePos.y) / stageScale,
      };

      const baseShape = {
        id: uid(),
        type,
        x: snapToGridEnabled ? snapToGrid(pos.x, GRID_SIZE) : pos.x,
        y: snapToGridEnabled ? snapToGrid(pos.y, GRID_SIZE) : pos.y,
        width: options.width || 120,
        height: options.height || 80,
        fill: currentStyle.fill,
        stroke: currentStyle.stroke,
        strokeWidth: currentStyle.strokeWidth,
        opacity: currentStyle.opacity,
        rotation: 0,
        locked: false,
        visible: true,
        ...options,
      };

      saveHistory();
      setShapes((prev) => [...prev, baseShape]);
      setSelectedIds([baseShape.id]);

      return baseShape;
    },
    [
      dimensions,
      stagePos,
      stageScale,
      currentStyle,
      snapToGridEnabled,
      saveHistory,
    ]
  );

  // Update shape
  const updateShape = useCallback((id, updates) => {
    setShapes((prev) =>
      prev.map((shape) => (shape.id === id ? { ...shape, ...updates } : shape))
    );
  }, []);

  // Delete shapes
  const deleteShapes = useCallback(
    (ids) => {
      saveHistory();
      setShapes((prev) => {
        const deleted = new Set(ids);
        // Also delete connectors attached to deleted shapes
        return prev.filter((shape) => {
          if (deleted.has(shape.id)) return false;
          if (
            shape.type === "connector" &&
            (deleted.has(shape.from) || deleted.has(shape.to))
          ) {
            return false;
          }
          return true;
        });
      });
      setSelectedIds([]);
    },
    [saveHistory]
  );

  // Duplicate shapes
  const duplicateShapes = useCallback(
    (ids) => {
      if (ids.length === 0) return;

      saveHistory();
      const toDuplicate = shapes.filter((s) => ids.includes(s.id));
      const newShapes = toDuplicate.map((shape) => ({
        ...shape,
        id: uid(),
        x: shape.x + 20,
        y: shape.y + 20,
      }));

      setShapes((prev) => [...prev, ...newShapes]);
      setSelectedIds(newShapes.map((s) => s.id));
    },
    [shapes, saveHistory]
  );

  const handleSave = async () => {
    try {
      setSaving(true);

      await updateDataMapping(id, {
        diagram_data: {
          shapes,
          version: "1.0",
          savedAt: new Date().toISOString(),
        },
      });

      // if (stageRef.current) {
      //   const svgString = stageRef.current.toSVG();
      //   await saveDiagramSVG(id, svgString);
      // }
    } catch (err) {
      console.error("Failed to save diagram:", err);
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  // Handle mouse down on stage
  const handleStageMouseDown = useCallback(
    (e) => {
      if (e.target !== e.target.getStage()) {
        return;
      }

      const pos = getRelativePointerPosition();
      if (!pos) return;

      if (mode === "hand" || tool === "hand") {
        setIsPanning(true);
        const stage = stageRef.current;
        const pointer = stage.getPointerPosition();
        setPanStart({ x: pointer.x - stagePos.x, y: pointer.y - stagePos.y });
        return;
      }

      if (mode.startsWith("shape-")) {
        const shapeType = mode.replace("shape-", "");
        addShape(shapeType, { position: pos });
        setMode("select");
        return;
      }

      if (mode === "text") {
        addShape("text", {
          position: pos,
          text: "Double-click to edit",
          fontSize: currentStyle.fontSize,
          width: 200,
          height: 40,
        });
        setMode("select");
        return;
      }

      if (mode === "draw") {
        setIsDrawing(true);
        setCurrentDrawing({
          id: uid(),
          type: "path",
          points: [pos.x, pos.y],
          stroke: currentStyle.stroke,
          strokeWidth: currentStyle.strokeWidth,
          fill: "transparent",
          visible: true, // ✅ add this line
          locked: false, // optional but consistent
        });
        return;
      }

      // Start selection rectangle
      setSelectionRect({
        startX: pos.x,
        startY: pos.y,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
      });
    },
    [mode, tool, getRelativePointerPosition, stagePos, addShape, currentStyle]
  );

  // Handle mouse move
  const handleStageMouseMove = useCallback(() => {
    const pos = getRelativePointerPosition();
    if (!pos) return;

    if (isPanning) {
      const stage = stageRef.current;
      const pointer = stage.getPointerPosition();
      setStagePos({
        x: pointer.x - panStart.x,
        y: pointer.y - panStart.y,
      });
      return;
    }

    if (isDrawing && currentDrawing) {
      setCurrentDrawing((prev) => ({
        ...prev,
        points: [...prev.points, pos.x, pos.y],
      }));
      return;
    }

    if (tempConnector) {
      setTempConnector((prev) => ({
        ...prev,
        endX: pos.x,
        endY: pos.y,
      }));
      // optional immediate redraw
      layerRef.current?.batchDraw();
      return;
    }

    if (selectionRect) {
      const { startX, startY } = selectionRect;
      setSelectionRect({
        ...selectionRect,
        x: Math.min(startX, pos.x),
        y: Math.min(startY, pos.y),
        width: Math.abs(pos.x - startX),
        height: Math.abs(pos.y - startY),
      });
    }
  }, [
    isPanning,
    isDrawing,
    currentDrawing,
    tempConnector,
    selectionRect,
    getRelativePointerPosition,
    panStart,
  ]);

  // Handle mouse up
  const handleStageMouseUp = useCallback(
    (e) => {
      // If we were dragging a connector from a port, detect if released on another shape's port
      if (tempConnector && connectingFrom) {
        // Find shape + port under pointer (closest port within threshold)
        const stage = stageRef.current;
        const pointer = stage.getPointerPosition();
        const pointerRel = {
          x: (pointer.x - stagePos.x) / stageScale,
          y: (pointer.y - stagePos.y) / stageScale,
        };

        // iterate shapes to find nearest port within threshold
        let matched = null;
        for (const s of shapes) {
          if (s.id === connectingFrom.shapeId) continue;
          if (s.locked) continue;
          const ports = getPortPositions(s);
          const topDist = Math.hypot(
            ports.top.x - pointerRel.x,
            ports.top.y - pointerRel.y
          );
          const bottomDist = Math.hypot(
            ports.bottom.x - pointerRel.x,
            ports.bottom.y - pointerRel.y
          );
          if (topDist < SNAP_THRESHOLD) {
            matched = { shape: s, port: "top" };
            break;
          }
          if (bottomDist < SNAP_THRESHOLD) {
            matched = { shape: s, port: "bottom" };
            break;
          }
        }

        if (matched) {
          // create connector between connectingFrom and matched
          const fromShape = shapes.find((s) => s.id === connectingFrom.shapeId);
          const startPortPos = getPortPositions(fromShape)[connectingFrom.port];
          const endPortPos = getPortPositions(matched.shape)[matched.port];

          saveHistory();
          const connector = {
            id: uid(),
            type: "connector",
            from: connectingFrom.shapeId,
            fromPort: connectingFrom.port,
            to: matched.shape.id,
            toPort: matched.port,
            points: [
              startPortPos.x,
              startPortPos.y,
              endPortPos.x,
              endPortPos.y,
            ],
            stroke: "#4B5563", // enterprise subtle gray
            strokeWidth: 2,
            fill: "transparent",
            dash: [8, 6],
            curved: true,
            locked: true, // non-draggable, non-transformable
            visible: true,
          };

          setShapes((prev) => [...prev, connector]);
        }

        setConnectingFrom(null);
        setTempConnector(null);
        return;
      }

      if (isPanning) {
        setIsPanning(false);
        setPanStart(null);
        return;
      }

      if (isDrawing && currentDrawing) {
        if (currentDrawing.points.length > 2) {
          saveHistory();
          setShapes((prev) => [...prev, currentDrawing]);
        }
        setIsDrawing(false);
        setCurrentDrawing(null);
        return;
      }

      if (selectionRect) {
        const { x, y, width, height } = selectionRect;

        if (width < 3 && height < 3) {
          setSelectedIds([]);
        } else {
          const selected = shapes
            .filter((shape) => {
              if (shape.locked) return false;
              const sx = shape.x;
              const sy = shape.y;
              const sw = shape.width || 0;
              const sh = shape.height || 0;

              return !(
                sx > x + width ||
                sx + sw < x ||
                sy > y + height ||
                sy + sh < y
              );
            })
            .map((s) => s.id);

          setSelectedIds(selected);
        }

        setSelectionRect(null);
      }
    },
    [
      isPanning,
      isDrawing,
      currentDrawing,
      selectionRect,
      shapes,
      saveHistory,
      tempConnector,
      connectingFrom,
      stagePos,
      stageScale,
    ]
  );

  // Handle shape click
  const handleShapeClick = useCallback(
    (e, shapeId) => {
      e.cancelBubble = true;

      const shape = shapes.find((s) => s.id === shapeId);
      if (!shape || shape.locked) return;

      // only allow normal selection behavior here - port interactions are handled by port handlers
      const isMultiSelect = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;

      if (isMultiSelect) {
        setSelectedIds((prev) =>
          prev.includes(shapeId)
            ? prev.filter((id) => id !== shapeId)
            : [...prev, shapeId]
        );
      } else {
        setSelectedIds([shapeId]);
      }
    },
    [shapes]
  );

  // Handle shape transform
  const handleTransform = useCallback(
    (e, shapeId) => {
      const node = e.target;
      const shape = shapes.find((s) => s.id === shapeId);
      if (!shape) return;

      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      const updates = {
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        width: Math.max(10, node.width() * scaleX),
        height: Math.max(10, node.height() * scaleY),
      };

      node.scaleX(1);
      node.scaleY(1);

      updateShape(shapeId, updates);
    },
    [shapes, updateShape]
  );

  // Handle drag end
  const handleDragEnd = useCallback(
    (e, shapeId) => {
      const node = e.target;

      let x = node.x();
      let y = node.y();

      if (snapToGridEnabled) {
        x = snapToGrid(x, GRID_SIZE);
        y = snapToGrid(y, GRID_SIZE);
        node.x(x);
        node.y(y);
      }

      saveHistory();
      updateShape(shapeId, { x, y });
    },
    [snapToGridEnabled, saveHistory, updateShape]
  );

  // Start dragging from a shape port
  const startPortDrag = useCallback(
    (e, shapeId, portKey) => {
      e.cancelBubble = true;
      const shape = shapes.find((s) => s.id === shapeId);
      if (!shape || shape.locked) return;
      const portPos = getPortPositions(shape)[portKey];
      setConnectingFrom({ shapeId, port: portKey, x: portPos.x, y: portPos.y });
      setTempConnector({
        startX: portPos.x,
        startY: portPos.y,
        endX: portPos.x,
        endY: portPos.y,
      });
    },
    [shapes]
  );

  // Update transformer selection nodes
  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;

    const selectedNodes = selectedIds
      .map((id) => stage.findOne(`#${id}`))
      .filter(
        (node) => node && !shapes.find((s) => s.id === node.id() && s.locked)
      );

    transformer.nodes(selectedNodes);
    transformer.getLayer()?.batchDraw();
  }, [selectedIds, shapes]);

  // Update connectors when shapes move — keep points in sync with ports
  useEffect(() => {
    setShapes((prevShapes) => {
      let changed = false;
      const updated = prevShapes.map((shape) => {
        if (shape.type !== "connector" || !shape.from || !shape.to) {
          return shape;
        }

        const fromShape = prevShapes.find((s) => s.id === shape.from);
        const toShape = prevShapes.find((s) => s.id === shape.to);

        if (!fromShape || !toShape) return shape;

        const fromPortPos =
          getPortPositions(fromShape)[shape.fromPort || "bottom"];
        const toPortPos = getPortPositions(toShape)[shape.toPort || "top"];
        const newPoints = [
          fromPortPos.x,
          fromPortPos.y,
          toPortPos.x,
          toPortPos.y,
        ];
        if (JSON.stringify(shape.points) !== JSON.stringify(newPoints)) {
          changed = true;
          return { ...shape, points: newPoints };
        }
        return shape;
      });
      return changed ? updated : prevShapes;
    });
  }, [
    JSON.stringify(
      shapes.map((s) => ({
        id: s.id,
        x: s.x,
        y: s.y,
        width: s.width,
        height: s.height,
      }))
    ),
  ]);
  // dependency uses stringified minimal shape info to avoid infinite loops

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMod = e.ctrlKey || e.metaKey;

      // Undo/Redo
      if (isMod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (isMod && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }

      // Delete
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.length > 0) {
          e.preventDefault();
          deleteShapes(selectedIds);
        }
      }

      // Duplicate
      if (isMod && e.key === "d") {
        e.preventDefault();
        duplicateShapes(selectedIds);
      }

      // Select all
      if (isMod && e.key === "a") {
        e.preventDefault();
        setSelectedIds(shapes.filter((s) => !s.locked).map((s) => s.id));
      }

      // Deselect
      if (e.key === "Escape") {
        setSelectedIds([]);
        setMode("select");
        setConnectingFrom(null);
        setTempConnector(null);
      }

      // Arrow keys to move
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) &&
        selectedIds.length > 0
      ) {
        e.preventDefault();
        const delta = e.shiftKey ? 10 : 1;
        const dx =
          e.key === "ArrowRight" ? delta : e.key === "ArrowLeft" ? -delta : 0;
        const dy =
          e.key === "ArrowDown" ? delta : e.key === "ArrowUp" ? -delta : 0;

        saveHistory();
        setShapes((prev) =>
          prev.map((shape) =>
            selectedIds.includes(shape.id)
              ? { ...shape, x: shape.x + dx, y: shape.y + dy }
              : shape
          )
        );
      }

      // Tool shortcuts
      if (!e.ctrlKey && !e.metaKey) {
        if (e.key === "v" || e.key === "V") setMode("select");
        if (e.key === "h" || e.key === "H") setMode("hand");
        if (e.key === "t" || e.key === "T") setMode("text");
        if (e.key === "p" || e.key === "P") setMode("draw");
        if (e.key === "l" || e.key === "L") setMode("connector");
        if (e.key === "r" || e.key === "R") setMode("shape-rectangle");
        if (e.key === "c" || e.key === "C") setMode("shape-circle");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedIds,
    shapes,
    undo,
    redo,
    deleteShapes,
    duplicateShapes,
    saveHistory,
  ]);

  // Zoom
  const handleWheel = useCallback(
    (e) => {
      e.evt.preventDefault();

      const stage = stageRef.current;
      const oldScale = stageScale;
      const pointer = stage.getPointerPosition();

      const mousePointTo = {
        x: (pointer.x - stagePos.x) / oldScale,
        y: (pointer.y - stagePos.y) / oldScale,
      };

      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const scaleBy = 1.05;
      const newScale =
        direction > 0
          ? Math.min(oldScale * scaleBy, 5)
          : Math.max(oldScale / scaleBy, 0.1);

      setStageScale(newScale);
      setStagePos({
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
    },
    [stageScale, stagePos]
  );

  // Export
  const exportJSON = useCallback(() => {
    const data = {
      shapes,
      version: "1.0",
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagram-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [shapes]);

  const handleExportSVG = async () => {
    try {
      const res = await getSVGExport(id);
      const svgString = res.data;

      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${flowMeta?.name || "diagram"}.svg`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("SVG export failed:", err);
      alert("Failed to export.");
    }
  };

  const importJSON = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.shapes) {
            saveHistory();
            setShapes(data.shapes);
            setSelectedIds([]);
          }
        } catch (err) {
          alert("Failed to import file");
        }
      };
      reader.readAsText(file);
    },
    [saveHistory]
  );

  // Render shape + ports
  const renderShape = (shape) => {
    if (!shape.visible) return null;

    const commonProps = {
      id: shape.id,
      draggable: !readOnly && !shape.locked && mode === "select",
      onClick: (e) => handleShapeClick(e, shape.id),
      onTap: (e) => handleShapeClick(e, shape.id),
      onDragEnd: (e) => handleDragEnd(e, shape.id),
      onTransformEnd: (e) => handleTransform(e, shape.id),
      opacity: shape.opacity || 1,
    };

    // Render connectors separately
    switch (shape.type) {
      case "connector": {
        const points = shape.points || [];
        if (points.length < 4) return null;

        const [x1, y1, x2, y2] = points;

        // Determine orientation (horizontal vs vertical)
        const horizontal = Math.abs(x2 - x1) > Math.abs(y2 - y1);

        let control1X, control1Y, control2X, control2Y;

        if (horizontal) {
          // Horizontal flow (S curve)
          const midX = (x1 + x2) / 2;
          control1X = midX;
          control2X = midX;
          control1Y = y1;
          control2Y = y2;
        } else {
          // Vertical flow (C curve)
          const midY = (y1 + y2) / 2;
          control1Y = midY;
          control2Y = midY;
          control1X = x1;
          control2X = x2;
        }

        const pathData = `M ${x1},${y1} C ${control1X},${control1Y} ${control2X},${control2Y} ${x2},${y2}`;

        // Calculate arrowhead manually
        const arrowLength = 10;
        const arrowWidth = 8;
        const angle = Math.atan2(y2 - y1, x2 - x1);

        const arrowTip = { x: x2, y: y2 };
        const arrowLeft = {
          x: x2 - arrowLength * Math.cos(angle - Math.PI / 6),
          y: y2 - arrowLength * Math.sin(angle - Math.PI / 6),
        };
        const arrowRight = {
          x: x2 - arrowLength * Math.cos(angle + Math.PI / 6),
          y: y2 - arrowLength * Math.sin(angle + Math.PI / 6),
        };

        return (
          <>
            {/* dashed curved connector */}
            <Path
              key={shape.id}
              data={pathData}
              stroke={shape.stroke || "#374151"}
              strokeWidth={shape.strokeWidth || 2}
              dash={[8, 6]}
              lineCap="round"
              lineJoin="round"
              listening={false}
              hitStrokeWidth={10}
              shadowColor="rgba(0,0,0,0.1)"
              shadowBlur={3}
            />

            {/* arrowhead only */}
            <Line
              points={[
                arrowLeft.x,
                arrowLeft.y,
                arrowTip.x,
                arrowTip.y,
                arrowRight.x,
                arrowRight.y,
              ]}
              fill={shape.stroke || "#374151"}
              stroke={shape.stroke || "#374151"}
              strokeWidth={shape.strokeWidth || 2}
              closed
              listening={false}
            />
          </>
        );
      }

      default: {
        // Non-connector shapes: render shape + ports
        const shapeNode = (() => {
          switch (shape.type) {
            case "rectangle":
              return (
                <Rect
                  {...commonProps}
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  fill={shape.fill}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  rotation={shape.rotation}
                />
              );
            case "rounded":
              return (
                <Rect
                  {...commonProps}
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  fill={shape.fill}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  cornerRadius={10}
                  rotation={shape.rotation}
                />
              );
            case "circle":
              return (
                <Circle
                  {...commonProps}
                  x={shape.x + shape.width / 2}
                  y={shape.y + shape.height / 2}
                  radius={shape.width / 2}
                  fill={shape.fill}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                />
              );
            case "ellipse":
              return (
                <Ellipse
                  {...commonProps}
                  x={shape.x + shape.width / 2}
                  y={shape.y + shape.height / 2}
                  radiusX={shape.width / 2}
                  radiusY={shape.height / 2}
                  fill={shape.fill}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  rotation={shape.rotation}
                />
              );
            case "diamond":
              return (
                <Line
                  {...commonProps}
                  points={[
                    shape.width / 2,
                    0,
                    shape.width,
                    shape.height / 2,
                    shape.width / 2,
                    shape.height,
                    0,
                    shape.height / 2,
                  ]}
                  x={shape.x}
                  y={shape.y}
                  fill={shape.fill}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  closed
                  rotation={shape.rotation}
                />
              );
            case "triangle":
              return (
                <Line
                  {...commonProps}
                  points={[
                    shape.width / 2,
                    0,
                    shape.width,
                    shape.height,
                    0,
                    shape.height,
                  ]}
                  x={shape.x}
                  y={shape.y}
                  fill={shape.fill}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  closed
                  rotation={shape.rotation}
                />
              );
            case "arrow":
              return (
                <KArrow
                  {...commonProps}
                  points={shape.points || [0, 0, shape.width || 100, 0]}
                  x={shape.x}
                  y={shape.y}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  fill={shape.stroke}
                  pointerLength={10}
                  pointerWidth={10}
                />
              );
            case "line":
              return (
                <Line
                  {...commonProps}
                  points={shape.points || [0, 0, shape.width || 100, 0]}
                  x={shape.x}
                  y={shape.y}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                />
              );
            case "path":
              return (
                <Line
                  {...commonProps}
                  points={shape.points}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                />
              );
            case "text":
              return (
                <KText
                  {...commonProps}
                  x={shape.x}
                  y={shape.y}
                  text={shape.text || "Text"}
                  fontSize={shape.fontSize || 16}
                  fontFamily={shape.fontFamily || "Arial"}
                  fill={shape.stroke || "#000"}
                  width={shape.width}
                  align={shape.align || "left"}
                />
              );
            case "icon":
              return (
                <KText
                  {...commonProps}
                  x={shape.x}
                  y={shape.y}
                  text={shape.iconSymbol || "❖"}
                  fontSize={shape.fontSize || 36}
                  fill={shape.stroke || "#000"}
                  width={shape.width || 50}
                  height={shape.height || 50}
                  align="center"
                  verticalAlign="middle"
                />
              );

            default:
              return null;
          }
        })();

        // compute ports
        const ports = getPortPositions(shape);
        const portRadius = 5;
        // ports drawn after shape so they appear above shapes
        return (
          <React.Fragment key={shape.id}>
            {shapeNode}
            {/* top port */}
            <Circle
              id={`${shape.id}-port-top`}
              x={ports.top.x}
              y={ports.top.y}
              radius={portRadius}
              fill="#3b82f6"
              stroke="#ffffff"
              strokeWidth={1}
              onMouseDown={(e) => {
                e.cancelBubble = true;
                startPortDrag(e, shape.id, "top");
              }}
              onTouchStart={(e) => {
                e.cancelBubble = true;
                startPortDrag(e, shape.id, "top");
              }}
            />
            {/* bottom port */}
            <Circle
              id={`${shape.id}-port-bottom`}
              x={ports.bottom.x}
              y={ports.bottom.y}
              radius={portRadius}
              fill="#3b82f6"
              stroke="#ffffff"
              strokeWidth={1}
              onMouseDown={(e) => {
                e.cancelBubble = true;
                startPortDrag(e, shape.id, "bottom");
              }}
              onTouchStart={(e) => {
                e.cancelBubble = true;
                startPortDrag(e, shape.id, "bottom");
              }}
            />
          </React.Fragment>
        );
      }
    }
  };

  const selectedShapes = shapes.filter((s) => selectedIds.includes(s.id));
  const selectedShape = selectedShapes.length === 1 ? selectedShapes[0] : null;

  return (
    <div className="fixed inset-0 bg-gray-100 flex flex-col overflow-hidden z-50">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-gray-300 shadow-sm flex items-center justify-between px-4 py-2 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/data-mapping")}
            className="p-2 rounded hover:bg-gray-100 flex items-center gap-1 text-gray-700"
            title="Back to Data Mapping"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Back</span>
          </button>

          <h1 className="text-xl font-bold text-gray-800 ml-2 mr-4">
            Data Mapping
          </h1>

          {/* Tool buttons */}
          <div className="flex items-center gap-1 border-r pr-2">
            <button
              onClick={() => setMode("select")}
              className={`p-2 rounded hover:bg-gray-100 ${
                mode === "select" ? "bg-blue-100 text-blue-600" : ""
              }`}
              title="Select (V)"
            >
              <Mouse size={18} />
            </button>
            <button
              onClick={() => setMode("hand")}
              className={`p-2 rounded hover:bg-gray-100 ${
                mode === "hand" ? "bg-blue-100 text-blue-600" : ""
              }`}
              title="Pan (H)"
            >
              <Hand size={18} />
            </button>
          </div>

          {/* Shape tools */}
          <div className="flex items-center gap-1 border-r pr-2">
            <button
              onClick={() => setMode("shape-rectangle")}
              disabled={readOnly}
              className={`p-2 rounded hover:bg-gray-100 ${
                mode === "shape-rectangle" ? "bg-blue-100 text-blue-600" : ""
              }`}
              title="Rectangle (R)"
            >
              <Square size={18} />
            </button>
            <button
              onClick={() => setMode("shape-circle")}
              disabled={readOnly}
              className={`p-2 rounded hover:bg-gray-100 ${
                mode === "shape-circle" ? "bg-blue-100 text-blue-600" : ""
              }`}
              title="Circle (C)"
            >
              <CircleIcon size={18} />
            </button>
            <button
              onClick={() => setMode("shape-diamond")}
              disabled={readOnly}
              className={`p-2 rounded hover:bg-gray-100 ${
                mode === "shape-diamond" ? "bg-blue-100 text-blue-600" : ""
              }`}
              title="Diamond"
            >
              <div className="w-4 h-4 border-2 border-current transform rotate-45"></div>
            </button>
            <button
              onClick={() => setMode("shape-triangle")}
              disabled={readOnly}
              className={`p-2 rounded hover:bg-gray-100 ${
                mode === "shape-triangle" ? "bg-blue-100 text-blue-600" : ""
              }`}
              title="Triangle"
            >
              <Triangle size={18} />
            </button>
            <button
              onClick={() => setMode("shape-arrow")}
              disabled={readOnly}
              className={`p-2 rounded hover:bg-gray-100 ${
                mode === "shape-arrow" ? "bg-blue-100 text-blue-600" : ""
              }`}
              title="Arrow"
            >
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Compliance / ROPA Icons */}
          <div className="flex items-center gap-1 border-r pr-2">
            <button
              onClick={() =>
                addShape("icon", { iconSymbol: "👤", width: 50, height: 50 })
              }
              disabled={readOnly}
              className="p-2 rounded hover:bg-gray-100"
              title="User"
            >
              <User size={18} />
            </button>

            <button
              onClick={() =>
                addShape("icon", { iconSymbol: "🧑‍💼", width: 50, height: 50 })
              }
              disabled={readOnly}
              className="p-2 rounded hover:bg-gray-100"
              title="Employee"
            >
              <Users size={18} />
            </button>

            <button
              onClick={() =>
                addShape("icon", { iconSymbol: "💾", width: 50, height: 50 })
              }
              disabled={readOnly}
              className="p-2 rounded hover:bg-gray-100"
              title="Database"
            >
              <Database size={18} />
            </button>

            <button
              onClick={() =>
                addShape("icon", { iconSymbol: "☁️", width: 50, height: 50 })
              }
              disabled={readOnly}
              className="p-2 rounded hover:bg-gray-100"
              title="Cloud"
            >
              <Cloud size={18} />
            </button>

            <button
              onClick={() =>
                addShape("icon", { iconSymbol: "📄", width: 50, height: 50 })
              }
              disabled={readOnly}
              className="p-2 rounded hover:bg-gray-100"
              title="Document"
            >
              <FileText size={18} />
            </button>

            <button
              onClick={() =>
                addShape("icon", { iconSymbol: "🔒", width: 50, height: 50 })
              }
              disabled={readOnly}
              className="p-2 rounded hover:bg-gray-100"
              title="Lock"
            >
              <LockKeyhole size={18} />
            </button>

            <button
              onClick={() =>
                addShape("icon", { iconSymbol: "🛡️", width: 50, height: 50 })
              }
              disabled={readOnly}
              className="p-2 rounded hover:bg-gray-100"
              title="Shield"
            >
              <Shield size={18} />
            </button>

            <button
              onClick={() =>
                addShape("icon", { iconSymbol: "🧾", width: 50, height: 50 })
              }
              disabled={readOnly}
              className="p-2 rounded hover:bg-gray-100"
              title="Compliance Record"
            >
              <FileText size={18} />
            </button>
          </div>

          {/* Drawing tools */}
          <div className="flex items-center gap-1 border-r pr-2">
            <button
              onClick={() => setMode("draw")}
              disabled={readOnly}
              className={`p-2 rounded hover:bg-gray-100 ${
                mode === "draw" ? "bg-blue-100 text-blue-600" : ""
              }`}
              title="Draw (P)"
            >
              <Pen size={18} />
            </button>
            <button
              onClick={() => setMode("text")}
              disabled={readOnly}
              className={`p-2 rounded hover:bg-gray-100 ${
                mode === "text" ? "bg-blue-100 text-blue-600" : ""
              }`}
              title="Text (T)"
            >
              <Type size={18} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 border-r pr-2">
            <button
              onClick={undo}
              disabled={readOnly}
              className="p-2 rounded hover:bg-gray-100"
              title="Undo (Ctrl+Z)"
            >
              <Undo size={18} />
            </button>
            <button
              onClick={redo}
              disabled={readOnly}
              className="p-2 rounded hover:bg-gray-100"
              title="Redo (Ctrl+Y)"
            >
              <Redo size={18} />
            </button>
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-1 border-r pr-2">
            <button
              onClick={() => {
                const newScale = Math.max(0.1, stageScale - 0.1);
                setStageScale(newScale);
              }}
              className="p-2 rounded hover:bg-gray-100"
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>
            <span className="text-sm text-gray-600 w-12 text-center">
              {Math.round(stageScale * 100)}%
            </span>
            <button
              onClick={() => {
                const newScale = Math.min(5, stageScale + 0.1);
                setStageScale(newScale);
              }}
              className="p-2 rounded hover:bg-gray-100"
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>
          </div>

          {/* View options */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded hover:bg-gray-100 ${
                showGrid ? "bg-blue-100 text-blue-600" : ""
              }`}
              title="Toggle Grid"
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => setSnapToGridEnabled(!snapToGridEnabled)}
              className={`p-2 rounded hover:bg-gray-100 ${
                snapToGridEnabled ? "bg-blue-100 text-blue-600" : ""
              }`}
              title="Snap to Grid"
            >
              <Move size={18} />
            </button>
          </div>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (selectedIds.length > 0) {
                duplicateShapes(selectedIds);
              }
            }}
            className="p-2 rounded hover:bg-gray-100"
            title="Duplicate (Ctrl+D)"
            disabled={readOnly || selectedIds.length === 0}
          >
            <Copy size={18} />
          </button>
          <button
            onClick={() => {
              if (selectedIds.length > 0) {
                deleteShapes(selectedIds);
              }
            }}
            className="p-2 rounded hover:bg-gray-100 text-red-600"
            title="Delete (Del)"
            disabled={readOnly || selectedIds.length === 0}
          >
            <Trash2 size={18} />
          </button>

          <button
            onClick={handleSave}
            disabled={readOnly}
            className="px-3 py-2 bg-[#5DEE92] text-white rounded hover:opacity-90 cursor-pointer"
          >
            {saving ? <Loader size={18} /> : <Save size={18} />}
          </button>

          <div className="border-l pl-2 flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={importJSON}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={handleExportPNG}
              className="p-2 rounded hover:bg-gray-100"
              title="Export"
            >
              <Download size={18} />
            </button>
          </div>

          <button
            onClick={() => setShowLayersPanel(!showLayersPanel)}
            className={`p-2 rounded hover:bg-gray-100 ${
              showLayersPanel ? "bg-blue-100 text-blue-600" : ""
            }`}
            title="Toggle Layers"
          >
            <Layers size={18} />
          </button>
          <button
            onClick={() => setShowPropertiesPanel(!showPropertiesPanel)}
            className={`p-2 rounded hover:bg-gray-100 ${
              showPropertiesPanel ? "bg-blue-100 text-blue-600" : ""
            }`}
            title="Toggle Properties"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Properties */}
        {showPropertiesPanel && (
          <div className="w-64 bg-white border-r border-gray-300 overflow-y-auto p-4">
            <h2 className="font-semibold text-lg mb-4">Properties</h2>

            {selectedShape ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <div className="text-sm text-gray-600 capitalize">
                    {selectedShape.type}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      X
                    </label>
                    <input
                      type="number"
                      value={Math.round(selectedShape.x)}
                      onChange={(e) =>
                        !readOnly &&
                        updateShape(selectedShape.id, {
                          x: Number(e.target.value),
                        })
                      }
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Y
                    </label>
                    <input
                      type="number"
                      value={Math.round(selectedShape.y)}
                      onChange={(e) =>
                        !readOnly &&
                        updateShape(selectedShape.id, {
                          y: Number(e.target.value),
                        })
                      }
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>
                </div>

                {selectedShape.type !== "connector" &&
                  selectedShape.type !== "path" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Width
                        </label>
                        <input
                          type="number"
                          value={Math.round(selectedShape.width || 0)}
                          onChange={(e) => {
                            saveHistory();
                            !readOnly &&
                              updateShape(selectedShape.id, {
                                width: Math.max(10, Number(e.target.value)),
                              });
                          }}
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Height
                        </label>
                        <input
                          type="number"
                          value={Math.round(selectedShape.height || 0)}
                          onChange={(e) => {
                            saveHistory();
                            !readOnly &&
                              updateShape(selectedShape.id, {
                                height: Math.max(10, Number(e.target.value)),
                              });
                          }}
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      </div>
                    </div>
                  )}

                {selectedShape.type === "text" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Text
                      </label>
                      <textarea
                        value={selectedShape.text || ""}
                        onChange={(e) => {
                          saveHistory();
                          !readOnly &&
                            updateShape(selectedShape.id, {
                              text: e.target.value,
                            });
                        }}
                        className="w-full px-2 py-1 border rounded text-sm"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Font Size
                      </label>
                      <input
                        type="number"
                        value={selectedShape.fontSize || 16}
                        onChange={(e) => {
                          saveHistory();
                          !readOnly &&
                            updateShape(selectedShape.id, {
                              fontSize: Number(e.target.value),
                            });
                        }}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fill Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={selectedShape.fill || "#ffffff"}
                      onChange={(e) => {
                        saveHistory();
                        !readOnly &&
                          updateShape(selectedShape.id, {
                            fill: e.target.value,
                          });
                      }}
                      className="w-12 h-8 rounded border"
                    />
                    <input
                      type="text"
                      value={selectedShape.fill || "#ffffff"}
                      onChange={(e) => {
                        saveHistory();
                        !readOnly &&
                          updateShape(selectedShape.id, {
                            fill: e.target.value,
                          });
                      }}
                      className="flex-1 px-2 py-1 border rounded text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stroke Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={selectedShape.stroke || "#000000"}
                      onChange={(e) => {
                        saveHistory();
                        !readOnly &&
                          updateShape(selectedShape.id, {
                            stroke: e.target.value,
                          });
                      }}
                      className="w-12 h-8 rounded border"
                    />
                    <input
                      type="text"
                      value={selectedShape.stroke || "#000000"}
                      onChange={(e) => {
                        saveHistory();
                        !readOnly &&
                          updateShape(selectedShape.id, {
                            stroke: e.target.value,
                          });
                      }}
                      className="flex-1 px-2 py-1 border rounded text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stroke Width: {selectedShape.strokeWidth || 2}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={selectedShape.strokeWidth || 2}
                    onChange={(e) => {
                      saveHistory();
                      !readOnly &&
                        updateShape(selectedShape.id, {
                          strokeWidth: Number(e.target.value),
                        });
                    }}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opacity: {Math.round((selectedShape.opacity || 1) * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedShape.opacity || 1}
                    onChange={(e) => {
                      saveHistory();
                      !readOnly &&
                        updateShape(selectedShape.id, {
                          opacity: Number(e.target.value),
                        });
                    }}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rotation: {Math.round(selectedShape.rotation || 0)}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={selectedShape.rotation || 0}
                    onChange={(e) => {
                      saveHistory();
                      !readOnly &&
                        updateShape(selectedShape.id, {
                          rotation: Number(e.target.value),
                        });
                    }}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      saveHistory();
                      updateShape(selectedShape.id, {
                        locked: !selectedShape.locked,
                      });
                    }}
                    className="flex-1 px-3 py-2 border rounded hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    {selectedShape.locked ? (
                      <Unlock size={16} />
                    ) : (
                      <Lock size={16} />
                    )}
                    <span className="text-sm">
                      {selectedShape.locked ? "Unlock" : "Lock"}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      saveHistory();
                      updateShape(selectedShape.id, {
                        visible: !selectedShape.visible,
                      });
                    }}
                    className="flex-1 px-3 py-2 border rounded hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    {selectedShape.visible ? (
                      <Eye size={16} />
                    ) : (
                      <EyeOff size={16} />
                    )}
                    <span className="text-sm">
                      {selectedShape.visible ? "Hide" : "Show"}
                    </span>
                  </button>
                </div>
              </div>
            ) : selectedShapes.length > 1 ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  {selectedShapes.length} shapes selected
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      saveHistory();
                      const avgFill = selectedShapes[0]?.fill || "#ffffff";
                      selectedShapes.forEach((shape) => {
                        updateShape(shape.id, { fill: avgFill });
                      });
                    }}
                    disabled={readOnly}
                    className="w-full px-3 py-2 border rounded hover:bg-gray-50 text-sm"
                  >
                    Apply Same Fill
                  </button>
                  <button
                    onClick={() => {
                      saveHistory();
                      const avgStroke = selectedShapes[0]?.stroke || "#000000";
                      selectedShapes.forEach((shape) => {
                        updateShape(shape.id, { stroke: avgStroke });
                      });
                    }}
                    disabled={readOnly}
                    className="w-full px-3 py-2 border rounded hover:bg-gray-50 text-sm"
                  >
                    Apply Same Stroke
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Select a shape to edit properties
              </div>
            )}

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-sm mb-3">Default Style</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Fill
                  </label>
                  <input
                    type="color"
                    value={currentStyle.fill}
                    onChange={(e) =>
                      !readOnly &&
                      setCurrentStyle((prev) => ({
                        ...prev,
                        fill: e.target.value,
                      }))
                    }
                    className="w-full h-8 rounded border"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Stroke
                  </label>
                  <input
                    type="color"
                    value={currentStyle.stroke}
                    onChange={(e) =>
                      !readOnly &&
                      setCurrentStyle((prev) => ({
                        ...prev,
                        stroke: e.target.value,
                      }))
                    }
                    className="w-full h-8 rounded border"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Stroke Width: {currentStyle.strokeWidth}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={currentStyle.strokeWidth}
                    onChange={(e) =>
                      !readOnly &&
                      setCurrentStyle((prev) => ({
                        ...prev,
                        strokeWidth: Number(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-hidden relative bg-gray-50">
          <Stage
            ref={stageRef}
            width={
              dimensions.width -
              (showPropertiesPanel ? 256 : 0) -
              (showLayersPanel ? 256 : 0)
            }
            height={dimensions.height - 56}
            scaleX={stageScale}
            scaleY={stageScale}
            x={stagePos.x}
            y={stagePos.y}
            onMouseDown={handleStageMouseDown}
            onMouseMove={handleStageMouseMove}
            onMouseUp={handleStageMouseUp}
            onWheel={handleWheel}
            style={{
              cursor:
                mode === "hand" || tempConnector
                  ? "grab"
                  : mode === "draw"
                  ? "crosshair"
                  : "default",
            }}
          >
            {/* Grid layer */}
            {showGrid && (
              <Layer listening={false}>
                {(() => {
                  const gridRange = 10000; // 🔹 extend the grid beyond viewport (10,000px in all directions)
                  const step = GRID_SIZE;
                  const zoom = stageScale;

                  const startX =
                    -gridRange - ((stagePos.x / zoom) % step) - step * 2; // extra padding
                  const endX = gridRange + dimensions.width / zoom + step * 2;
                  const startY =
                    -gridRange - ((stagePos.y / zoom) % step) - step * 2;
                  const endY = gridRange + dimensions.height / zoom + step * 2;

                  const vertical = [];
                  const horizontal = [];

                  // 🔹 Vertical grid lines (X direction)
                  for (let x = startX; x < endX; x += step) {
                    vertical.push(
                      <Line
                        key={`v${x}`}
                        points={[x, -gridRange * 2, x, gridRange * 2]}
                        stroke="#e0e0e0"
                        strokeWidth={1 / zoom}
                        perfectDrawEnabled={false}
                      />
                    );
                  }

                  // 🔹 Horizontal grid lines (Y direction)
                  for (let y = startY; y < endY; y += step) {
                    horizontal.push(
                      <Line
                        key={`h${y}`}
                        points={[-gridRange * 2, y, gridRange * 2, y]}
                        stroke="#e0e0e0"
                        strokeWidth={1 / zoom}
                        perfectDrawEnabled={false}
                      />
                    );
                  }

                  return [...vertical, ...horizontal];
                })()}
              </Layer>
            )}

            {/* Shapes layer */}
            <Layer ref={layerRef}>
              {shapes.map((shape) => (
                <React.Fragment key={shape.id}>
                  {renderShape(shape)}
                </React.Fragment>
              ))}

              {/* Current drawing */}
              {currentDrawing && (
                <Line
                  points={currentDrawing.points}
                  stroke={currentDrawing.stroke}
                  strokeWidth={currentDrawing.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                />
              )}

              {/* Temp connector */}
              {tempConnector && (
                <Line
                  points={[
                    tempConnector.startX,
                    tempConnector.startY,
                    tempConnector.endX,
                    tempConnector.endY,
                  ]}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dash={[10, 5]}
                />
              )}

              {/* Selection rectangle */}
              {selectionRect &&
                selectionRect.width > 0 &&
                selectionRect.height > 0 && (
                  <Rect
                    x={selectionRect.x}
                    y={selectionRect.y}
                    width={selectionRect.width}
                    height={selectionRect.height}
                    fill="rgba(59, 130, 246, 0.1)"
                    stroke="#3b82f6"
                    strokeWidth={1 / stageScale}
                    dash={[10 / stageScale, 5 / stageScale]}
                  />
                )}

              {!readOnly && (
                <Transformer
                  ref={transformerRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 10 || newBox.height < 10) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                />
              )}
            </Layer>
          </Stage>

          {/* Status bar */}
          <div className="absolute bottom-4 left-4 bg-white border rounded shadow-sm px-3 py-2 text-xs text-gray-600">
            {shapes.length} objects | {selectedIds.length} selected |{" "}
            {Math.round(stageScale * 100)}% zoom
          </div>
        </div>

        {/* Right panel - Layers */}
        {showLayersPanel && (
          <div className="w-64 bg-white border-l border-gray-300 overflow-y-auto p-4">
            <h2 className="font-semibold text-lg mb-4">Layers</h2>
            <div className="space-y-1">
              {shapes
                .slice()
                .reverse()
                .map((shape, index) => (
                  <div
                    key={shape.id}
                    onClick={() => {
                      if (!shape.locked) {
                        setSelectedIds([shape.id]);
                      }
                    }}
                    className={`p-2 rounded cursor-pointer text-sm flex items-center justify-between ${
                      selectedIds.includes(shape.id)
                        ? "bg-blue-100 border-blue-300"
                        : "hover:bg-gray-100"
                    } ${shape.locked ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          saveHistory();
                          updateShape(shape.id, { visible: !shape.visible });
                        }}
                        className="flex-shrink-0"
                      >
                        {shape.visible ? (
                          <Eye size={14} />
                        ) : (
                          <EyeOff size={14} />
                        )}
                      </button>
                      <span className="truncate capitalize">{shape.type}</span>
                      {shape.text && (
                        <span className="text-xs text-gray-500 truncate">
                          - {shape.text}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        saveHistory();
                        updateShape(shape.id, { locked: !shape.locked });
                      }}
                      className="flex-shrink-0"
                    >
                      {shape.locked ? (
                        <Lock size={14} />
                      ) : (
                        <Unlock
                          size={14}
                          className="opacity-0 group-hover:opacity-100"
                        />
                      )}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
