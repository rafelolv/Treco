import fs from 'node:fs/promises';
import { compileCore, compileStyles } from './compile-ui.mjs';
import { verifyDistributionReferences } from './verify-distribution.mjs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const pkg = JSON.parse(await fs.readFile('package.json'));
const script = await fs.readFile('Zynubo.user.js', 'utf8');
assert.equal(script, await compileCore(await fs.readFile('src/core.user.js', 'utf8'), pkg.version));
assert(script.includes(`// @version      ${pkg.version}`));
assert(script.includes('Copyright (c) 2025 Matthew Parker'));
const manifests = [];
const main = await fs.readFile('dist/chromium/main.js', 'utf8');
for (const browser of ['chromium', 'firefox']) {
    const dir = `dist/${browser}`;
    const manifest = JSON.parse(await fs.readFile(`${dir}/manifest.json`));
    manifests.push(manifest);
    assert.equal(manifest.version, pkg.version);
    assert(manifest.host_permissions.every(host => host.startsWith('https://')));
    assert(manifest.content_scripts.every(item => item.matches.every(host => host.startsWith('https://'))));
    assert.deepEqual(manifest.permissions, ['storage', 'contextMenus', 'declarativeNetRequest']);
    assert(!manifest.host_permissions.some(host => /<all_urls>|githubusercontent|\*:\/\/\*\//.test(host)));
    assert.equal(await fs.readFile(`${dir}/main.js`, 'utf8'), main);
    assert.equal(await fs.readFile(`${dir}/popup.css`, 'utf8'), await compileStyles('popup'));
    for (const size of [16,32,48,128]) {
        const png = await fs.readFile(`${dir}/icons/icon${size}.png`);
        assert.deepEqual(png.subarray(0,8), Buffer.from([137,80,78,71,13,10,26,10]));
        assert.equal(png.readUInt32BE(16), size);
        assert.equal(png.readUInt32BE(20), size);
        if (size === 128) assert.deepEqual(png, await fs.readFile('icon.png'));
    }
    const info = JSON.parse(await fs.readFile(`${dir}/build-info.json`));
    assert.equal(info.version, pkg.version);
    assert.equal(info.coreSha256, hash(script));
    assert.equal(info.mainSha256, hash(main));
    const rules = JSON.parse(await fs.readFile(`${dir}/rules/network-blocks.json`));
    assert.deepEqual(rules, JSON.parse(await fs.readFile('src/extension/network-rules.json')).dnrRules);
    for (const file of ['main.js', 'background.js', 'bridge.js', 'popup.js']) {
        const code = await fs.readFile(`${dir}/${file}`, 'utf8');
        new vm.Script(code, { filename: file });
        assert(!/\beval\s*\(|\bnew\s+Function\s*\(|importScripts\s*\(/.test(code), `Executable loading in ${file}`);
    }
    assert.equal(await fs.readFile(`${dir}/LICENSE`, 'utf8'), await fs.readFile('LICENSE', 'utf8'));
}
verifyDistributionReferences({readme:await fs.readFile('README.md','utf8'), script, config:JSON.parse(await fs.readFile('build/distribution.json','utf8')), manifests, version:pkg.version});
assert.deepEqual(manifests[0].background, { service_worker: 'background.js' });
assert.deepEqual(manifests[1].background, { scripts: ['background.js'] });
assert.equal(manifests[1].browser_specific_settings.gecko.id, 'zynubo@rafelolv.github.io');
// Rebuild and compare all distribution files, including rasterized icons.
async function snapshot(dir) {
    const files = await fs.readdir(dir, { withFileTypes: true });
    const values = [];
    for (const file of files.sort((a,b) => a.name.localeCompare(b.name))) {
        const p = `${dir}/${file.name}`;
        if (file.isDirectory()) values.push(...await snapshot(p));
        else values.push([p, hash(await fs.readFile(p))]);
    }
    return values;
}
const before = [...await snapshot('dist/chromium'), ...await snapshot('dist/firefox')];
const result = spawnSync(process.execPath, ['build/build.mjs'], { encoding: 'utf8' });
assert.equal(result.status, 0, result.stderr);
assert.deepEqual([...await snapshot('dist/chromium'), ...await snapshot('dist/firefox')], before);
console.log('Versions, package contents, shared engine, license and reproducible rebuild verified.');
