import { useState, useEffect, useRef } from "react";
import {
  Eye,
  SquarePen,
  Copy,
  Trash2,
  EllipsisVertical,
  Link,
  Filter,
} from "lucide-react";
import Button from "../ui/Button";

const ropasData = [
  {
    id: "RPA-001-001",
    title: "Employee Onboarding Process",
    stage: "Infovoyage",
    processOwner: "John Doe",
    department: "HR Department",
    createdAt: "2025-01-15 14:32:15",
  },
  {
    id: "RPA-001-002",
    title: "Data Processing Flow",
    stage: "Infovoyage",
    processOwner: "Jane Smith",
    department: "Finance",
    createdAt: "2025-01-20 10:22:45",
  },
  {
    id: "RPA-001-003",
    title: "Vendor Management",
    stage: "Infovoyage",
    processOwner: "Alice Johnson",
    department: "Operations",
    createdAt: "2025-01-25 18:42:11",
  },
];

export default function RoPARecords() {
  const [ropas] = useState(ropasData);
  const [openMenu, setOpenMenu] = useState(null);
  const dropdownRef = useRef(null);

  const toggleMenu = (id) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 border border-[#828282] rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#828282] dark:border-gray-700 flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold">RoPA Records</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage RoPA’s and view details
          </p>
        </div>
        <div className="flex justify-center gap-4">
            <button className="flex items-center gap-2 bg-[#5DEE92] text-black px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition hover:cursor-pointer ">
              <Filter size={16} />
              Filter
            </button>
            <Button
              onClick={() => {
                setEditingUser(null); 
                setIsNewOpen(true); 
              }}
              text="New RoPA"
            />
          </div>
      </div>

      {/* Table Layout */}
      <div className="p-4">
        {/* Column headers */}
        <div className="grid grid-cols-6 gap-4 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          <div>RoPA ID</div>
          <div>Title</div>
          <div>Stage</div>
          <div>Process Owner</div>
          <div>Department</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Rows */}
        <div className="space-y-4 mt-2 relative">
          {ropas.map((ropa, index) => {
            const isLast = index === ropas.length - 1;

            return (
              <div
                key={ropa.id}
                className="grid grid-cols-6 gap-4 items-center bg-[#F4F4F4] dark:bg-gray-900 rounded-lg shadow-sm px-4 py-3 hover:shadow-md transition relative"
              >
                <div className="text-sm text-gray-800 dark:text-gray-100">
                  {ropa.id}
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-100">
                  {ropa.title}
                </div>
                <div>
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-[#5de992] text-black">
                    {ropa.stage}
                  </span>
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-100">
                  {ropa.processOwner}
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-100">
                  {ropa.department}
                </div>
                <div className="flex items-center justify-end space-x-2 relative">
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
                    <Eye size={16} />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
                    <SquarePen size={16} />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
                    <Copy size={16} />
                  </button>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => toggleMenu(ropa.id)}
                      className="text-gray-400 hover:text-green-600 cursor-pointer"
                    >
                      <EllipsisVertical size={16} />
                    </button>

                    {openMenu === ropa.id && (
                      <div
                        className={`absolute right-0 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 ${
                          isLast ? "bottom-full mb-2" : "top-full mt-2"
                        }`}
                      >
                        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                          <Trash2 size={14} className="mr-2" /> Delete
                        </button>
                        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                          <Link size={14} className="mr-2" /> Link RoPA
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
