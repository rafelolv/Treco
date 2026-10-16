// Installation/integration fixtures only. No requests to real YouTube or user profiles.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { chromium } from 'playwright-core';
import { connectWithMaxRetries } from '../node_modules/web-ext/lib/firefox/remote.js';

const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'zynubo-browser-'));
const reports = new Map();
let origin;
const core = await fs.readFile('Zynubo.user.js', 'utf8');
const version = JSON.parse(await fs.readFile('package.json')).version;
const fixture = mode => `<!doctype html><html><head><meta charset="utf-8"><title>Zynubo fixture</title></head><body>
<ytd-masthead><div id="end"><div id="buttons"></div></div></ytd-masthead>
<div class="ad-div"><tp-yt-paper-dialog role="dialog" class="ad-div"><button id="native-action" class="ad-div">Continue</button></tp-yt-paper-dialog></div>
<div class="ad-div" id="ordinary-ad">Advertisement</div>
<div id="movie_player" style="position:relative"><video class="html5-main-video"></video><div class="ytp-right-controls"><button class="ytp-settings-button">Settings</button></div></div>
<script>
const fixtureStore = Object.create(null);
window.GM_getValue = (key, fallback) => Object.hasOwn(fixtureStore, key) ? fixtureStore[key] : fallback;
window.GM_setValue = (key, value) => { fixtureStore[key] = value; };
window.GM_registerMenuCommand = () => null;
window.GM_unregisterMenuCommand = () => {};
window.GM_xmlhttpRequest = opts => opts.onerror?.(new Error('Fixture network disabled'));
</script>
${mode === 'userscript' ? '<script src="/core.js"></script>' : ''}
<script>
(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    let status;
    document.addEventListener('zynubo:status-response', e => { status = JSON.parse(e.detail); });
    document.dispatchEvent(new Event('zynubo:status-request'));
    const result = JSON.parse('{"adPlacements":[{"slot":1}],"videoDetails":{"title":"Keep this title"}}');
    const before = window.fetch;
    const second = document.createElement('script'); second.src = '/core.js';
    await new Promise((resolve, reject) => { second.onload = resolve; second.onerror = reject; document.head.append(second); });
    const payload = { mode: ${JSON.stringify(mode)}, status, pruned: !('adPlacements' in result),
        title: result.videoDetails.title, duplicatePrevented: window.fetch === before,
        panelBuilt: !!document.querySelector('.ytab-panel'),
        closedPanelHidden: !document.querySelector('.ytab-overlay').getClientRects().length,
        nativeActionVisible: !!document.getElementById('native-action').getClientRects().length,
        ordinaryAdHidden: !document.getElementById('ordinary-ad').getClientRects().length,
        launcherVisible: !!document.getElementById('ytab-launcher')?.getClientRects().length };
    document.getElementById('ytab-launcher').click();
    payload.launcherOpensPanel = document.querySelector('.ytab-overlay').classList.contains('ytab-active');
    document.getElementById('ytab-close-btn').click();
    document.body.dispatchEvent(new KeyboardEvent('keydown', {code:'KeyZ',altKey:true,shiftKey:true,bubbles:true}));
    payload.shortcutOpensPanel = document.querySelector('.ytab-overlay').classList.contains('ytab-active');
    payload.launcherStatus = document.getElementById('ytab-launcher').dataset.status;
    document.getElementById('ytab-star-fetchIntercept').click();
    payload.favoriteAvailable = !!document.getElementById('ytab-favorite-toggle-fetchIntercept');
    document.querySelector('[data-section-id="ytab-section-enhance"]').click();
    const speed = document.getElementById('ytab-playback-speed');
    speed.value = '10'; document.getElementById('ytab-speed-apply').click();
    payload.speedMaximum = document.querySelector('video').playbackRate === 10;
    document.getElementById('ytab-speed-reset').click();
    payload.speedReset = document.querySelector('video').playbackRate === 1;
    document.getElementById('ytab-close-btn').click();
    const speedButton = document.getElementById('ytab-player-speed-button');
    speedButton.click();
    const playerSlider = document.getElementById('ytab-player-speed-slider');
    playerSlider.value = '10'; playerSlider.dispatchEvent(new Event('input',{bubbles:true}));
    payload.playerSpeedMaximum = document.querySelector('video').playbackRate === 10 && speedButton.textContent === '10×';
    document.querySelector('#ytab-player-speed-popup button').click();
    payload.playerSpeedReset = document.querySelector('video').playbackRate === 1;
    // DOM fixture reports are deliberately unsigned test evidence, not product status.
    window.fixtureResult = payload;
})();
</script></body></html>`;
const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.url === '/chat-data') {
        res.setHeader('Content-Type', 'application/json'); res.end('{"message":"Live fixture message"}'); return;
    }
    if (req.url === '/live_chat') {
        res.setHeader('Content-Type', 'text/html');
        res.end(`<!doctype html><html><body><div id="messages"></div><script>
            const data=JSON.parse('{"adPlacements":[1],"frameworkUpdates":{"keep":true}}');
            let count=0;
            const timer=setInterval(async () => {
                const message=await (await fetch('/chat-data')).json();
                document.getElementById('messages').textContent+=message.message;
                if (++count===2) {
                    clearInterval(timer);
                    const node=document.createElement('pre');node.id='fixture-result';
                    node.textContent=JSON.stringify({mode:'chat',unpruned:!!data.adPlacements,frameworkKept:!!data.frameworkUpdates,panelAbsent:!document.querySelector('.ytab-panel'),received:count});
                    document.body.append(node);
                }
            },100);
        </script></body></html>`); return;
    }
    if (req.url.startsWith('/report')) {
        let body = ''; for await (const chunk of req) body += chunk;
        const report = JSON.parse(body); reports.set(report.browser + ':' + report.mode, report);
        res.end('ok'); return;
    }
    if (req.url === '/core.js') { res.setHeader('Content-Type', 'application/javascript'); res.end(core); return; }
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'");
    res.setHeader('Content-Type', 'text/html');
    res.end(fixture(req.url.includes('userscript') ? 'userscript' : 'extension'));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
