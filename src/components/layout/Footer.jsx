export default function Footer({ collapsed }) {
  return (
    <footer
      className={`h-12 bg-[#FAFAFA] dark:bg-gray-800 dark:text-gray-400 border-t dark:border-gray-600 flex items-center justify-between px-8 py-4 text-sm z-40
        transition-all duration-300
        ${collapsed ? "ml-24 w-[calc(100%-6rem)]" : "ml-48 w-[calc(100%-12rem)]"}`}
    >
      {/* Left */}
      <span className="text-black dark:text-gray-400">
        © 2025 Proteccio Data
      </span>

      {/* Right */}
      <div className="flex gap-8">
        <a
          href="/terms"
          className="text-black dark:text-gray-400 hover:text-gray-500 transition"
        >
          Terms of Service
        </a>
        <a
          href="/support"
          className="text-black dark:text-gray-400 hover:text-gray-500 transition"
        >
          Support
        </a>
      </div>
    </footer>
  )
}
