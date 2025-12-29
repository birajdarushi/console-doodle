import { Activity, Rocket, AlertTriangle, ScrollText, User, Download } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { api } from "@/services/api";

const navItems = [
  { path: "/", label: "Status", icon: Activity },
  { path: "/deployments", label: "Deployments", icon: Rocket },
  { path: "/incidents", label: "Incidents", icon: AlertTriangle },
  { path: "/logs", label: "Logs", icon: ScrollText },
  { path: "/about", label: "About", icon: User },
];

export const Sidebar = () => {
  const location = useLocation();

  const handleDownload = async () => {
    try {
      await api.logAction("Resume Downloaded", { source: "sidebar", format: "pdf" });
      console.log("[ACTION] Resume download logged");
      // here we would trigger actual file download
      alert("Resume Download Started (Logged to Backend)");
    } catch (e) {
      console.error("Failed to log download", e);
    }
  };

  return (
    <aside className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="status-dot" />
          <span className="text-sm text-card-foreground font-medium">ops.console</span>
        </div>
        <p className="text-xs text-terminal-text-dim mt-1">v1.0.0 • production</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? "nav-item-active" : ""}`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Divider */}
        <div className="section-divider" />

        {/* Download Resume Action */}
        <button
          onClick={handleDownload}
          className="nav-item w-full text-left group"
        >
          <Download size={16} className="group-hover:text-primary transition-colors" />
          <span>Download Resume</span>
        </button>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-terminal-text-dim">
          Last sync: just now
        </p>
      </div>
    </aside>
  );
};
