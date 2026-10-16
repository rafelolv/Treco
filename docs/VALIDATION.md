# Validation — 2026-10-16

These results describe this local preparation, before external publication.

## Passed

- `npm run check`: build, inherited engine/broker/security tests, new distribution
  tests, license preflight, synchronized versions, syntax and package-content
  verification, plus byte-identical repeated extension builds (including icons).
- 220 individual unit/contract cases: 157 engine cases, 36 background cases,
  23 bridge cases, 3 distribution/popup cases, and 1 signer case. The Node test
  subprocess reporter summarizes five files; individual direct runs expose the
  underlying cases. No failed or skipped cases in the final run.
- `npm run lint:firefox`: web-ext 10.8.0, zero errors, notices or warnings.
- `npm run test:extensions:browser`: Chromium for Testing 149.0.7827.55 and
  Mozilla Firefox 157.0, headless Linux, temporary profiles. Loaded unpacked /
  temporary add-on packages and exercised packaged MAIN engine and isolated
  bridge, JSON ad-field pruning while retaining content, Control Center creation,
  duplicate-engine prevention, and queried runtime status. A separate userscript
  fixture used simulated GM APIs. Chromium also checked the real popup's
  unavailable state. No user browser profile was used.
- Test-only manifests replace production matches with loopback-only matches;
  production executable files are verified byte-for-byte. Extra test-driver
  scripts relay runtime status and collect local fixture reports. Production
  sender/host restrictions are not weakened. The production settings broker
  correctly cannot trust the loopback origin; its sender validation and storage
  behavior are covered separately by the contract tests.
- `npm run test:browser:upstream`: Google Chrome 154.0.8037.97, 12 mocked surface
  combinations (userscript and generated extension engine across desktop dark,
  light, wide, Music, TV and Kids). All passed. This matrix injects the engine
  with test adapters; it is UI/behavior evidence, not extension-installation
  evidence. Screenshots are in `dist/browser-smoke/` and are not release assets.
- `npm run package`: unsigned Chromium/Firefox ZIPs, editable reviewer source,
  generated userscript and checksums. Two consecutive archive generations were
  compared byte-for-byte through SHA256SUMS.
- Original signed filter/signature files and their manifests remain byte-identical
  to upstream. GitHub account lookup confirmed rafelolv has public ID 82127878.

## Limits and pending manual checks

- No real YouTube playback/ad-blocking check, logged-in account check, SSAI
  session, userscript-manager installation, minimum-version browser test,
  Chrome/Brave/Edge manual extension install, cross-device sync or mobile test.
- Automated extension loading was performed in Chromium for Testing. Installed
  Google Chrome 154 did not expose the extension worker through command-line
  loading; that attempt timed out and is not recorded as an installation pass.
- No GitHub push, release publication, store upload, approval or signed XPI.
  The CI workflow is prepared but has not run on GitHub yet.
- No end-to-end check of the new remote data URLs: publication is pending.
  Built-in fallback remains available. Signed data still trusts the inherited
  public key; maintainers need an explicit key rotation to change those data.
- Store screenshots, publisher accounts, first Chromium IDs, signing credentials
  and a final store privacy questionnaire remain publication prerequisites.
- web-ext's update-notifier could not write its user config in the sandbox; the
  linter itself passed. npm audit reports three high-severity development-tool
  entries via web-ext's Android/node-forge chain with no current registry fix;
  see MAINTENANCE.md. None are bundled in runtime packages.
- The inherited in-page pause does not disable extension static DNR rules.
  DOM status can be spoofed by page scripts and is not a security attestation.

The source VM harness exposes real functions but stubs browser APIs. Successful
unit tests or fixture screenshots cannot certify live ad blocking or store review.

## Independent-history update — 2026-10-16

The maintainer subsequently authorized replacing main with an independent root
commit, without a backup. Earlier preparation results above describe the original
setup. This update changes ancestry and documentation only; runtime source,
versions, signing data and compatibility identifiers remain unchanged. The local
check suite was rerun for this update. GitHub contributor statistics can remain
cached after a force push; their refresh is separate from verifying branch ancestry.

## 1.1.0 visual redesign — 2026-10-16

- `npm run check` passed: all 220 unit/contract cases, generated source parity,
  version/hash checks, license preflight and reproducible extension rebuilds.
