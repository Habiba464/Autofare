// src/components/Sidebar.jsx

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Car, Wallet, User } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import "./Sidebar.css";
import mustLogo from "../assets/PicTures/Must_Without_BackGround.jpg";

function Sidebar({ userData, role = "user" }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const defaultUserData = {
    name: "John Driver",
    fleetId: "FL-2024",
  };

  const currentUserData = userData || defaultUserData;

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
      labelKey: "sidebar.dashboard",
      userPath: "/dashboard",
      adminPath: "/admin/dashboard",
      roles: ["user", "admin"],
    },
    {
      key: "trips",
      icon: Car,
      labelKey: "sidebar.trips",
      userPath: "/dashboard/trips",
      adminPath: "/admin/trips",
      roles: ["user", "admin"],
    },
    {
      key: "wallet",
      icon: Wallet,
      labelKey: "sidebar.wallet",
      userPath: "/dashboard/wallet",
      adminPath: "/admin/wallet",
      roles: ["user", "admin"],
    },
    {
      key: "profile",
      icon: User,
      labelKey: "sidebar.profile",
      userPath: "/dashboard/profile",
      adminPath: null,
      roles: ["user"],
    },
  ];

  const menuItems = allMenuItems
    .filter((item) => item.roles.includes(role))
    .map((item) => ({
      ...item,
      label: t(item.labelKey),
      path: role === "admin" && item.adminPath ? item.adminPath : item.userPath,
    }));

  const isActive = (path) => {
    if (path === "/dashboard" || path === "/admin/dashboard") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar sidebar--floating" aria-label="Main navigation">
      <div className="sidebar-floating-inner">
        <div className="sidebar-header sidebar-header--floating">
          <button
            type="button"
            className="sidebar-logo-btn"
            onClick={() => navigate("/")}
            title={t("sidebar.homeTitle")}
          >
            <img
              src={mustLogo}
              alt="Misr-Gate"
              className="sidebar-logo-img sidebar-logo-img--floating"
            />
          </button>
          <LanguageSwitcher variant="sidebar" />
        </div>

        <nav className="sidebar-menu sidebar-menu--floating" aria-label="Primary">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                type="button"
                className={`sidebar-nav-icon ${active ? "active" : ""}`}
                onClick={() => navigate(item.path)}
                title={item.label}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={22} strokeWidth={1.75} aria-hidden />
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer sidebar-footer--floating">
          <button
            type="button"
            className="sidebar-user-orb"
            onClick={() => role === "user" && navigate("/dashboard/profile")}
            title={currentUserData.name}
            aria-label={t("sidebar.account", { name: currentUserData.name })}
          >
            {getInitials(currentUserData.name)}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
