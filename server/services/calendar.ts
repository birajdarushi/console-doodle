import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const KEY_FILE = path.join(process.cwd(), 'server/certs/service-account.json');
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

// "Learning" keywords to filter events by (optional, or just fetch all from a specific calendar)
// For now, we assume the connected calendar is dedicated to "Learning" or we look for specific titles.
// Let's assume ANY event in this specific calendar is "Learning" or "Focus".

export const calendarService = {
    async syncLearningStatus() {
        console.log('[Calendar] Syncing learning status...');

        try {
            // 1. Auth
            // We check if key file exists or GOOGLE_APPLICATION_CREDENTIALS is set
            // For this MVP, let's look for the file explicitly or just return if not found.

            // 1. Auth via Env Var (Vercel) or File (Local)
            let auth;

            if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
                // Parse the JSON string from Environment Variable
                try {
                    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
                    auth = new google.auth.GoogleAuth({
                        credentials,
                        scopes: SCOPES,
                    });
                } catch (e) {
                    console.error("[Calendar] Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON", e);
                }
            }

            if (!auth) {
                // Fallback to file (Local Dev)
                auth = new google.auth.GoogleAuth({
                    keyFile: KEY_FILE,
                    scopes: SCOPES,
                });
            }

            // Simple check if file exists (the auth lib throws if not found usually, but we want to be graceful)
            // Actually, let's just try-catch the whole thing.

            const calendar = google.calendar({ version: 'v3', auth });

            // 2. Fetch "Current" or "Today's" event
            const now = new Date();
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const res = await calendar.events.list({
                calendarId: CALENDAR_ID,
                timeMin: now.toISOString(), // Events active now or in future
                timeMax: endOfDay.toISOString(),
                maxResults: 1,
                singleEvents: true,
                orderBy: 'startTime',
            });

            const events = res.data.items;
            if (events && events.length > 0) {
                const event = events[0];
                const title = event.summary || 'Busy';

                console.log(`[Calendar] Found current/next learning: ${title}`);

                // Update System Status
                // We use upsert to ensure we update if exists
                // Actually SystemConfig is a simple key-value store in our schema
                // model SystemConfig { key String @id, value String }

                // Use Prisma's upsert
                await prisma.systemConfig.upsert({
                    where: { key: 'learningToday' },
                    update: { value: title },
                    create: { key: 'learningToday', value: title }
                });

                // Log it if it's a new thing we haven't logged recently?
                // Maybe too spammy. Let's just update the StatusPage for now.
                // If we want a "history" of learning, we'd logging "Completed X" when an event ends.
                // For now, "Learning Today" status is sufficient.

            } else {
                console.log('[Calendar] No learning scheduled for rest of day.');
            }

            // 3. Sync Year Goal (Search for event "Goal: ...")
            const goalRes = await calendar.events.list({
                calendarId: CALENDAR_ID,
                timeMin: new Date(new Date().getFullYear(), 0, 1).toISOString(), // Start of this year
                timeMax: new Date(new Date().getFullYear() + 1, 11, 31).toISOString(), // End of NEXT year
                q: "Goal:", // Search query
                maxResults: 1,
                singleEvents: true,
                orderBy: 'startTime',
            });

            if (goalRes.data.items && goalRes.data.items.length > 0) {
                const goalTitle = goalRes.data.items[0].summary || '';
                // Extract clean goal text (remove "Goal:" prefix if present)
                const cleanGoal = goalTitle.replace(/^Goal:\s*/i, '').trim();

                console.log(`[Calendar] Found Year Goal: ${cleanGoal}`);
                await prisma.systemConfig.upsert({
                    where: { key: 'yearGoal' },
                    update: { value: cleanGoal },
                    create: { key: 'yearGoal', value: cleanGoal }
                });
            }

        } catch (error: any) {
            if (error.code === 'ENOENT' || error.message.includes('no such file')) {
                console.warn("[Calendar] Service account file not found. Skipping sync.");
            } else {
                console.error('[Calendar] Sync failed:', error);
            }
        }
    }
};
