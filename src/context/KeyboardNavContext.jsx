import { createContext, useContext, useEffect, useState } from "react";

const KeyboardNavContext = createContext(null);

export function KeyboardNavProvider({ children }) {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem("keyboardNav") !== "false";
  });

  // Apply globally + persist
  useEffect(() => {
    const root = document.documentElement;

    if (!enabled) {
      root.classList.add("keyboard-nav-disabled");
    } else {
      root.classList.remove("keyboard-nav-disabled");
    }

    localStorage.setItem("keyboardNav", enabled ? "true" : "false");
  }, [enabled]);

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "keyboardNav") {
        setEnabled(e.newValue !== "false");
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <KeyboardNavContext.Provider
      value={{
        keyboardNavEnabled: enabled,
        setKeyboardNavEnabled: setEnabled,
      }}
    >
      {children}
    </KeyboardNavContext.Provider>
  );
}

export function useKeyboardNav() {
  const ctx = useContext(KeyboardNavContext);
  if (!ctx) {
    throw new Error("useKeyboardNav must be used inside KeyboardNavProvider");
  }
  return ctx;
}
