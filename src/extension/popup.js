'use strict';
const status = document.getElementById('status');
const open = document.getElementById('open');
const version = chrome.runtime.getManifest().version;
document.getElementById('version').textContent = `v${version}`;
(async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) throw Error('No active tab');
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'zynubo:status' });
        if (response?.version && response.version !== version) {
            status.textContent = 'The page is using a different Zynubo version. Reload the extension and YouTube, then try again.';
            return;
        }
        if (!response || response.initialized !== true ||
            !['extension', 'userscript'].includes(response.distribution) ||
            typeof response.enabled !== 'boolean' || typeof response.degraded !== 'boolean') {
            throw Error('No verified engine response');
        }
        status.textContent = `${response.distribution === 'userscript' ? 'Userscript controls this tab' : 'Page engine responded'} · ${response.enabled ? 'Enabled' : 'Paused'}${response.degraded ? ' · Needs attention' : ''}`;
        // Only the extension owner installs extension panel commands.
        open.disabled = response.distribution !== 'extension';
        open.addEventListener('click', async () => {
            try { await chrome.tabs.sendMessage(tab.id, { type: 'ytab:open-panel' }); window.close(); }
            catch { status.textContent = 'The tab changed. Reload YouTube and try again.'; open.disabled = true; }
        });
    } catch {
        status.textContent = 'No engine response. Open or reload a supported YouTube page.';
    }
})();
