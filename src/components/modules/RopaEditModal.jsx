import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { X, Save, Loader } from "lucide-react";
import { useToast } from "../ui/ToastProvider";
import { useAuth } from "../../context/AuthContext";
import { updateRopa } from "../../services/RopaService";
import ConfirmationModal from "../ui/ConfirmationModal";

function Field({ label, children, note }) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div>{children}</div>
      {note && <div className="text-xs text-gray-400 mt-1">{note}</div>}
    </div>
  );
}

export default function EditRoPAModal({
  isOpen,
  onClose,
  ropa = {},
  onUpdated,
}) {
  const { addToast } = useToast();
  const { user } = useAuth?.() || {}; // optional
  const [local, setLocal] = useState(null);
  const [activeTab, setActiveTab] = useState("operational");
  const [saving, setSaving] = useState(false);
  const autosaveRef = useRef(null);
  const dirtyRef = useRef(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLocal({ ...ropa });
    dirtyRef.current = false;
    // start autosave timer
    startAutosave();
    return () => stopAutosave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, ropa]);

  // Autosave every 7 seconds if changes
  const startAutosave = () => {
    stopAutosave();
    autosaveRef.current = setInterval(async () => {
      if (dirtyRef.current && local) {
        await handleSave({ auto: true });
      }
    }, 7000);
  };
  const stopAutosave = () => {
    if (autosaveRef.current) clearInterval(autosaveRef.current);
    autosaveRef.current = null;
  };

  const setField = (path, value) => {
    setLocal((p) => {
      const next = { ...(p || {}) };
      // support nested keys like 'data.transit.field' but our model is flat — simple set
      next[path] = value;
      dirtyRef.current = true;
      return next;
    });
  };

  const handleSave = async ({ auto = false } = {}) => {
    if (!local) return;
    setSaving(true);
    try {
      // Build payload: send only editable fields (exclude locked)
      const payload = { ...local };
      // Remove locked fields so backend doesn't attempt to change them
      delete payload.id;
      delete payload.ropa_id;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.organization_id;
      delete payload.created_by;
      delete payload.linked_assessment_id;
      delete payload.flow_stage; // locked per your instruction

      // Clean payload: convert empty strings to null for ENUMs/Numbers
      Object.keys(payload).forEach(key => {
        if (payload[key] === "") {
          payload[key] = null;
        }
      });

      // Send update
      const res = await updateRopa(ropa.id, payload);
      dirtyRef.current = false;
      if (!auto) {
        addToast("success", "RoPA saved");
        onClose();
      } else {
        addToast("info", "Auto-saved");
      }
      if (onUpdated) onUpdated(res.data.ropa || res.data);
    } catch (err) {
      console.error("Save failed", err);
      addToast("error", "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  // UI helpers
  const locked = (name) =>
    [
      "ropa_id",
      "id",
      "createdAt",
      "updatedAt",
      "organization_id",
      "created_by",
      "linked_assessment_id",
      "flow_stage",
    ].includes(name);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => {
          stopAutosave();
          onClose();
        }}
      />

      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        className="relative w-full max-w-5xl max-h-[90vh] overflow-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Edit RoPA
            </h3>
            <div className="text-sm text-gray-500">
              Edit fields for{" "}
              <span className="font-medium">{ropa.ropa_id || "—"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-[#5DEE92] text-black rounded-xl shadow hover:opacity-95"
            >
              {saving ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span className="text-sm font-medium">Save</span>
            </button>
            <button
              onClick={() => {
                stopAutosave();
                onClose();
              }}
              className="p-2 rounded-full border border-gray-200 dark:border-gray-700"
            >
              <X />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "operational", label: "Operational Lens" },
              { key: "process", label: "Process Grid" },
              { key: "defence", label: "Defence Grid" },
              { key: "transit", label: "Data Transit" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-3 py-2 rounded-lg ${activeTab === t.key
                    ? "bg-[#5DEE92] text-black"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  } border border-[#828282]`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form body */}
        <div className="space-y-6">
          {/* Top row: identifiers + status */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="RoPA ID">
              <input
                value={local?.ropa_id || ""}
                disabled
                className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800"
              />
            </Field>

            <Field label="Status">
              <select
                value={local?.status || "draft"}
                onChange={(e) => setField("status", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
              >
                <option value="draft">Draft</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="approved">Approved</option>
                <option value="archived">Archived</option>
              </select>
            </Field>

            <Field label="Created At">
              <input
                value={local?.createdAt || ""}
                disabled
                className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800"
              />
            </Field>

            <Field label="Updated At">
              <input
                value={local?.updatedAt || ""}
                disabled
                className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800"
              />
            </Field>
          </div>

          {/* Section tabs content */}
          {activeTab === "operational" && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Operational Lens</h4>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Acting Role">
                  <select
                    value={local?.acting_role || ""}
                    onChange={(e) => setField("acting_role", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  >
                    <option value="">Select role</option>
                    <option value="fiduciary">Fiduciary</option>
                    <option value="processor">Processor</option>
                    <option value="joint_fiduciary">Joint Fiduciary</option>
                    <option value="joint_processor">Joint Processor</option>
                  </select>
                </Field>

                <Field label="Title of Processing Activity">
                  <input
                    value={local?.title || ""}
                    onChange={(e) => setField("title", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Name of Organization">
                  <input
                    value={local?.organization_name || ""}
                    onChange={(e) =>
                      setField("organization_name", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Accountable Department">
                  <input
                    value={local?.accountable_department || ""}
                    onChange={(e) =>
                      setField("accountable_department", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Department Head">
                  <input
                    value={local?.department_head || ""}
                    onChange={(e) =>
                      setField("department_head", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Process Owner">
                  <input
                    value={local?.process_owner || ""}
                    onChange={(e) => setField("process_owner", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Process Expert (comma separated)">
                  <input
                    value={(local?.process_expert || []).join(", ")}
                    onChange={(e) =>
                      setField(
                        "process_expert",
                        e.target.value.split(",").map((s) => s.trim())
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="DPO Contact">
                  <input
                    value={local?.dpo_contact || ""}
                    onChange={(e) => setField("dpo_contact", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Privacy Manager">
                  <input
                    value={local?.privacy_manager || ""}
                    onChange={(e) =>
                      setField("privacy_manager", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <div className="col-span-2">
                  <Field label="Description">
                    <textarea
                      value={local?.description || ""}
                      onChange={(e) => setField("description", e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                    />
                  </Field>
                </div>

                <div className="col-span-2">
                  <Field label="Additional Comments">
                    <textarea
                      value={local?.additional_comments || ""}
                      onChange={(e) =>
                        setField("additional_comments", e.target.value)
                      }
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {activeTab === "process" && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Process Grid</h4>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Type of Data Subjects (comma separated)">
                  <input
                    value={(local?.type_of_data_subjects || []).join(", ")}
                    onChange={(e) =>
                      setField(
                        "type_of_data_subjects",
                        e.target.value.split(",").map((s) => s.trim())
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Number of Data Subjects">
                  <input
                    type="number"
                    value={local?.number_of_data_subjects || ""}
                    onChange={(e) =>
                      setField("number_of_data_subjects", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Data Elements (comma separated)">
                  <input
                    value={(local?.data_elements || []).join(", ")}
                    onChange={(e) =>
                      setField(
                        "data_elements",
                        e.target.value.split(",").map((s) => s.trim())
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Data Collection Source (comma separated)">
                  <input
                    value={(local?.data_collection_source || []).join(", ")}
                    onChange={(e) =>
                      setField(
                        "data_collection_source",
                        e.target.value.split(",").map((s) => s.trim())
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Country of Data Collection (comma separated)">
                  <input
                    value={(local?.country_of_data_collection || []).join(", ")}
                    onChange={(e) =>
                      setField(
                        "country_of_data_collection",
                        e.target.value.split(",").map((s) => s.trim())
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Purpose of Processing (comma separated)">
                  <input
                    value={(local?.purpose_of_processing || []).join(", ")}
                    onChange={(e) =>
                      setField(
                        "purpose_of_processing",
                        e.target.value.split(",").map((s) => s.trim())
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Data Retention Period">
                  <input
                    value={local?.data_retention_period || ""}
                    onChange={(e) =>
                      setField("data_retention_period", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                    placeholder="e.g., 7 years"
                  />
                </Field>

                <Field label="Deletion Method">
                  <input
                    value={local?.deletion_method || ""}
                    onChange={(e) =>
                      setField("deletion_method", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Physical Applications (comma separated)">
                  <input
                    value={(local?.physical_applications || []).join(", ")}
                    onChange={(e) =>
                      setField(
                        "physical_applications",
                        e.target.value.split(",").map((s) => s.trim())
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Physical Application IDs (comma separated)">
                  <input
                    value={(local?.physical_application_ids || []).join(", ")}
                    onChange={(e) =>
                      setField(
                        "physical_application_ids",
                        e.target.value.split(",").map((s) => s.trim())
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Virtual Applications (comma separated)">
                  <input
                    value={(local?.virtual_applications || []).join(", ")}
                    onChange={(e) =>
                      setField(
                        "virtual_applications",
                        e.target.value.split(",").map((s) => s.trim())
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Virtual Application IDs (comma separated)">
                  <input
                    value={(local?.virtual_application_ids || []).join(", ")}
                    onChange={(e) =>
                      setField(
                        "virtual_application_ids",
                        e.target.value.split(",").map((s) => s.trim())
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <div className="col-span-2">
                  <Field label="Process Grid - Additional Comments">
                    <textarea
                      value={local?.process_grid_comments || ""}
                      onChange={(e) =>
                        setField("process_grid_comments", e.target.value)
                      }
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {activeTab === "defence" && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Defence Grid</h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "security_measures", label: "Security Measures" },
                  { key: "access_measures", label: "Access Measures" },
                  { key: "compliance_measures", label: "Compliance Measures" },
                  { key: "data_governance", label: "Data Governance" },
                  {
                    key: "operational_measures",
                    label: "Operational Measures",
                  },
                  {
                    key: "transparency_measures",
                    label: "Transparency Measures",
                  },
                  { key: "ethical_measures", label: "Ethical Measures" },
                  {
                    key: "physical_security_measures",
                    label: "Physical Security Measures",
                  },
                  { key: "technical_measures", label: "Technical Measures" },
                  {
                    key: "risk_management_measures",
                    label: "Risk Management Measures",
                  },
                ].map((f) => (
                  <Field key={f.key} label={f.label}>
                    <input
                      value={(local?.[f.key] || []).join(", ")}
                      onChange={(e) =>
                        setField(
                          f.key,
                          e.target.value.split(",").map((s) => s.trim())
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                    />
                  </Field>
                ))}

                <div className="col-span-2">
                  <Field label="Defence Grid - Additional Comments">
                    <textarea
                      value={local?.defense_grid_comments || ""}
                      onChange={(e) =>
                        setField("defense_grid_comments", e.target.value)
                      }
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {activeTab === "transit" && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Data Transit</h4>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Will data be transferred?">
                  <select
                    value={local?.will_data_be_transferred ? "yes" : "no"}
                    onChange={(e) =>
                      setField(
                        "will_data_be_transferred",
                        e.target.value === "yes"
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </Field>

                <Field label="Type of Data Transfer">
                  <input
                    value={local?.type_of_data_transfer || ""}
                    onChange={(e) =>
                      setField("type_of_data_transfer", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Purpose of Transfer">
                  <input
                    value={local?.purpose_of_transfer || ""}
                    onChange={(e) =>
                      setField("purpose_of_transfer", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Legal Basis for Transfer">
                  <input
                    value={local?.legal_basis_for_transfer || ""}
                    onChange={(e) =>
                      setField("legal_basis_for_transfer", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Importer Name">
                  <input
                    value={local?.importer_name || ""}
                    onChange={(e) => setField("importer_name", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Importer Location">
                  <input
                    value={local?.importer_location || ""}
                    onChange={(e) =>
                      setField("importer_location", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Importer Role">
                  <input
                    value={local?.importer_role || ""}
                    onChange={(e) => setField("importer_role", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Importer Retention Period">
                  <input
                    value={local?.importer_retention_period || ""}
                    onChange={(e) =>
                      setField("importer_retention_period", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Security Safeguards by Importer (comma separated)">
                  <input
                    value={(local?.security_safeguards_by_importer || []).join(
                      ", "
                    )}
                    onChange={(e) =>
                      setField(
                        "security_safeguards_by_importer",
                        e.target.value.split(",").map((s) => s.trim())
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Exporter Name">
                  <input
                    value={local?.exporter_name || ""}
                    onChange={(e) => setField("exporter_name", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Exporter Location">
                  <input
                    value={local?.exporter_location || ""}
                    onChange={(e) =>
                      setField("exporter_location", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Exporter Role">
                  <input
                    value={local?.exporter_role || ""}
                    onChange={(e) => setField("exporter_role", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <Field label="Exporter Retention Period">
                  <input
                    value={local?.exporter_retention_period || ""}
                    onChange={(e) =>
                      setField("exporter_retention_period", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                  />
                </Field>

                <div className="col-span-2">
                  <Field label="Data Principal Rights by Importer (comma separated)">
                    <input
                      value={(
                        local?.data_principal_rights_by_importer || []
                      ).join(", ")}
                      onChange={(e) =>
                        setField(
                          "data_principal_rights_by_importer",
                          e.target.value.split(",").map((s) => s.trim())
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                    />
                  </Field>
                </div>

                <div className="col-span-2">
                  <Field label="Data Principal Rights by Exporter (comma separated)">
                    <input
                      value={(
                        local?.data_principal_rights_by_exporter || []
                      ).join(", ")}
                      onChange={(e) =>
                        setField(
                          "data_principal_rights_by_exporter",
                          e.target.value.split(",").map((s) => s.trim())
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700"
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => {
              stopAutosave();
              onClose();
            }}
            className="px-4 py-2 rounded-lg border cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-[#5DEE92] text-black rounded-xl shadow hover:opacity-95"
          >
            <Save size={16} />
            <span className="text-sm font-medium">Save</span>
          </button>
        </div>
      </motion.div>
      {/* Save Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setConfirmOpen(false);
          await handleSave({ auto: false });
        }}
        title="Save Changes"
        message={`Are you sure you want to save updates to "${ropa?.ropa_id}"? 
These changes will immediately update the RoPA record.`}
        confirmText="Save Changes"
        cancelText="Cancel"
        type="info"
        isLoading={saving}
        confirmColor="green"
      >
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-700 dark:text-green-300 font-medium">
              RoPA being updated:
            </span>
            <span className="text-green-700 dark:text-green-300 font-bold">
              {ropa?.ropa_id}
            </span>
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-2">
            <strong>Note:</strong> All editable fields will be updated
            permanently.
          </div>
        </div>
      </ConfirmationModal>
    </div>
  );
}
