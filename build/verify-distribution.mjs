import assert from 'node:assert/strict';

// Main userscript updates and packaged release downloads are separate channels.
export function verifyDistributionReferences({readme, script, config, manifests, version}) {
    assert.equal(config.repository, 'rafelolv/Zynubo');
    const versions = [...readme.matchAll(/releases\/download\/v(\d+\.\d+\.\d+)\/Zynubo-(?:chromium|firefox)-v\d+\.\d+\.\d+\.zip/g)].map(match=>match[1]);
    assert.equal(new Set(versions).size, 1, 'README downloads must name one published release');
    const publishedVersion = versions[0];
    const project = `https://github.com/${config.repository}`;
    const raw = `https://raw.githubusercontent.com/${config.repository}/main`;
    for (const [field, expected] of Object.entries({
        version, icon:`${raw}/icon.png`, downloadURL:`${raw}/Zynubo.user.js`,
        updateURL:`${raw}/Zynubo.user.js`, homepageURL:project, supportURL:`${project}/issues`
    })) {
        const values = [...script.matchAll(new RegExp(`^// @${field}\\s+(\\S+)\\s*$`, 'gm'))].map(match => match[1]);
        assert.deepEqual(values, [expected], `Userscript @${field} differs from distribution references`);
    }
    const expected = ['chromium', 'firefox'].map(browser => `${project}/releases/download/v${publishedVersion}/Zynubo-${browser}-v${publishedVersion}.zip`).sort();
    const downloads = [...readme.matchAll(/https:\/\/github\.com\/[^\s"<>)]*\/releases\/download\/[^\s"<>)]*/g)].map(match=>match[0]);
    assert.deepEqual([...new Set(downloads)].sort(), expected, 'README release links do not match the published version pointer');
    assert(readme.includes(`${raw}/Zynubo.user.js`), 'README userscript installer link missing');
    for (const manifest of manifests) {
        assert.equal(manifest.version, version);
        assert.equal(manifest.homepage_url, project);
        for (const size of [16,32,48,128]) assert.equal(manifest.icons[size], `icons/icon${size}.png`);
        for (const size of [16,32,48]) assert.equal(manifest.action.default_icon[size], `icons/icon${size}.png`);
    }
}
