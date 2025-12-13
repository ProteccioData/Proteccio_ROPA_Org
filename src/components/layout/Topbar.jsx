import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, User, LogOut, Settings, FileText } from "lucide-react";
import SearchBar from "../ui/SearchBar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationSidebar from "../modules/NotificationsSidebar";
import NotificationService from "../../services/NotificationService";
import Portal from "../../utils/portal";
import GlobalSearchBar from "../modules/GlobalSearchBar";
import { useTranslation } from "react-i18next";
import { addTranslationNamespace } from "../../i18n/config";

export default function Topbar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { logout, user } = useAuth();
  const { t } = useTranslation("layout", { keyPrefix: "Topbar" });

  useEffect(() => {
    addTranslationNamespace("en", "layout", "Topbar");
    addTranslationNamespace("hindi", "layout", "Topbar");
    addTranslationNamespace("sanskrit", "layout", "Topbar");
    addTranslationNamespace("telugu", "layout", "Topbar");
  }, []);
  
  const fullName = user?.full_name || "User";
  const email = user?.email || "email@example.com";
  const initial = fullName?.charAt(0).toUpperCase();

  const loadNotifications = async () => {
    try {
      const res = await NotificationService.getAllNotifications({
        page: 1,
        limit: 30,
      });
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  const loadUnread = async () => {
    try {
      const res = await NotificationService.getUnreadCount();
      setUnreadCount(res.count || 0);
    } catch (err) {}
  };

  useEffect(() => {
    loadUnread();
    const int = setInterval(loadUnread, 30000);
    return () => clearInterval(int);
  }, []);

  useEffect(() => {
    if (notifOpen) loadNotifications();
  }, [notifOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.25, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -8, scale: 0.95, transition: { duration: 0.15 } },
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-[#828282]/60 dark:border-gray-700/50 bg-[#FAFAFA]/90 dark:bg-gray-900/90 backdrop-blur-md px-8 py-2 flex items-center justify-between shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <img
            src="/assets/logo.svg"
            alt={t("proteccio")}
            className="w-28 sm:w-32 md:w-40 hover:cursor-pointer"
            onClick={() => navigate("/")}
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
          <GlobalSearchBar />
        </div>
      </motion.div>

      {/* Icons */}
      <div className="flex items-center gap-3" ref={dropdownRef}>
        {/* Articles button */}
        <motion.button
          onClick={() => navigate("/articles")}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md border border-[#828282]/40 dark:border-gray-700/40 bg-white/80 dark:bg-gray-800/70 hover:shadow-md transition cursor-pointer"
          aria-label="Articles"
        >
          <FileText className="h-5 w-5 text-[#1a7f4d] dark:text-[#5DEE92]" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-100">
            {t("articles")}
          </span>
        </motion.button>

        {/* Notification */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setNotifOpen(true)}
          className="relative p-2 rounded-full border border-[#828282]/60 dark:border-gray-600/60 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition cursor-pointer"
        >
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          {unreadCount > 0 && (
            <span
              className="
              absolute -top-1 -right-1 bg-red-500 text-white text-[10px]
              w-4 h-4 flex items-center justify-center rounded-full shadow
            "
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </motion.button>

        {/* Profile Dropdown */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-2 rounded-full border border-[#828282]/60 dark:border-gray-600/60 bg-gradient-to-b from-[#5DEE92]/80 to-[#4fd882]/90 dark:from-[#5DEE92]/50 dark:to-[#38b36c]/60 backdrop-blur-sm transition cursor-pointer"
          >
            <User className="h-5 w-5 text-[#1a7f4d] dark:text-[#5DEE92]" />
          </motion.button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden border border-[#828282]/40 dark:border-gray-700/50 bg-white/95 dark:bg-gray-800/90 shadow-2xl backdrop-blur-lg"
              >
                {/* Profile Card */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200/40 dark:border-gray-700/40">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5DEE92] to-[#38b36c] flex items-center justify-center text-white font-semibold text-sm">
                    {initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {fullName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {email}
                    </p>
                  </div>
                </div>

                {/* Dropdown Options */}
                <div className="flex flex-col py-1">
                  <button
                    onClick={() => {
                      navigate("/profile-settings");
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-[#5DEE92]/20 dark:hover:bg-[#5DEE92]/10 transition-all duration-150 cursor-pointer"
                  >
                    <Settings className="h-4 w-4 text-[#38b36c] dark:text-[#5DEE92]" />
                    {t("profile_settings")}
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/30 transition-all duration-150 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("logout")}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Portal>
          <NotificationSidebar
            isOpen={notifOpen}
            onClose={() => setNotifOpen(false)}
            onUnreadChange={(count) => setUnreadCount(count)}
          />
        </Portal>
      </div>
    </header>
  );
}
