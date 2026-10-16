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