- `npm run test:browser:upstream` passed all 22 scenarios (24 including parent
  test groups) on Chromium for Testing 149.0.7827.55. The existing 12 surface
  combinations now also check the redesigned section navigation; 10 additional
  cases cover both distributions at 320x568, 390x844, 768x1024, 960x540 and
  1440x900 in light/dark fixture themes. Checks cover single-page visibility,
  search across pages, empty search, Escape-to-clear, focus wrapping, checkbox
  state/focus after rebuild, horizontal overflow and reopening on Overview.
- `npm run test:extensions:browser` passed on Chromium for Testing 149.0.7827.55
  and Firefox 157.0 with temporary profiles. In addition to existing runtime
  checks, both installed packages opened the redesigned panel through the
  isolated bridge and verified its theme, bounds and single visible section.
  The real Chromium popup's unavailable state was captured as well.
- `npm run lint:firefox` passed with zero errors, notices or warnings.
- Native browser captures were visually inspected in dark/light themes and on
  narrow screens. Examples are in docs/images/; extended captures remain in
  dist/ui-preview/ and dist/browser-smoke/. All use synthetic local data.
- `npm run package` rebuilt the synchronized 1.1.0 userscript, Chromium/Firefox
  ZIPs and reviewer source. Repeated ZIP generation produced matching checksums.
- No live YouTube playback, actual mobile browser, store signing/submission or
  cross-device synchronization is claimed. Narrow viewport checks are desktop
  browser emulation. Blocking engines, defaults, consent, storage namespaces,
  signed-data revisions and add-on IDs were preserved.

## GitHub release 1.1.0 preparation — 2026-10-16

- Repeated npm run package, Firefox lint and temporary-profile Chromium/Firefox
  integration checks; all passed. The full 22-scenario UI fixture matrix passed.
- Rebuilt ZIPs twice with identical SHA256SUMS. The release validator checked
  exact asset names, checksums, versions, bundled engine and reviewer source.
  An altered userscript was rejected by a separate corruption check.
- Reviewed the new tag-only Release workflow: validation has read-only repository
  access; the dependent publication job alone receives contents: write and the
  ephemeral GitHub token. It refuses existing releases, downloads the published
  assets and verifies checksums. Ordinary main/PR CI remains non-publishing.
- Release notes distinguish unsigned GitHub ZIPs from store signing/approval.
  No live YouTube or store compatibility claim has been added.

## 1.1.1 modal-lock correction — 2026-10-16

- Reproduced two startup failures in synthetic YouTube routes before the fix:
  the closed Control Center could mount without its document-start stylesheet,
  and cosmetic rules could hide a native modal while its backdrop and inert
  page remained active. Both injected distribution modes failed the regression.
- Cosmetic serialization now preserves native dialogs, their descendants and
  containing elements even when cached or remote selectors match them. Native
  actions stay under user control; the engine does not dismiss verification or
  consent prompts. Ordinary matching ads remain hidden in the regression.
- The native-dialog regression passed on Brave Origin Nightly 154.1.98.28 in
  userscript and extension modes. It checks startup visibility, a native modal,
  manual dismissal, advancing synthetic video frames, restored clicks, panel
  closing and recovery after detaching an open panel during simulated navigation.
- The full Chromium for Testing 149.0.7827.55 UI matrix passed 24 scenarios
  (27 including parent groups). The subsequent detached-panel assertions were
  checked separately on Brave in both modes.
- Temporary installation checks passed on Chromium 149.0.7827.55 and Firefox
  157.0, including hidden startup UI, native dialog controls and ordinary ad
  hiding in both the userscript fixture and installed extension. Production
  executable files remain byte-identical to the generated packages.
- npm run check passed all 220 unit/contract cases, license checks, synchronized
  versions, shared-engine parity and reproducible builds. Firefox lint reported
  zero errors, notices or warnings. npm run package produced the 1.1.1 artifacts.
- These tests use synthetic pages, simulated manager APIs and temporary browser
  profiles. No actual Violentmonkey installation or live YouTube playback was
  validated, so resolution in the user's Brave profile remains unconfirmed.
- Signed filter files, verification keys, storage and consent defaults remain
  unchanged. The existing published v1.1.0 tag/assets are unchanged.

