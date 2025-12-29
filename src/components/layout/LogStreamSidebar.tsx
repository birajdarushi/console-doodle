import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Loader2 } from 'lucide-react';

export const LogStreamSidebar = () => {
    const { data: logs, isLoading } = useQuery({
        queryKey: ['logs', 'stream'],
        queryFn: () => api.getLogs({ limit: 20 }), // Fetch last 20 logs
        refetchInterval: 5000 // Poll every 5 seconds for "live" feel
    });

    const getLogClass = (type: string) => {
        switch (type.toLowerCase()) {
            case "learning": return "log-entry-learning";
            case "deployment": return "log-entry-deployment";
            case "action": return "log-entry-action";
            case "error": return "log-entry-error";
            default: return "log-entry-system";
        }
    };

    const getTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case "learning": return "text-primary";
            case "deployment": return "text-success";
            case "action": return "text-warning";
            case "error": return "text-destructive";
            default: return "text-muted-foreground";
        }
    };

    return (
        <aside className="w-80 bg-terminal-bg flex flex-col border-l border-terminal-border shrink-0">
            {/* Header */}
            <div className="px-4 py-3 border-b border-terminal-border">
                <span className="section-title">LOG STREAM</span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {isLoading ? (
                    <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
                ) : (
                    <div>
                        {logs?.map((log, index) => (
                            <div key={log.id}>
                                <div className={`log-entry ${getLogClass(log.category)}`}>
                                    <div className="flex items-start gap-2">
                                        <span className="text-terminal-text-dim text-xs shrink-0">
                                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                                        </span>
                                        <div>
                                            <span className={`text-xs font-medium ${getTypeColor(log.category)}`}>
                                                {log.category.charAt(0).toUpperCase() + log.category.slice(1)}:
                                            </span>
                                            <p className="text-xs text-foreground mt-0.5">{log.message}</p>
                                        </div>
                                    </div>
                                </div>
                                {index < (logs.length - 1) && (
                                    <div className="border-t border-dashed border-muted mx-3" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-terminal-border">
                <p className="helper-text">Logs are immutable records</p>
            </div>
        </aside>
    );
};
