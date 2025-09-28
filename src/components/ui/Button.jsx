export default function AddOrgButton({
  onClick,
  text = "Add Organization",
  icon: Icon,
  iconSrc,
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 bg-[#5DEE92] text-black 
                 font-medium px-3 sm:px-4 py-2 rounded-md hover:bg-green-500 
                 focus:outline-none focus:ring-2 focus:ring-green-300 
                 transition cursor-pointer"
    >
      {Icon && <Icon size={16} />}
      {iconSrc && (
        <img src={iconSrc} alt="Add icon" className="h-6 w-6 object-contain" />
      )}
      <span className="hidden sm:inline md:text-sm pr-2">{text}</span>
    </button>
  );
}
