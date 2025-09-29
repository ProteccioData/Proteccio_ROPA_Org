import { motion } from "framer-motion";
import {
  Plus,
  Download,
  ShieldCheck,
  HardDrive,
  Database,
  Server,
  CirclePlus,
} from "lucide-react";

const setupOptions = [
  {
    id: 1,
    title: "Asset Management",
    description: "Evaluate risks of cross-border data transfers",
    items: 247,
    icon: <HardDrive size={32} className="text-gray-700 dark:text-gray-300" />,
  },
  {
    id: 2,
    title: "Data Collection Configuration",
    description: "Configure data collection sources",
    items: 47,
    icon: <Server size={32} className="text-gray-700 dark:text-gray-300" />,
  },
  {
    id: 3,
    title: "Data Element Configuration",
    description: "Define data elements and types",
    items: 7,
    icon: <Database size={32} className="text-gray-700 dark:text-gray-300" />,
  },
];

export default function Setup() {
  return (
    <div className="min-h-screen">
      {/* Action Buttons */}
      <div className="flex w-full gap-8 items-center mb-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center w-full gap-2 bg-[#5DEE92] px-6 py-3 rounded-lg text-black font-medium shadow-md hover:opacity-90 transition hover:cursor-pointer"
        >
          <CirclePlus size={18} /> Add New Asset
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center w-full gap-2 bg-[#5DEE92] px-6 py-3 rounded-lg text-black font-medium shadow-md hover:opacity-90 transition hover:cursor-pointer"
        >
          <Download size={18} /> Bulk Import
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center w-full justify-center gap-2 bg-[#5DEE92] px-6 py-3 rounded-lg text-black font-medium shadow-md hover:opacity-90 transition hover:cursor-pointer"
        >
          <ShieldCheck size={18} /> Security Review
        </motion.button>
      </div>

      {/* Setup Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 4 }).map((_, rowIdx) =>
          setupOptions.map((option, idx) => (
            <motion.div
              key={`${rowIdx}-${option.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (idx + rowIdx * 3) * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 flex flex-col justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">{option.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {option.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {option.items} items
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-[#5DEE92] text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-500 transition"
                >
                  Configure
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

