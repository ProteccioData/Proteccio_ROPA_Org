import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./components/ui/ToastProvider.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./i18n/config.js"; // Initialize i18n
import { KeyboardNavProvider } from "./context/KeyboardNavContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <KeyboardNavProvider>
            <App />
          </KeyboardNavProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
