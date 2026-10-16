# Zynubo

<img src="images/icon.svg" width="64" height="64" alt="Zynubo Z logo">

Your YouTube enhancement suite: block ads, skip sponsors with consent, and
customize your experience from one Control Center.

Zynubo offers a userscript and independent Chromium (Chrome, Brave, Edge) and
Firefox extensions. Extensions do not need Tampermonkey. All formats share the
same engine. Version 1.1.0 brings a redesigned Control Center with focused sections and
matching browser popups. No version can promise coverage of every YouTube experiment.

![Zynubo Control Center](docs/images/control-center-dark.png)

Local fixture capture of the redesigned panel. See [light, narrow-screen and popup previews](docs/UI.md);
these images do not demonstrate live YouTube ad blocking.

## Install

No Zynubo store listing or signed release has been published as part of this
setup. Until a release is available, build the local packages below. The
[releases page](https://github.com/rafelolv/Zynubo/releases) will contain official
downloads when published; do not install a similarly named third-party listing.

### Userscript

1. Install Tampermonkey or Violentmonkey in your browser.
2. Open [Zynubo.user.js](https://raw.githubusercontent.com/rafelolv/Zynubo/main/Zynubo.user.js) after the repository has been published, or import the local generated file into your manager.
3. Confirm installation and reload YouTube. Open **Zynubo: Open Control Center** from your manager menu.

On Chromium, your manager may require **Allow User Scripts** in its extension
settings. Page-context injection is necessary to intercept player responses;
manager configuration can affect timing and access to GM APIs.

### Chrome, Brave and Edge

1. Extract `Zynubo-chromium-v1.1.0.zip` into a permanent folder.
2. Open `chrome://extensions`, `brave://extensions` or `edge://extensions`.
3. Enable **Developer mode**, choose **Load unpacked**, and select the folder.
4. Reload YouTube and open the Zynubo toolbar popup.

The unsigned ZIP is for local testing or store submission, not a signed CRX.
The declared Chromium baseline is 121; actual tested versions are recorded in
[validation](docs/VALIDATION.md).

### Firefox

1. Extract `Zynubo-firefox-v1.1.0.zip`.
2. Open `about:debugging#/runtime/this-firefox`, select **Load Temporary Add-on**,
   then select the extracted `manifest.json`.
3. Reload YouTube and open the toolbar popup.

Firefox 140+ is required by this build. Temporary installs disappear after the
browser closes. The ZIP is unsigned and cannot provide a normal persistent
install. Persistent distribution requires Mozilla signing and, for a public
AMO listing, review. No signed XPI or AMO approval is claimed here.

## Use and update

Open the popup on a supported YouTube page, then **Open Control Center**.
Choose a section from the sidebar (scrollable navigation on narrow screens) or
use **Find a setting** to search across sections. Changes save automatically.
The Overview shows the main counters; **More counters** reveals technical totals.
The popup reports an actual engine response, enabled/paused state and degraded
initialization. It does not certify that ads are blocked. Other websites and
unresponsive tabs show an unavailable state. The Control Center contains engine
health, rule integrity, recovery and optional focus settings.

SponsorBlock, DeArrow and Return YouTube Dislike require individual consent.
DeArrow remains userscript-only. Extension community API access is optional;
grant it through the extension context menu only if needed. Services receive
video-related identifiers when enabled; read [privacy](docs/PRIVACY.md).

Use one distribution per browser profile. A document-wide claim prevents a
second Zynubo engine when both are enabled; the first to start owns the page.
The extension's declarative network rules still apply while installed, even
when the userscript owns the page or the page engine is paused. This inherited
separation is not a complete browser-layer off switch. Disable the extension to
stop its network rules. Other blockers and older upstream installations are
outside this duplicate guard; disable them during validation.

Userscript updates use this repository's main branch. For local extensions,
replace the extracted files with the new version, reload the extension, then
reload YouTube. Keep the same directory to avoid changing an unpacked Chromium
identity. Future store installs will update through the store using their
original extension IDs. Do not run an old and new userscript entry together.

## Limits and support

YouTube changes frequently. Server-stitched ads, account experiments, late
injection, competing scripts and browser policies can reduce effectiveness.
Tests against simulated pages do not prove live playback or live ad blocking.
Stable inherited behavior is kept separate from the historical upstream backlog;
no experimental features were promoted automatically.

Report problems at [Zynubo issues](https://github.com/rafelolv/Zynubo/issues).
Include browser and distribution versions, the affected YouTube surface and
redacted engine diagnostics. Never include cookies, tokens or private URLs.

## Build and maintain

Requires Node 22+, npm and Python 3. Use Node 24 for the reference build.

```sh
npm ci
npm run check
npm run lint:firefox
npm run test:extensions:browser
npm run package
```

Outputs: `Zynubo.user.js`, `dist/chromium/`, `dist/firefox/`, two extension ZIPs,
a reviewer source ZIP, the userscript and `dist/SHA256SUMS`.
Build dependencies are development-only. The runtime has no npm dependencies
and downloads no executable code. Signed filter/signature data are refreshed
from this project's repository; the inherited public verification key and
revision 8 remain unchanged. A new maintainer signing key needs an explicit
rotation before changing signed data. Built-in rules remain a fallback.

Read [maintenance](docs/MAINTENANCE.md), [architecture](docs/ARCHITECTURE.md),
[release instructions](docs/RELEASING.md) and [validation](docs/VALIDATION.md).

## License and origin

The inherited engine is MIT-licensed, copyright (c) 2025 Matthew Parker.
Zynubo is maintained independently by rafelolv with its own Git history.
Upstream provenance and required notices remain documented. See [LICENSE](LICENSE), [third-party notices](THIRD_PARTY_NOTICES.md)
and the [base assessment](docs/BASE-ASSESSMENT.md). External filter data and
community service data retain their separate terms and attribution.
