import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { GUID, firefoxReleaseNotes, publishFirefox, token, isNewer, verifyPayload, main } from '../build/firefox/publish.mjs';

const version = '1.10.3';
const input = { version, addon: Buffer.from('exact-release-zip'), source: Buffer.from('exact-source-zip'), notes: 'Changes', issuer: 'test-issuer', secret: 'test-secret', sleep: async () => {} };
const uuid = '1234567890abcdef1234567890abcdef';
const checked = { uuid, processed: true, valid: true, version, channel: 'listed', submitted: false };
const detail = { version, channel: 'listed', file: { status: 'unreviewed' }, source: 'private-source', release_notes: { 'en-US': 'Changes' } };
const reply = (data, status = 200) => new Response(JSON.stringify(data), { status });
function transport(replies) {
    const calls = [];
    return { calls, fetchAPI: async (url, options) => {
        calls.push({ url, ...options });
        assert(url.startsWith('https://addons.mozilla.org/api/v5/addons/'));
        assert.equal(options.redirect, 'error');
        assert.match(options.headers.Authorization, /^JWT /);
        const next = replies.shift();
        if (next instanceof Error) throw next;
        assert(next, 'Unexpected extra AMO request');
        return next;
    } };
}
const start = () => [reply({ guid: GUID }), reply({}, 404), reply({ results: [{ version: '1.10.1' }], next: null })];

test('store notes preserve short English text and bound long Unicode notes including the link', () => {
    assert.equal(firefoxReleaseNotes('a'.repeat(3000), version).length, 3000);
    assert.equal(firefoxReleaseNotes(' Notes ', version), 'Notes');
    for (const long of ['a'.repeat(3001), '😀'.repeat(4000), ('A paragraph.\n\n').repeat(500)]) {
        const result = firefoxReleaseNotes(long, version);
        assert(result.length <= 3000);
        assert(result.endsWith(`Full release notes: https://github.com/rafelolv/Treco/releases/tag/v${version}`));
        assert(!/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/.test(result));
    }
    assert.throws(() => firefoxReleaseNotes(' ', version));
    assert.throws(() => firefoxReleaseNotes('Notes', '../tag'));
    assert.equal(firefoxReleaseNotes(`# Treco v${version}\n\n## Changes\n\n- Better controls.\n\n## Validation\n\nPrivate fixture details.`, version), '- Better controls.');
    assert.throws(() => firefoxReleaseNotes(`# Treco v${version}\n\nNo changes section.`, version), /Changes section/);
    assert.throws(() => firefoxReleaseNotes(`# Treco v${version}\n\n## Changes\n\n## Validation\n`, version), /empty/);
});

test('JWT uses HS256 and expires in one minute without exposing the secret', () => {
    const jwt = token(input.issuer, input.secret);
    const [header, body, signature] = jwt.split('.');
    assert.equal(JSON.parse(Buffer.from(header, 'base64url')).alg, 'HS256');
    const claims = JSON.parse(Buffer.from(body, 'base64url'));
    assert.equal(claims.exp - claims.iat, 60);
    assert.equal(claims.iss, input.issuer);
    assert.equal(signature, createHmac('sha256', input.secret).update(`${header}.${body}`).digest('base64url'));
    assert.notEqual(token(input.issuer, input.secret), jwt);
});

test('version comparison handles numeric components and refuses ambiguous prior versions', () => {
    assert(isNewer('1.10.3', '1.9.99'));
    assert(isNewer('1.10.3', '1.10.2.99'));
    assert(!isNewer('1.10.3', '1.10.3.0'));
    assert(!isNewer('1.10.3', '2.0'));
    assert.throws(() => isNewer('1.10.3', '1.10.3beta'));
    assert.throws(() => isNewer('1.10.3', '01.2.3'));
    assert.throws(() => isNewer('1234567890.0.0', '1.0.0'));
});

test('submission sends exact archive bytes, separate source and bounded translated notes', async () => {
    const mock = transport([...start(), reply({ uuid, processed: false }), reply(checked), reply(detail), reply(detail), reply(detail)]);
    const message = await publishFirefox({ ...input, ...mock });
    const mutations = mock.calls.filter(c => c.method !== 'GET');
    assert.equal(mutations.length, 3);
    assert.equal(mutations[0].body.get('channel'), 'listed');
    assert.deepEqual(Buffer.from(await mutations[0].body.get('upload').arrayBuffer()), input.addon);
    assert.deepEqual(Buffer.from(await mutations[1].body.get('source').arrayBuffer()), input.source);
    assert.equal(mutations[1].body.get('release_notes'), null);
    assert.deepEqual(JSON.parse(mutations[2].body), { release_notes: { 'en-US': 'Changes' } });
    assert.match(message, /submitted.*status=unreviewed/);
    assert.match(message, /does not establish signing, approval/);
});

test('existing version and read-only inspect never upload or replace anything', async () => {
    for (const mode of ['submit', 'inspect']) {
        const mock = transport([reply({ guid: GUID }), reply(detail)]);
        if (mode === 'inspect') assert.match(await publishFirefox({ ...input, ...mock, mode }), /already exists.*No changes/);
        else await assert.rejects(publishFirefox({ ...input, ...mock }), /already exists/);
        assert(mock.calls.every(c => c.method === 'GET'));
    }
});

test('missing listing, mismatched ID and missing credentials cannot create a listing', async () => {
    for (const responses of [[reply({}, 404)], [reply({ guid: 'other@id' })]]) {
        const mock = transport(responses);
        await assert.rejects(publishFirefox({ ...input, ...mock }), /listing/);
        assert.equal(mock.calls.length, 1);
        assert.equal(mock.calls[0].method, 'GET');
    }
    await assert.rejects(publishFirefox({ ...input, issuer: '', fetchAPI: () => assert.fail('No request without credentials') }), /Configure/);
});

