import { prisma } from '../app';

export enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR'
}

export enum LogCategory {
    SYSTEM = 'System',
    DEPLOYMENT = 'Deployment',
    LEARNING = 'Learning',
    ACTION = 'Action', // e.g., Resume Download
}

export async function createLog(level: LogLevel, category: LogCategory, message: string, details?: any) {
    try {
        return await prisma.log.create({
            data: {
                level,
                category,
                message,
                details: details ? JSON.stringify(details) : undefined,
            },
        });
    } catch (error) {
        // Fallback if DB fails? Console log at least.
        console.error('FAILED TO WRITE LOG TO DB', error);
    }
}

export async function getLogs(limit = 100) {
    return await prisma.log.findMany({
        orderBy: { timestamp: 'desc' },
        take: limit,
    });
}
