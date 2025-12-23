import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { useToast } from "../ui/ToastProvider";
import { createAssessment } from "../../services/AssessmentService";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { addTranslationNamespace } from "../../i18n/config";

export default function CreateAssessmentModal({
  open,
  onClose,
  type, // "LIA" | "DPIA" | "TIA"
  onCreated, // return created assessment
}) {
  const { addToast } = useToast();

  const [form, setForm] = useState({
    title: "",
    description: "",
    impact: "",
    likelihood: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      addTranslationNamespace("en", "modules", "CreateAssessmentModel"),
      addTranslationNamespace("hindi", "modules", "CreateAssessmentModel"),
      addTranslationNamespace("sanskrit", "modules", "CreateAssessmentModel"),
      addTranslationNamespace("telugu", "modules", "CreateAssessmentModel"),
    ]).then(() => setReady(true));
  }, []);

  const { t } = useTranslation("modules", {
    keyPrefix: "CreateAssessmentModel",
  });

  const impactScale = {
    insignificant: 1,
    minor: 2,
    moderate: 3,
    major: 4,
    severe: 5,
  };

  const likelihoodScale = {
    rare: 1,
    unlikely: 2,
    possible: 3,
    likely: 4,
    almost_certain: 5,
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleCreate = async () => {
    if (!validate()) {
      addToast("error", "Please fill required fields.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        type,
        title: form.title,
        description: form.description,
        impact: form.impact ? impactScale[form.impact] : undefined,
        likelihood: form.likelihood
          ? likelihoodScale[form.likelihood]
          : undefined,
      };

      const res = await createAssessment(payload);

      addToast("success", `${type} created successfully`);

      onCreated?.(res.data.assessment); // return assessment object
      onClose();
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to create assessment");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-3xl rounded-xl border border-[#828282] dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {t("create_new")} {type}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("title")}
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 ${
                errors.title ? "border-red-500" : "border-[#828282]"
              }`}
              placeholder="Enter assessment title"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("description")}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-md border-[#828282] bg-white dark:bg-gray-700 dark:text-gray-100"
              placeholder="Enter optional description"
            />
          </div>

          {/* Impact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("impact")} (optional)
            </label>
            <select
              value={form.impact}
              onChange={(e) => handleChange("impact", e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-[#828282] bg-white dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">{t("select")}</option>
              {Object.keys(impactScale).map((lvl) => (
                <option key={lvl} value={lvl}>
                  {t(lvl)}
                </option>
              ))}
            </select>
          </div>

          {/* Likelihood */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("likelihood")} (optional)
            </label>
            <select
              value={form.likelihood}
              onChange={(e) => handleChange("likelihood", e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-[#828282] bg-white dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">{t("select")}</option>
              {Object.keys(likelihoodScale).map((lvl) => (
                <option key={lvl} value={lvl}>
                  {t(lvl)}
                </option>
              ))}
            </select>
          </div>

          {/* Create Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCreate}
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-medium transition-colors ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Creating..." : `${t("create")} ${type}`}
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
