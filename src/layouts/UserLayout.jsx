import React, { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../components/Sidebar.css";
import "../styles/user-theme.css";
import "../styles/user-pages-glass.css";
import "./UserLayout.css";

const DEFAULT_USER = {
  name: "John Driver",
  fleetId: "FL-2024",
};

function readShellUser() {
  try {
    return {
      name: localStorage.getItem("userName") || DEFAULT_USER.name,
      fleetId: localStorage.getItem("fleetId") || DEFAULT_USER.fleetId,
    };
  } catch {
    return { ...DEFAULT_USER };
  }
}

/**
 * Sidebar user line comes from localStorage (set at login/signup/profile save).
 * Avoids an extra /users/me/ round-trip on every dashboard navigation.
 */
function UserLayout() {
  const { pathname } = useLocation();
  const user = useMemo(() => readShellUser(), [pathname]);

  return (
    <div className="user-app-shell">
      <Sidebar userData={user} />
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

export default UserLayout;
