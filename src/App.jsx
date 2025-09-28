import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Footer from "./components/layout/Footer";
import Home from "./components/pages/Home";

export default function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white text-black transition-colors duration-300">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Topbar />
      </div>

      <div className={`flex flex-1 pt-16`}>
        <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] z-40">
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        <main
          className={`flex-1 overflow-y-auto bg-white dark:bg-gray-900 text-black
            p-6
          transition-all duration-300 
      ${collapsed ? "ml-24" : "ml-48"}`}
          // style={{ minHeight: "calc(100vh - 4rem)" }} // ensures main fills viewport minus topbar
        >
          <Home />
        </main>
      </div>

      <Footer collapsed={collapsed} />
    </div>
  );
}
