import { app } from '../server/app.js';

// Vercel Serverless Function Config
export const config = {
    api: {
        bodyParser: false,
    },
};

// Vercel expects a default export handler
// Vercel expects a default export handler
export default async function handler(request: any, response: any) {
    console.log('[Vercel] API Handler invoked:', request.url);
    try {
        await app(request, response);
    } catch (e) {
        console.error('[Vercel] Handler crashed:', e);
        response.status(500).send('Internal Server Error: ' + String(e));
    }
}
