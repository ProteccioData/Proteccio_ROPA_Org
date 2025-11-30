import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  ShieldAlert,
  Users,
  FileText,
  Server,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
} from "lucide-react";
import NotificationService from "../../services/NotificationService";

// ---------------------------------------------
// ICON & STYLE MAPS
// ---------------------------------------------
const TypeIcons = {
  security: ShieldAlert,
  user: Users,
  compliance: FileText,
  system: Server,
  warning: AlertTriangle,
  info: Info,
};

const TypeStyles = {
  security: "bg-[#5DE992]/10 text-[#5DE992] border-[#5DE992]/30",
  user: "bg-[#5DE992]/10 text-[#5DE992] border-[#5DE992]/30",
  compliance: "bg-[#5DE992]/10 text-[#5DE992] border-[#5DE992]/30",
  system: "bg-[#5DE992]/10 text-[#5DE992] border-[#5DE992]/30",
  warning: "bg-[#5DE992]/10 text-[#5DE992] border-[#5DE992]/30",
  info: "bg-[#5DE992]/10 text-[#5DE992] border-[#5DE992]/30",
};

// ---------------------------------------------
// TIME HELPER
// ---------------------------------------------
const getRelativeTime = (iso) => {
  const date = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ---------------------------------------------
// ANIMATION VARIANTS
// ---------------------------------------------
const sidebarVariants = {
  closed: {
    x: "100%",
    opacity: 0.5,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  open: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { x: 20, opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0, height: 0, marginBottom: 0, padding: 0 },
};

// ---------------------------------------------
// MAIN SIDEBAR COMPONENT
// ---------------------------------------------
export default function NotificationSidebar({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // FETCH DATA
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      NotificationService.getNotifications()
        .then((data) => {
          // backend returns: { notifications: [...] }
          setNotifications(data.notifications || []);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  // ACTIONS
  const handleMarkRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    await NotificationService.markAsRead(id);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await NotificationService.markAllAsRead();
  };

  const handleDelete = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await NotificationService.deleteNotification(id);
  };

  // GROUPING
  const groupedNotifications = useMemo(() => {
    const filtered =
      filter === "all"
        ? notifications
        : notifications.filter((n) => !n.is_read);

    const todayStart = new Date().setHours(0, 0, 0, 0);

    const today = [];
    const earlier = [];

    filtered.forEach((n) => {
      const d = new Date(n.created_at).setHours(0, 0, 0, 0);
      if (d === todayStart) today.push(n);
      else earlier.push(n);
    });

    const groups = [];
    if (today.length) groups.push({ label: "Today", items: today });
    if (earlier.length) groups.push({ label: "Earlier", items: earlier });

    return groups;
  }, [notifications, filter]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-[0.5px] z-[40]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* PANEL */}
          <motion.div
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-2 bottom-2 right-2 w-full max-w-md bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl z-[50] flex flex-col overflow-hidden"
          >
            {/* ---------------- HEADER ---------------- */}
            <div className="flex flex-col gap-4 p-6 border-b border-zinc-200 dark:border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative p-2.5 rounded-xl bg-gradient-to-tr from-[#5DE992] to-green-600 dark:from-green-600 dark:to-green-800 shadow-lg shadow-indigo-500/20 text-white">
                    <Bell size={20} />
                    {notifications.some((n) => !n.is_read) && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                      Inbox
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      You have {notifications.filter((n) => !n.is_read).length}{" "}
                      unread updates
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors text-zinc-500 dark:text-zinc-400"
                >
                  <X size={20} />
                </button>
              </div>

              {/* FILTERS */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-white/5 rounded-xl">
                  {["all", "unread"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
                        filter === f
                          ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white"
                          : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                      }`}
                    >
                      {f[0].toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors cursor-pointer"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              </div>
            </div>

            {/* ---------------- LIST AREA ---------------- */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : groupedNotifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-20 h-20 bg-zinc-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Bell
                      className="text-zinc-300 dark:text-zinc-600"
                      size={32}
                    />
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                    All caught up!
                  </p>
                  <p className="text-zinc-400 dark:text-zinc-600 text-sm mt-1">
                    Check back later for updates.
                  </p>
                </motion.div>
              ) : (
                groupedNotifications.map((group) => (
                  <div key={group.label}>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 px-2">
                      {group.label}
                    </h3>

                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {group.items.map((n) => (
                          <NotificationItem
                            key={n.id}
                            notification={n}
                            onMarkRead={handleMarkRead}
                            onDelete={handleDelete}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ---------------- FOOTER ---------------- */}
            <div className="p-3 bg-zinc-50 dark:bg-white/5 border-t border-zinc-200 dark:border-white/5 text-center">
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">
                Notifications
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// SUB COMPONENT: Notification Item

function NotificationItem({ notification, onMarkRead, onDelete }) {
  const Icon = TypeIcons[notification.type];
  const style = TypeStyles[notification.type];

  return (
    <motion.div
      layout
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        notification.is_read
          ? "bg-white dark:bg-white/5 border-zinc-200 dark:border-white/5"
          : "bg-white dark:bg-zinc-900 border-green-200 dark:border-green-500/30 shadow-lg shadow-green-500/5"
      }`}
    >
      {!notification.is_read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#5DE992] to-green-500" />
      )}

      <div className="p-4 pl-5">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 p-2.5 rounded-xl border ${style}`}>
            <Icon size={18} strokeWidth={2.5} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h4
                className={`text-sm font-bold truncate pr-2 ${
                  notification.is_read
                    ? "text-zinc-700 dark:text-zinc-300"
                    : "text-zinc-900 dark:text-white"
                }`}
              >
                {notification.title}
              </h4>

              <span className="flex items-center gap-1 text-[10px] bg-zinc-100 dark:bg-white/10 text-gray-700 dark:text-zinc-400 px-1.5 py-0.5 rounded whitespace-nowrap">
                <Clock size={10} />
                {getRelativeTime(notification.createdAt)}
              </span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed line-clamp-2">
              {notification.message}
            </p>

            {notification.action_label && (
              <button className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline">
                {notification.action_label}
                <ArrowRight size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        className="
    absolute bottom-2 right-2
    flex gap-2
    opacity-0 group-hover:opacity-100
    transition-all duration-200
    translate-y-2 group-hover:translate-y-0
  "
      >
        {!notification.is_read && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(notification.id);
            }}
            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/30 cursor-pointer"
            title="Mark as read"
          >
            <Check size={14} strokeWidth={3} />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/30 cursor-pointer"
          title="Delete"
        >
          <Trash2 size={14} strokeWidth={2.5} />
        </button>
      </div>
    </motion.div>
  );
}
