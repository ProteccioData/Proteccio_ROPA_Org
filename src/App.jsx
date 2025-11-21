import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Footer from "./components/layout/Footer";
import Home from "./components/pages/Home";
import { Route, Routes, useLocation } from "react-router-dom";
import RoPA from "./components/pages/RoPA";
import Assessments from "./components/pages/Assessments";
import DataMapping from "./components/pages/DataMapping";
import Setup from "./components/pages/Setup";
import AuditLogs from "./components/pages/AuditLogs";
import ReportsPage from "./components/pages/Reports";
import UserManagement from "./components/pages/UserManagement";
import SettingsPage from "./components/pages/Settings";
import AddROPAModal from "./components/modules/AddRoPA";
import ProfileSettings from "./components/pages/ProfileSettings";
import ArticlesPage from "./components/pages/Article";
import ArticleDetail from "./components/pages/ArticleDetail";
import ActionDashboard from "./components/pages/ActionItem";
import Login from "./components/pages/Login";
import ProtectedRoute from "./components/modules/ProtectedRoute";

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const hideLayout = location.pathname === "/login";

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-black transition-colors duration-300">
      {/* Topbar */}
      {!hideLayout && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Topbar />
        </div>
      )}

      {/* Main layout */}
      <div className={`flex flex-1 ${!hideLayout ? "pt-16" : ""}`}>
        {/* Sidebar */}
        {!hideLayout && (
          <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] z-40">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
          </div>
        )}

        {/* Page content */}
        <main
          className={`flex-1 overflow-y-auto bg-green-50 dark:bg-gray-900 transition-all duration-300 
            ${!hideLayout ? "p-6" : ""}
            ${!hideLayout ? (collapsed ? "ml-24" : "ml-48") : ""}
          `}
        >
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            <Route
              path="/RoPA"
              element={
                <ProtectedRoute>
                  <RoPA />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessments"
              element={
                <ProtectedRoute>
                  <Assessments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/data-mapping"
              element={
                <ProtectedRoute>
                  <DataMapping />
                </ProtectedRoute>
              }
            />
            <Route
              path="/setup"
              element={
                <ProtectedRoute>
                  <Setup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-setup"
              element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/new-ropa"
              element={
                <ProtectedRoute>
                  <AddROPAModal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile-settings"
              element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/articles"
              element={
                <ProtectedRoute>
                  <ArticlesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/article/:id"
              element={
                <ProtectedRoute>
                  <ArticleDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/action-item"
              element={
                <ProtectedRoute>
                  <ActionDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>

      {!hideLayout && <Footer collapsed={collapsed} />}
    </div>
  );
}
