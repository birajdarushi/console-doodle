import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { createLog, getLogs, LogLevel, LogCategory } from './services/logger.js';
import { githubService } from './services/github.js';
import { calendarService } from './services/calendar.js';

// ADDED: DNS Debugging & IPv6 Support
import dns from 'dns';
import { promisify } from 'util';
const dnsLookup = promisify(dns.lookup);

// Force IPv6 resolution for Supabase compatibility (database only has IPv6)
dns.setDefaultResultOrder('ipv6first');

// Safe Prisma Init for Serverless
let prismaInstance: PrismaClient;

// accessible for debug logging
let debugSanitizedConfig = '';

try {
    // Sanitize URL (Remove quotes if user added them in Vercel)
    const rawUrl = process.env.DATABASE_URL;
    let sanitizedUrl = rawUrl ? rawUrl.replace(/^["']+|["']+$/g, '').trim() : undefined;

    // Enhance URL for Serverless Stability (Simple Mode)
    // We do NOT force port 6543. We trust the environment variable.
    if (sanitizedUrl) {
        debugSanitizedConfig = sanitizedUrl.replace(/:([^:@]+)@/, ':****@');

        // Ensure minimal timeouts
        const separator = sanitizedUrl.includes('?') ? '&' : '?';
        let params = '';
        if (!sanitizedUrl.includes('connect_timeout')) params += '&connect_timeout=15';
        if (!sanitizedUrl.includes('pool_timeout')) params += '&pool_timeout=15';

        if (params) {
            sanitizedUrl += (params.startsWith('&') && !sanitizedUrl.includes('?')) ? params.replace('&', '?') : separator + params.substring(params.startsWith('&') ? 1 : 0);
        }
    }

    // Pass sanitized URL explicitly to constructor
    prismaInstance = new PrismaClient({
        datasources: {
            db: {
                url: sanitizedUrl
            }
        }
    });

} catch (e) {
    console.error('[App] Failed to initialize Prisma Client on boot:', e);

    prismaInstance = new Proxy({} as any, {
        get: (target, prop) => {
            console.error(`[App] Attempted to access prisma.${String(prop)} but DB init failed.`);
            return () => Promise.reject(new Error('Database not initialized'));
        }
    });
}
export const prisma = prismaInstance;
export const app = express();

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow Localhost and Vercel Deployments
        if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        // Block others
        return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true
}));
app.use(express.json());

// Request logging & Visitor Tracking middleware
app.use(async (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

    // Simple Visitor Tracking
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    // Log before DB Call
    console.log(`[App] Middleware: Tracking visitor ${ip}...`);

    try {
        await prisma.visitor.findFirst({ where: { ip: String(ip) } }).then((existing: any) => {
            if (!existing) {
                prisma.visitor.create({
                    data: {
                        ip: String(ip),
                        userAgent: req.headers['user-agent']
                    }
                }).catch((e: any) => console.error("Failed to track visitor", e));
            }
        });
        console.log(`[App] Middleware: Visitor Check Done.`);
    } catch (e) {
        console.error(`[App] Middleware: Visitor Track Failed/Skipped:`, e);
    }

    next();
});

// Debug Endpoint
import fs from 'fs';
import path from 'path';

app.get('/api/debug', async (req, res) => {
    try {
        const dbUrl = process.env.DATABASE_URL;
        const dbStatus = dbUrl ? `Set (${dbUrl.substring(0, 10)}...)` : 'MISSING';

        let fileTree = '';
        try {
            // Check specific locations
            const schemaPath1 = path.join(process.cwd(), 'server/prisma/schema.prisma');
            const schemaPath2 = path.join(process.cwd(), 'prisma/schema.prisma');
            const nodeModules = path.join(process.cwd(), 'node_modules/.prisma/client');

            fileTree += `CWD: ${process.cwd()}\n`;
            fileTree += `Schema at server/...: ${fs.existsSync(schemaPath1)}\n`;
            fileTree += `Schema at root/...: ${fs.existsSync(schemaPath2)}\n`;
            fileTree += `Node Modules Prisma: ${fs.existsSync(nodeModules)}\n`;

            // List root files
            fileTree += `Root Files: ${fs.readdirSync(process.cwd()).join(', ')}\n`;
        } catch (e) {
            fileTree = 'Error listing files: ' + String(e);
        }

        let dbConnection = 'Not Tested';
        try {
            const client = new PrismaClient();
            await client.$connect();
            dbConnection = 'Success!';
            await client.$disconnect();
        } catch (e: any) {
            dbConnection = 'Failed: ' + e.message;
        }

        res.json({
            status: 'Debug Info',
            env: {
                DATABASE_URL: dbStatus,
                NODE_ENV: process.env.NODE_ENV
            },
            fs: fileTree,
            dbConnection
        });
    } catch (e: any) {
        res.status(500).json({ error: String(e) });
    }
});

