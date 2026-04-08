// src/components/Sidebar.jsx

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Car, Wallet, User } from "lucide-react";
import "./Sidebar.css";

function Sidebar({ userData, role = "user" }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Default userData if not provided
  const defaultUserData = {
    name: "John Driver",
    fleetId: "FL-2024",
  };

  const currentUserData = userData || defaultUserData;

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const allMenuItems = [
    {
      key: "dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      userPath: "/dashboard",
      adminPath: "/admin/dashboard",
      roles: ["user", "admin"],
    },
    {
      key: "trips",
      icon: Car,
      label: "Trips",
      userPath: "/dashboard/trips",
      adminPath: "/admin/trips",
      roles: ["user", "admin"],
    },
    {
      key: "wallet",
      icon: Wallet,
      label: "Wallet & Payments",
      userPath: "/dashboard/wallet",
      adminPath: "/admin/wallet",
      roles: ["user", "admin"],
    },
    {
      key: "profile",
      icon: User,
      label: "Profile & Settings",
      userPath: "/dashboard/profile",
      adminPath: null,
      roles: ["user"], // admins don't see profile in sidebar
    },
  ];

  const menuItems = allMenuItems
    .filter((item) => item.roles.includes(role))
    .map((item) => ({
      ...item,
      path: role === "admin" && item.adminPath ? item.adminPath : item.userPath,
    }));

  const isActive = (path) => {
    if (path === "/dashboard" || path === "/admin/dashboard") {
      return location.pathname === path;
    }

    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" />
          <div>
            <h3>AutoFare</h3>
            <p>{role === "admin" ? "Admin Panel" : "Driver"}</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              type="button"
              className={`sidebar-menu-item ${active ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-info">
          <div className="sidebar-user-avatar">
            {currentUserData.photoUrl ? (
              <img
                src={currentUserData.photoUrl}
                alt=""
                className="sidebar-user-avatar-img"
              />
            ) : (
              getInitials(currentUserData.name)
            )}
          </div>
          <div>
            <h4>{currentUserData.name}</h4>
            <p>
              {role === "admin"
                ? "System Administrator"
                : `Fleet ID: ${currentUserData.fleetId}`}
            </p>
          </div>
          <button type="button" className="sidebar-settings-btn">
            →
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
