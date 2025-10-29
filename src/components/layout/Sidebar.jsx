import {
  LayoutGrid,
  FileText,
  Clock,
  Settings,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Database,
  FilePlus2,
  FileChartLine,
  User2,
  ListCheck,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import useTheme from "../hooks/useTheme";

const menuItems = [
  { name: "Home", icon: LayoutGrid, path: "/" },
  {
    name: "RoPA",
    icon: FileText,
    path: "/RoPA",
  },
  { name: "Assessments", icon: FileCheck, path: "/assessments" },
  {
    name: "Data Mapping",
    icon: Database,
    path: "/data-mapping",
  },
  {
    name: "Setup",
    icon: FilePlus2,
    path: "/setup",
  },
  {
    name: "Audit Logs",
    icon: Clock,
    path: "/audit-logs",
  },
  {
    name: "Reports",
    icon: FileChartLine,
    path: "/reports",
  },
  {
    name: "User Setup",
    icon: User2,
    path: "/user-setup",
  },
  {
    name: "Action Items",
    icon: ListCheck,
    path: "/action-item",
  },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className={`flex flex-col border border-r border-[#828282] dark:text-gray-100 bg-[#FAFAFA] dark:bg-gray-800 dark:border-gray-600 transition-all duration-300  
        ${collapsed ? "w-24" : "w-48"} h-[calc(100vh-4rem)]`}
    >
      {/* --- Top section (static) --- */}
      <div
        className={`p-4 flex justify-between  ${
          collapsed ? "items-center" : ""
        } gap-4`}
      >
        <button
          onClick={toggleTheme}
          className={`
                w-12 h-6 rounded-full relative transition-colors duration-300 border border-[#828282] dark:border-gray-600 hover:cursor-pointer
                ${theme === "dark" ? "bg-[#5DE992]" : "bg-gray-300"}
                ${collapsed ? "mx-auto" : ""}
              `}
        >
          <div
            className={`
                  w-5 h-5 bg-white rounded-full top-0 transition-transform duration-300
                  ${theme === "dark" ? "translate-x-6" : "translate-x-0"}
                  flex items-center justify-center
                `}
          >
            {theme === "dark" ? (
              <Sun className="w-3 h-3 text-black" />
            ) : (
              <Moon className="w-3 h-3 text-black" />
            )}
          </div>
        </button>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`
                w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 
                hover:bg-gray-200 dark:hover:bg-gray-600 
                flex items-center justify-center transition-all duration-200 border border-[#828282] dark:border-gray-400 hover:cursor-pointer
                ${
                  collapsed
                    ? "absolute -right-4 bg-white dark:bg-gray-800 shadow-md"
                    : ""
                }
              `}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-900 dark:text-gray-300" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-900 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* --- Middle nav (scrollable) --- */}
      <nav
        className={`flex-1 overflow-y-auto ${
          collapsed
            ? "px-4 flex flex-col items-center"
            : "px-4 flex flex-col gap-2"
        } space-y-2`}
      >
        {menuItems.map(({ name, icon: Icon, path }) => (
          <NavLink key={name} to={path}>
            {({ isActive }) => (
              <div
                className={`flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm transition
        ${
          isActive
            ? "bg-[#5DEE92] text-black"
            : "hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
              >
                <Icon size={`${collapsed ? 24 : 20}`} />
                {!collapsed && (
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{name}</span>
                  </div>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* --- Bottom section (fixed at bottom) --- */}
      <div
        className={`py-4 flex gap-2 ${
          collapsed
            ? "flex-col justify-center items-center"
            : "justify-between items-center gap-2 px-4"
        }`}
      >
        <NavLink
          key={name}
          to="/settings"
          className={({ isActive }) =>
            `flex items-center justify-center rounded-full w-10 h-10 text-sm transition gap-2
              ${
                isActive
                  ? "bg-[#5DEE92] text-black"
                  : "hover:bg-gray-200 hover:text-black dark:hover:bg-gray-700 dark:hover:text-gray-200"
              }`
          }
        >
          <Settings size={20} />
        </NavLink>

        <div
          className={`
              text-center ${collapsed ? "mt-4" : ""} transition-all duration-300
            `}
        >
          <span className="text-sm text-gray-800 dark:text-gray-400 font-mono border border-[#828282] dark:border-gray-600 px-2 py-1 rounded">
            V:2.0
          </span>
        </div>
      </div>
    </div>
  );
}