app.get('/', (req, res) => {
    res.send('Terminal Ops Console API is running. Access endpoints at /api/...');
});

// 1. STATUS API
app.get('/api/status', async (req, res) => {
    // Debug variables declared at function scope for error handling
    let debugResolvedIp = 'Not resolved';
    let debugDnsInfo = 'Not checked';
    let debugConnectionString = debugSanitizedConfig;

    try {
        console.log('[API] /api/status called');
        let configMap: any = {};
        let visitorCount = 0;
        let lastDeployTime = 'Never';
        let metrics = { deployments: 0, activity: 0, errors: 0 };
        let systemHealth = 'Unknown';
        let dnsInfo = 'DNS: Pending';

        try {
            // DIAGNOSTICS: Resolve DB Host
            const rawUrl = process.env.DATABASE_URL;
            if (rawUrl) {
                const match = rawUrl.match(/@([^:/]+)/);
                if (match && match[1]) {
                    const host = match[1];
                    try {
                        const { address, family } = await dnsLookup(host, { family: 6 });
                        debugResolvedIp = address;
                        debugDnsInfo = `${host} => ${address} (IPv${family})`;
                        dnsInfo = `DNS: ${debugDnsInfo}`;
                        console.log(`[API] ${dnsInfo}`);
                    } catch (dnsErr) {
                        debugDnsInfo = `Failed: ${String(dnsErr)}`;
                        dnsInfo = `DNS Fail: ${debugDnsInfo}`;
                        console.error(dnsInfo);
                    }
                }
            }

            // Attempt DB Calls
            console.log('[API] Connecting to DB...');
            const configs = await prisma.systemConfig.findMany();
            configMap = configs.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as any);
            visitorCount = await prisma.visitor.count();

            const lastDeploy = await prisma.deployment.findFirst({
                orderBy: { timestamp: 'desc' }
            });

            if (lastDeploy) {
                const diffMs = new Date().getTime() - new Date(lastDeploy.timestamp).getTime();
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMins / 60);

                if (diffMins < 60) lastDeployTime = `${diffMins}m ago`;
                else if (diffHours < 24) lastDeployTime = `${diffHours}h ago`;
                else lastDeployTime = `${Math.floor(diffHours / 24)}d ago`;
            }

            const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
            const [deployments24h, activity24h, errors24h] = await Promise.all([
                prisma.deployment.count({ where: { timestamp: { gte: yesterday } } }),
                prisma.log.count({ where: { timestamp: { gte: yesterday } } }),
                prisma.log.count({ where: { timestamp: { gte: yesterday }, level: { in: ['error', 'warn'] } } })
            ]);
            metrics = { deployments: deployments24h, activity: activity24h, errors: errors24h };
            systemHealth = 'Healthy';
            console.log('[API] DB Calls Success');

        } catch (dbError: any) {
            console.error('[API] DB Failed:', dbError);
            const msg = dbError.message || String(dbError);

            systemHealth = `Error: IPv4: ${debugResolvedIp} | DNS: ${debugDnsInfo} | Msg: ${msg.substring(0, 100)} | Config: ${debugConnectionString}`;
        }

        res.json({
            learningToday: configMap.learningToday || 'System Recovering...',
            yearGoal: configMap.yearGoal || 'Stability',
            resumeUrl: configMap.resume_url || '',
            currentRole: {
                title: configMap.currentRole_title || 'DevOps Engineer',
                company: configMap.currentRole_company || 'Unknown',
                url: configMap.currentRole_url || '#',
                status: configMap.currentRole_status || 'Offline'
            },
            systemHealth: {
                infra: systemHealth,
                visitors: visitorCount,
                lastDeployment: lastDeployTime,
                region: process.env.VERCEL_REGION || 'Edge'
            },
            metrics24h: metrics,
            lastUpdate: new Date().toISOString()
        });
    } catch (e: any) {
        console.error('[API] Critical Status Error:', e);
        res.status(500).json({ error: 'Failed to fetch status' });
    }
});