## 1.2.0 page launcher — 2026-10-16

- Added a visible Zynubo button to the YouTube/YouTube Music header with a
  bottom-right fallback on other layouts. Embedded players are excluded. The
  existing manager menu and browser toolbar remain available.
- The launcher regression passed in userscript and extension modes on Brave
  Origin Nightly 154.1.98.28. Checks cover click/Enter opening, Escape closing,
  returning keyboard focus, 320px viewport bounds, notification clearance,
  delayed masthead rendering, replacement during navigation and duplicate
  prevention. Synthetic header/mobile captures were visually reviewed.
- Temporary installation tests passed on Chromium for Testing 149.0.7827.55 and
  Firefox 157.0, including page-button visibility and opening the same panel
  from both the simulated userscript integration and each installed extension.
- npm run package passed all 220 unit/contract cases, license preflight,
  synchronized 1.2.0 metadata, shared-engine parity and reproducible build
  verification. Firefox lint passed with zero errors, notices or warnings.
- The full Chromium UI suite passed all 26 scenarios (30 including parent
  groups), covering existing surfaces, responsive settings, modal recovery
  and the new launcher.
- All browser evidence uses local/synthetic routes and temporary profiles.
  Actual Violentmonkey installation, live YouTube header layouts and playback
  were not validated. No existing release tag or published asset was changed.

## 1.3.0 quick access and favorites — 2026-10-16

- Added Alt+Shift+Z, a launcher status dot and starred feature switches near the
  top of Overview. Shortcut handling ignores text inputs, comment editors,
  composition, repeats and already-consumed events. Closing the dialog restores
  focus to the launcher if the previous target cannot regain focus.
- Focused synthetic-page checks passed on Brave Origin Nightly 154.1.98.28 in
  userscript and extension modes: shortcut opening, input/editor exclusion,
  favorite add/remove, focus retention, unchanged feature state when starring,
  shared switch updates, persistence across panel reopening, pause/status
  changes and 320px bounds. DeArrow remains disabled in extension favorites.
  Narrow favorites captures were visually inspected.
- Temporary installation checks passed on Chromium for Testing 149.0.7827.55
  and Firefox 157.0. Both integrations exercise shortcut opening, launcher
  attention status for deliberately failed fixture refreshes and adding a
  favorite through the existing storage adapter.
- npm run package passed 221 unit/contract cases, license checks, synchronized
  1.3.0 metadata, shared-engine parity and reproducible builds. The new broker
  regression checks bounded favorite boolean maps and exclusion from sync.
  Firefox lint passed with zero errors, notices or warnings.
- The full Chromium UI suite passed 28 scenarios (33 including parent groups),
  including existing surfaces, responsive layouts, modal recovery, the launcher
  and the new controls.
- Favorite preferences are local to the installation and excluded from settings
  exports/sync. Consent, feature defaults, signed data and add-on IDs are
  unchanged. No new permissions or published release tags/assets were added.
- Tests use synthetic routes, simulated manager APIs and temporary profiles;
  no actual Violentmonkey installation or live YouTube compatibility is claimed.

## 1.3.1 header-only launcher — 2026-10-16

- Removed the floating page-button fallback. The launcher now requires a main
  document and a supported YouTube/YouTube Music header. It is excluded from
  live chat, replay chat, embedded players and every child frame, including
  frames that contain a matching header. Missing/replaced headers leave no
  button over the page; keyboard and menu access remain available.
- The focused launcher regression passed on Brave Origin Nightly 154.1.98.28
  in userscript and extension modes. It checks absence without a header,
  shortcut access, delayed header mounting, normal document-flow placement,
  removal/replacement of the header container, repeated navigation, live-chat
  frames, generic child frames and standalone live/replay/embed routes.
- The synthetic fixture intentionally includes a matching header in excluded
  routes and frames so the test verifies placement policy, not just missing
  host markup. No production host or frame permission was expanded.
- npm run check passed 221 unit/contract cases, license checks, synchronized
  1.3.1 metadata, shared-engine parity and reproducible build verification.
- The full Chromium suite passed 28 scenarios (33 including parent groups).
  Temporary installation checks passed on Chromium for Testing 149.0.7827.55
  and Firefox 157.0. Firefox lint reported zero errors, notices or warnings;
  npm run package produced the synchronized 1.3.1 artifacts.
