import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs.tsx";
import { motion } from "framer-motion";

export default function ViewAssessmentModal({ open, onClose, assessment }) {
  if (!assessment) return null;

  const {
    assessment_id,
    type,
    title,
    description,
    impact,
    likelihood,
    risk_score,
    risk_category,
    creator,
    createdAt,
    stages = [],
  } = assessment;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            View {type} Assessment – #{assessment_id}
          </DialogTitle>
        </DialogHeader>

        {/* BASIC INFO */}
        <section className="mt-4 grid grid-cols-2 gap-4">
          <InfoCard label="Title" value={title} />
          <InfoCard label="Description" value={description} />
          <InfoCard label="Impact" value={impact} />
          <InfoCard label="Likelihood" value={likelihood} />
          <InfoCard label="Risk Score" value={risk_score} />
          <InfoCard label="Risk Category" value={risk_category} />
          <InfoCard label="Created By" value={creator?.full_name} />
          <InfoCard
            label="Created At"
            value={new Date(createdAt).toLocaleString()}
          />
        </section>

        {/* STAGES IN TABS (LIKE ROPA UI) */}
        <Tabs
          defaultValue={stages?.[0]?.id?.toString() || "stage-1"}
          className="mt-8"
        >
          <TabsList className="grid grid-cols-5 w-full">
            {stages.length === 0 ? (
              <p className="text-gray-500 text-sm col-span-5 py-2">
                No stages found.
              </p>
            ) : (
              stages.map((stage) => (
                <TabsTrigger
                  key={stage.id}
                  value={stage.id.toString()}
                >
                  {stage.stage_name || `Stage ${stage.id}`}
                </TabsTrigger>
              ))
            )}
          </TabsList>

          {stages.map((stage) => (
            <TabsContent
              key={stage.id}
              value={stage.id.toString()}
              className="mt-4"
            >
              <StageFields stage={stage} />
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

const InfoCard = ({ label, value }) => (
  <div className="p-3 border rounded-lg bg-gray-50">
    <p className="text-xs text-gray-500 uppercase">{label}</p>
    <p className="text-sm font-medium">{value || "-"}</p>
  </div>
);

const StageFields = ({ stage }) => {
  const fields = stage.responses || {};

  return (
    <div>
      <h2 className="font-semibold text-lg mb-3">{stage.stage_name}</h2>

      {Object.keys(fields).length === 0 && (
        <p className="text-gray-500 text-sm">No fields added in this stage yet.</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(fields).map(([key, value]) => (
          <div
            key={key}
            className="border p-3 rounded-lg bg-gray-50"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              {key}
            </p>
            <p className="text-sm font-medium">{value || "-"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
