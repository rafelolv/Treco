import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const script = fs.readFileSync('Zynubo.user.js', 'utf8');
const extension = fs.readFileSync('dist/chromium/main.js', 'utf8');
const popup = fs.readFileSync('src/extension/popup.js', 'utf8');
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
        runtime: { getManifest: () => ({version:'1.0.0'}) },
        tabs: { query: async () => [{ id: 1 }], sendMessage: async () => { if (reject) throw Error(); return response; } }
    } });
    await new Promise(resolve => setImmediate(resolve));
    return nodes;
}
test('popup reports unresponsive, paused, degraded and userscript ownership honestly', async () => {
    assert.match((await runPopup(null, true)).status.textContent, /No engine response/);
    const valid = {version:'1.0.0',initialized:true,distribution:'extension',enabled:false,degraded:true};
    const paused = await runPopup(valid);
    assert.match(paused.status.textContent, /Paused.*Degraded/);
    assert.equal(paused.open.disabled, false);
    assert.equal((await runPopup({...valid,version:'0.0.1'})).open.disabled, true);
    const user = await runPopup({...valid,distribution:'userscript'});
    assert.match(user.status.textContent, /Userscript owns/);
    assert.equal(user.open.disabled, true);
});
