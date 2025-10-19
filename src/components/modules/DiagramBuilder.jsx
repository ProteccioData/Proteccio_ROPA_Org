import React, { useCallback, useEffect, useState, useRef } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { toPng, toSvg } from "html-to-image";
import { motion } from "framer-motion";
import {
  Save,
  Download,
  Archive,
  Trash2,
  Plus,
  Zap,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

/* ---------- constants ---------- */
const STORAGE_KEY = "ropa_flows_v3";
const BRAND_COLOR = "#5DEE92";
const BORDER_GRAY = "#828282";

const NODE_TYPE_STYLES = {
  controller: { border: `2px solid ${BRAND_COLOR}`, background: "var(--bg-primary)" },
  dataSubject: { border: `2px dashed #F59E0B`, background: "var(--bg-primary)" },
  dataStore: { border: `2px solid #60A5FA`, background: "var(--bg-primary)" },
  thirdParty: { border: `2px solid #EF4444`, background: "var(--bg-primary)" },
  process: { border: `2px solid #A78BFA`, background: "var(--bg-primary)" },
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 180;
const nodeHeight = 60;

function getLayoutedElements(nodes, edges, direction = "LR") {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });
  nodes.forEach((n) => dagreGraph.setNode(n.id, { width: nodeWidth, height: nodeHeight }));
  edges.forEach((e) => dagreGraph.setEdge(e.source, e.target));
  dagre.layout(dagreGraph);
  const layoutedNodes = nodes.map((n) => {
    const pos = dagreGraph.node(n.id);
    n.position = { x: pos.x - nodeWidth / 2, y: pos.y - nodeHeight / 2 };
    return { ...n, position: n.position };
  });
  return { nodes: layoutedNodes, edges };
}

/* ---------- localStorage ---------- */
function loadSavedFlows() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load flows", e);
    return [];
  }
}
function saveSavedFlows(flows) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flows));
  } catch (e) {
    console.error("Failed to save flows", e);
  }
}

/* ---------- initial ---------- */
const initialNodes = [];
const initialEdges = [];

