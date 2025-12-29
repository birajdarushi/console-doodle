import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../services/api';

interface LogEntry {
    id: string;
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    category: string;
    message: string;
    details?: string;
}

async function fetchLogs(limit: number): Promise<LogEntry[]> {
    const res = await fetch(`${API_URL}/logs?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch logs');
    return res.json();
}

const LogsPage = () => {
    const [filterCategory, setFilterCategory] = useState<string>('All');

    const { data: logs, isLoading } = useQuery({
        queryKey: ['logs'],
        queryFn: () => fetchLogs(100),
        refetchInterval: 10000,
    });

    const filteredLogs = logs?.filter(log =>
        filterCategory === 'All' || log.category === filterCategory
    );

    return (
        <div className="flex h-full">
            {/* Left: Filters */}
            <div className="w-48 border-r border-terminal-border p-4 space-y-6 hidden md:block">
                <div className="space-y-2">
                    <h3 className="section-title">Category</h3>
                    {['All', 'System', 'Learning', 'Deployment', 'Action'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`block w-full text-left text-sm px-2 py-1 rounded transition-colors ${filterCategory === cat ? 'bg-secondary text-primary' : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Right: Log Stream */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs md:text-sm">
                {isLoading ? (
                    <div className="text-muted-foreground animate-pulse">Loading stream...</div>
                ) : (
                    <div className="space-y-1">
                        {filteredLogs?.map((log) => (
                            <div key={log.id} className={`log-entry log-entry-${log.category.toLowerCase()} group`}>
                                <div className="flex gap-3">
                                    <span className="text-muted-foreground opacity-60 w-32 shrink-0">
                                        [{new Date(log.timestamp).toLocaleString('en-GB')}]
                                    </span>
                                    <span className={`w-12 font-bold ${log.level === 'ERROR' ? 'text-destructive' :
                                            log.level === 'WARN' ? 'text-warning' : 'text-info'
                                        }`}>
                                        {log.level}
                                    </span>
                                    <span className="w-24 text-muted-foreground">{log.category}</span>
                                    <span className="text-foreground group-hover:text-primary transition-colors">
                                        {log.message}
                                    </span>
                                </div>
                                {log.details && (
                                    <div className="pl-[14rem] text-muted-foreground opacity-60 text-xs mt-1">
                                        Details: {log.details}
                                    </div>
                                )}
                            </div>
                        ))}
                        {filteredLogs?.length === 0 && (
                            <div className="text-muted-foreground italic p-4">No logs found for this filter.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogsPage;
