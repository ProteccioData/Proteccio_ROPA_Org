// ExcalFlowBuilder.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
} from "reactflow";
import "reactflow/dist/style.css";
import { toPng } from "html-to-image";
import { motion } from "framer-motion";
import {
  Plus,
  Save,
  Download,
  Trash2,
  Zap,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ---------- Constants & Styles ---------- */
const STORAGE_KEY = "excal_flow_v1";
const BRAND = "#5DEE92";
const BORDER = "#828282";
const DEFAULT_NODE_SIZE = { w: 180, h: 80 };

/* ---------- Utility helpers ---------- */
const uid = (prefix = "n") => `${prefix}_${Date.now()}_${Math.floor(Math.random()*1000)}`;

/* ---------- Custom Node: supports shapes + editable text ---------- */
function ShapeNode({ id, data, selected }) {
  // data: { label, shape, style: { bg, border, textColor, fontSize, bold }, isTextOnly }
  const { label = "", shape = "rect", style = {}, isTextOnly } = data;
  const [editing, setEditing] = useState(false);
  const textRef = useRef();

  useEffect(() => {
    if (editing && textRef.current) {
      textRef.current.focus();
      // place caret at end
      const range = document.createRange();
      range.selectNodeContents(textRef.current);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [editing]);

  const baseStyles = {
    fontSize: style.fontSize || 14,
    color: style.textColor || "#111827",
    fontWeight: style.bold ? 700 : 400,
    padding: 8,
    userSelect: editing ? "text" : "none",
    fontFamily: "'Jakarta Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto",
  };

  // SVG shape renderer
  const shapeElement = (() => {
    const w = DEFAULT_NODE_SIZE.w;
    const h = DEFAULT_NODE_SIZE.h;
    const rx = 12;
    const fill = style.bg || "#fff";
    const stroke = style.border || BORDER;
    switch (shape) {
      case "ellipse":
        return <ellipse cx={w/2} cy={h/2} rx={w/2} ry={h/2} fill={fill} stroke={stroke} strokeWidth={2} />;
      case "diamond": {
        const cx = w/2, cy = h/2;
        const points = `${cx},0 ${w},${cy} ${cx},${h} 0,${cy}`;
        return <polygon points={points} fill={fill} stroke={stroke} strokeWidth={2} />;
      }
      case "rounded":
        return <rect x={0} y={0} width={w} height={h} rx={rx} ry={rx} fill={fill} stroke={stroke} strokeWidth={2} />;
      default:
        return <rect x={0} y={0} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={2} />;
    }
  })();

  // label area uses foreignObject for HTML editing
  return (
    <div style={{ width: DEFAULT_NODE_SIZE.w, height: DEFAULT_NODE_SIZE.h, position: "relative" }}>
      <svg width={DEFAULT_NODE_SIZE.w} height={DEFAULT_NODE_SIZE.h}>
        {shapeElement}
      </svg>

      {/* Handles for React Flow */}
      <Handle type="target" position="top" style={{ left: DEFAULT_NODE_SIZE.w/2 - 8 }} />
      <Handle type="source" position="bottom" style={{ left: DEFAULT_NODE_SIZE.w/2 - 8 }} />

      <foreignObject
        x={0} y={0} width={DEFAULT_NODE_SIZE.w} height={DEFAULT_NODE_SIZE.h}
        style={{ pointerEvents: "none" }}
      >
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "auto" }}>
          <div
            onDoubleClick={() => setEditing(true)}
            onBlur={() => setEditing(false)}
            contentEditable={editing}
            suppressContentEditableWarning
            ref={textRef}
            style={{ ...baseStyles, textAlign: "center", minHeight: 24, outline: editing ? "2px solid rgba(0,0,0,0.06)" : "none", padding: 6 }}
            onInput={(e) => {
              const txt = e.currentTarget.textContent || "";
              if (data.onChange) data.onChange(id, { label: txt });
            }}
          >
            {label}
          </div>
        </div>
      </foreignObject>

      {/* Selected outline */}
      {selected && (
        <div style={{ position: "absolute", inset: 6, border: `2px dashed ${BRAND}`, borderRadius: 8, pointerEvents: "none" }} />
      )}
    </div>
  );
}

/* map node type to renderer */
const nodeTypes = { shapeNode: ShapeNode };

/* ---------- Main Component ---------- */
export default function RoPAFlowBuilder({ onClose, saveEndpoint = "/api/flows" }) {
  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // UI state
  const [selected, setSelected] = useState(null); // node id
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);
  const wrapperRef = useRef(null);

  // load initial starter node
  useEffect(() => {
    if (nodes.length === 0) {
      const id = uid("start");
      const baseStyle = { bg: "#ffffff", border: BORDER, textColor: "#111827", fontSize: 14, bold: false };
      const starter = {
        id,
        type: "shapeNode",
        position: { x: 40, y: 40 },
        data: { label: "Start", shape: "rounded", style: baseStyle, onChange: handleNodeTextChange },
      };
      setNodes([starter]);
    }
    // eslint-disable-next-line
  }, []);

  // helper to create nodes of given type
  function createNode(shape = "rect", x = 200, y = 200, label = "Node", options = {}) {
    const id = uid("n");
    const defaultStyle = { bg: "#ffffff", border: BORDER, textColor: "#111827", fontSize: 14, bold: false };
    const node = {
      id,
      type: "shapeNode",
      position: { x, y },
      data: { label, shape, style: { ...defaultStyle, ...(options.style||{}) }, isTextOnly: options.isTextOnly || false, onChange: handleNodeTextChange },
      selectable: true,
      draggable: true,
    };
    setNodes((nds) => nds.concat(node));
    return node;
  }

  /* ---------- Event handlers ---------- */
  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: BRAND } }, eds)), [setEdges]);

  function handleNodeTextChange(nodeId, patch) {
    setNodes((nds) => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...patch, onChange: handleNodeTextChange } } : n));
  }

  const handleSelect = (e) => {
    // e contains nodes/edges in selection; we set selected as first node or null
    const sel = (e?.nodes && e.nodes[0]) || null;
    setSelected(sel ? sel.id : null);
  };

  const onInit = (rfi) => setReactFlowInstance(rfi);

  // delete selected node
  const deleteSelected = () => {
    if (!selected) return;
    setNodes((nds) => nds.filter(n => n.id !== selected));
    setEdges((eds) => eds.filter(e => e.source !== selected && e.target !== selected));
    setSelected(null);
  };

  /* ---------- Inspector updates ---------- */
  const updateSelectedStyle = (patch) => {
    if (!selected) return;
    setNodes((nds) => nds.map(n => {
      if (n.id !== selected) return n;
      const newStyle = { ...(n.data.style || {}), ...patch };
      const newData = { ...n.data, style: newStyle };
      return { ...n, data: { ...newData, onChange: handleNodeTextChange } };
    }));
  };

  const updateShape = (shape) => {
    if (!selected) return;
    setNodes((nds) => nds.map(n => n.id === selected ? { ...n, data: { ...n.data, shape, onChange: handleNodeTextChange } } : n));
  };

  /* ---------- Export & Save ---------- */
  const exportJSON = () => {
    const payload = { nodes: nodes.map(n => ({ id: n.id, position: n.position, data: n.data })), edges, exportedAt: new Date().toISOString() };
    const href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const a = document.createElement("a"); a.href = href; a.download = `${(nodes[0]?.data?.label || "diagram").replace(/\s+/g, "_")}.json`; a.click(); a.remove();
  };

  const exportPNG = async () => {
    if (!wrapperRef.current) return alert("Canvas not ready");
    try {
      const dataUrl = await toPng(wrapperRef.current);
      const a = document.createElement("a"); a.href = dataUrl; a.download = `diagram.png`; a.click(); a.remove();
    } catch (e) {
      console.error(e);
      alert("Export failed");
    }
  };

  const saveToServer = async () => {
    // Create payload including node visual style
    const payload = { nodes: nodes.map(n => ({ id: n.id, position: n.position, data: n.data })), edges, name: nodes[0]?.data?.label || "diagram", updatedAt: new Date().toISOString() };
    // try generating thumbnail
    try {
      if (wrapperRef.current) {
        const png = await toPng(wrapperRef.current);
        payload.thumbnail = png;
      }
    } catch (e) {
      console.warn("thumbnail failed", e);
    }

    // Save locally as optimistic
    const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    local.unshift({ id: uid("saved"), ...payload });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(local));

    // Attempt server save (placeholder)
    try {
      const res = await fetch(saveEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" /* add auth if needed */ },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Server save failed");
      const json = await res.json();
      alert("Saved to server");
      return json;
    } catch (err) {
      console.warn("server save failed", err);
      alert("Saved locally (server call failed or endpoint not configured)");
    }
  };

  /* ---------- Selection derived state ---------- */
  const selectedNode = nodes.find(n => n.id === selected);

  /* ---------- Render ---------- */
  return (
    <div className="fixed inset-0 flex bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 z-50">
      {/* Close */}
      <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
        <X size={18} />
      </button>

      {/* Left palette */}
      {showLeft && (
        <motion.aside initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-56 bg-white dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 p-3">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-lg font-semibold">Palette</h3>
              <div className="text-xs text-gray-500 dark:text-gray-400">Click to add</div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowLeft(false)} className="p-1 border rounded"><ChevronLeft size={14} /></button>
            </div>
          </div>

          <div className="space-y-2">
            <button onClick={() => createNode("rect", 200, 200, "Rectangle")} className="w-full px-2 py-2 border rounded text-left">Rectangle</button>
            <button onClick={() => createNode("rounded", 220, 240, "Rounded")} className="w-full px-2 py-2 border rounded text-left">Rounded</button>
            <button onClick={() => createNode("ellipse", 240, 280, "Ellipse")} className="w-full px-2 py-2 border rounded text-left">Ellipse</button>
            <button onClick={() => createNode("diamond", 260, 320, "Decision")} className="w-full px-2 py-2 border rounded text-left">Diamond</button>
            <button onClick={() => createNode("rect", 280, 360, "Text", { isTextOnly: true, style: { bg: "transparent", border: "transparent" } })} className="w-full px-2 py-2 border rounded text-left">Text</button>
          </div>

          <div className="mt-4 border-t pt-3 space-y-2">
            <button onClick={() => { runAutoLayout(); }} className="w-full px-2 py-2 border rounded">Auto Layout</button>
            <button onClick={() => exportJSON()} className="w-full px-2 py-2 border rounded">Export JSON</button>
            <button onClick={() => exportPNG()} className="w-full px-2 py-2 border rounded">Export PNG</button>
            <button onClick={() => saveToServer()} className="w-full px-2 py-2 bg-green-400 rounded text-white">Save</button>
            <button onClick={() => deleteSelected()} className="w-full px-2 py-2 border rounded text-red-600">Delete Selected</button>
          </div>
        </motion.aside>
      )}

      {/* Canvas */}
      <div className="flex-1 relative">
        <div className="flex items-center justify-between p-3 border-b border-gray-300 dark:border-gray-700 gap-2">
          <div className="flex items-center gap-2 w-full">
            <input
              className="px-3 py-2 border rounded w-full md:w-1/3 bg-white dark:bg-gray-700"
              placeholder="Diagram name..."
              value={selectedNode?.data?.label || ""}
              onChange={(e) => {
                if (!selected) return;
                handleNodeTextChange(selected, { label: e.target.value });
              }}
            />
            <div className="flex gap-2 ml-auto">
              <button onClick={() => saveToServer()} className="px-3 py-2 bg-green-400 rounded text-white"><Save size={14} /></button>
              <button onClick={() => exportPNG()} className="px-3 py-2 border rounded"><Download size={14} /></button>
            </div>
          </div>
        </div>

        <div ref={wrapperRef} className="h-[calc(100vh-72px)] bg-gray-50 dark:bg-gray-900">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onInit={onInit}
            onConnect={onConnect}
            onSelectionChange={handleSelect}
            fitView
            nodeTypes={nodeTypes}
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </div>
      </div>

      {/* Right inspector */}
      {showRight && (
        <motion.aside initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-80 bg-white dark:bg-gray-800 border-l border-gray-300 dark:border-gray-700 p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-lg font-semibold">Inspector</h4>
              <div className="text-xs text-gray-500 dark:text-gray-400">Selected node settings</div>
            </div>
            <button onClick={() => setShowRight(false)} className="p-1 border rounded"><ChevronRight size={14} /></button>
          </div>

          {!selectedNode && <div className="text-sm text-gray-500">Select a node to edit its style</div>}

          {selectedNode && (
            <div className="space-y-3 text-sm">
              <div className="font-medium">Label</div>
              <input value={selectedNode.data.label || ""} onChange={(e) => handleNodeTextChange(selected, { label: e.target.value })} className="w-full px-2 py-1 border rounded bg-white dark:bg-gray-700" />

              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs">Shape</label>
                <select value={selectedNode.data.shape} onChange={(e) => updateShape(e.target.value)} className="w-full px-2 py-1 border rounded bg-white dark:bg-gray-700">
                  <option value="rect">Rectangle</option>
                  <option value="rounded">Rounded</option>
                  <option value="ellipse">Ellipse</option>
                  <option value="diamond">Diamond</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs">Fill</label>
                <input type="color" value={selectedNode.data.style?.bg || "#ffffff"} onChange={(e) => updateSelectedStyle({ bg: e.target.value })} className="w-full h-9" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs">Border</label>
                <input type="color" value={selectedNode.data.style?.border || BORDER} onChange={(e) => updateSelectedStyle({ border: e.target.value })} className="w-full h-9" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs">Text Color</label>
                <input type="color" value={selectedNode.data.style?.textColor || "#111827"} onChange={(e) => updateSelectedStyle({ textColor: e.target.value })} className="w-full h-9" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs">Font Size</label>
                <input type="number" min={10} max={36} value={selectedNode.data.style?.fontSize || 14} onChange={(e) => updateSelectedStyle({ fontSize: Number(e.target.value) })} className="w-full px-2 py-1 border rounded bg-white dark:bg-gray-700" />
              </div>

              <div className="flex gap-2">
                <button onClick={() => updateSelectedStyle({ bold: !selectedNode.data.style?.bold })} className="px-2 py-1 border rounded">Toggle Bold</button>
                <button onClick={() => updateSelectedStyle({ bg: "#FEF3C7", border: "#F59E0B" })} className="px-2 py-1 border rounded">Preset</button>
              </div>

              <div className="border-t pt-2">
                <div className="text-xs text-gray-500 mb-1">Advanced</div>
                <div className="flex gap-2">
                  <button onClick={() => { /* bring to front */ setNodes((nds)=> {
                    const pick = nds.find(n=>n.id===selected);
                    if(!pick) return nds;
                    const rest = nds.filter(n=>n.id!==selected);
                    return [...rest, pick];
                  })}} className="px-2 py-1 border rounded">Bring Front</button>
                  <button onClick={() => { /* send to back */ setNodes((nds)=> {
                    const pick = nds.find(n=>n.id===selected);
                    if(!pick) return nds;
                    const rest = nds.filter(n=>n.id!==selected);
                    return [pick, ...rest];
                  })}} className="px-2 py-1 border rounded">Send Back</button>
                </div>
              </div>
            </div>
          )}
        </motion.aside>
      )}
    </div>
  );
}

/* ---------- Auto layout (simple dagre) ---------- */
import dagre from "dagre";
async function runAutoLayout(nodesInput = [], edgesInput = [], direction = "LR") {
  // this helper is used by palette auto layout button - kept separate to avoid hoisting issues
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction });
  const nodeW = DEFAULT_NODE_SIZE.w, nodeH = DEFAULT_NODE_SIZE.h;
  nodesInput.forEach(n => g.setNode(n.id, { width: nodeW, height: nodeH }));
  edgesInput.forEach(e => g.setEdge(e.source, e.target));
  dagre.layout(g);
  const layouted = nodesInput.map(n => {
    const pos = g.node(n.id);
    return { ...n, position: { x: pos.x - nodeW/2, y: pos.y - nodeH/2 } };
  });
  return { nodes: layouted, edges: edgesInput };
}
