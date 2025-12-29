import { useState } from "react";
import { ExternalLink, X, CheckCircle2, Clock, AlertCircle, Loader2, Lock, Unlock } from "lucide-react";
import { TerminalWindow } from "@/components/layout/TerminalWindow";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Deployment } from "@/types/start";

export const DeploymentsPage = () => {
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);

  const { data: deployments, isLoading } = useQuery({
    queryKey: ['deployments'],
    queryFn: api.getDeployments
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
      case "complete":
        return <CheckCircle2 size={14} className="text-success" />;
      case "running":
      case "pending":
        return <Clock size={14} className="text-warning animate-pulse" />;
      case "failed":
        return <AlertCircle size={14} className="text-destructive" />;
      default:
        return <Clock size={14} className="text-muted-foreground" />;
    }
  };

  if (isLoading) return <div className="p-4 text-muted-foreground flex gap-2"><Loader2 className="animate-spin" /> Loading deployments...</div>;


  return (
    <div className="flex gap-6 relative min-h-full">
      {/* Main Content */}
      <div className={`flex-1 max-w-4xl space-y-6 transition-all mx-auto ${selectedDeployment ? "mr-96" : ""}`}>
        <div>
          <h1 className="text-xl font-semibold text-terminal-highlight">Deployments</h1>
          <p className="helper-text mt-1">CI/CD pipeline history and project deployments</p>
        </div>

        <TerminalWindow title="deployments.log">
          <div className="space-y-1">
            <div className="grid grid-cols-12 gap-4 text-xs text-terminal-text-dim pb-2 border-b border-border">
              <span className="col-span-5">PROJECT</span>
              <span className="col-span-3">STATUS</span>
              <span className="col-span-4">TIME</span>
            </div>

            {deployments?.map((deployment) => (
              <button
                key={deployment.id}
                onClick={() => setSelectedDeployment(deployment)}
                className={`w-full grid grid-cols-12 gap-4 py-3 px-2 text-left hover:bg-muted/30 rounded transition-colors ${selectedDeployment?.id === deployment.id ? "bg-muted/50" : ""
                  }`}
              >
                <div className="col-span-5 overflow-hidden flex flex-col justify-center">
                  <span className="text-foreground font-medium truncate">
                    {deployment.project}
                  </span>
                  <span className="text-xs text-muted-foreground truncate font-mono opacity-80">
                    ↳ {deployment.details.description}
                  </span>
                </div>
                <span className="col-span-3">
                  <StatusBadge status={deployment.status === "success" ? "healthy" : deployment.status === "running" ? "warning" : "error"}>
                    {deployment.status}
                  </StatusBadge>
                </span>
                <span className="col-span-4 text-muted-foreground text-sm">
                  {new Date(deployment.time).toLocaleDateString()} {/* Basic formatting for now */}
                </span>
              </button>
            ))}
            {deployments?.length === 0 && <div className="p-4 text-muted-foreground">No deployments found.</div>}
          </div>
        </TerminalWindow>
      </div>

      {/* Side Drawer */}
      {selectedDeployment && (
        <div className="absolute right-0 top-0 h-full w-96 bg-card border-l border-border p-6 overflow-y-auto shadow-2xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-terminal-highlight">
                {selectedDeployment.project}
              </h2>
              <StatusBadge status="healthy" pulse>
                {selectedDeployment.status}
              </StatusBadge>
            </div>
            <button
              onClick={() => setSelectedDeployment(null)}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Description */}
            <div>
              <span className="section-title">description</span>
              <p className="text-sm text-foreground">{selectedDeployment.details.description}</p>
            </div>

            {/* Live Link (if available) */}
            {selectedDeployment.details.deployedUrl && (
              <div>
                <a
                  href={selectedDeployment.details.deployedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-link text-sm text-success"
                >
                  <ExternalLink size={14} />
                  <span>View Live</span>
                </a>
              </div>
            )}

            {/* GitHub Link */}
            <div>
              <a
                href={selectedDeployment.details.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-link text-sm flex items-center gap-2"
              >
                {selectedDeployment.details.private ? (
                  <Lock size={14} className="text-warning" />
                ) : (
                  <Unlock size={14} className="text-muted-foreground" />
                )}
                <span>View on GitHub</span>
                <ExternalLink size={12} className="ml-1 opacity-50" />
              </a>
            </div>

            {/* Strategy */}
            <div>
              <span className="section-title">deployment strategy</span>
              <p className="text-sm metric-value">{selectedDeployment.details.strategy}</p>
            </div>

            {/* Pipeline */}
            <div>
              <span className="section-title">pipeline</span>
              <div className="mt-2 space-y-2">
                {selectedDeployment.details.pipeline.map((stage, index) => (
                  <div
                    key={stage.stage}
                    className="flex items-center gap-3 text-sm"
                  >
                    {getStatusIcon(stage.status)}
                    <span className="text-muted-foreground w-4">{index + 1}.</span>
                    <span className={stage.status === "complete" ? "text-foreground" : "text-muted-foreground"}>
                      {stage.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Decisions */}
            <div>
              <span className="section-title">key decisions</span>
              <ul className="mt-2 space-y-2">
                {selectedDeployment.details.decisions.map((decision, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-terminal-text-dim">•</span>
                    <span>{decision}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
