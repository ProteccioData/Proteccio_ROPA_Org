import { Search, Command } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { userSearchConfig } from "../../utils/searchConfig";

export default function GlobalSearchBar({ openNotifications }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Compute filtered results
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const filtered = userSearchConfig.filter(
      (item) =>
        item.keywords.some((k) => k.includes(q)) ||
        item.title.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    );

    setResults(filtered);
    setSelectedIndex(0);
  }, [query]);

  // Keyboard shortcut: Ctrl + K / Cmd + K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 80);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && results.length > 0) {
      e.preventDefault();
      handleResultSelect(results[selectedIndex]);
    }
  };

  const handleResultSelect = (item) => {
    if (item.action === "openNotifications") {
      openNotifications?.();
    } else if (item.path.startsWith("/")) {
      navigate(item.path);
    }

    setIsOpen(false);
    setQuery("");
  };

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div className="relative w-full max-w-xl lg:max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        
        <input
          ref={inputRef}
          type="text"
          placeholder="Search everywhere... (Ctrl+K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={() => setIsOpen(true)}
          onBlur={handleBlur}
          className="
            w-full border-2 border-[#5DE992] dark:border-gray-500 
            rounded-full py-1.5 sm:py-2 
            pl-9 pr-20 text-sm placeholder-gray-400
            bg-white dark:bg-gray-800 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-green-400
            transition-all duration-200 cursor-pointer
          "
        />

        {/* Shortcut Badge */}
        <div className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1">
          <kbd className="px-1.5 py-0.5 text-xs border rounded bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
            Ctrl
          </kbd>
          <kbd className="px-1.5 py-0.5 text-xs border rounded bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
            K
          </kbd>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="
            absolute top-full left-0 right-0 mt-2 
            bg-white dark:bg-gray-800 
            border border-gray-200 dark:border-gray-600 
            rounded-lg shadow-xl z-50 
            max-h-80 overflow-y-auto
          "
        >
          {results.length > 0 ? (
            <div className="py-2">
              {results.map((item, index) => (
                <div
                  key={item.title}
                  onClick={() => handleResultSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`
                    px-4 py-3 cursor-pointer transition-colors
                    ${
                      index === selectedIndex
                        ? "bg-green-50 dark:bg-green-900/20 border-l-2 border-green-500"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Command size={14} className="text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      Tab
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : query.trim() !== "" ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              <Search size={24} className="mx-auto mb-2 opacity-50" />
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-1">Try different keywords</p>
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              <Search size={24} className="mx-auto mb-2 opacity-50" />
              <p>Start typing to search...</p>
              <p className="text-sm mt-1">Try "ropa", "data mapping", or "reports"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
