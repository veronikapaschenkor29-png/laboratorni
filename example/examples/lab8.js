import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import {
    BaseHttpClient,
    JwtStrategy,
    ApiKeyStrategy,
    OAuthStrategy,
    AuthProxy,
    LoggingProxy,
    RateLimitProxy,
    GitHubService,
} from 'generators-lib';

const __dirname = fileURLToPath(new URL('.', import.meta.url));


async function fakeTokenRefresh() {
    await new Promise(r => setTimeout(r, 50));
    return process.env.TOKEN || 'refreshed-demo-token';
}

function buildGitHubService() {
    const token = process.env.TOKEN || 'demo-token-not-valid';
    const authStrategy = new JwtStrategy(token, fakeTokenRefresh);

    return new GitHubService(
        new LoggingProxy(
            new RateLimitProxy(
                new AuthProxy(new BaseHttpClient(), authStrategy),
                { maxRequests: 30, windowMs: 60_000 }
            )
        )
    );
}

function example1_architectureCheck() {
    console.log('\n=== Example 1: Architecture verification ===');

    const baseClientSrc = readFileSync(
        join(__dirname, '../../generators-lib/src/auth-proxy.js'),
        'utf8'
    );
    const baseClientBody = baseClientSrc.match(/class BaseHttpClient \{[\s\S]*?^}/m)?.[0] || '';
    const authMentioned  = /auth|token|Authorization/i.test(baseClientBody);
    console.log(`  BaseHttpClient mentions auth/token/Authorization: ${authMentioned} (expected: false)`);

    const gitHubBody = baseClientSrc.match(/class GitHubService \{[\s\S]*?^}/m)?.[0] || '';
    const hardcoded  = /new BaseHttpClient|new AuthProxy|import.*client/i.test(gitHubBody);
    console.log(`  GitHubService hard-codes a client:                ${hardcoded} (expected: false)`);

    console.log('\n  AuthProxy chain: GitHubService ← LoggingProxy ← RateLimitProxy ← AuthProxy ← BaseHttpClient');
}

function example2_strategies() {
    console.log('\n=== Example 2: Strategy objects ===');

    const apiKey = new ApiKeyStrategy('my-secret-key', 'X-API-Key');
    apiKey.getHeaders().then(h => console.log('  ApiKeyStrategy headers:', JSON.stringify(h)));

    const jwt = new JwtStrategy('eyJhbGciOiJIUzI1NiJ9.demo.sig', fakeTokenRefresh);
    jwt.getHeaders().then(h => console.log('  JwtStrategy headers:   ', JSON.stringify(h)));
    console.log('  JwtStrategy canRefresh:', jwt.canRefresh());

    const oauth = new OAuthStrategy('oauth-access-token-abc', fakeTokenRefresh);
    oauth.getHeaders().then(h => console.log('  OAuthStrategy headers: ', JSON.stringify(h)));
}


async function example3_liveCall() {
    console.log('\n=== Example 3: Live GitHub API call ===');

    if (!process.env.TOKEN) {
        console.log('  Skipped — set TOKEN env var to run a real request.');
        return;
    }

    const svc = buildGitHubService();

    try {
        const user = await svc.getUser('octocat');
        console.log(`  octocat: ${user.name}, public_repos: ${user.public_repos}`);
    } catch (err) {
        console.error('  Request failed:', err.message);
    }
}

async function example4_rateLimit() {
    console.log('\n=== Example 4: RateLimitProxy queues excess requests ===');

    const timestamps = [];
    const fakeClient = {
        async request() {
            timestamps.push(Date.now());
            return { status: 200, headers: {}, body: 'ok' };
        },
    };

    const limited = new RateLimitProxy(fakeClient, { maxRequests: 3, windowMs: 200 });

    const reqs = Array.from({ length: 6 }, (_, i) =>
        limited.request({ url: `https://example.com/${i}` })
    );

    await Promise.all(reqs);
    console.log(`  Sent 6 requests; timestamps spread over ~${timestamps[5] - timestamps[0]}ms`);
    console.log('  (first 3 fire immediately; last 3 wait for the window to slide)');
}

(async () => {
    example1_architectureCheck();
    example2_strategies();
    await example3_liveCall();
    await example4_rateLimit();
    console.log('\nDone.\n');
})().catch(err => { console.error(err); process.exit(1); });