// 2. DEPLOYMENTS API
app.get('/api/deployments', async (req, res) => {
    const deployments = await prisma.deployment.findMany({
        orderBy: { timestamp: 'desc' }
    });

    // Transform to Frontend format
    const formatted = deployments.map(d => ({
        id: d.id,
        project: d.project,
        status: d.status,
        time: d.timestamp.toISOString(), // Frontend handles formatting "2h ago"
        details: d.details ? JSON.parse(d.details) : {}
    }));

    res.json(formatted);
});

// 3. INCIDENTS API
app.get('/api/incidents', async (req, res) => {
    const incidents = await prisma.incident.findMany({
        orderBy: { date: 'desc' }
    });

    const formatted = incidents.map(i => ({
        id: i.id,
        title: i.title,
        date: i.date.toISOString().split('T')[0],
        impact: i.impact,
        rootCause: i.rootCause,
        status: i.status,
        learning: i.learning,
        timeline: i.timeline ? JSON.parse(i.timeline) : []
    }));

    res.json(formatted);
});

// 4. LOGS API
app.get('/api/logs', async (req, res) => {
    const { category, severity, limit } = req.query;

    const whereClause: any = {};
    if (category) whereClause.category = String(category);
    if (severity) whereClause.level = String(severity); // Map 'severity' param to 'level' column

    const logs = await prisma.log.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        take: limit ? Number(limit) : 100
    });

    const requesterIp = (req.ip || req.socket.remoteAddress || '').replace('::ffff:', '');
    // Private IP + Localhost are "Admins"
    const allowedIps = ['192.168.1.3', '127.0.0.1', '::1'];
    const isAdmin = allowedIps.includes(requesterIp);

    const formatted = logs.map(l => {
        let message = l.message;

        // Privacy Logic for Resume Downloads
        if (message.startsWith('Resume Download by visitor :')) {
            const parts = message.split(' : ');
            const logIp = parts[1]; // The IP recorded in the log

            if (!isAdmin) {
                // Visitors see generic message
                message = 'Resume Download by Visitor';
            }
            // Admin (192.168.1.3) sees the full message with IP
        }

        return {
            id: l.id,
            timestamp: l.timestamp.toISOString(),
            category: l.category,
            severity: l.level,
            message: message,
            details: l.details ? JSON.parse(l.details) : undefined
        };
    });

    res.json(formatted);
});

// 5. ACTION API
app.post('/api/action', async (req, res) => {
    try {
        const { action, details } = req.body;

        let message = action;
        if (action === 'Resume Download') {
            const ip = req.ip || req.socket.remoteAddress || 'unknown';
            // Clean up IPv6 prefix if present (optional but looks nicer)
            const cleanIp = String(ip).replace('::ffff:', '');
            message = `Resume Download by visitor : ${cleanIp}`;
        }

        await prisma.log.create({
            data: {
                level: 'info',
                category: 'action',
                message: message,
                details: JSON.stringify(details || {})
            }
        });
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: 'Failed to log action' });
    }
});

// 6. SYNC API (Cron)
app.get('/api/sync', async (req, res) => {
    // Vercel Cron sends a generic header, but we can leave it open or check 'authorization' if needed.
    // For now open is fine or check if header 'Authorization' == process.env.CRON_SECRET if configured.
    try {
        console.log('🔄 Triggering Manual/Cron Sync...');
        await Promise.all([
            githubService.syncActivity(),
            calendarService.syncLearningStatus()
        ]);
        res.json({ success: true, message: 'Sync Triggered' });
    } catch (e: any) {
        console.error('Sync failed', e);
        res.status(500).json({ error: 'Sync failed' });
    }
});

// 7. PROFILE PHOTO API
app.get('/api/profile-photo', async (req, res) => {
    try {
        const photo = await prisma.profilePhoto.findFirst({
            orderBy: { uploadedAt: 'desc' }
        });

        if (!photo) {
            return res.status(404).json({ error: 'No photo found' });
        }

        res.setHeader('Content-Type', photo.mimeType);
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
        res.send(photo.imageData);
    } catch (e: any) {
        console.error('[API] Profile photo error:', e);
        res.status(500).json({ error: 'Failed to fetch photo' });
    }
});
