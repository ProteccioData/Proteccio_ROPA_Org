import { Bell } from "lucide-react";

export default function NotificationBell({ count = 0, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center 
                 rounded-full border dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none 
                 focus:ring-2 focus:ring-green-300 transition cursor-pointer"
    >
      <Bell size={18} className="text-gray-600 dark:text-gray-100" />
      {count > 0 && (
        <span
          className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white text-[10px] sm:text-xs 
                     w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center"
        >
          {count}
        </span>
      )}
    </button>
  );
}
