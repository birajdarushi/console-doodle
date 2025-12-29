import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database with RICH data...');

    // Clear existing
    await prisma.log.deleteMany();
    await prisma.deployment.deleteMany();
    await prisma.incident.deleteMany();
    await prisma.systemConfig.deleteMany();

    // 1. System Config (Status Page Data)
    await prisma.systemConfig.createMany({
        data: [
            { key: 'learningToday', value: 'Kubernetes Network Policies' },
            { key: 'yearGoal', value: 'CKA Certification' },
            { key: 'currentRole_title', value: 'Cloud / DevOps Engineer (Aspirant)' },
            { key: 'currentRole_company', value: 'Open to Opportunities' },
            { key: 'currentRole_url', value: 'https://linkedin.com/in/rushiraj' },
            { key: 'currentRole_status', value: 'Actively Looking' },
            { key: 'region', value: 'ap-south-1' },
            // Uptime and Health are dynamic in the API
        ]
    });

    // 2. Deployment
    await prisma.deployment.create({
        data: {
            project: "portfolio-console",
            status: "success",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            details: JSON.stringify({
                description: "Personal DevOps portfolio built as a production console interface",
                github: "https://github.com/rushiraj/portfolio-console",
                strategy: "Blue-Green Deployment",
                pipeline: [
                    { stage: "Build", status: "complete" },
                    { stage: "Test", status: "complete" },
                    { stage: "Deploy", status: "complete" },
                    { stage: "Verify", status: "complete" },
                ],
                decisions: [
                    "Chose Vite over CRA for faster builds",
                    "Implemented health checks before traffic switch",
                    "Used immutable infrastructure pattern",
                ],
            })
        }
    });

    // 3. Incident
    await prisma.incident.create({
        data: {
            title: "Database Connection Pool Exhaustion",
            date: new Date('2024-01-15T14:30:00Z'),
            impact: "API response times degraded to 5s+ for 23 minutes",
            rootCause: "Connection leak in background job processor",
            status: "resolved",
            learning: "Added connection pool monitoring and leak detection",
            timeline: JSON.stringify([
                { time: "14:32", action: "Detection", detail: "Alert triggered: API latency > 3s" },
                { time: "14:35", action: "Diagnosis", detail: "Pool at 100% capacity" },
                { time: "14:55", action: "Fix Deployed", detail: "Patched connection handling" },
                { time: "15:10", action: "Recovery", detail: "System nominal" },
            ])
        }
    });

    // 4. Logs
    await prisma.log.createMany({
        data: [
            {
                level: 'info',
                category: 'learning',
                message: 'Started Kubernetes Network Policies module',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                details: JSON.stringify({ source: 'Official Docs', topic: 'NetPol' })
            },
            {
                level: 'info',
                category: 'deployment',
                message: 'portfolio-console deployed successfully',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                details: JSON.stringify({ version: 'v1.0.1', env: 'prod' })
            },
            {
                level: 'warn',
                category: 'system',
                message: 'High CPU usage on worker-02',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            }
        ]
    });

    console.log('✅ Seeding complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