origin = `http://127.0.0.1:${server.address().port}`;
let firefoxProcess;
let remote;
let context;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(fn, label, timeout = 30000) {
    const end = Date.now() + timeout;
    while (Date.now() < end) { const value = await fn(); if (value) return value; await delay(100); }
    throw Error(`Timeout: ${label}`);
}
async function prepare(browser) {
    const dir = path.join(tmp, browser);
    await fs.cp(`dist/${browser}`, dir, { recursive: true });
    const manifest = JSON.parse(await fs.readFile(`${dir}/manifest.json`, 'utf8'));
    for (const item of manifest.content_scripts) {
        item.matches = ['http://127.0.0.1/*'];
        item.exclude_matches = ['http://127.0.0.1/userscript*', 'http://127.0.0.1/live_chat*'];
    }
    manifest.host_permissions = ['http://127.0.0.1/*'];
    manifest.content_scripts.push({ matches: ['http://127.0.0.1/*'], js: ['test-probe.js'], run_at: 'document_idle' });
    if (browser === 'firefox') manifest.background.scripts.push('test-driver.js');
    else manifest.background = { service_worker: 'test-worker.js' };
    await fs.writeFile(`${dir}/manifest.json`, JSON.stringify(manifest));
    await fs.writeFile(`${dir}/test-worker.js`, "importScripts('background.js', 'test-driver.js');");
    await fs.writeFile(`${dir}/test-driver.js`, `
chrome.runtime.onMessage.addListener((message, sender, reply) => {
    if (message?.type === 'test:open' && sender.tab) {
        chrome.tabs.sendMessage(sender.tab.id, {type:'ytab:open-panel'}).then(() => reply({ok:true}), () => reply({ok:false}));
        return true;
    }
    if (message?.type !== 'test:status' || !sender.tab) return;
    chrome.tabs.sendMessage(sender.tab.id, {type:'zynubo:status'}).then(reply, () => reply({initialized:false}));
    return true;
});
chrome.tabs.create({url:${JSON.stringify(origin + '/extension')}});
chrome.tabs.create({url:${JSON.stringify(origin + '/userscript')}});
chrome.tabs.create({url:${JSON.stringify(origin + '/live_chat')}});
`);
    await fs.writeFile(`${dir}/test-probe.js`, `
(async () => {
    const limit = Date.now() + 15000;
    while (Date.now() < limit) {
        // Read fixture result through JSON, respecting Firefox's Xray boundary.
        const node = document.getElementById('fixture-result');
        if (node) {
            const result = JSON.parse(node.textContent);
            if (result.mode === 'extension') {
                result.runtimeStatus = await chrome.runtime.sendMessage({type:'test:status'});
                await chrome.runtime.sendMessage({type:'test:open'});
                await new Promise(resolve => setTimeout(resolve,200));
                const panel = document.querySelector('.ytab-panel');
                const rect = panel.getBoundingClientRect();
                result.panelOpened = !!document.querySelector('.ytab-overlay.ytab-active');
                result.panelFits = rect.width <= innerWidth && rect.height <= innerHeight;
                result.visibleSections = [...document.querySelectorAll('.ytab-layout > .ytab-section')].filter(el => !el.hidden).length;
                result.background = getComputedStyle(panel).backgroundColor;
            }
            await fetch(${JSON.stringify(origin + '/report')}, {method:'POST',body:JSON.stringify({...result,browser:${JSON.stringify(browser)}})});
            return;
        }
        await new Promise(resolve => setTimeout(resolve,100));
    }
})();
`);
    // All production executable files remain byte-identical; only test manifests
    // and additional driver scripts expand access to the loopback fixture.
    for (const file of ['main.js','background.js','bridge.js','popup.js']) {
        assert.deepEqual(await fs.readFile(`${dir}/${file}`), await fs.readFile(`dist/${browser}/${file}`));
    }
    return dir;
}
function check(report, expected) {
    assert.equal(report.status?.initialized, true, JSON.stringify(report));
    assert.equal(report.status.distribution, expected);
    assert.equal(report.status.version, version);
    assert.equal(report.pruned, true);
    assert.equal(report.title, 'Keep this title');
    assert.equal(report.duplicatePrevented, true);
    assert.equal(report.panelBuilt, true);
    assert.equal(report.closedPanelHidden, true);
    assert.equal(report.nativeActionVisible, true);
    assert.equal(report.ordinaryAdHidden, true);
    assert.equal(report.launcherVisible, true);
    assert.equal(report.launcherOpensPanel, true);
    assert.equal(report.shortcutOpensPanel, true);
    assert.equal(report.launcherStatus, 'attention', 'Fixture refresh failure must remain visible');
    assert.equal(report.playerSpeedMaximum, true);
    assert.equal(report.playerSpeedReset, true);
    assert.equal(report.speedMaximum, true);
    assert.equal(report.speedReset, true);
    assert.equal(report.favoriteAvailable, true);
    if (expected === 'extension') {
        assert.equal(report.runtimeStatus?.initialized, true, 'Isolated runtime status bridge');
        assert.equal(report.panelOpened, true);
        assert.equal(report.panelFits, true);
        assert.equal(report.visibleSections, 1);
        assert.equal(report.background, 'rgb(255, 255, 255)');
    }
}
try {
    // Add a DOM text report for the isolated probe, without object-world access.
    const originalEmit = server.listeners('request')[0];
    server.removeAllListeners('request');
    server.on('request', (req,res) => {
        if (req.url === '/extension' || req.url === '/userscript') {
            res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'");
            res.setHeader('Content-Type','text/html');
            res.end(fixture(req.url.slice(1)).replace('window.fixtureResult = payload;', `const node = document.createElement('pre'); node.id='fixture-result'; node.textContent=JSON.stringify(payload); document.body.append(node);`));
        } else originalEmit(req,res);
    });
    const chromeDir = await prepare('chromium');
    const executablePath = !process.env.ZYNUBO_CHROMIUM || process.env.ZYNUBO_CHROMIUM === 'playwright' ? chromium.executablePath() : process.env.ZYNUBO_CHROMIUM;
    context = await chromium.launchPersistentContext(path.join(tmp,'chrome-profile'), {
        executablePath, headless:true, args: ['--no-sandbox',`--disable-extensions-except=${chromeDir}`,`--load-extension=${chromeDir}`]
    });
    const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
    await waitFor(() => reports.get('chromium:extension'), 'Chromium extension report');
    await waitFor(() => reports.get('chromium:userscript'), 'Chromium userscript report');
    const chromiumChat = await waitFor(() => reports.get('chromium:chat'), 'Chromium excluded chat report');
    assert.deepEqual([chromiumChat.unpruned, chromiumChat.frameworkKept, chromiumChat.panelAbsent, chromiumChat.received], [true,true,true,2]);
    check(reports.get('chromium:extension'), 'extension'); check(reports.get('chromium:userscript'), 'userscript');
    const popup = await context.newPage();
    await popup.goto(worker.url().replace(/[^/]+$/, 'popup.html'));
    await popup.waitForFunction(() => document.getElementById('status').textContent.includes('No engine response'));
    await fs.mkdir('dist/ui-preview', {recursive:true});
    await popup.locator('body').screenshot({path:'dist/ui-preview/popup.png'});
    assert.equal(await popup.locator('#open').isDisabled(),true);
    console.log(`PASS Chromium ${context.browser()?.version() || execFileSync(executablePath,['--version']).toString().trim()}: temporary extension, page interception, duplicate claim, userscript fixture, runtime status, redesigned panel bounds/theme, popup unavailable state.`);
    await context.close(); context = null;

    const firefoxDir = await prepare('firefox');
    const profile = path.join(tmp,'firefox-profile'); await fs.mkdir(profile);
    const portServer = http.createServer(); await new Promise(resolve => portServer.listen(0,'127.0.0.1',resolve));
    const port = portServer.address().port; await new Promise(resolve => portServer.close(resolve));
    await fs.writeFile(`${profile}/user.js`, [
        'user_pref("devtools.debugger.remote-enabled", true);',
        'user_pref("devtools.debugger.prompt-connection", false);',
        'user_pref("devtools.chrome.enabled", true);',
        'user_pref("browser.shell.checkDefaultBrowser", false);',
        'user_pref("browser.aboutwelcome.enabled", false);',
        'user_pref("datareporting.policy.dataSubmissionEnabled", false);',
        'user_pref("toolkit.telemetry.enabled", false);'
    ].join('\n'));
    const firefoxPath = process.env.ZYNUBO_FIREFOX || '/usr/bin/firefox';
    firefoxProcess = spawn(firefoxPath,['--headless','--no-remote','--profile',profile,'--start-debugger-server',String(port),'about:blank'], {stdio:['ignore','pipe','pipe']});
    let firefoxLog=''; firefoxProcess.stderr.on('data', data => { firefoxLog += data; });
    remote = await connectWithMaxRetries({port,maxRetries:150,retryInterval:100});
    await remote.installTemporaryAddon(firefoxDir, false);
    await waitFor(() => reports.get('firefox:extension'), 'Firefox extension report');
    await waitFor(() => reports.get('firefox:userscript'), 'Firefox userscript report');
    const firefoxChat = await waitFor(() => reports.get('firefox:chat'), 'Firefox excluded chat report');
    assert.deepEqual([firefoxChat.unpruned, firefoxChat.frameworkKept, firefoxChat.panelAbsent, firefoxChat.received], [true,true,true,2]);
    check(reports.get('firefox:extension'), 'extension'); check(reports.get('firefox:userscript'), 'userscript');
    console.log(`PASS ${execFileSync(firefoxPath,['--version']).toString().trim()}: temporary add-on via Firefox RDP, page interception, duplicate claim, userscript fixture, cross-world runtime status, redesigned panel bounds/theme.`);
    console.log('LIMIT: loopback fixtures and simulated manager APIs; no real YouTube playback, manager installation, store signing or cross-device sync validation.');
} finally {
    remote?.disconnect();
    if (firefoxProcess) {
        const exited = new Promise(resolve => firefoxProcess.once('exit',resolve));
        firefoxProcess.kill('SIGTERM');
        await Promise.race([exited, delay(3000)]);
        if (firefoxProcess.exitCode === null) firefoxProcess.kill('SIGKILL');
    }
    await context?.close();
    await new Promise(resolve => server.close(resolve));
    await fs.rm(tmp, {recursive:true,force:true});
}
