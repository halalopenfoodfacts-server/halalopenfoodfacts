(function (window) {
    'use strict';

    const DEFAULT_TIMEOUT_MS = 10000;
    const DEFAULT_RETRIES = 1;

    class ApiError extends Error {
        constructor(message, details = {}) {
            super(message);
            this.name = 'ApiError';
            this.kind = details.kind || 'unknown';
            this.status = details.status || 0;
            this.url = details.url || '';
            this.retryable = Boolean(details.retryable);
        }
    }

    function getErrorKind(error, response) {
        if (error?.name === 'AbortError') return 'timeout';
        if (!response) return 'network';
        if (response.status === 404) return 'not-found';
        if (response.status === 429) return 'rate-limit';
        if (response.status >= 500) return 'server';
        if (response.status >= 400) return 'client';
        return 'unknown';
    }

    function isRetryable(status) {
        return status === 429 || status >= 500;
    }

    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function parseJson(response, url) {
        const text = await response.text();
        if (!text.trim()) {
            throw new ApiError('Empty API response', {
                kind: 'invalid-response',
                status: response.status,
                url
            });
        }

        try {
            return JSON.parse(text);
        } catch (error) {
            console.error('[HalalApi] Invalid JSON response', { url, status: response.status });
            throw new ApiError('Invalid API response', {
                kind: 'invalid-response',
                status: response.status,
                url
            });
        }
    }

    async function request(path, options = {}) {
        const {
            method = 'GET',
            query,
            body,
            signal,
            timeoutMs = DEFAULT_TIMEOUT_MS,
            retries = DEFAULT_RETRIES,
            credentials = 'same-origin'
        } = options;
        const url = new URL(path, window.location.origin);
        if (query instanceof URLSearchParams) {
            query.forEach((value, key) => {
                if (value !== '') url.searchParams.append(key, value);
            });
        } else if (query) {
            Object.entries(query).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach(item => url.searchParams.append(key, String(item)));
                } else if (value !== undefined && value !== null && value !== '') {
                    url.searchParams.set(key, String(value));
                }
            });
        }

        for (let attempt = 0; attempt <= retries; attempt += 1) {
            const timeoutController = new AbortController();
            const abortRequest = () => timeoutController.abort();
            signal?.addEventListener('abort', abortRequest, { once: true });
            const timeoutId = window.setTimeout(() => timeoutController.abort(), timeoutMs);

            try {
                const response = await fetch(url, {
                    method,
                    body,
                    credentials,
                    signal: timeoutController.signal,
                    headers: { Accept: 'application/json' }
                });

                if (!response.ok) {
                    const kind = getErrorKind(null, response);
                    if (attempt < retries && isRetryable(response.status)) {
                        await wait(250 * (2 ** attempt));
                        continue;
                    }
                    throw new ApiError('API request failed', {
                        kind,
                        status: response.status,
                        url: url.toString(),
                        retryable: isRetryable(response.status)
                    });
                }

                return await parseJson(response, url.toString());
            } catch (error) {
                if (error instanceof ApiError) throw error;
                const kind = getErrorKind(error);
                if (attempt < retries && kind === 'network') {
                    await wait(250 * (2 ** attempt));
                    continue;
                }
                if (error.name === 'AbortError' && signal?.aborted) {
                    throw error;
                }
                console.error('[HalalApi] Request failed', { url: url.toString(), kind });
                throw new ApiError('Unable to reach API', {
                    kind,
                    url: url.toString(),
                    retryable: kind === 'network' || kind === 'timeout'
                });
            } finally {
                window.clearTimeout(timeoutId);
                signal?.removeEventListener('abort', abortRequest);
            }
        }

        throw new ApiError('API request exhausted retries', {
            kind: 'unknown',
            url: url.toString()
        });
    }

    const client = Object.freeze({
        request,
        search(query, options = {}) {
            return request('/proxy/search/search', {
                ...options,
                query: { ...query }
            });
        },
        catalogue(query, options = {}) {
            return request('/proxy/v2/search', {
                ...options,
                query: { ...query }
            });
        },
        product(code, options = {}) {
            return request(`/proxy/v2/product/${encodeURIComponent(code)}.json`, options);
        },
        stats(query = {}, options = {}) {
            return request('/proxy/stats', { ...options, query });
        },
        recent(query = {}, options = {}) {
            return request('/proxy/recent', { ...options, query });
        },
        facets(type, options = {}) {
            return request(`/proxy/facets/${encodeURIComponent(type)}.json`, options);
        },
        session(options = {}) {
            return request('/proxy/session', options);
        }
    });

    window.HalalApiClient = client;
    window.HalalApiError = ApiError;
})(window);
