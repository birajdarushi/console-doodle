import { ExternalLink, ArrowRight, Loader2, AlertCircle, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export const StatusPage = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["status"],
    queryFn: api.getStatus,
    refetchInterval: 30000
  });

  const generateAsciiBar = (count: number, max: number = 20) => {
    const intensity = Math.min(Math.max(count / max, 0.1), 1);
    const length = 12;
    const filled = Math.ceil(length * intensity);
    // Uses different chars for texture: ░ ▒ ▓ █ or just . : | 
    // User asked for "subtle ASCII bars"
    // Let's go with a classic:  ..::|||
    const chars = ".:|";
    let bar = "";
    for (let i = 0; i < length; i++) {
      if (i < filled) bar += chars[Math.min(Math.floor((i / length) * chars.length), chars.length - 1)];
      else bar += ".";
    }
    // actually simpler: repeat '|' or 'I' or blocks.
    // Let's use the requested style: ..I..I..
    // Or just simple blocks suitable for a "bar"
    // Let's try: ▂▃▅▆▇  (Unicode blocks might be too fancy / non-ascii)
    // Let's stick to simple pipe/dot:  ||||......

    return "||||||||||||".slice(0, filled).padEnd(length, '.');
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground animate-pulse gap-2">
        <Loader2 className="animate-spin" size={20} />
        <span>Establishing handshake...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-destructive gap-2">
        <AlertCircle size={20} />
        <span>System Unreachable: {error?.message || "Check connection"}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto relative">
      {/* Background Telemetry Texture */}
      <div className="absolute inset-0 bg-scanline pointer-events-none opacity-50 z-0" />

      <div className="relative z-10 space-y-6">
        {/* Identity Header */}
        <div>
          <h1 className="text-xl font-semibold text-card-foreground tracking-wide">Rushiraj Birajdar</h1>
          <p className="text-foreground text-sm mt-1">{data.currentRole.title}</p>
        </div>

        {/* Current State Section */}
        <div>
          <span className="section-title">CURRENT STATE</span>
          <div className="section-divider" />

          <div className="space-y-4 mt-4">
            {/* Learning Today */}
            <div>
              <p className="text-xs text-terminal-text-dim mb-1">What I'm learning today</p>
              <p className="text-primary font-medium">{data.learningToday}</p>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">↳ auto-synced daily</p>
            </div>

            {/* Year Goal */}
            <div>
              <p className="text-xs text-terminal-text-dim mb-1">Year goal</p>
              <p className="metric-value">{data.yearGoal}</p>
            </div>

            {/* Current Role */}
            <div>
              <p className="text-xs text-terminal-text-dim mb-1">Current role</p>
              <a
                href="https://www.linkedin.com/in/rushirajbirajdar/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-link text-sm"
              >
                <Linkedin size={14} className="text-blue-400" />
                <span>{data.currentRole.status} @ {data.currentRole.company}</span>
              </a>
            </div>
          </div>
        </div>

        {/* System Health Section */}
        <div>
          <span className="section-title">SYSTEM HEALTH</span>
          <div className="section-divider" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <div className="space-y-3">
              {/* Infra Health */}
              <div className="flex items-center gap-2">
                <p className="text-xs text-terminal-text-dim w-32">Infra health</p>
                <div className="flex items-center gap-2">
                  <div className={`status-dot ${data.systemHealth.infra === 'Healthy' ? 'bg-success' : 'bg-warning'}`} />
                  <span className={`text-sm ${data.systemHealth.infra === 'Healthy' ? 'text-primary' : 'text-warning'}`}>
                    {data.systemHealth.infra}
                  </span>
                </div>
              </div>

              {/* Uptime -> Visitors */}
              <div className="flex items-center gap-2">
                <p className="text-xs text-terminal-text-dim w-32">Total visitors</p>
                <p className="metric-value text-sm">{data.systemHealth.visitors}</p>
              </div>

              {/* Last Deployment */}
              <div className="flex items-center gap-2">
                <p className="text-xs text-terminal-text-dim w-32">Last deployment</p>
                <p className="metric-value text-sm">{data.systemHealth.lastDeployment}</p>
              </div>

              {/* Region */}
              <div className="flex items-center gap-2">
                <p className="text-xs text-terminal-text-dim w-32">Region</p>
                <p className="metric-value text-sm">{data.systemHealth.region}</p>
              </div>
            </div>

            {/* NEW: Dynanmic Metrics (24h) */}
            <div className="space-y-3">
              <p className="text-xs text-terminal-text-dim mb-2">METRICS (24h)</p>

              <div className="flex items-center gap-4">
                <p className="text-xs text-muted-foreground w-24">Deployments</p>
                <p className="font-mono text-xs text-muted-foreground tracking-widest opacity-80">
                  {generateAsciiBar(data.metrics24h?.deployments || 0, 5)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-xs text-muted-foreground w-24">Activity</p>
                <p className="font-mono text-xs text-muted-foreground tracking-widest opacity-80">
                  {generateAsciiBar(data.metrics24h?.activity || 0, 50)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-xs text-muted-foreground w-24">Errors</p>
                <p className="font-mono text-xs text-destructive tracking-widest opacity-80">
                  {generateAsciiBar(data.metrics24h?.errors || 0, 5)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 flex items-center justify-between">
          <div>
            <p className="helper-text">
              Last sync: {new Date(data.lastUpdate).toLocaleTimeString()}
            </p>
            <Link to="/logs" className="inline-link text-sm mt-2 inline-flex group">
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              <span>view logs</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

