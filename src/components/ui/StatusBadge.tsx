interface StatusBadgeProps {
  status: "healthy" | "warning" | "error" | "info";
  children: React.ReactNode;
  pulse?: boolean;
}

export const StatusBadge = ({ status, children, pulse = false }: StatusBadgeProps) => {
  const statusClasses = {
    healthy: "status-healthy",
    warning: "status-warning",
    error: "status-error",
    info: "status-info",
  };

  return (
    <span className={`status-badge ${statusClasses[status]}`}>
      {pulse && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          status === "healthy" ? "bg-success" :
          status === "warning" ? "bg-warning" :
          status === "error" ? "bg-destructive" :
          "bg-info"
        } animate-pulse-slow`} />
      )}
      {children}
    </span>
  );
};
