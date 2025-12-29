import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { TerminalWindow } from "@/components/layout/TerminalWindow";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Incident } from "@/types/start";

export const IncidentsPage = () => {
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);

  const { data: incidents, isLoading } = useQuery<Incident[]>({
    queryKey: ['incidents'],
    queryFn: api.getIncidents
  });

  if (isLoading) return <div className="p-4 text-muted-foreground flex gap-2"><Loader2 className="animate-spin" /> Loading incidents...</div>;

  return (
    <div className="max-w-4xl space-y-6 mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-terminal-highlight">Incidents</h1>
        <p className="helper-text mt-1">Resolved incidents and post-mortems. Learning from failure builds resilience.</p>
      </div>

      <div className="space-y-4">
        {incidents?.map((incident) => {
          const isExpanded = expandedIncident === incident.id;

          return (
            <TerminalWindow key={incident.id} title={incident.id}>
              <div>
                {/* Header - Clickable */}
                <button
                  onClick={() => setExpandedIncident(isExpanded ? null : incident.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown size={16} className="text-muted-foreground" />
                        ) : (
                          <ChevronRight size={16} className="text-muted-foreground" />
                        )}
                        <h3 className="font-medium text-terminal-highlight">{incident.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 ml-7">{incident.date}</p>
                    </div>
                    <StatusBadge status="healthy">
                      <CheckCircle2 size={12} />
                      resolved
                    </StatusBadge>
                  </div>
                </button>

                {/* Summary - Always Visible */}
                <div className="mt-4 ml-7 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="section-title">impact</span>
                    <p className="text-sm text-foreground">{incident.impact}</p>
                  </div>
                  <div>
                    <span className="section-title">root cause</span>
                    <p className="text-sm text-foreground">{incident.rootCause}</p>
                  </div>
                </div>

                {/* Expanded Timeline */}
                {isExpanded && (
                  <div className="mt-6 ml-7 border-t border-border pt-4">
                    <span className="section-title">incident timeline</span>
                    <div className="mt-3 space-y-3">
                      {incident.timeline.map((event, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <span className="text-xs text-terminal-text-dim font-medium w-12">
                            {event.time}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{event.action}</p>
                            <p className="text-sm text-muted-foreground">{event.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-3 bg-muted/30 rounded border border-border">
                      <span className="section-title">key learning</span>
                      <p className="text-sm text-foreground">{incident.learning}</p>
                    </div>
                  </div>
                )}
              </div>
            </TerminalWindow>
          );
        })}
      </div>
    </div>
  );
};
