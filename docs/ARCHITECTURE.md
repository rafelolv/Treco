# Architecture

`package.json` owns the public version. `src/core.user.js` is the only editable
engine source; `build/build.mjs` substitutes its version, compiles local UI assets
through `build/compile-ui.mjs`, and generates the root userscript. The engine intercepts player JSON, fetch/XHR and property assignments,
installs bounded DOM/playback fallbacks, and renders the existing Control Center.
It preserves consent, compliance-dialog exceptions and data-integrity checks.

Structural pruning uses an explicit source-reviewed ad-field allowlist at both
parsing and execution boundaries, including old cached rules. Generic containers,
player state and comment entities cannot be deletion/replacement targets.
Property traps are limited to known initial player/data roots and approved ad
leaves. Key replacement only recognizes JSON property names, preserving identical
string values. User-selected blocklists and cosmetic preferences remain separate.

Live and replay chat exit before the duplicate claim or extension adapters are
installed. Userscript metadata and extension content-script exclusions reinforce
this guard. Parent-page frame bridging refuses chat targets both before loading
and after navigation; chat continuations bypass response pruning as well.
Static extension network rules retain ad targets while leaving mixed-purpose
log_event, att/log and generate_204 endpoints alone.

Extension generation strips only userscript metadata and inserts the inherited
GM adapters and command hooks from `src/extension/`. Both packages receive an
identical generated `main.js`; packaging never maintains a second engine.
`src/extension/network-rules.json` drives packaged DNR output and is checked
against core intercept patterns. The canonical T logo is `images/icon.svg`;
Sharp creates all runtime PNGs; the same SVG is embedded in the panel stylesheet.
`src/ui/theme.json` is the shared panel/popup palette and `src/ui/panel.css` is the
canonical scoped panel stylesheet. CSS is embedded as a string during the build;
there is no runtime stylesheet download or HTML parsing. Source files remain
readable and unminified.

The page launcher opens the same Control Center as the manager menu and extension
commands. It mounts only inside the main page's YouTube/YouTube Music header.
There is no floating fallback; child frames, live chat/replay and embedded
players are excluded even if they contain a matching header. A tracked
1.5-second reconciliation timer and YouTube navigation events recover lazy or
replaced headers without observing the entire DOM. Shared theme tokens and the
canonical logo style a compact 40px launcher with the same red tile as the panel.
The build embeds images/icon.svg without a separate launcher variant. Missing headers leave keyboard/menu access available.

Alt+Shift+Z toggles the panel outside text fields and editable comments. The
launcher tooltip reports page-engine status. A dimmed symbol indicates pause;
a small amber dot appears only for refresh/engine warnings. These indicators
do not attest that ads were blocked. Favorites use a validated local
`ytab_favorite_features` boolean map. Known feature switches appear in Overview
with separate DOM IDs and the same consent/extension restrictions. Starring
never changes a feature override. This UI preference is intentionally excluded
from portable exports and cross-device sync.

The Control Center displays one selected section at a time; search deliberately
shows all matching sections. Hidden sections retain their controls and state for
updates but are excluded from the keyboard focus trap. Option rebuilds preserve
the current section, focused control and scroll position. Technical counters are
collapsed under Activity & rule status. Temporary pause controls use a separate
details element. The full-width brand bar owns the close button; the main header
owns the single visible section title. Feature pages render their controls
directly, while search retains per-result titles. Local serif display text and
system sans-serif controls share the same tokens with the extension popup. Existing storage keys, consent gates, feature
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
key IDs and monotonic data revisions remain intact. Treco uses new public
installation metadata while preserving the existing Firefox add-on ID. There is no automatic transfer
of manager storage or upstream extension storage to a different install identity;
use the existing settings export/import controls if needed. The importer accepts
the legacy YoutubeAdblock and Zynubo envelopes as well as Treco, while still rejecting
unrelated application exports and future schemas.

Remote resources are declarative data, never executable JavaScript. The inherited
Ed25519 trust anchor authenticates the unchanged signed data. URLs now point to
rafelolv/Treco, including mirrors. Until publication these URLs may return 404;
failed refreshes retain cached/built-in rules. The inherited signer cannot
create compatible signatures without the original private key. Rotate the key
explicitly, rebuild all formats and preserve revision/rollback semantics before
publishing changed signed data. Never commit private keys.

References: [Chrome content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts),
[Firefox content scripts](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_scripts),
[background differences](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background).


Playback speed is a manual Video tools action, not an installed filtering engine.
It validates quarter-step values between 0.25 and 10 before setting the current
main video's native playbackRate. It does not call play(), set defaultPlaybackRate,
change mute/pitch, add a storage key, or enforce speed during navigation/ratechange.
Ads, live player state and paused/disabled page protection block the action. The
existing panel statistics timer refreshes the read-only speed/availability display
while the panel is open; no additional interval or observer is installed.


The desktop player has a compact native-toolbar speed button. Its scoped slider
popover is a direct child of the same video player so fullscreen retains it.
Reconciliation reuses the header's 1.5-second timer and navigation hook. Native
rate/metadata events update the read-only button/slider state; they never reapply
a preferred speed. Replaced videos/toolbars dispose their old media listeners,
button, popover and outside-click listener before mounting a new control. The
popover closes on outside click, focus leaving, Escape or opening the main panel;
its keys and pointer actions do not bubble into the player's playback shortcuts.
It is absent in child frames, embedded/Shorts/chat pages, ads, live streams or
paused/disabled protection. No setting, permission or runtime dependency is added.


The hidePlayerSpeedButton feature defaults to false. Its saved boolean uses the
existing validated feature_overrides map and ordinary import/export/storage
broker, with no new permission or storage namespace. Reconciliation removes the
player button/popover while hidden; setting it back to false recreates the UI
without changing playback speed. Manual panel speed actions are independent.


Treco is the current product name. The GitHub repository and wire/storage
identities retain their existing names for compatibility. Treco.user.js is the
canonical generated installer; Zynubo.user.js is a byte-identical update alias.
The metadata icon is a build-time PNG data URL generated from images/icon.svg,
matching the packaged 128px icon and avoiding a stale remote icon cache. Author
metadata names rafelolv; inherited MIT notices remain in the source and legal files.
