import { Octokit } from 'octokit';
import { createLog, LogCategory, LogLevel } from './logger.js';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Initialize Octokit with token from env
// If no token, we can fall back to public access (rate limited) or no-op
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

const USERNAME = process.env.GITHUB_USERNAME || "rushiraj";

export const githubService = {
    /**
     * Syncs recent GitHub activity to Deployments and Logs
     */
    async syncActivity() {
        console.log(`[GitHub] Syncing activity for ${USERNAME}...`);

        try {
            if (!process.env.GITHUB_TOKEN) {
                console.warn("[GitHub] No GITHUB_TOKEN provided. Skipping sync.");
                return;
            }

            // 1. Get User Events (Push, Release, Deployment) - Include Private
            const { data: events } = await octokit.request('GET /users/{username}/events', {
                username: USERNAME,
                per_page: 10
            });

            for (const event of events) {
                // We use event.id to deduplicate. 
                // In a real app, we'd check if log exists with this 'externalId'.
                // For simpler logic here, we just check if we have a log with this exact timestamp + message combo 
                // OR we can add an 'externalId' field to Schema. 
                // Let's stick to simple "Try create, ignore if duplicate" or just fetch latest.

                // Actually, let's map generic Pushes to Logs
                if (event.type === 'PushEvent') {
                    const repo = event.repo.name;
                    const payload = event.payload as any;

                    // DEBUG: Inspect payload structure
                    console.log(`[GitHub] Processing PushEvent for ${repo}`);
                    console.log(`[GitHub] Payload keys: ${Object.keys(payload)}`);
                    if (payload.commits) console.log(`[GitHub] Commits count: ${payload.commits.length}`);
                    if (payload.head_commit) console.log(`[GitHub] Head commit: ${JSON.stringify(payload.head_commit)}`);

                    // Robust Commit parsing
                    const commitSha = payload.commits?.[0]?.sha || payload.head || 'main'; // Fallback
                    const msg = payload.commits?.[0]?.message
                        || payload.head_commit?.message
                        || "Update " + repo;

                    // Check for existing log to avoid spamming DB on every poll
                    const existing = await prisma.log.findFirst({
                        where: {
                            details: { contains: event.id }
                        }
                    });

                    if (!existing) {
                        await prisma.log.create({
                            data: {
                                level: 'info',
                                category: 'deployment', // or 'action'
                                message: `Pushed to ${repo}`,
                                details: JSON.stringify({
                                    commit: msg,
                                    eventId: event.id,
                                    url: `https://github.com/${repo}`
                                }),
                                timestamp: new Date(event.created_at || Date.now())
                            }
                        });

                        // Fetch repo details for privacy and pages
                        let deployedUrl = '';
                        let isPrivate = false;

                        try {
                            const { data: repoData } = await octokit.request('GET /repos/{owner}/{repo}', {
                                owner: repo.split('/')[0],
                                repo: repo.split('/')[1]
                            });
                            isPrivate = repoData.private;
                            if (repoData.homepage) {
                                deployedUrl = repoData.homepage;
                            } else if (repoData.has_pages) {
                                deployedUrl = `https://${repo.split('/')[0]}.github.io/${repo.split('/')[1]}`;
                            }
                        } catch (e) {
                            console.warn(`[GitHub] Failed to get repo details for ${repo}`);
                        }

                        // Robust Commit parsing
                        // For PushEvents, payload has 'commits' array
                        let commitSha = payload.head || payload.before || 'main'; // Default to head
                        if (payload.commits && payload.commits.length > 0) {
                            // The last commit in the array is usually the head of the push
                            commitSha = payload.commits[payload.commits.length - 1].sha;
                        }

                        let commitMsg = "";

                        // 1. Try payload commits
                        if (payload.commits && payload.commits.length > 0) {
                            // Get the last commit message (most recent)
                            commitMsg = payload.commits[payload.commits.length - 1].message;
                        }
                        // 2. Try head_commit
                        else if (payload.head_commit) {
                            commitMsg = payload.head_commit.message;
                        }

                        // 3. If still empty or generic, try fetching
                        if (!commitMsg || commitMsg === "Update " + repo) {
                            try {
                                const ref = payload.ref ? payload.ref.replace('refs/heads/', '') : 'main';
                                const shaToFetch = (commitSha && commitSha !== 'main') ? commitSha : ref;

                                console.log(`[GitHub] ⚠️ Generic message found. Fetching real commit for ${repo} @ ${shaToFetch}`);

                                const { data: commitData } = await octokit.request('GET /repos/{owner}/{repo}/commits/{ref}', {
                                    owner: repo.split('/')[0],
                                    repo: repo.split('/')[1],
                                    ref: shaToFetch
                                });

                                if (commitData.commit.message) {
                                    commitMsg = commitData.commit.message;
                                    // Update SHA if we just fetched by ref
                                    if (commitSha === 'main') commitSha = commitData.sha;
                                }
                            } catch (e) {
                                console.warn(`[GitHub] Failed to fetch commit details for ${repo}:`, e);
                                commitMsg = "Update " + repo; // Final fallback
                            }
                        }

                        // Create Deployment Record
                        await prisma.deployment.create({
                            data: {
                                project: repo,
                                status: 'success',
                                timestamp: new Date(event.created_at || Date.now()),
                                details: JSON.stringify({
                                    description: commitMsg,
                                    github: `https://github.com/${repo}/commit/${commitSha}`,
                                    deployedUrl: deployedUrl || undefined,
                                    private: isPrivate,
                                    strategy: 'Continuous Deployment',
                                    pipeline: [
                                        { stage: 'Build', status: 'complete' },
                                        { stage: 'Test', status: 'complete' },
                                        { stage: 'Deploy', status: 'complete' }
                                    ],
                                    decisions: ['Auto-Deploy Triggered']
                                })
                            }
                        });
                    }
                }
            }

            console.log(`[GitHub] Sync complete. Processed ${events.length} events.`);

        } catch (error) {
            console.error("[GitHub] Sync failed:", error);
        }
    }
};
