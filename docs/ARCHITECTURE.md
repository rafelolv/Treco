# Architecture

`package.json` owns the public version. `src/core.user.js` is the only editable
engine source; `build/build.mjs` substitutes its version, compiles local UI assets
through `build/compile-ui.mjs`, and generates the root userscript. The engine intercepts player JSON, fetch/XHR and property assignments,
installs bounded DOM/playback fallbacks, and renders the existing Control Center.
It preserves consent, compliance-dialog exceptions and data-integrity checks.

Extension generation strips only userscript metadata and inserts the inherited
GM adapters and command hooks from `src/extension/`. Both packages receive an
identical generated `main.js`; packaging never maintains a second engine.
`src/extension/network-rules.json` drives packaged DNR output and is checked
against core intercept patterns. The canonical Z logo is `images/icon.svg`;
Sharp creates all runtime PNGs; the same SVG is embedded in the panel stylesheet.
`src/ui/theme.json` is the shared panel/popup palette and `src/ui/panel.css` is the
canonical scoped panel stylesheet. CSS is embedded as a string during the build;
there is no runtime stylesheet download or HTML parsing. Source files remain
readable and unminified.

The page launcher opens the same Control Center as the manager menu and extension
commands. It mounts inside the YouTube/YouTube Music header when present and uses
a fixed bottom-right fallback elsewhere, except embedded players. A tracked
1.5-second reconciliation timer and YouTube navigation events recover lazy or
replaced headers without observing the entire DOM. Shared theme tokens and the
canonical logo style the launcher; floating notifications leave room above it.

The Control Center displays one selected section at a time; search deliberately
shows all matching sections. Hidden sections retain their controls and state for
updates but are excluded from the keyboard focus trap. Option rebuilds preserve
the current section, focused control and scroll position. Technical counters are
collapsed under More counters. Existing storage keys, consent gates, feature
defaults and blocking engines are unchanged by the redesign.

| Surface | Userscript | Chromium | Firefox |
|---|---|---|---|
| Execution | Manager, requested page world | Static MAIN content script | Static MAIN content script, Firefox 140+ |
| Persistence | Manager GM APIs | Page localStorage mirror + validated storage broker | Same adapter, native chrome compatibility API |
| Browser APIs | Manager grants | MV3 service worker | MV3 background scripts |
| Network rules | Page interception | Page interception + static DNR | Page interception + static DNR |
| Community requests | GM cross-origin requests | Native fetch, CORS applies | Native fetch, CORS applies |
| Installation | Manager | Unpacked ZIP or future store | Temporary ZIP or future signed XPI |

The core must run in MAIN to intercept YouTube's native APIs. The isolated
bridge alone can contact extension storage and the broker. Messages retain the
inherited key allowlist, schema/size limits, coalescing, rate limits, sender
checks and bounded DNR diagnostics. Cross-world CustomEvent payloads are JSON
strings for Firefox's Xray boundary. Page scripts can observe/spoof DOM messages;
this channel must never authorize arbitrary network requests or expose secrets.
The popup's read-only status is evidence of a page response, not attestation
against a malicious page and not live blocking evidence.

The duplicate claim uses a synchronous cancelable document event before adapters
or engines initialize. It works without changing storage namespaces or internal
compatibility counters. Existing `ytab_*`, `__ytab_*`, event names, signed filenames,
key IDs and monotonic data revisions remain intact. Zynubo uses new public
installation metadata and a new Firefox add-on ID. There is no automatic transfer
of manager storage or upstream extension storage to a different install identity;
use the existing settings export/import controls if needed. The importer accepts
the legacy YoutubeAdblock envelope as well as Zynubo, while still rejecting
unrelated application exports and future schemas.

Remote resources are declarative data, never executable JavaScript. The inherited
Ed25519 trust anchor authenticates the unchanged signed data. URLs now point to
rafelolv/Zynubo, including mirrors. Until publication these URLs may return 404;
failed refreshes retain cached/built-in rules. The inherited signer cannot
create compatible signatures without the original private key. Rotate the key
explicitly, rebuild all formats and preserve revision/rollback semantics before
publishing changed signed data. Never commit private keys.

References: [Chrome content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts),
[Firefox content scripts](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_scripts),
[background differences](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background).