- Browser evidence uses synthetic responses and temporary profiles. No actual
  Violentmonkey installation, live YouTube broadcast or live chat was tested.
  Signed data, feature defaults, storage namespaces and published release assets
  remain unchanged.

## 1.3.2 comment entity preservation — 2026-10-16

- A focused regression reproduced deletion of frameworkUpdates, including a
  commentEntityPayload text mutation, by the inherited broad pruning rule.
  A second case covers cached broad rules and property-trap compilation.
- Removed the broad built-in paths and guarded filter sanitization, direct
  pruning, trap compilation and application. Targeted adPlacements and ad-signal
  pruning remain active. Signed data files remain byte-identical.
- The maintainer requested a focused hotfix without repeating the local browser
  matrix. npm run package covers 222 unit/contract cases, versions, generated
  parity, attribution and reproducible builds. The tag publication workflow
  retains its existing validation requirements and downloaded checksum checks.
- No live comments, real YouTube playback or actual Violentmonkey profile was
  validated locally. This fix preserves missing entity data; the exact symptom
  in the user's browser still needs confirmation after updating and reloading.

## 1.4.0 structural safety and chat isolation — 2026-10-16

- Structural pruning, parsed scriptlets, cached-rule execution and key
  replacement now accept only reviewed ad fields. Generic framework, content,
  player and comment containers remain intact. Property traps accept only
  approved initial player/data roots. Literal comment text matching an ad
  field name remains unchanged. Signed data files are byte-identical.
- Chat documents exit before the duplicate claim, adapters, DOM hooks, timers
  or storage setup. Userscript and extension declarations exclude chat as an
  additional layer. Parent iframe bridging checks both the intended source
  and current document, and chat continuations bypass response pruning.
- Removed static extension rules for mixed-purpose log_event, att/log and
  generate_204 endpoints. No host grants or API permissions were added.
- npm run package passed 228 unit/contract cases, version/parity/license checks
  and reproducible builds. New regressions cover rejected generic targets,
  cached rules, text preservation, chat continuations, parent API bridging,
  early chat exits in both builds and extension declarations/bridge exclusions.
- npm run test:stability passed in userscript and generated extension modes on
  Chromium for Testing 149.0.7827.55 and Brave Origin Nightly 154.1.98.28. Each
  run took about 3 seconds. It verifies actual advancing synthetic media,
  initial/fetched comment rendering while ad fields are removed, live messages,
  native chat API identity, live/replay isolation and SPA/full navigation.
- The full Chromium UI matrix passed 28 scenarios (33 including parent groups).
  Existing header tests now expect no engine inside live/replay chat documents.
- Temporary installation checks passed on Chromium 149.0.7827.55 and Firefox
  157.0. Their excluded chat fixture retains its parsed data, receives two
  network messages and mounts no panel. Production executable files remain
  byte-identical; loopback-only test manifests model the chat exclusions.
- Firefox lint reported zero errors, notices or warnings. Both CI workflows now
  run the short stability gate before the existing full UI matrix.
- Evidence is synthetic, including the video stream and incoming chat messages.
  Actual Violentmonkey installation and live YouTube playback/comments/chat
  were not validated. No new release tag or store submission was authorized.

## 1.5.0 settings redesign — 2026-10-16

- Replaced the dashboard-style Overview with a compact page-filter switch,
  favorites and three plain navigation rows. Counters and rule metadata live
  in Activity & rule status; temporary pause controls have a separate disclosure.
  Page warnings remain visible. Feature pages open their controls directly.
- Added a full-width brand/close bar, one visible section title, local serif
  headings and neutral black/white surfaces with the canonical red Z mark.
  The extension popup uses the same palette and typography. Narrow headers
  place search on its own full-width line.
- npm run package passed all 228 unit/contract cases, attribution, synchronized
  versions, generated source parity and reproducible builds. Public metadata
  is 1.5.0 in the root userscript and both extension manifests/build-info files.
  Userscript download/update/icon URLs still point to the generated main files.
- The complete Chromium for Testing 149.0.7827.55 UI matrix passed 28 scenarios
  (33 including parent groups). Assertions cover collapsed technical counters,
  direct home links, heading focus, summaries in keyboard focus wrapping,
  search, settings rebuilds, both themes, narrow layouts and existing recovery.
  The 10 responsive cases were repeated after the final mobile search alignment.
