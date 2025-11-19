import { useState, useEffect, useRef } from "react";
import {
  Eye,
  SquarePen,
  Copy,
  Trash2,
  EllipsisVertical,
  Link,
  Filter,
  Archive,
} from "lucide-react";
import Button from "../ui/Button";
import AddROPAModal from "./AddRoPA";
import { useNavigate } from "react-router-dom";
import { getAllRopas } from "../../services/RopaService";
import ViewROPAModal from "./ViewRopaModel";
import EditRoPAModal from "./RopaEditModal";
import RopaFilterModal from "./RopaFilterModel";
import { motion } from "framer-motion";
import { useToast } from "../ui/ToastProvider";
import { useAuth } from "../../context/AuthContext";

export default function RoPARecords() {
  const [ropas, setRopas] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedRopa, setSelectedRopa] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editRopa, setEditRopa] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    flow_stage: "",
    department: "",
  });
  const { user } = useAuth();
  const currentUser = user

  const {addToast} = useToast();

  const toggleMenu = (id) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  const removeFilter = async (key) => {
    const updated = { ...filters, [key]: "" };
    setFilters(updated);

    try {
      const res = await getAllRopas({ page: 1, limit: 10, ...updated });
      setRopas(res.data.ropas || []);
    } catch (err) {
      console.error("Failed to filter after chip removal", err);
    }
  };

  const canUserEditRopa = (ropa, user) => {
    const stage = ropa.category?.toLowerCase();
    const status = ropa.status?.toLowerCase();
    const role = user.role?.toLowerCase();

    // ORG ADMIN: Full Access
    if (role === "org_admin") return true;

    // OFFDOFF → No one can edit (except org_admin)
    if (stage === "offdoff") return false;

    // INFO VOYAGE RULES
    if (stage === "infovoyage") {
      if (role === "process_owner") {
        return status === "draft" || status === "returned";
      }

      if (role === "process_expert") {
        return (
          ropa.assigned_to === user.id &&
          (status === "assigned" || status === "returned")
        );
      }

      return false;
    }

    // CHECKSYNC RULES
    if (stage === "checksync") {
      return role === "privacy_sme";
    }

    // BEAM RULES
    if (stage === "beam") {
      return role === "privacy_sme";
    }

    return false;
  };

  const handleEditClick = (ropa) => {
    if (!canUserEditRopa(ropa, currentUser)) {
      addToast("error" ,"You don’t have permission to edit this RoPA.");
      return;
    }

    // Allowed → open edit modal
    setEditRopa(ropa);
    setEditOpen(true);
  };

  useEffect(() => {
    const fetchRopas = async () => {
      try {
        const res = await getAllRopas({ page: 1, limit: 10 });
        setRopas(res.data.ropas || []);
      } catch (err) {
        console.error("Failed to load ROPAs", err);
      }
    };

    fetchRopas();
  }, []);

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

  const handleOpen = () => {
    navigate("/new-ropa");
  };

  const applyFilters = async (newFilters) => {
    setFilters(newFilters);
    try {
      const res = await getAllRopas({ page: 1, limit: 10, ...newFilters });
      setRopas(res.data.ropas || []);
    } catch (err) {
      console.error("Failed to filter", err);
    }
    setFilterOpen(false);
  };

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
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 bg-[#5DEE92] text-black px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition hover:cursor-pointer "
          >
            <Filter size={16} />
            Filter
          </button>
          <Button onClick={handleOpen} text="New RoPA" />
          {/* {isModalOpen && <AddROPAModal isOpen={handleOpen} onClose={handleClose} />} */}
        </div>
      </div>

      {/* ACTIVE FILTERS */}
      {Object.values(filters).some((v) => v) && (
        <div className="px-6 mt-3 flex flex-wrap gap-2">
          {Object.entries(filters)
            .filter(([k, v]) => v)
            .map(([key, value]) => (
              <motion.div
                key={key}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-2 px-3 py-1 bg-[#5DEE92]/20 border border-[#5DEE92] text-black rounded-full text-xs font-medium"
              >
                <span className="capitalize">
                  {key.replace(/_/g, " ")}: {value}
                </span>
                <button
                  onClick={() => removeFilter(key)}
                  className="text-black/70 hover:text-black"
                >
                  ✕
                </button>
              </motion.div>
            ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 mt-2 text-sm text-gray-600 dark:text-gray-400"
      >
        Showing{" "}
        <motion.span
          key={ropas.length}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="font-semibold text-black dark:text-white"
        >
          {ropas.length}
        </motion.span>{" "}
        records
      </motion.div>

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
                  {ropa.ropa_id}
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-100">
                  {ropa.name}
                </div>
                <div>
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-[#5de992] text-black">
                    {ropa.category}
                  </span>
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-100">
                  {ropa.creator?.full_name || "—"}
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-100">
                  {ropa.accountable_department || "—"}
                </div>
                <div className="flex items-center justify-end space-x-2 relative">
                  <button
                    onClick={() => {
                      setSelectedRopa(ropa);
                      setViewOpen(true);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => {
                      handleEditClick(ropa);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                  >
                    <SquarePen size={16} />
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
                        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                          <Archive size={14} className="mr-2" /> Archive
                        </button>
                        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
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
      <ViewROPAModal
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        ropa={selectedRopa}
      />

      <EditRoPAModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        ropa={editRopa}
        onUpdated={(updated) => {
          // update list without refetch
          setRopas((prev) =>
            prev.map((r) => (r.id === updated.id ? updated : r))
          );
        }}
      />

      <RopaFilterModal
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={applyFilters}
        initial={filters}
      />
    </div>
  );
}
