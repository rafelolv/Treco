import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {verifyDistributionReferences} from '../build/verify-distribution.mjs';
const script = fs.readFileSync('Zynubo.user.js', 'utf8');
const extension = fs.readFileSync('dist/chromium/main.js', 'utf8');
const popup = fs.readFileSync('src/extension/popup.js', 'utf8');
const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
const prefix = text => text.slice(text.indexOf('(function() {'), text.indexOf('    function readBridgeDetail')) + '\n})();';
for (const order of [[script, extension], [extension, script]]) {
    test(`duplicate claim prevents a second engine (${order[0] === script ? 'userscript' : 'extension'} first)`, () => {
        const document = new EventTarget();
        let installed = 0;
        const context = vm.createContext({ document, Event, install: () => installed++ });
        for (const text of order) vm.runInContext(prefix(text).replace('\n})();', '\ninstall();\n})();'), context);
        assert.equal(installed, 1);
    });
}
async function runPopup(response, reject = false) {
    const nodes = Object.fromEntries(['status','open','version'].map(key => [key, { disabled: true, textContent: '', addEventListener() {} }]));
    vm.runInNewContext(popup, { document: { getElementById: id => nodes[id] }, chrome: {
        runtime: { getManifest: () => ({version}) },
        tabs: { query: async () => [{ id: 1 }], sendMessage: async () => { if (reject) throw Error(); return response; } }
    } });
    await new Promise(resolve => setImmediate(resolve));
    return nodes;
}
test('popup reports unresponsive, paused, degraded and userscript ownership honestly', async () => {
    assert.match((await runPopup(null, true)).status.textContent, /No engine response/);
    const valid = {version,initialized:true,distribution:'extension',enabled:false,degraded:true};
    const paused = await runPopup(valid);
    assert.match(paused.status.textContent, /Paused.*Needs attention/);
    assert.equal(paused.open.disabled, false);
    assert.equal((await runPopup({...valid,version:'0.0.1'})).open.disabled, true);
    const user = await runPopup({...valid,distribution:'userscript'});
    assert.match(user.status.textContent, /Userscript controls/);
    assert.equal(user.open.disabled, true);
});

test('chat builds exit before claiming the document or installing adapters', () => {
    for (const code of [script, extension]) {
        for (const pathname of ['/live_chat', '/live_chat_replay']) {
            let touched=0;
            vm.runInNewContext(prefix(code).replace('\n})();','\ninstall();\n})();'), {
                URL, location:{href:`https://www.youtube.com${pathname}`,pathname},
                document:{dispatchEvent(){touched++;return true;},addEventListener(){touched++;}},
                install(){touched++;}
            });
            assert.equal(touched,0);
        }
    }
});

test('extension declarations exclude chat and avoid mixed-purpose telemetry blocks', () => {
    const manifest=JSON.parse(fs.readFileSync('src/extension/manifest.json'));
    for (const item of manifest.content_scripts) assert(item.exclude_matches.includes('https://*.youtube.com/live_chat*'));
    const rules=JSON.parse(fs.readFileSync('src/extension/network-rules.json')).dnrRules;
    for (const rule of rules) assert(!/log_event|\/att\/|generate_204|live_chat/.test(rule.condition.urlFilter || rule.condition.regexFilter || ''));
});


test('distribution references reject stale versions, wrong owners and mismatched icons', () => {
    const input={readme:fs.readFileSync('README.md','utf8'), script, config:JSON.parse(fs.readFileSync('build/distribution.json')), manifests:['chromium','firefox'].map(browser=>JSON.parse(fs.readFileSync(`dist/${browser}/manifest.json`))), version,iconData:`data:image/png;base64,${fs.readFileSync('icon.png').toString('base64')}`};
    assert.doesNotThrow(()=>verifyDistributionReferences(input));
    assert.throws(()=>verifyDistributionReferences({...input, script:script.replace(/@version +\S+/, '@version      0.0.1')}));
    assert.throws(()=>verifyDistributionReferences({...input, readme:input.readme.replaceAll('github.com/rafelolv/Treco/releases/download/', 'github.com/other/repo/releases/download/')}));
    const manifests=structuredClone(input.manifests); manifests[0].icons[128]='icons/old.png';
    assert.throws(()=>verifyDistributionReferences({...input,manifests}));
});

test('shared themes keep readable text and visible keyboard focus', () => {
    const theme=JSON.parse(fs.readFileSync('src/ui/theme.json'));
    const luminance=hex=>{
        const channels=hex.slice(1).match(/../g).map(value=>parseInt(value,16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4);
        return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;
    };
    const ratio=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
    for (const name of ['dark','light']) {
        const colors={...theme.common,...theme[name]};
        for (const surface of ['paper','rail','inset']) {
            for (const text of ['ink','muted','faint']) assert(ratio(colors[text],colors[surface])>=4.5, `${name} ${text}/${surface}`);
        }
        assert(ratio(colors.focus,colors.paper)>=3, `${name} focus outline`);
        assert(ratio(colors['accent-text'],colors.accent)>=4.5, `${name} primary button`);
    }
});


test('Treco metadata embeds the canonical icon and preserves its legacy update file', () => {
    assert.equal(fs.readFileSync('Treco.user.js','utf8'),script);
    assert.match(script,/^\/\/ @name +Treco$/m);
    assert.match(script,/^\/\/ @author +rafelolv$/m);
    const icon=script.match(/^\/\/ @icon +(\S+)/m)[1];
    assert.deepEqual(Buffer.from(icon.split(',')[1],'base64'),fs.readFileSync('icon.png'));
    for (const browser of ['chromium','firefox']) {
        const manifest=JSON.parse(fs.readFileSync(`dist/${browser}/manifest.json`));
        assert.equal(manifest.name,'Treco');
        assert.equal(manifest.action.default_title,'Treco');
    }
});