test('empty and oversized archives are rejected before any authenticated request', async () => {
    for (const addon of [Buffer.alloc(0), { length: 200 * 1024 * 1024 + 1 }]) {
        await assert.rejects(publishFirefox({ ...input, addon, fetchAPI: () => assert.fail('No upload with invalid size') }), /200 MB/);
    }
});

test('history includes nonpublic versions and safely scans pages without trusting next URLs', async () => {
    const mock = transport([reply({ guid: GUID }), reply({}, 404),
        reply({ results: [{ version: '1.9.0' }], next: 'https://attacker.invalid/?token=secret' }),
        reply({ results: [{ version: '1.11.0' }], next: null })]);
    await assert.rejects(publishFirefox({ ...input, ...mock }), /must increase/);
    assert(mock.calls.every(c => c.method === 'GET'));
    assert(mock.calls[2].url.includes('filter=all_with_unlisted'));
    assert(mock.calls[3].url.endsWith('page=2'));
});

test('invalid or exhausted upload validation never creates a version', async () => {
    for (const altered of [{ valid: false }, { version: '9.0.0' }, { channel: 'unlisted' }, { submitted: true }]) {
        const mock = transport([...start(), reply({ ...checked, ...altered }), reply({}, 404)]);
        await assert.rejects(publishFirefox({ ...input, ...mock }), /upload validation/);
        assert.equal(mock.calls.filter(c => c.method === 'POST').length, 1);
    }
    const mock = transport([...start(), reply({ uuid, processed: false }), ...Array.from({ length: 60 }, () => reply({ uuid, processed: false })), reply({}, 404)]);
    await assert.rejects(publishFirefox({ ...input, ...mock }), /timed out/);
    assert.equal(mock.calls.filter(c => c.method === 'POST').length, 1);
});

test('ambiguous create response triggers diagnosis once and never retries POST', async () => {
    const mock = transport([...start(), reply(checked), new Error('sensitive browsing URL test-secret'), reply(detail)]);
    await assert.rejects(publishFirefox({ ...input, ...mock }), error => {
        assert.match(error.message, /version exists.*repair metadata only/);
        assert(!error.message.includes('test-secret'));
        return true;
    });
    assert.equal(mock.calls.filter(c => c.method === 'POST').length, 2);
    assert.equal(mock.calls.at(-1).method, 'GET');
});

test('notes failure diagnoses the already-created package without leaking raw API errors', async () => {
    const mock = transport([...start(), reply(checked), reply(detail),
        reply({ release_notes: { 'en-US': ['Secret raw error test-secret'] } }, 400), reply(detail)]);
    await assert.rejects(publishFirefox({ ...input, ...mock }), error => {
        assert.match(error.message, /HTTP 400.*notes update.*release_notes, en-US.*version exists/);
        assert(!error.message.includes('test-secret'));
        return true;
    });
    assert.equal(mock.calls.filter(c => c.method === 'PATCH').length, 1);
});

test('mismatched confirmation cannot be reported as a successful submission', async () => {
    const mock = transport([...start(), reply(checked), reply(detail), reply(detail), reply({ ...detail, source: null }), reply(detail)]);
    await assert.rejects(publishFirefox({ ...input, ...mock }), /metadata was not confirmed/);
});

test('payload verification rejects tampering and runs before reading secrets', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'treco-amo-payload-'));
    try {
        const hash = bytes => createHash('sha256').update(bytes).digest('hex');
        writeFileSync(join(directory, `Treco-firefox-v${version}.zip`), input.addon);
        writeFileSync(join(directory, `Treco-source-v${version}.zip`), input.source);
        writeFileSync(join(directory, 'payload.json'), JSON.stringify({ version, guid: GUID, notes: 'Changes', addonSha256: hash(input.addon), sourceSha256: hash(input.source) }));
        assert.deepEqual(verifyPayload(directory, `v${version}`).addon, input.addon);
        assert.throws(() => verifyPayload(directory, 'v9.0.0'), /mismatch/);
        writeFileSync(join(directory, `Treco-source-v${version}.zip`), 'changed');
        const env = { GITHUB_ACTIONS: 'true', GITHUB_REPOSITORY: 'rafelolv/Treco', GITHUB_EVENT_NAME: 'push', GITHUB_REF: `refs/tags/v${version}`, RELEASE_TAG: `v${version}`, FIREFOX_PAYLOAD_DIR: directory,
            get AMO_JWT_ISSUER() { assert.fail('Credentials read before verification'); } };
        await assert.rejects(main(env), /checksum/);
        await assert.rejects(main({ GITHUB_ACTIONS: 'true', GITHUB_REPOSITORY: 'other/fork' }), /official/);
    } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('workflow limits store credentials to the submission job after release validation', () => {
    const workflow = readFileSync('.github/workflows/publish-firefox.yml', 'utf8');
    const prepare = workflow.split('  prepare:')[1].split('  submit:')[0];
    assert(!prepare.includes('secrets.AMO_'));
    assert(workflow.includes('needs: prepare'));
    assert(workflow.includes('ref: refs/tags/${{ inputs.release_tag }}'));
    assert(workflow.includes('default: inspect'));
    const release = readFileSync('.github/workflows/release.yml', 'utf8');
    assert(release.includes('needs: publish'));
    assert(!readFileSync('.github/workflows/ci.yml', 'utf8').includes('publish-firefox'));
});

test('Python preparation verifies stable releases, exact source, sizes and checksums', () => {
    execFileSync('python3', ['tests/firefox_prepare_test.py'], { stdio: 'pipe' });
});
