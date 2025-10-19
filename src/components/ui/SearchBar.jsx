import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="relative w-full">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        placeholder="Start searching..."
        className="w-full border border-[#828282] dark:border-gray-500 rounded-full py-1.5 sm:py-2 pl-9 pr-3 text-sm 
                   placeholder-gray-400 focus:outline-none focus:ring-2 
                   focus:ring-green-400 focus:border-green-400"
      />
    </div>
  );
}
