import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../components/Sidebar.css";
import "../styles/user-theme.css";
import "../styles/admin-pages-glass.css";

const ADMIN_USER = {
  name: "System Admin",
  fleetId: "ADMIN-001",
};

/**
 * Same shell as user routes: gradient background + floating sidebar,
 * without the top profile bar or page header avatar strip.
 */
function AdminLayout() {
  return (
    <div className="user-app-shell">
      <Sidebar role="admin" userData={ADMIN_USER} />
      <div className="user-app-shell__main">
        <div className="user-app-shell__content">
          <div className="user-app-shell__outlet">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
