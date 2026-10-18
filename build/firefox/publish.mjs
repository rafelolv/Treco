import { createHash, createHmac, randomUUID } from 'node:crypto';
import { readFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

export const GUID = 'zynubo@rafelolv.github.io';
const API = 'https://addons.mozilla.org/api/v5/';
const listing = `addons/addon/${encodeURIComponent(GUID)}/`;
const LIMIT = 200 * 1024 * 1024;
const stable = /^(0|[1-9]\d{0,8})\.(0|[1-9]\d{0,8})\.(0|[1-9]\d{0,8})$/;
class PublicationError extends Error {}
const fail = message => { throw new PublicationError(message); };

// Preserve AdBonk's paragraph-aware English shortening, including the full link.
export function firefoxReleaseNotes(notes, version) {
    if (!stable.test(version) || typeof notes !== 'string' || !notes.trim()) fail('Invalid store notes or version.');
    notes = notes.trim();
    const sections = notes.split(/^## Changes[ \t]*\r?\n/m);
    if (sections.length > 1) notes = sections[1].split(/^## /m)[0].trim();
    else if (/^# Treco /m.test(notes)) fail('Tagged release notes need a Changes section for the store summary.');
    if (!notes) fail('Store change summary is empty.');
    if (notes.length <= 3000) return notes;
    const footer = `\n\nFull release notes: https://github.com/rafelolv/Treco/releases/tag/v${version}`;
    const budget = 3000 - footer.length - 1;
    let prefix = '';
    for (const character of notes) {
        if (prefix.length + character.length > budget) break;
        prefix += character;
    }
    const boundary = prefix.lastIndexOf('\n\n');
    if (boundary > 0) prefix = prefix.slice(0, boundary);
    return prefix.trimEnd() + '…' + footer;
}

export function verifyPayload(directory, tag) {
    const data = JSON.parse(readFileSync(join(directory, 'payload.json'), 'utf8'));
    if (!stable.test(data.version) || tag !== `v${data.version}` || data.guid !== GUID) fail('Payload tag/identity mismatch.');
    const load = kind => readFileSync(join(directory, `Treco-${kind}-v${data.version}.zip`));
    const addon = load('firefox'), source = load('source');
    for (const [bytes, digest] of [[addon, data.addonSha256], [source, data.sourceSha256]]) {
        if (!bytes.length || bytes.length > LIMIT || createHash('sha256').update(bytes).digest('hex') !== digest) fail('Payload size/checksum mismatch.');
    }
    return { version: data.version, addon, source, notes: firefoxReleaseNotes(data.notes, data.version) };
}

export function token(issuer, secret) {
    const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
    const iat = Math.floor(Date.now() / 1000);
    const body = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ iss: issuer, jti: randomUUID(), iat, exp: iat + 60 })}`;
    return `${body}.${createHmac('sha256', secret).update(body).digest('base64url')}`;
}

// Treco uses numeric versions. Stop for unfamiliar AMO versions rather than guess
// Gecko's prerelease ordering or accidentally upload an older package.
export function isNewer(version, previous) {
    if (!stable.test(version) || typeof previous !== 'string' || !/^(0|[1-9]\d{0,8})(\.(0|[1-9]\d{0,8})){0,3}$/.test(previous)) fail('AMO version ordering needs manual review.');
    const a = version.split('.').map(BigInt), b = previous.split('.').map(BigInt);
    for (let i = 0; i < 4; i++) {
        if ((a[i] ?? 0n) !== (b[i] ?? 0n)) return (a[i] ?? 0n) > (b[i] ?? 0n);
    }
    return false;
}

function status(version) {
    const known = new Set(['public', 'disabled', 'unreviewed']);
    return known.has(version?.file?.status) ? version.file.status : 'unknown';
}

export async function publishFirefox({ version, addon, source, notes, issuer, secret, mode = 'submit', fetchAPI = fetch, sleep = delay }) {
    if (!issuer || !secret) fail('Configure AMO_JWT_ISSUER and AMO_JWT_SECRET in Treco Actions secrets.');
    if (!stable.test(version) || !['submit', 'inspect'].includes(mode)) fail('Invalid version or publication mode.');
    notes = firefoxReleaseNotes(notes, version);
    if (![addon, source].every(bytes => bytes?.length > 0 && bytes.length <= LIMIT)) fail('AMO archives must be nonempty and at most 200 MB.');
    const versionPath = `${listing}versions/${version}/`;
    async function request(path, method = 'GET', body, allowMissing = false, stage = 'request') {
        // Never send the JWT to a response-supplied pagination host or redirect.
        if (typeof path !== 'string' || !path.startsWith('addons/') || path.includes('..')) fail('Unexpected AMO request path.');
        let response, data;
        try {
            response = await fetchAPI(`${API}${path}`, {
                method, body, redirect: 'error', signal: AbortSignal.timeout(60000),
                headers: { Authorization: `JWT ${token(issuer, secret)}`, ...(typeof body === 'string' ? { 'Content-Type': 'application/json' } : {}) },
            });
            if (allowMissing && response.status === 404) return null;
            data = await response.json();
        } catch {
            fail(`AMO ${stage} timed out or returned an unreadable response. Inspect submission status before retrying; no automatic retry was made.`);
        }
        if (!response.ok) {
            const fields = ['detail', 'release_notes', 'en-US', 'source', 'upload', 'license', 'non_field_errors'];
            const found = fields.filter(key => Object.hasOwn(data ?? {}, key) || Object.hasOwn(data?.release_notes ?? {}, key));
            fail(`AMO HTTP ${response.status} during ${stage}; error fields: ${found.join(', ') || 'unknown'}. Inspect Developer Hub before retrying. Raw response withheld.`);
        }
        if (!data || typeof data !== 'object') fail(`AMO ${stage} response is invalid.`);
        return data;
    }
    const existingAddon = await request(listing, 'GET', undefined, true, 'listing lookup');
    if (!existingAddon) fail('AMO listing was not found. Complete the initial Treco listing and privacy declarations in Developer Hub using the preserved add-on ID.');
    if (existingAddon.guid !== GUID) fail('AMO listing identity mismatch.');
    const existing = await request(versionPath, 'GET', undefined, true, 'version lookup');
    if (mode === 'inspect') return `Firefox ${version}: ${existing ? `already exists; AMO file status=${status(existing)}` : 'not found on AMO'}. No changes made.`;
    if (existing) fail(`Firefox ${version} already exists; AMO file status=${status(existing)}. No upload made. Inspect before a metadata-only repair.`);

    // Include pending, rejected and unlisted versions, not only the public one.
    for (let page = 1; ; page++) {
        if (page > 1000) fail('AMO history exceeded the bounded scan; inspect manually.');
        const history = await request(`${listing}versions/?filter=all_with_unlisted&page_size=50&page=${page}`, 'GET', undefined, false, 'version history');
        if (!Array.isArray(history.results) || !(history.next === null || typeof history.next === 'string')) fail('AMO version history is invalid.');
        for (const item of history.results) if (!isNewer(version, item.version)) fail('Firefox version must increase beyond every existing AMO version. No upload made.');
        if (history.next === null) break;
    }
    const upload = new FormData();
    upload.set('channel', 'listed');
    upload.set('upload', new Blob([addon], { type: 'application/zip' }), `Treco-firefox-v${version}.zip`);
    let result;
    try {
        result = await request('addons/upload/', 'POST', upload, false, 'package upload');
        if (typeof result.uuid !== 'string' || !/^(?:[a-f\d]{32}|[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12})$/i.test(result.uuid)) fail('AMO upload identifier is invalid. Inspect before retrying.');
        const uuid = result.uuid;
        for (let attempt = 0; result.processed !== true && attempt < 60; attempt++) {
            await sleep(10000);
            result = await request(`addons/upload/${uuid}/`, 'GET', undefined, false, 'upload validation');
        }
        if (result.processed !== true || result.valid !== true || result.version !== version || result.channel !== 'listed' || result.submitted) fail('AMO upload validation failed, timed out or returned mismatched metadata. No version creation requested. Inspect validation results.');
        const submission = new FormData();
        submission.set('upload', uuid);
        submission.set('source', new Blob([source], { type: 'application/zip' }), `Treco-source-v${version}.zip`);
        submission.set('approval_notes', 'Exact GitHub release package and matching reviewer source. See docs/RELEASING.md and .nvmrc: npm ci && npm run build. The shared engine and local UI assets are generated without minification. All executable code is bundled; signed remote data is declarative.');
        const created = await request(`${listing}versions/`, 'POST', submission, false, 'version creation');
        if (created.version !== version || created.channel !== 'listed') fail('Unexpected AMO version creation result. Inspect before retrying.');
        // Complex translated notes require JSON, separate from multipart source.
        await request(versionPath, 'PATCH', JSON.stringify({ release_notes: { 'en-US': notes } }), false, 'notes update after package submission');
        const confirmed = await request(versionPath, 'GET', undefined, false, 'submission confirmation');
        if (confirmed.version !== version || confirmed.channel !== 'listed' || confirmed.release_notes?.['en-US'] !== notes || !confirmed.source) fail('AMO submission metadata was not confirmed. Inspect before retrying.');
        return `Firefox ${version} submitted with matching source and English notes; AMO file status=${status(confirmed)}. Submission does not establish signing, approval or public availability.`;
    } catch (error) {
        // One read-only diagnosis after any possibly successful mutation. Never
        // repeat POST/PATCH automatically, including a failed notes update.
        let diagnosis = 'status lookup failed; inspect Developer Hub';
        try {
            const found = await request(versionPath, 'GET', undefined, true, 'post-failure diagnosis');
            diagnosis = found ? `version exists; AMO file status=${status(found)}; repair metadata only after inspection` : 'version not found; inspect the upload before retrying';
        } catch { /* Preserve the original controlled error without raw responses. */ }
        fail(`${error instanceof PublicationError ? error.message : 'AMO submission failed.'} Diagnosis: ${diagnosis}.`);
    }
}

export async function main(env = process.env) {
    if (env.GITHUB_ACTIONS !== 'true' || env.GITHUB_REPOSITORY !== 'rafelolv/Treco' ||
        !['push', 'workflow_dispatch'].includes(env.GITHUB_EVENT_NAME) ||
        (env.GITHUB_EVENT_NAME === 'push' ? env.GITHUB_REF !== `refs/tags/${env.RELEASE_TAG}` : env.GITHUB_REF !== 'refs/heads/main')) fail('Submission requires the official release workflow or an explicit main-branch retry.');
    const payload = verifyPayload(env.FIREFOX_PAYLOAD_DIR, env.RELEASE_TAG);
    // Local integrity validation deliberately precedes reading submission secrets.
    const message = await publishFirefox({ ...payload, mode: env.FIREFOX_MODE || 'submit', issuer: env.AMO_JWT_ISSUER, secret: env.AMO_JWT_SECRET });
    console.log(message);
    if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, `- ${message}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch(error => {
        console.error(error instanceof PublicationError ? error.message : 'Firefox preparation failed. Check the exact release payload and workflow configuration.');
        process.exitCode = 1;
    });
}
