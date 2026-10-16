// Short synthetic regression gate. This does not certify live YouTube compatibility.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright-core';

const executablePath = process.env.YTAB_BROWSER_PATH || chromium.executablePath();
const sources = {
    userscript: fs.readFileSync('Zynubo.user.js','utf8'),
    extension: fs.readFileSync('dist/chromium/main.js','utf8')
};
const model = JSON.stringify({
    adPlacements:[{slot:1}],
    frameworkUpdates:{entityBatchUpdate:{mutations:[{payload:{commentEntityPayload:{properties:{content:{content:'A readable comment'}}}}}]}},
    videoDetails:{title:'A playable video'}, streamingData:{formats:[{itag:18}]}
});
const fixture = `<!doctype html><html><head><title>Stability fixture</title></head><body>
<ytd-masthead><div id="end"><div id="buttons"></div></div></ytd-masthead>
<div id="movie_player"><video id="video" muted playsinline></video><button id="play">Play</button></div>
<div id="comments"></div><div id="fetched-comments"></div><div id="messages"></div>
<a id="next" href="/watch?v=second">Next video</a>
<script>
const getComment = data => data.frameworkUpdates.entityBatchUpdate.mutations[0].payload.commentEntityPayload.properties.content.content;
const initial = JSON.parse(${JSON.stringify(model)});
document.getElementById('comments').textContent = getComment(initial);
window.fixtureAdRemoved = !('adPlacements' in initial);
fetch('/youtubei/v1/next').then(r => r.json()).then(data => {
    document.getElementById('fetched-comments').textContent = getComment(data);
    window.fixtureFetchedAdRemoved = !('adPlacements' in data);
});
const canvas = document.createElement('canvas'); canvas.width=64; canvas.height=64;
const ctx = canvas.getContext('2d'); ctx.fillRect(0,0,64,64);
const video = document.getElementById('video'); video.srcObject = canvas.captureStream(10);
setInterval(() => ctx.fillRect(0,0,64,64), 50);
document.getElementById('play').addEventListener('click', () => video.play());
if (location.pathname.startsWith('/live_chat')) {
    let count=0;
    setInterval(async () => {
        const response=await fetch('/youtubei/v1/live_chat/get_live_chat');
        const data=await response.json();
        const line=document.createElement('p'); line.textContent=data.message+' '+(++count);
        document.getElementById('messages').append(line);
    },100);
}
</script></body></html>`;
const prelude = `
window.fixtureNative = {fetch:window.fetch, parse:JSON.parse, xhr:window.XMLHttpRequest, timeout:window.setTimeout, append:Node.prototype.appendChild};
const store=Object.create(null);
window.GM_getValue=(key,fallback)=>Object.hasOwn(store,key)?store[key]:fallback;
window.GM_setValue=(key,value)=>{store[key]=value};
window.GM_registerMenuCommand=()=>null;
window.GM_unregisterMenuCommand=()=>{};
window.GM_xmlhttpRequest=options=>queueMicrotask(()=>options.onerror?.({status:0}));
`;

test('essential surfaces: video, comments, chat updates and navigation', {skip:!fs.existsSync(executablePath)}, async t => {
    const browser=await chromium.launch({executablePath,headless:true});
    t.after(()=>browser.close());
    for (const mode of Object.keys(sources)) {
        await t.test(mode, async () => {
            const context=await browser.newContext();
            try {
                await context.addInitScript({content:prelude+sources[mode]});
                await context.route('**/*', route => {
                    const url=new URL(route.request().url());
                    if (url.pathname==='/youtubei/v1/next') return route.fulfill({contentType:'application/json',body:model});
                    if (url.pathname.startsWith('/youtubei/v1/live_chat/')) return route.fulfill({contentType:'application/json',body:'{"message":"A live message"}'});
                    if (url.hostname==='www.youtube.com') return route.fulfill({contentType:'text/html',body:fixture});
                    return route.abort();
                });
                const page=await context.newPage();
                await page.goto('https://www.youtube.com/watch?v=first');
                await page.waitForFunction(()=>document.getElementById('fetched-comments').textContent==='A readable comment');
                assert.equal(await page.locator('#comments').textContent(),'A readable comment');
                assert.equal(await page.evaluate(()=>window.fixtureAdRemoved),true);
                assert.equal(await page.evaluate(()=>window.fixtureFetchedAdRemoved),true);
                await page.click('#play');
                await page.waitForFunction(()=>!document.getElementById('video').paused && document.getElementById('video').currentTime>.1);
                // A same-origin chat must not receive the parent's intercepted APIs.
                await page.evaluate(()=>{
                    const chat=document.createElement('iframe'); chat.id='chat'; chat.src='/live_chat'; document.body.append(chat);
                });
                const chat=page.frameLocator('#chat');
                await chat.locator('#messages p').nth(1).waitFor();
                const chatFrame=page.frames().find(frame=>new URL(frame.url()).pathname==='/live_chat');
                assert.deepEqual(await chatFrame.evaluate(()=>({
                    fetch:fetch===window.fixtureNative.fetch, parse:JSON.parse===window.fixtureNative.parse,
                    xhr:XMLHttpRequest===window.fixtureNative.xhr, timeout:setTimeout===window.fixtureNative.timeout,
                    append:Node.prototype.appendChild===window.fixtureNative.append,
                    bridged:window.__ytabBridged__===true, panel:!!document.querySelector('.ytab-panel')
                })),{fetch:true,parse:true,xhr:true,timeout:true,append:true,bridged:false,panel:false});
                await page.evaluate(()=>{history.pushState({},'', '/watch?v=spa');document.dispatchEvent(new Event('yt-navigate-finish'));});
                assert.equal(await page.locator('#ytab-launcher').count(),1);
                assert.equal(await page.locator('#comments').textContent(),'A readable comment');
                await page.click('#next');
                await page.waitForURL('**/watch?v=second');
                await page.waitForFunction(()=>document.getElementById('fetched-comments').textContent==='A readable comment');
                await page.click('#play');
                await page.waitForFunction(()=>!document.getElementById('video').paused && document.getElementById('video').currentTime>.1);
                await page.goto('https://www.youtube.com/live_chat_replay');
                await page.locator('#messages p').nth(1).waitFor();
                assert.equal(await page.locator('.ytab-panel').count(),0);
                assert.equal(await page.evaluate(()=>fetch===window.fixtureNative.fetch && JSON.parse===window.fixtureNative.parse),true);
            } finally {await context.close();}
        });
    }
});