- A userscript desktop fixture passed on Brave Origin Nightly 154.1.98.28.
  Native dark/light, settings, mobile and popup captures were visually reviewed.
  Current screenshots have versioned filenames so earlier evidence is retained.
- Temporary extension installation/integration checks passed on Chromium
  149.0.7827.55 and Firefox 157.0; both open the shared redesigned panel and
  preserve the existing status, storage, shortcut and chat-exclusion behavior.
  Firefox lint reported zero errors, notices or warnings.
- The short video/comment/chat/navigation gate passed in both generated modes.
  Filter engines, signed data, consent defaults and storage namespaces are
  unchanged by this UI work. No new host or API permissions were added.
- All browser evidence uses synthetic data, simulated manager APIs and temporary
  profiles. No actual Violentmonkey profile, live YouTube playback or store
  signing/submission was validated. No new release tag was created.


## 1.6.0 support and distribution improvements — 2026-10-16

- Added recovery advice with explicit reload/rule-refresh actions, plain-language
  feature descriptions with optional technical details, clearer storage errors
  and an extension/page version mismatch message. Existing consent defaults,
  filter algorithms, permissions, signed files and chat exclusions are preserved.
- Diagnostics can be reviewed, copied or downloaded as text. Reports omit video
  and channel IDs, pasted lists, custom source URLs and raw errors; lines are
  capped at 768 characters and reports at 16,384 characters. Explicit settings
  export remains separate. New regression fixtures inject private data and
  assert that it is absent from the report.
- List replacement and migration require deliberate confirmation, canceled by
  editing, blur or Escape. JSON import previews expire and reject double-clicks;
  their rebuilt panel keeps the existing undo action visible. The clipboard
  fallback removes its temporary field and restores focus even on failure.
- Shared theme contrast assertions exposed and corrected the light-theme faint
  text color. Inputs have explicit labels, technical disclosures identify their
  feature, and keyboard focus excludes content inside closed disclosures.
- npm run package passed all five unit/contract suites, source/version/engine
  parity, license checks and reproducible extension builds. Public metadata is
  synchronized at 1.6.0 in the userscript and both extension packages.
- Chromium for Testing 149.0.7827.55 passed the full UI matrix: 30 scenarios
  (36 including parent groups), with zero skips. New browser scenarios exercise
  text import confirmation, edit cancellation, migration Escape, JSON import,
  undo after rebuilding, diagnostic preview/download and destructive double-click
  protection in both generated modes. The affected support scenarios were
  repeated after adding JSON-preview Escape cancellation. Dark settings captures
  were inspected visually.
- npm run test:stability passed both userscript and generated-extension scenarios.
  Temporary extension installation/integration checks passed in Chromium
  149.0.7827.55 and Mozilla Firefox 157.0. Firefox lint reported zero errors,
  notices or warnings. No user browser profile was used.
- npm run verify:published downloaded and verified all five existing v1.3.2
  release assets, SHA256SUMS, userscript metadata, shared engines, icon dimensions,
  public icon and matching reviewer source. The new weekly/manual audit workflow
  is read-only. README links intentionally continue to name that published
  release; the userscript's main URL can receive newer versions independently.
- Browser evidence is synthetic and uses simulated manager APIs. Actual
  Violentmonkey installation and live YouTube playback/ad blocking were not
  validated. No new release tag or store submission was created.


## 1.7.0 manual playback speed — 2026-10-16

- Video tools offers a labeled 0.25×–10× numeric control in quarter steps, an
  explicit Apply speed button/Enter action, current-rate display and Reset to 1×.
  Search finds the control. It changes only the current main video's native
  playbackRate; it never calls play(), changes mute/pitch, writes speed settings
  or installs a navigation/ratechange override. Ads, live streams and paused or
  disabled page protection block the action. It uses the existing panel timer.
- Invalid values and native setter failures produce bounded, actionable messages.
  Help explains that high playback rates may silence audio in some browsers;
  10× is an available manual rate, not a universal playback-quality guarantee.
