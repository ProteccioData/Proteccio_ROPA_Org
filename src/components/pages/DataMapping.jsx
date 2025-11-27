import { useState, useEffect, useRef } from "react";
import {
  Eye,
  SquarePen,
  Copy,
  Trash2,
  Download,
  EllipsisVertical,
  Filter,
  CirclePlus,
  Archive,
  Edit3,
} from "lucide-react";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import CreateFlowModal from "../modules/CreateFlowModal";

import {
  getAllDataMappings,
  createDataMapping,
  updateDataMapping,
  deleteDataMapping,
  archiveDataMapping,
  restoreDataMapping,
  getSVGExport,
} from "../../services/DataMappingService";
import ViewFlowModal from "../modules/ViewFlowModal";
import ConfirmationModal from "../ui/ConfirmationModal";

export default function DataMappingTable() {
  const [mappings, setMappings] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const [showDiagramBuilder, setShowDiagramBuilder] = useState(false);
  const [editingFlow, setEditingFlow] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, archived
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewFlow, setViewFlow] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    action: null, // 'delete' | 'archive' | 'unarchive'
    flow: null,
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const toggleMenu = (id) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await getAllDataMappings();
      setMappings(res.data?.dataMappings || []);
    } catch (err) {
      console.error("Failed to fetch data mappings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingFlow(null);
    setShowCreateModal(true);
  };

  const handleCreate = async (payload) => {
    try {
      setShowCreateModal(false);
      setLoading(true);
      const res = await createDataMapping({
        name: payload.name,
        description: payload.description,
        category: payload.category === "Other" ? "Other" : payload.category,
        diagram_data: {},
        status: payload.status || "active",
      });

      const newMapping = res.data?.dataMapping;
      await fetchList();

      if (newMapping && newMapping.id) {
        navigate(`/diagram-builder/${newMapping.id}`);
      } else {
        // fallback: open main page and let user choose
        console.warn(
          "Created mapping but couldn't get id to open diagram builder"
        );
      }
    } catch (err) {
      console.error("Failed to create mapping:", err);
      setShowCreateModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (flow) => {
    setEditingFlow(flow);
    setShowCreateModal(true);
  };

  // Called by CreateFlowModal for updates
  const handleUpdate = async (id, payload) => {
    try {
      setShowCreateModal(false);
      setLoading(true);

      await updateDataMapping(id, {
        name: payload.name,
        description: payload.description,
        status: payload.status,
        category: payload.category === "Other" ? "Other" : payload.category,
      });

      await fetchList();
    } catch (err) {
      console.error("Failed to update mapping:", err);
      setShowCreateModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDiagramEditor = (flow) => {
    navigate(`/diagram-builder/${flow.id}`);
  };

  // const handleViewDiagram = (flow) => {
  //   navigate(`/diagram-builder/${flow.id}?view=1`);
  // };

  const handleViewMeta = (flow) => {
    setEditingFlow(flow);
    setShowCreateModal(true);
    setViewMode(true);
  };

  const handleArchiveFlow = (flow) => {
    setConfirmModal({
      open: true,
      action: flow.status === "archived" ? "unarchive" : "archive",
      flow,
    });
    setOpenMenu(null);
  };

  const handleDeleteFlow = (flowId, flowName) => {
    setConfirmModal({
      open: true,
      action: "delete",
      flow: { id: flowId, name: flowName },
    });
    setOpenMenu(null);
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.flow) return;

    setConfirmLoading(true);

    try {
      if (confirmModal.action === "delete") {
        await deleteDataMapping(confirmModal.flow.id);
      } else if (confirmModal.action === "archive") {
        await archiveDataMapping(confirmModal.flow.id);
      } else if (confirmModal.action === "unarchive") {
        await restoreDataMapping(confirmModal.flow.id);
      }

      await fetchList();
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setConfirmLoading(false);
      setConfirmModal({ open: false, action: null, flow: null });
    }
  };

  const handleExportSVG = async (flowId, name = "diagram") => {
    try {
      const res = await getSVGExport(flowId);
      const svgString = res.data?.svg;
      if (!svgString) {
        alert("No SVG available for this flow.");
        return;
      }
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(name || "diagram").replace(/\s+/g, "_")}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      setOpenMenu(null);
    } catch (err) {
      console.error("Export SVG failed:", err);
      alert("Failed to download SVG.");
    }
  };

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

  const filteredMappings = mappings.filter((flow) => {
    if (filterStatus === "all") return true;
    return flow.status === filterStatus;
  });

  useEffect(() => {
    function handleClick() {
      setOpenMenu(null);
    }

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <>
      <div className="bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 border border-[#828282] rounded-lg shadow-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#828282] dark:border-gray-700 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold">Data Mapping</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create and manage data flow diagrams
            </p>
          </div>
          <div className="flex justify-center gap-4">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex items-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-black dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition cursor-pointer"
            >
              <option value="all">All Flows</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>

            <Button
              onClick={() => setShowCreateModal(true)}
              text="Create New Flow"
              icon={CirclePlus}
            />
          </div>
        </div>

        {/* Grid Table */}
        <div className="p-4">
          {/* Column headers */}
          <div className="grid grid-cols-7 gap-4 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
            <div>Title</div>
            <div>Description</div>
            <div>Created By</div>
            <div>Created At</div>
            <div>Last Updated</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Rows */}
          <div className="space-y-4 mt-2 relative">
            {loading && <div className="p-4">Loading...</div>}

            {!loading &&
              filteredMappings.map((flow, index) => {
                const isLast = index === filteredMappings.length - 1;

                // Friendly fallbacks if older objects have different keys
                const title = flow.name || flow.title || "Untitled";
                const description = flow.description || flow.desc || "";
                const createdBy =
                  flow.creator?.full_name || flow.createdBy || "—";
                const createdAt = flow.created_at || flow.createdAt || null;
                const updatedAt = flow.updated_at || flow.updatedAt || null;

                return (
                  <div
                    key={flow.id}
                    className="grid grid-cols-7 gap-4 items-center bg-[#F4F4F4] dark:bg-gray-900 rounded-lg shadow-sm px-4 py-3 hover:shadow-md transition relative"
                  >
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {title}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {description}
                    </div>
                    <div className="text-sm text-gray-800 dark:text-gray-100">
                      {createdBy}
                    </div>
                    <div className="text-sm text-gray-800 dark:text-gray-100">
                      {createdAt
                        ? new Date(createdAt).toLocaleDateString()
                        : "—"}
                    </div>
                    <div className="text-sm text-gray-800 dark:text-gray-100">
                      {updatedAt
                        ? new Date(updatedAt).toLocaleDateString()
                        : "—"}
                    </div>
                    <div className="text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          (flow.status || "active") === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {flow.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-end space-x-2 relative">
                      <button
                        onClick={() => {
                          // Edit metadata: opens modal with current fields + option to open diagram
                          handleOpenEditModal(flow);
                        }}
                        className="text-gray-400 hover:text-[#5DEE92] transition"
                        title="Edit Metadata"
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        onClick={() => {
                          setViewFlow(flow);
                          setViewModalOpen(true);
                        }}
                        className="text-gray-400 hover:text-[#5DEE92]"
                      >
                        <Eye size={16} />
                      </button>

                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu(flow.id);
                          }}
                          className="text-gray-400 hover:text-[#5DEE92] transition"
                        >
                          <EllipsisVertical size={16} />
                        </button>

                        {openMenu === flow.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className={`absolute right-0 w-48  bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[9999] ${
                              isLast ? "bottom-full mb-2" : "top-full mt-2"
                            }`}
                          >
                            {/* <button
                              onClick={() => handleExportPNG()}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Download size={16} className="mr-2" /> Export
                            </button> */}
                            <button
                              onClick={() => handleArchiveFlow(flow)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Archive size={14} className="mr-2" />
                              {flow.status === "archived"
                                ? "Unarchive"
                                : "Archive"}
                            </button>
                            <button
                              onClick={() => handleDeleteFlow(flow.id, title)}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Trash2 size={14} className="mr-2" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Empty State */}
          {!loading && filteredMappings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                No flows found
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                text="Create Your First Flow"
                icon={CirclePlus}
              />
            </div>
          )}
        </div>
      </div>

      <ViewFlowModal
        open={viewModalOpen}
        flow={viewFlow}
        onClose={() => {
          setViewModalOpen(false);
          setViewFlow(null);
        }}
        onViewDiagram={(id) => navigate(`/diagram-builder/${id}?view=1`)}
      />

      {/* CREATE / EDIT MODAL */}
      <CreateFlowModal
        open={showCreateModal}
        initialData={editingFlow}
        onClose={() => {
          setShowCreateModal(false);
          setEditingFlow(null);
        }}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onOpenDiagram={(id) => {
          // open diagram builder for editing (from inside modal)
          setShowCreateModal(false);
          navigate(`/diagram-builder/${id}`);
        }}
      />

      <ConfirmationModal
        isOpen={confirmModal.open}
        onClose={() =>
          setConfirmModal({ open: false, action: null, flow: null })
        }
        onConfirm={handleConfirmAction}
        isLoading={confirmLoading}
        title={
          confirmModal.action === "delete"
            ? "Delete Data Mapping"
            : confirmModal.action === "archive"
            ? "Archive Data Mapping"
            : "Restore Data Mapping"
        }
        message={
          confirmModal.action === "delete"
            ? `Are you sure you want to permanently delete "${confirmModal.flow?.name}"? This action cannot be undone.`
            : confirmModal.action === "archive"
            ? `Are you sure you want to archive "${confirmModal.flow?.name}"?`
            : `Restore "${confirmModal.flow?.name}" back to active status?`
        }
        confirmText={
          confirmModal.action === "delete"
            ? "Delete"
            : confirmModal.action === "archive"
            ? "Archive"
            : "Restore"
        }
        type={
          confirmModal.action === "delete"
            ? "danger"
            : confirmModal.action === "archive"
            ? "warning"
            : "info"
        }
        confirmColor={
          confirmModal.action === "delete"
            ? "red"
            : confirmModal.action === "archive"
            ? "yellow"
            : "blue"
        }
      />
    </>
  );
}
