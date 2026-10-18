# Releases

1. Confirm whether the request explicitly authorizes a GitHub release. The
   maintainer authorized automatic existing-listing AMO updates following those
   releases; initial listing creation and Chromium stores are separate. If release
   authorization is absent, finish preparation before asking.
2. Review main, notices and changelog. Update package.json only for the public
   version, run npm install --package-lock-only, regenerate and commit artifacts.
3. Run npm run package, npm run lint:firefox and npm run test:extensions:browser.
   Record results and live manual limits. Repeat packaging and compare SHA256SUMS.
4. Review the source ZIP: it must contain the editable source, lockfile, build
   commands and licenses, and no credentials or local browser profiles.
5. Prepare concise English release notes using RELEASE-TEMPLATE.md. Refuse any
   already-published tag/version. Do not reuse upstream tags as Treco versions.
6. With explicit authorization, push main and create a new annotated vX.Y.Z tag.
   Publish a GitHub release using the official GitHub CLI/API with the two ZIPs,
   source ZIP, Treco.user.js and SHA256SUMS. Use a notes file, not shell-interpolated
   multiline text. Never force-push or replace existing artifacts.
7. Verify the release URL, tag commit and asset names; download the assets into a
   fresh directory and compare SHA256SUMS to the locally reviewed packages.
8. Report the URL and actual verification. A GitHub release does not imply store
   signing, approval or availability.

Ordinary push/PR CI only validates and uploads temporary Actions artifacts.
The separate Release workflow publishes only on a new `v*` tag. Its read-only
validation job rebuilds, lints, tests browsers and checks the exact archives. Only
the dependent publication job receives `contents: write` and the temporary GitHub
token. It refuses existing releases and verifies downloaded asset checksums.
A tag push is therefore a publication action: push it only for an authorized
release. After successful publication, the dependent Firefox workflow submits
the validated package/source pair to the existing AMO listing. Release notes live
in docs/releases/.

When using this workflow for step 6, push the new annotated tag and wait for
both jobs. Do not publish a second copy locally or retry by moving the tag.
If publication partially succeeds, inspect existing release assets before any
retry; the workflow intentionally refuses to replace a published release.

## Store preparation

Every Firefox release and retry must follow
[Firefox publication rules](FIREFOX-PUBLISH.md#publication-rules), including
store-note bounds, archive/version checks, reviewer source, declarations and
API-response diagnosis. Its enforcement table distinguishes current automation
from manual pre-submission requirements. Metadata-only submission fixes may use
`main` with unchanged tagged files; package changes require a new version.

Chromium ZIP: upload its exact contents to Chrome Web Store or Edge Add-ons after
separate authorization. Record the assigned IDs and preserve them for updates.
Brave accepts compatible Chromium installations; no independent Brave store
publication is configured. Before the first listing, obtain actual YouTube
playback evidence and review required store screenshots and privacy disclosures.
The canonical T logo generates packaged icons; create store-specific marketing
screenshots from the actual tested product, not the old upstream screenshots.

Firefox ZIP: validate with web-ext lint. Supply the source ZIP with Node 24,
`npm ci && npm run build` instructions for reviewers. The stable ID is
`zynubo@rafelolv.github.io`; use that identity for subsequent signing submissions.
Mozilla signing is necessary for persistent mainstream installs. An uploaded
package can be pending/rejected; verify review status and public listing separately.
No signed XPI exists until Mozilla returns one. The current unsigned ZIP is
suitable for temporary development and as submission input, not store availability.

The maintainer authorized the automatic Firefox update workflow on 2026-10-18.
See FIREFOX-PUBLISH.md for setup, release submission and read-only diagnosis.
It uses official APIs, read-only GitHub permissions and step-scoped AMO secrets;
ordinary main pushes and pull requests do not submit. A failed AMO job does not
undo the published GitHub release or authorize moving its tag. Diagnose before
retrying only the Firefox workflow from main against the immutable release.
