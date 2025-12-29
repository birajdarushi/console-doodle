export interface Deployment {
    id: string;
    project: string;
    status: "success" | "running" | "failed";
    time: string; // "2h ago" - backend can send timestamp, frontend formats it, or backend formats it. Let's say backend sends ISO string, frontend formats.
    details: {
        description: string;
        github: string;
        deployedUrl?: string;
        private?: boolean;
        strategy: string;
        pipeline: { stage: string; status: "complete" | "running" | "pending" | "failed" }[];
        decisions: string[];
    };
}

export interface Incident {
    id: string;
    title: string;
    date: string; // ISO Date
    impact: string;
    rootCause: string;
    status: "resolved";
    timeline: { time: string; action: string; detail: string }[];
    learning: string;
}

export interface LogEntry {
    id: string;
    timestamp: string;
    category: "learning" | "deployment" | "system" | "action";
    severity: "info" | "warn" | "error";
    message: string;
    details?: Record<string, string>;
}

export interface SystemStatus {
    learningToday: string;
    yearGoal: string;
    resumeUrl?: string;
    currentRole: {
        title: string;
        company: string;
        url: string;
        status: string;
    };
    systemHealth: {
        infra: "Healthy" | "Degraded" | "Unreachable";
        visitors: number;
        lastDeployment: string;
        region: string;
    };
    metrics24h: {
        deployments: number;
        activity: number;
        errors: number;
    };
    lastUpdate: string;
}
