import { CirclePlus } from "lucide-react";

export default function Button({
  onClick,
  text = "Add Organization",
  icon: Icon,
  iconSrc,
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 bg-[#5DEE92] text-black 
                 font-medium px-3 sm:px-4 py-2 rounded-md hover:opacity-90
                 focus:outline-none focus:ring-2 focus:ring-green-300 
                 transition cursor-pointer"
    >
      <CirclePlus className="h-4 w-4"  />
      <span className="hidden sm:inline md:text-sm pr-2">{text}</span>
    </button>
  );
}
