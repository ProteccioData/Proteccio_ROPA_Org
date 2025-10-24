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
import DiagramBuilder from "../modules/DiagramBuilder";

// Enhanced data structure for flows
const initialDataMappings = [
  {
    id: "DM-001",
    title: "Customer Data Flow",
    description: "Data flow for customer onboarding process",
    createdBy: "John Doe",
    createdAt: "2025-06-04",
    updatedAt: "2025-06-04",
    type: "diagram",
    status: "active", // active, archived
    diagramData: null, // This would contain the actual flow data
  },
  {
    id: "DM-002",
    title: "Payment Processing",
    description: "Payment data flow diagram",
    createdBy: "Jane Smith",
    createdAt: "2025-06-04",
    updatedAt: "NA",
    type: "diagram",
    status: "active",
    diagramData: null,
  },
];

export default function DataMappingTable() {
  const [mappings, setMappings] = useState(initialDataMappings);
  const [openMenu, setOpenMenu] = useState(null);
  const [showDiagramBuilder, setShowDiagramBuilder] = useState(false);
  const [editingFlow, setEditingFlow] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, archived
  const dropdownRef = useRef(null);

  const toggleMenu = (id) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  // Filter flows based on status
  const filteredMappings = mappings.filter(flow => {
    if (filterStatus === 'all') return true;
    return flow.status === filterStatus;
  });

  const handleCreateNewFlow = () => {
    setEditingFlow(null);
    setShowDiagramBuilder(true);
  };

  const handleEditFlow = (flow) => {
    setEditingFlow(flow);
    setShowDiagramBuilder(true);
  };

  const handleSaveFlow = (flowData) => {
    if (editingFlow) {
      // Update existing flow
      setMappings(prev => prev.map(flow => 
        flow.id === editingFlow.id 
          ? { ...flow, ...flowData, updatedAt: new Date().toISOString().split('T')[0] }
          : flow
      ));
    } else {
      // Create new flow
      const newFlow = {
        id: `DM-${String(mappings.length + 1).padStart(3, '0')}`,
        title: flowData.name,
        description: `Diagram: ${flowData.name}`,
        createdBy: "Current User", // You would get this from auth context
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        type: "diagram",
        status: "active",
        diagramData: flowData.data,
      };
      setMappings(prev => [...prev, newFlow]);
    }
    setShowDiagramBuilder(false);
    setEditingFlow(null);
  };

  const handleArchiveFlow = (flowId) => {
    setMappings(prev => prev.map(flow => 
      flow.id === flowId 
        ? { ...flow, status: flow.status === 'archived' ? 'active' : 'archived' }
        : flow
    ));
    setOpenMenu(null);
  };

  const handleDeleteFlow = (flowId) => {
    if (window.confirm('Are you sure you want to delete this flow?')) {
      setMappings(prev => prev.filter(flow => flow.id !== flowId));
      setOpenMenu(null);
    }
  };

  const handleExportSVG = (flowId) => {
    // Implementation for exporting specific flow as SVG
    console.log('Exporting flow:', flowId);
    setOpenMenu(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 border border-[#828282] rounded-lg shadow-sm overflow-hidden">
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
              onClick={handleCreateNewFlow}
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
            {filteredMappings.map((flow, index) => {
              const isLast = index === filteredMappings.length - 1;

              return (
                <div
                  key={flow.id}
                  className="grid grid-cols-7 gap-4 items-center bg-[#F4F4F4] dark:bg-gray-900 rounded-lg shadow-sm px-4 py-3 hover:shadow-md transition relative"
                >
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {flow.title}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {flow.description}
                  </div>
                  <div className="text-sm text-gray-800 dark:text-gray-100">
                    {flow.createdBy}
                  </div>
                  <div className="text-sm text-gray-800 dark:text-gray-100">
                    {flow.createdAt}
                  </div>
                  <div className="text-sm text-gray-800 dark:text-gray-100">
                    {flow.updatedAt}
                  </div>
                  <div className="text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      flow.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {flow.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-end space-x-2 relative">
                    <button 
                      onClick={() => handleEditFlow(flow)}
                      className="text-gray-400 hover:text-[#5DEE92] transition"
                      title="Edit Diagram"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-[#5DEE92] transition">
                      <Eye size={16} />
                    </button>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => toggleMenu(flow.id)}
                        className="text-gray-400 hover:text-[#5DEE92] transition"
                      >
                        <EllipsisVertical size={16} />
                      </button>

                      {openMenu === flow.id && (
                        <div
                          className={`absolute right-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 ${
                            isLast ? "bottom-full mb-2" : "top-full mt-2"
                          }`}
                        >
                          <button 
                            onClick={() => handleExportSVG(flow.id)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Download size={16} className="mr-2" /> Export SVG
                          </button>
                          <button 
                            onClick={() => handleArchiveFlow(flow.id)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Archive size={14} className="mr-2" /> 
                            {flow.status === 'archived' ? 'Unarchive' : 'Archive'}
                          </button>
                          <button 
                            onClick={() => handleDeleteFlow(flow.id)}
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
          {filteredMappings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                No flows found
              </div>
              <Button
                onClick={handleCreateNewFlow}
                text="Create Your First Flow"
                icon={CirclePlus}
              />
            </div>
          )}
        </div>
      </div>

      {/* Diagram Builder Modal */}
      {showDiagramBuilder && (
        <DiagramBuilder
          onSave={handleSaveFlow}
          onClose={() => {
            setShowDiagramBuilder(false);
            setEditingFlow(null);
          }}
          initialData={editingFlow?.diagramData}
        />
      )}
    </>
  );
}