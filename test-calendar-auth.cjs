const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function testAuth() {
    try {
        console.log('📋 Testing Google Calendar Authentication...\n');

        const keyFile = path.join(__dirname, 'server/certs/service-account.json');
        const credentials = JSON.parse(fs.readFileSync(keyFile, 'utf8'));

        console.log('✅ Credentials loaded');
        console.log('   Service Account:', credentials.client_email);
        console.log('   Project ID:', credentials.project_id);
        console.log('   Private Key ID:', credentials.private_key_id);
        console.log('   Private Key Length:', credentials.private_key.length, 'chars\n');

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
        });

        console.log('🔐 Attempting to get auth client...');
        const authClient = await auth.getClient();
        console.log('✅ Auth client created\n');

        console.log('🔐 Attempting to get access token...');
        const accessToken = await authClient.getAccessToken();
        console.log('✅ Access token obtained:', accessToken.token ? 'SUCCESS' : 'FAILED');
        console.log('   Token preview:', accessToken.token?.substring(0, 50) + '...\n');

        const calendar = google.calendar({ version: 'v3', auth });

        const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
        console.log('📅 Testing calendar access...');
        console.log('   Calendar ID:', calendarId);

        const now = new Date();
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const res = await calendar.events.list({
            calendarId: calendarId,
            timeMin: now.toISOString(),
            timeMax: endOfDay.toISOString(),
            maxResults: 5,
            singleEvents: true,
            orderBy: 'startTime',
        });

        console.log('✅ Calendar API call successful!');
        console.log('   Events found:', res.data.items?.length || 0);

        if (res.data.items && res.data.items.length > 0) {
            console.log('\n📋 Events:');
            res.data.items.forEach((event, i) => {
                console.log(`   ${i + 1}. ${event.summary || 'No title'}`);
            });
        }

        console.log('\n✅ ALL TESTS PASSED! Calendar integration is working correctly.');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);

        if (error.code === 400 && error.message.includes('invalid_grant')) {
            console.error('\n🔧 SOLUTION:');
            console.error('   The service account key is invalid or has been revoked.');
            console.error('   Please regenerate the key in Google Cloud Console:');
            console.error('   1. Go to https://console.cloud.google.com/');
            console.error('   2. Navigate to IAM & Admin → Service Accounts');
            console.error('   3. Find: console-reader@portfolio-482608.iam.gserviceaccount.com');
            console.error('   4. Delete old keys and create a new JSON key');
            console.error('   5. Replace server/certs/service-account.json with the new file');
        } else if (error.code === 404) {
            console.error('\n🔧 SOLUTION:');
            console.error('   Calendar not found or service account doesn\'t have access.');
            console.error('   1. Share the calendar with:', credentials.client_email);
            console.error('   2. Grant at least "See all event details" permission');
        } else if (error.message.includes('Calendar API has not been used')) {
            console.error('\n🔧 SOLUTION:');
            console.error('   Enable the Google Calendar API:');
            console.error('   1. Go to https://console.cloud.google.com/apis/library/calendar-json.googleapis.com');
            console.error('   2. Select project: portfolio-482608');
            console.error('   3. Click "Enable"');
        }

        console.error('\n📋 Full error details:');
        console.error(error);
        process.exit(1);
    }
}

testAuth();
