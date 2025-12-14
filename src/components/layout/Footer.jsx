import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { addTranslationNamespace } from "../../i18n/config";

export default function Footer({ collapsed }) {
  const { t , ready } = useTranslation("layout", { keyPrefix: "Footer" });
  
  // useEffect(() => {
  //   addTranslationNamespace("en", "layout", "Footer");
  //   addTranslationNamespace("hindi", "layout", "Footer");
  //   addTranslationNamespace("sanskrit", "layout", "Footer");
  //   addTranslationNamespace("telugu", "layout", "Footer");
  // }, []);

  if (!ready) {
    return null;
  }

  return (
    <footer
      className={`h-12 bg-[#FAFAFA] dark:bg-gray-800 dark:text-gray-400 border-t dark:border-gray-600 flex items-center justify-between px-8 py-4 text-sm z-40
        transition-all duration-300
        ${
          collapsed ? "ml-24 w-[calc(100%-6rem)]" : "ml-48 w-[calc(100%-12rem)]"
        }`}
    >
      {/* Left */}
      <span className="text-black dark:text-gray-400">
        {t("2025_proteccio_data")}
      </span>

      {/* Right */}
      <div className="flex gap-8">
        <a
          href="/terms-of-service"
          className="text-black dark:text-gray-400 hover:text-gray-500 transition"
        >
          {t("terms_of_service")}
        </a>
        {/* <a
          href="/support"
          className="text-black dark:text-gray-400 hover:text-gray-500 transition"
        >
          {t("support")}
        </a> */}
      </div>
    </footer>
  );
}