- npm run package passed all five unit/contract suites, including new invalid-rate,
  live-video and setter-error regressions. Versions are synchronized at 1.7.0;
  both extension engines are byte-identical. No dependency, API permission, host
  match, consent default, signed-data or filtering-algorithm changes were made.
- Chromium for Testing 149.0.7827.55 passed the full UI matrix: 32 scenarios
  (39 including parent groups), with zero skips. New scenarios in both modes
  verify explicit application, 0.25×/10×/1×, invalid input, paused media staying
  paused, native rate changes, replacement videos, ad/live guards and search.
  Responsive layouts and speed scenarios were repeated after the final button
  spacing adjustment. The desktop Video tools capture was visually inspected.
- Temporary integration checks on Chromium 149.0.7827.55 and Firefox 157.0
  confirmed that the installed extensions and userscript fixtures accept 10×
  and reset to 1×. Firefox lint reported zero errors, notices or warnings.
  The short synthetic video/comment/chat/navigation gate passed both modes.
- Repeated archive generation produced identical SHA256SUMS. Documentation and
  generated userscript match the editable reviewer source archive.
- Tests use synthetic pages, simulated manager APIs and temporary profiles.
  Actual Violentmonkey installation, live YouTube playback at 10× and high-speed
  audio/video quality were not verified. No new release tag or store submission
  was created; existing published ZIP links remain separate from main updates.

## 1.7.0 release preparation — 2026-10-16

The maintainer authorized the GitHub release. README and extension-guide ZIP
links now target v1.7.0; cumulative notes include the changes since v1.3.2.
Release preparation repeats local packaging, Firefox lint and temporary extension
integration. The existing 1.7.0 UI/stability evidence and live-check limitations
above still apply. The tag-triggered workflow repeats validation before publishing
and verifies downloaded assets; no store submission is authorized.


## 1.8.0 in-player speed controls — 2026-10-16

- Added a compact speed button beside native player settings, with an immediate
  0.25×–10× range input, reset and close actions. Its popover stays inside the
  player in fullscreen and is constrained to narrow/short player bounds. Native
  speed changes update its label. Main-panel controls remain available.
- Reuses the existing header reconciliation timer and navigation event. Replaced
  videos/control bars remove old DOM/media/outside-click listeners; cloned bars
  do not retain duplicate buttons. Ads, live streams, child frames and disabled
  protection have no player speed control. No new setting, dependency, permission
  or automatic playback/speed override was added.
- Pointer actions and slider keys stay outside player playback shortcuts. Escape
  closes the popover and returns focus; a subsequent Escape reaches the player.
  Outside click, leaving focus and opening the main panel dismiss the popover.
- npm run package passed all unit/contract suites, synchronized 1.8.0 metadata,
  source/engine parity, license checks and reproducible builds. Both extensions
  receive the same engine and embedded player styles.
- Chromium for Testing 149.0.7827.55 passed 34 UI scenarios (42 including parent
  groups), zero skips. New userscript/extension scenarios cover direct player
  changes, reset, keyboard isolation, focus, outside click, native speed changes,
  fullscreen, replacement media, ads/live guards and disabling protection. The
  affected scenarios were repeated for cloned/nested toolbar layouts, a 180px
  player and the final Escape behavior. Narrow captures were visually reviewed.
- Temporary extension integration passed on Chromium 149.0.7827.55 and Firefox
  157.0. Installed packages and userscript fixtures exercised the new player
  slider at 10× and its reset. Firefox lint had zero errors, notices or warnings.
  The short synthetic video/comment/chat/navigation gate passed both modes.
- Repeated archive generation produced identical checksums, and the reviewer
  source includes the canonical sources and documentation. Existing release
  downloads remain v1.7.0 until a new release is authorized.
- All browser evidence is synthetic, with temporary profiles and simulated
  manager APIs. Actual Violentmonkey installation and real YouTube/native-toolbar
  layouts, fullscreen playback and high-speed audio quality were not verified.

## 1.9.0 visibility preference and release preparation — 2026-10-16

- Added Video tools → Hide player speed button, off by default so existing
  installations retain their player control. Its boolean is saved in the existing
  validated feature_overrides map. Hiding removes the button and popover during
  navigation/reconciliation without changing playback speed or panel controls.
