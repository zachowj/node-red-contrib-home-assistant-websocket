/**
 * Normalize a Home Assistant base URL by removing surrounding whitespace and
 * any trailing slashes.
 *
 * Paths are appended to the base URL as `${host}/api/...`, so a trailing slash
 * would create a double slash, e.g. `http://localhost:8123//api/websocket`.
 * Home Assistant matches routes on the exact path and doesn't normalize it,
 * making every request 404.
 */
export function normalizeBaseUrl(url?: string): string {
    return url ? url.trim().replace(/\/+$/, '') : '';
}
