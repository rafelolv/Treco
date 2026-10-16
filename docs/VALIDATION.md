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
