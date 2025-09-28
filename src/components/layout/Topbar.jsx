import { motion } from "framer-motion";
import { Bell, Search, User } from "lucide-react";
import logo from "../../assets/logo.svg"
import SearchBar from "../ui/SearchBar";

export default function Topbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-[#828282] dark:border-gray-700/50 bg-[#FAFAFA] dark:bg-gray-800 backdrop-blur-md px-8 py-2 flex items-center justify-between shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <img
            src={logo}
            alt="Proteccio"
            className="w-28 sm:w-32 md:w-40"
          />
        </motion.div>
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 max-w-2xl mx-4"
      >
        <div className="relative">
          <SearchBar />
        </div>
      </motion.div>

      {/* Icons */}
      <div className="flex items-center gap-3">
        {/* Notification */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full border border-gray-300/60 dark:border-gray-600/60 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition hover:cursor-pointer"
        >
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </motion.button>

        {/* Profile */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full border border-gray-300/60 dark:border-gray-600/60 bg-gradient-to-b from-purple-200/90 to-purple-300/90 dark:from-purple-600/80 dark:to-purple-700/80 backdrop-blur-sm transition hover:cursor-pointer"
        >
          <User className="h-5 w-5 text-purple-600 dark:text-purple-200" />
        </motion.button>
      </div>
    </header>
  );
}

