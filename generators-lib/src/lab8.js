class BaseHttpClient {
    async request({ url, method = 'GET', headers = {}, body, signal }) {
        const init = { method, headers: { ...headers }, signal };
        if (body !== undefined) {
            init.body = typeof body === 'string' ? body : JSON.stringify(body);
            init.headers['Content-Type'] = init.headers['Content-Type'] || 'application/json';
        }

        const res = await fetch(url, init);
        const contentType = res.headers.get('content-type') || '';
        const parsed = contentType.includes('application/json')
            ? await res.json()
            : await res.text();

        return { status: res.status, headers: res.headers, body: parsed };
    }
}


class ApiKeyStrategy {
    constructor(key, headerName = 'X-API-Key') {
        if (!key) throw new Error('ApiKeyStrategy: key is required');
        this._header = headerName;
        this._key    = key;
    }

    async getHeaders()    { return { [this._header]: this._key }; }
    canRefresh()          { return false; }
    async refresh()       {  }
}

class JwtStrategy {
    constructor(token, refreshFn = null) {
        if (!token) throw new Error('JwtStrategy: token is required');
        this._token     = token;
        this._refreshFn = refreshFn;
    }

    async getHeaders()  { return { Authorization: `Bearer ${this._token}` }; }
    canRefresh()        { return typeof this._refreshFn === 'function'; }

    async refresh() {
        this._token = await this._refreshFn();
    }
}

class OAuthStrategy {
    constructor(accessToken, refreshFn) {
        if (!accessToken) throw new Error('OAuthStrategy: accessToken is required');
        this._token     = accessToken;
        this._refreshFn = refreshFn;
    }

    async getHeaders()  { return { Authorization: `Bearer ${this._token}` }; }
    canRefresh()        { return typeof this._refreshFn === 'function'; }

    async refresh() {
        if (!this._refreshFn) throw new Error('OAuthStrategy: no refreshFn provided');
        const { accessToken } = await this._refreshFn();
        this._token = accessToken;
    }
}


class AuthProxy {
    constructor(client, strategy) {
        this._client   = client;
        this._strategy = strategy;
    }

    async request(config) {
        const authHeaders = await this._strategy.getHeaders();
        const enriched    = {
            ...config,
            headers: { ...config.headers, ...authHeaders },
        };

        const response = await this._client.request(enriched);

        if (response.status === 401 && this._strategy.canRefresh()) {
            await this._strategy.refresh();
            const retryHeaders = await this._strategy.getHeaders();
            return this._client.request({
                ...config,
                headers: { ...config.headers, ...retryHeaders },
            });
        }

        return response;
    }
}


class LoggingProxy {
    constructor(client, logger = console) {
        this._client = client;
        this._log    = logger;
    }

    async request(config) {
        const start = Date.now();
        this._log.log(`[HTTP] --> ${config.method || 'GET'} ${config.url}`);
        try {
            const response = await this._client.request(config);
            const ms = Date.now() - start;
            this._log.log(`[HTTP] <-- ${response.status} ${config.url} (${ms}ms)`);
            return response;
        } catch (err) {
            this._log.error(`[HTTP] ERR ${config.url}: ${err.message}`);
            throw err;
        }
    }
}


class RateLimitProxy {
    constructor(client, { maxRequests = 60, windowMs = 60_000 } = {}) {
        this._client      = client;
        this._maxRequests = maxRequests;
        this._windowMs    = windowMs;
        this._timestamps  = [];
    }

    async request(config) {
        await this._waitForSlot();
        return this._client.request(config);
    }

    async _waitForSlot() {
        while (true) {
            const now    = Date.now();
            const cutoff = now - this._windowMs;
            this._timestamps = this._timestamps.filter(t => t > cutoff);

            if (this._timestamps.length < this._maxRequests) {
                this._timestamps.push(now);
                return;
            }

            const wait = this._timestamps[0] + this._windowMs - now + 1;
            await new Promise(res => setTimeout(res, wait));
        }
    }
}


class GitHubService {
    constructor(httpClient) {
        this._client = httpClient;
    }

    async getUser(username) {
        const { body, status } = await this._client.request({
            url: `https://api.github.com/users/${encodeURIComponent(username)}`,
            headers: { Accept: 'application/vnd.github.v3+json' },
        });
        if (status !== 200) throw new Error(`GitHub API error: ${status}`);
        return body;
    }

    async getRepos(username) {
        const { body, status } = await this._client.request({
            url: `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=10`,
            headers: { Accept: 'application/vnd.github.v3+json' },
        });
        if (status !== 200) throw new Error(`GitHub API error: ${status}`);
        return body;
    }
}

export {
    BaseHttpClient,
    ApiKeyStrategy,
    JwtStrategy,
    OAuthStrategy,
    AuthProxy,
    LoggingProxy,
    RateLimitProxy,
    GitHubService,
};
