import 'dotenv/config';
import { app, prisma } from './app';
import { githubService } from './services/github';
import { calendarService } from './services/calendar';

const PORT = 3000;

async function main() {
    try {
        await prisma.$connect();
        console.log('✅ Connected to SQLite Database');

        // Start Background Sync Jobs
        console.log('🔄 Starting Background Sync Jobs...');

        // Initial Sync
        githubService.syncActivity();
        calendarService.syncLearningStatus();

        // Poll every 10 minutes
        setInterval(() => {
            githubService.syncActivity();
            calendarService.syncLearningStatus();
        }, 10 * 60 * 1000);

        app.listen(PORT, '127.0.0.1', () => {
            console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
        });
    } catch (e) {
        console.error('❌ Failed to connect to database', e);
        process.exit(1);
    }
}

main();