- Unit regression checks the default and loading a saved preference. The two
  player UI scenarios additionally verify saved overrides, removal of both nodes,
  panel speed changes while hidden, staying hidden across navigation/reconciliation
  and showing the button again without changing the current rate.
- Chromium for Testing 149.0.7827.55 passed the full 34-scenario UI matrix (42
  with parent groups), with zero failures or skips. Temporary installation/integration passed in Chromium
  149.0.7827.55 and Firefox 157.0, including hide/show through the actual shared
  panel in userscript and extension fixtures. Firefox lint had zero errors,
  notices or warnings; the short stability gate passed both modes.
- npm run package checks source/engine parity, licenses, versions and unit/contract
  suites. Repeated archives are compared through SHA256SUMS and the exact release
  files are inspected before publication. All public formats use version 1.9.0.
- The maintainer authorized this GitHub release. It includes the previously
  unreleased 1.8.0 player UI; README and extension downloads target v1.9.0. The
  tag-triggered workflow repeats validation, publishes five assets and verifies
  downloaded checksums. No store submission or signing is authorized.
- Evidence remains synthetic, with simulated manager APIs and temporary profiles.
  Actual Violentmonkey installation, live YouTube blocking/native player layouts
  and high-speed audio quality were not verified. No permissions, signed data,
  filtering algorithms, storage namespaces or runtime dependencies changed.

## 1.10.0 Treco rename — 2026-10-16

- Current product metadata, panel, popup, toolbar/menu copy, settings exports,
  documentation and generated package names use Treco. README uses The Complete
  YouTube Toolkit and All the tricks you need for a better YouTube. The canonical
  logo is a white T on the existing red tile, regenerated at 16/32/48/128 pixels.
- Userscript metadata lists rafelolv as author. Its PNG data icon is generated
  directly from the canonical SVG and matches icon.png and both 128px package
  icons byte-for-byte. MIT copyright, license, source provenance and service
  attribution remain in the source and legal files.
- Treco.user.js is the canonical generated installer. Zynubo.user.js is an
  identical compatibility update endpoint. GitHub repository URLs, the Firefox
  ID, ytab/__ytab storage keys, zynubo wire events and signed data remain intact.
  Imports accept Treco, Zynubo and the inherited YoutubeAdblock envelope; foreign
  application exports are still rejected. Manual installs with a different name
  can be separate manager entries; the guide explains export/import and keeping
  one entry enabled.
- npm run package passed all five unit/contract suites, versions, licenses,
  source/engine parity and reproducible builds. New checks cover the embedded
  icon, author/name, compatibility installer and old portable settings formats.
  Repeated package generations have identical SHA256SUMS.
- Chromium for Testing 149.0.7827.55 passed the complete UI matrix: 34 scenarios
  (42 including parent groups), with zero failures/skips. Both themes, narrow and
  short layouts, focus, search and player speed lifecycle passed. Current dark,
  light, narrow, settings and popup screenshots replace the active documentation
  previews with versioned files; the panel/popup captures were visually reviewed.
- Temporary extension integration passed in Chromium 149.0.7827.55 and Firefox
  157.0. Firefox lint reported zero errors, notices or warnings. The short
  synthetic video/comment/chat/navigation gate passed both generated modes.
- The read-only published audit still verifies the immutable v1.9.0 release.
  Archived icons are compared with that release's reviewer source instead of the
  moving main icon. Future Treco releases validate their embedded metadata icon
  against their own package icon. Published assets/tags were not replaced.
- Evidence is synthetic, using temporary profiles and simulated manager APIs.
  Actual Violentmonkey/Tampermonkey update/installation, manager icon rendering,
  live YouTube blocking and native playback were not validated. No new release
  tag or store submission was created. Existing public ZIPs retain Zynubo 1.9.0;
  new local outputs are Treco 1.10.0 and README explains that distinction.


## Treco 1.10.0 release preparation — 2026-10-16

The maintainer authorized the Treco GitHub release. README and extension-guide
buttons target the new Treco 1.10.0 packages. Preparation repeats npm run package,
Firefox lint and temporary browser integration, compares repeated SHA256SUMS and
checks the exact release payload. The existing 1.10.0 UI/stability evidence and
manager/live-YouTube limitations above still apply. Publication uses the new-tag
workflow and verifies all five downloaded assets. No store submission is included.
