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
} from "lucide-react";
import Button from "../ui/Button";

const dataMappings = [
  {
    id: "DM-001",
    title: "Customer Data Flow",
    description: "Data flow for customer onboarding process",
    createdBy: "John Doe",
    createdAt: "2025-06-04",
    updatedAt: "2025-06-04",
  },
  {
    id: "DM-002",
    title: "Customer Data Flow",
    description: "Data flow for customer onboarding process",
    createdBy: "John Doe",
    createdAt: "2025-06-04",
    updatedAt: "NA",
  },
  {
    id: "DM-003",
    title: "Customer Data Flow",
    description: "Data flow for customer onboarding",
    createdBy: "John Doe",
    createdAt: "2025-06-04",
    updatedAt: "NA",
  },
  {
    id: "DM-004",
    title: "Customer Data Flow",
    description:
      "Data flow for customer onboarding process lorem ipsum etc etc .....",
    createdBy: "John Doe",
    createdAt: "2025-06-04",
    updatedAt: "2025-06-04",
  },
];

export default function DataMappingTable() {
  const [mappings] = useState(dataMappings);
  const [openMenu, setOpenMenu] = useState(null);
  const dropdownRef = useRef(null);

  const toggleMenu = (id) => {
    setOpenMenu(openMenu === id ? null : id);
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
    <div className="bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 border border-[#828282] rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#828282] dark:border-gray-700 flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold">Data Mapping</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage and view data flows
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <button className="flex items-center gap-2 bg-[#5DEE92] text-black px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition hover:cursor-pointer">
            <Filter size={16} />
            Filter
          </button>
          <Button
            onClick={() => {
              console.log("Create New Flow modal open");
            }}
            text="Create New Flow"
            icon={CirclePlus}
          />
        </div>
      </div>

      {/* Grid Table */}
      <div className="p-4">
        {/* Column headers */}
        <div className="grid grid-cols-6 gap-4 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          <div>Title</div>
          <div>Description</div>
          <div>Created By</div>
          <div>Created At</div>
          <div>Last Updated</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Rows */}
        <div className="space-y-4 mt-2 relative">
          {mappings.map((flow, index) => {
            const isLast = index === mappings.length - 1;

            return (
              <div
                key={flow.id}
                className="grid grid-cols-6 gap-4 items-center bg-[#F4F4F4] dark:bg-gray-900 rounded-lg shadow-sm px-4 py-3 hover:shadow-md transition relative"
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
                <div className="flex items-center justify-end space-x-2 relative">
                  <button className="text-gray-400 hover:text-[#5DEE92] transition">
                    <Eye size={16} />
                  </button>
                  <button className="text-gray-400 hover:text-[#5DEE92] transition">
                    <SquarePen size={16} />
                  </button>
                  <button className="text-gray-400 hover:text-[#5DEE92] transition">
                    <Copy size={16} />
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
                        className={`absolute right-0 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 ${
                          isLast ? "bottom-full mb-2" : "top-full mt-2"
                        }`}
                      >
                        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                          <Download size={16} className="mr-2" /> Download
                        </button>
                        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
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
      </div>
    </div>
  );
}
