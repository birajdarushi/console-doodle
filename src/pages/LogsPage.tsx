import { useState } from "react";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { TerminalWindow } from "@/components/layout/TerminalWindow";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { LogEntry } from "@/types/start";

type LogCategory = "all" | "learning" | "deployment" | "system" | "action";
type LogSeverity = "all" | "info" | "warn" | "error";

const categoryColors: Record<string, string> = {
  learning: "log-entry-learning",
  deployment: "log-entry-deployment",
  system: "log-entry-system",
  action: "log-entry-action",
};

export const LogsPage = () => {
  const [categoryFilter, setCategoryFilter] = useState<LogCategory>("all");
  const [severityFilter, setSeverityFilter] = useState<LogSeverity>("all");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const { data: logs, isLoading } = useQuery({
    queryKey: ['logs', categoryFilter, severityFilter],
    queryFn: () => api.getLogs({
      category: categoryFilter,
      severity: severityFilter
    }),
    refetchInterval: 5000
  });

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "error": return "text-destructive";
      case "warn": return "text-warning";
      default: return "text-muted-foreground";
    }
  };

  if (isLoading && !logs) return <div className="p-4 text-muted-foreground flex gap-2"><Loader2 className="animate-spin" /> Loading logs...</div>;

  // Client side backup filtering if needed, but API handles it
  const filteredLogs = logs || [];


  return (
    <div className="max-w-6xl space-y-6 mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-terminal-highlight">Logs</h1>
        <p className="helper-text mt-1">Immutable historical records. Logs are append-only and cannot be modified.</p>
      </div>

      <div className="flex gap-6">
        {/* Filters - Left Column */}
        <div className="w-48 flex-shrink-0">
          <TerminalWindow title="filters">
            <div className="space-y-6">
              {/* Time Range */}
              <div>
                <span className="section-title">time range</span>
                <select className="w-full mt-2 bg-muted border border-border rounded px-2 py-1.5 text-sm text-foreground">
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="all">All time</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <span className="section-title">category</span>
                <div className="mt-2 space-y-1">
                  {(["all", "learning", "deployment", "system", "action"] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`w-full text-left px-2 py-1 text-sm rounded transition-colors ${categoryFilter === cat
                        ? "bg-success/10 text-success"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                    >
                      {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div>
                <span className="section-title">severity</span>
                <div className="mt-2 space-y-1">
                  {(["all", "info", "warn", "error"] as const).map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSeverityFilter(sev)}
                      className={`w-full text-left px-2 py-1 text-sm rounded transition-colors ${severityFilter === sev
                        ? "bg-success/10 text-success"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                    >
                      {sev === "all" ? "All" : sev.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TerminalWindow>
        </div>

        {/* Log Stream - Right Column */}
        <div className="flex-1">
          <TerminalWindow title="stdout">
            <div className="space-y-0">
              {filteredLogs.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">No logs match the current filters</p>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedLog === log.id;

                  return (
                    <div key={log.id}>
                      <button
                        onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                        className={`log-entry w-full text-left ${categoryColors[log.category]}`}
                      >
                        <div className="flex items-start gap-3">
                          {isExpanded ? (
                            <ChevronDown size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                          ) : (
                            <ChevronRight size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                          )}
                          <span className="text-terminal-text-dim text-xs w-36 flex-shrink-0">
                            {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <span className={`text-xs w-12 flex-shrink-0 uppercase ${getSeverityColor(log.severity)}`}>
                            {log.severity}
                          </span>
                          <span className="text-foreground flex-1">{log.message}</span>
                        </div>
                      </button>

                      {isExpanded && log.details && (
                        <div className="ml-12 pl-4 py-2 border-l border-border bg-muted/20">
                          {Object.entries(log.details).map(([key, value]) => (
                            <div key={key} className="flex gap-2 text-sm">
                              <span className="text-terminal-text-dim">{key}:</span>
                              <span className="text-foreground">{value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </TerminalWindow>
        </div>
      </div>
    </div>
  );
};