export default function RoPAFlowBuilder({ onSave: externalSaveHandler, onClose }) {
  /* ---------- React Flow state ---------- */
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [rfInstance, setRfInstance] = useState(null);

  /* ---------- UI state ---------- */
  const [flowName, setFlowName] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [savedFlows, setSavedFlows] = useState(loadSavedFlows());
  const [archivedFilter, setArchivedFilter] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const wrapperRef = useRef(null);

  const [nodeMetadata, setNodeMetadata] = useState({});
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(280);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(320);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  /* ---------- init ---------- */
  useEffect(() => {
    if (nodes.length === 0) {
      const starter = createNode({ type: "process", label: "Start", x: 80, y: 80 });
      setNodes([starter]);
    }
  }, []);

  useEffect(() => saveSavedFlows(savedFlows), [savedFlows]);

  /* ---------- Node Helpers ---------- */
  const createNodeId = useCallback(() => `${Date.now()}_${Math.floor(Math.random() * 1000)}`, []);

  function createNode({ type = "process", label = "Node", x = 200, y = 200 } = {}) {
    const id = createNodeId();
    const style = NODE_TYPE_STYLES[type] || NODE_TYPE_STYLES.process;
    setNodeMetadata((meta) => ({
      ...meta,
      [id]: { type, label, dataCategory: "", processingActivity: "", legalBasis: "", retention: "", description: "" },
    }));
    return { id, type: "default", data: { label }, position: { x, y }, style: { padding: 8, borderRadius: 8, minWidth: nodeWidth, ...style } };
  }

  const addNodeOfType = (type) => {
    const node = createNode({ type, label: `${capitalize(type)} Node`, x: Math.random() * 400, y: Math.random() * 300 });
    setNodes((nds) => nds.concat(node));
  };

  const capitalize = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : "");

  /* ---------- Diagram Callbacks ---------- */
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  const onInit = useCallback((rfi) => setRfInstance(rfi), []);
  const validateDiagram = useCallback(() => {
    const errors = [];
    nodes.forEach((n) => { if (!(n.data.label || "").trim()) errors.push({ nodeId: n.id, message: `Node ${n.id} missing label` }); });
    const connected = new Set(edges.flatMap((e) => [e.source, e.target]));
    nodes.forEach((n) => { if (!connected.has(n.id) && nodes.length > 1) errors.push({ nodeId: n.id, message: `Node "${n.data.label}" isolated` }); });
    edges.forEach((e) => { if (!nodes.find((n) => n.id === e.source) || !nodes.find((n) => n.id === e.target)) errors.push({ edge: e, message: `Edge ${e.source}->${e.target} invalid` }); });
    setValidationErrors(errors);
    return errors;
  }, [nodes, edges]);

  const runAutoLayout = useCallback(
    (dir = "LR") => {
      const { nodes: layouted, edges: newEdges } = getLayoutedElements([...nodes], [...edges], dir);
      setNodes(layouted); setEdges(newEdges);
    },
    [nodes, edges]
  );

  /* ---------- Save/Version ---------- */
  const saveFlow = useCallback(({ name = "" } = {}) => {
    if (!rfInstance) return;
    const snapshot = { nodes, edges, nodeMetadata };
    const payload = { name: name || flowName || `Untitled Flow`, versions: [{ snapshot, timestamp: new Date().toISOString() }], archived: false, lastUpdated: new Date().toISOString() };
    setSavedFlows((prev) => [payload, ...prev]);
    if (externalSaveHandler) externalSaveHandler(payload);
  }, [rfInstance, nodes, edges, nodeMetadata, flowName, externalSaveHandler]);

  const loadSavedFlow = (index) => {
    const f = savedFlows[index]; if (!f || !f.versions.length) return;
    const latest = f.versions[0].snapshot;
    setNodes(latest.nodes || []); setEdges(latest.edges || []); setNodeMetadata(latest.nodeMetadata || {}); setFlowName(f.name);
  };

  /* ---------- Export ---------- */
  const exportAsPng = async () => {
    if (!wrapperRef.current) return;
    try {
      const dataUrl = await toPng(wrapperRef.current, { cacheBust: true });
      const a = document.createElement("a"); a.href = dataUrl; a.download = `${flowName.replace(/\s+/g, "_") || "flow"}.png`; document.body.appendChild(a); a.click(); a.remove();
    } catch (e) { console.error(e); }
  };
  const exportAsSvg = async () => {
    if (!wrapperRef.current) return;
    try {
      const svgData = await toSvg(wrapperRef.current);
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${flowName.replace(/\s+/g, "_") || "flow"}.svg`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
  };

  /* ---------- Metadata ---------- */
  const updateSelectedNodeMetadata = (patch) => {
    if (!selectedNodeId) return;
    setNodeMetadata((meta) => ({ ...meta, [selectedNodeId]: { ...meta[selectedNodeId], ...patch } }));
    if (patch.label) setNodes((nds) => nds.map((n) => n.id === selectedNodeId ? { ...n, data: { ...n.data, label: patch.label } } : n));
  };

  const selectedNodeMeta = nodeMetadata[selectedNodeId];
  const visibleSavedFlows = savedFlows.filter((f) => (archivedFilter ? f.archived : !f.archived));

  /* ---------- Resize Logic ---------- */
  const resizingRef = useRef({ active: false, side: null, startX: 0, startWidth: 0 });
  const initResize = (e, side) => {
    e.preventDefault();
    resizingRef.current = { active: true, side, startX: e.clientX, startWidth: side === "left" ? leftSidebarWidth : rightSidebarWidth };
  };
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!resizingRef.current.active) return;
      const delta = e.clientX - resizingRef.current.startX;
      if (resizingRef.current.side === "left") {
        const newWidth = Math.min(Math.max(resizingRef.current.startWidth + delta, 200), 400);
        setLeftSidebarWidth(newWidth);
      } else if (resizingRef.current.side === "right") {
        const newWidth = Math.min(Math.max(resizingRef.current.startWidth - delta, 250), 450);
        setRightSidebarWidth(newWidth);
      }
    };
    const onMouseUp = () => { resizingRef.current.active = false; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
  }, []);

  /* ---------- Responsive Fullscreen ---------- */
  return (
    <div className="fixed inset-0 flex bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 z-[9999]">
      {/* Close Button */}
      <button onClick={onClose} className="absolute top-4 right-4 z-[10000] p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
        <X size={20} />
      </button>

      {/* Left Sidebar */}
      {showLeftSidebar && (
        <motion.aside
          initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          className="flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 relative"
          style={{ width: leftSidebarWidth, minWidth: 200, maxWidth: 400 }}
        >
          <div className="p-4 flex justify-between items-center border-b border-gray-300 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-semibold">Saved Flows</h3>
              <div className="text-xs text-gray-500 dark:text-gray-400">Local versioned flows</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setArchivedFilter((s) => !s)} className="p-1 rounded-md border border-gray-300 dark:border-gray-600">
                <Archive size={16} />
              </button>
              <button onClick={() => setShowLeftSidebar(false)} className="p-1 rounded-md border border-gray-300 dark:border-gray-600">
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
          <div className="p-3 overflow-auto h-[calc(100vh-80px)] space-y-2">
            {visibleSavedFlows.length === 0 && <div className="text-sm text-gray-500 dark:text-gray-400">No saved flows</div>}
            {visibleSavedFlows.map((f, idx) => (
              <div key={idx} className="p-2 border rounded-md flex justify-between items-center hover:shadow-md transition dark:border-gray-600">
                <div>
                  <div className="font-medium">{f.name}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">{new Date(f.lastUpdated).toLocaleString()}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => loadSavedFlow(idx)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"><CheckCircle size={16} /></button>
                  <button onClick={() => saveFlow({ name: f.name })} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"><Save size={16} /></button>
                </div>
              </div>
            ))}
          </div>
          {/* Left Resize Handle */}
          <div
            className="absolute top-0 right-0 h-full w-1 cursor-col-resize z-50 hover:bg-gray-300 dark:hover:bg-gray-600"
            onMouseDown={(e) => initResize(e, "left")}
          />
        </motion.aside>
      )}

      {/* Center Canvas */}
      <div className="flex-1 flex flex-col relative">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between p-4 border-b border-gray-300 dark:border-gray-700 gap-2">
          <input type="text" placeholder="Flow name..." value={flowName} onChange={(e) => setFlowName(e.target.value)}
            className="px-3 py-2 border rounded-md w-full md:w-1/3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-green-400"
          />
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => addNodeOfType("process")} className="px-3 py-2 border rounded-md hover:bg-green-100 dark:hover:bg-green-800">Add Process</button>
            <button onClick={() => addNodeOfType("dataStore")} className="px-3 py-2 border rounded-md hover:bg-blue-100 dark:hover:bg-blue-800">Add Data Store</button>
            <button onClick={() => addNodeOfType("thirdParty")} className="px-3 py-2 border rounded-md hover:bg-red-100 dark:hover:bg-red-800">Add Third Party</button>
            <button onClick={() => runAutoLayout("LR")} className="px-3 py-2 border rounded-md hover:bg-green-100 dark:hover:bg-green-800"><Zap size={16} /> Auto Layout</button>
            <button onClick={validateDiagram} className="px-3 py-2 border rounded-md hover:bg-yellow-100 dark:hover:bg-yellow-800"><AlertCircle size={16} /> Validate</button>
            <button onClick={saveFlow} className="px-3 py-2 bg-green-400 rounded-md hover:opacity-90">Save</button>
            <button onClick={exportAsPng} className="px-3 py-2 border rounded-md">PNG</button>
            <button onClick={exportAsSvg} className="px-3 py-2 border rounded-md">SVG</button>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div ref={wrapperRef} className="flex-1 relative bg-gray-50 dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700">
          <ReactFlow
            nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onInit={onInit}
            fitView attributionPosition="bottom-left" onNodeClick={(e, n) => setSelectedNodeId(n.id)} onPaneClick={() => setSelectedNodeId(null)}
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>

          {/* Validation Panel */}
          <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-2 rounded-md shadow-md max-w-xs">
            <div className="text-sm font-medium">Validation ({validationErrors.length})</div>
            {validationErrors.length > 0 ? (
              <ul className="text-xs mt-1 max-h-40 overflow-auto space-y-1 text-red-600">{validationErrors.map((e,i)=><li key={i}>• {e.message}</li>)}</ul>
            ) : <div className="text-xs text-green-600 mt-1">No issues</div>}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      {showRightSidebar && (
        <motion.aside
          className="flex-shrink-0 bg-white dark:bg-gray-800 border-l border-gray-300 dark:border-gray-700 p-4 relative"
          style={{ width: rightSidebarWidth, minWidth: 250, maxWidth: 450 }}
        >
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-semibold">Node Metadata</h4>
            <button onClick={() => setShowRightSidebar(false)} className="p-1 rounded-md border border-gray-300 dark:border-gray-600"><ChevronRight size={16} /></button>
          </div>
          {!selectedNodeMeta && <div className="text-sm text-gray-500 dark:text-gray-400">Select a node to edit metadata</div>}
          {selectedNodeMeta && (
            <div className="space-y-3 text-sm">
              <input placeholder="Label" value={selectedNodeMeta.label} onChange={(e)=>updateSelectedNodeMetadata({label:e.target.value})} className="w-full px-2 py-1 border rounded-md dark:bg-gray-700"/>
              <select value={selectedNodeMeta.type} onChange={(e)=>updateSelectedNodeMetadata({type:e.target.value})} className="w-full px-2 py-1 border rounded-md dark:bg-gray-700">
                <option value="controller">Controller</option><option value="process">Process</option><option value="dataStore">Data Store</option><option value="thirdParty">Third Party</option><option value="dataSubject">Data Subject</option>
              </select>
              <input placeholder="Data Category" value={selectedNodeMeta.dataCategory} onChange={(e)=>updateSelectedNodeMetadata({dataCategory:e.target.value})} className="w-full px-2 py-1 border rounded-md dark:bg-gray-700"/>
              <input placeholder="Processing Activity" value={selectedNodeMeta.processingActivity} onChange={(e)=>updateSelectedNodeMetadata({processingActivity:e.target.value})} className="w-full px-2 py-1 border rounded-md dark:bg-gray-700"/>
              <select value={selectedNodeMeta.legalBasis} onChange={(e)=>updateSelectedNodeMetadata({legalBasis:e.target.value})} className="w-full px-2 py-1 border rounded-md dark:bg-gray-700">
                <option value="">Legal Basis...</option>
                <option value="consent">Consent</option><option value="contract">Contract</option><option value="legalObligation">Legal Obligation</option><option value="legitimateInterest">Legitimate Interest</option>
              </select>
              <input placeholder="Retention Period" value={selectedNodeMeta.retention} onChange={(e)=>updateSelectedNodeMetadata({retention:e.target.value})} className="w-full px-2 py-1 border rounded-md dark:bg-gray-700"/>
              <textarea placeholder="Description" value={selectedNodeMeta.description} onChange={(e)=>updateSelectedNodeMetadata({description:e.target.value})} className="w-full px-2 py-1 border rounded-md dark:bg-gray-700" rows={3}/>
            </div>
          )}
          {/* Right Resize Handle */}
          <div
            className="absolute top-0 left-0 h-full w-1 cursor-col-resize z-50 hover:bg-gray-300 dark:hover:bg-gray-600"
            onMouseDown={(e) => initResize(e, "right")}
          />
        </motion.aside>
      )}
    </div>
  );
}
