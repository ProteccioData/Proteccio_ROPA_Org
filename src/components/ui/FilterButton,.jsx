import { useState, useRef, useEffect } from "react";
import { Filter } from "lucide-react";

export default function FilterDropdown({ options = [], onSelect }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Filter");
  const ref = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    setSelected(option.label);
    onSelect(option);
    setOpen(false); 
  };

  return (
    <div className="relative" ref={ref}>
      {/* Filter Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 bg-[#5DEE92] text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-500 transition cursor-pointer"
      >
        <Filter size={16} />
        {selected}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {options.map((option, index) => (
            <div
              key={index}
              onMouseDown={() => handleSelect(option)} 
              className="w-full px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
