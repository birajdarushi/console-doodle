import { Deployment, Incident, LogEntry, SystemStatus } from "../types/start";

// DYNAMIC API URL
// In development: http://127.0.0.1:3000/api
// In production: /api (relative, so it hits the same domain)
const API_URL = import.meta.env.PROD
    ? "/api"
    : "http://127.0.0.1:3000/api";

export const api = {
    // Status
    getStatus: async (): Promise<SystemStatus> => {
        const res = await fetch(`${API_URL}/status`);
        if (!res.ok) throw new Error("Failed to fetch status");
        return res.json();
    },

    // Deployments
    getDeployments: async (): Promise<Deployment[]> => {
        const res = await fetch(`${API_URL}/deployments`);
        if (!res.ok) throw new Error("Failed to fetch deployments");
        return res.json();
    },

    // Incidents
    getIncidents: async (): Promise<Incident[]> => {
        const res = await fetch(`${API_URL}/incidents`);
        if (!res.ok) throw new Error("Failed to fetch incidents");
        return res.json();
    },

    // Logs
    getLogs: async (filters?: { category?: string; severity?: string; limit?: number }): Promise<LogEntry[]> => {
        const params = new URLSearchParams();
        if (filters?.category && filters.category !== 'all') params.append("category", filters.category);
        if (filters?.severity && filters.severity !== 'all') params.append("severity", filters.severity);
        if (filters?.limit) params.append("limit", filters.limit.toString());

        const res = await fetch(`${API_URL}/logs?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch logs");
        return res.json();
    },

    // Action (Resume Download)
    logAction: async (action: string, details?: Record<string, string>) => {
        return fetch(`${API_URL}/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, details }),
        });
    }
};
