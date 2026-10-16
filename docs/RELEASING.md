# Releases

1. Confirm whether the request explicitly authorizes a GitHub release. Store
   submission is separate. If authorization is absent, finish local preparation
   and present concrete artifacts before asking.
2. Review main, notices and changelog. Update package.json only for the public
   version, run npm install --package-lock-only, regenerate and commit artifacts.
3. Run npm run package, npm run lint:firefox and npm run test:extensions:browser.
   Record results and live manual limits. Repeat packaging and compare SHA256SUMS.
4. Review the source ZIP: it must contain the editable source, lockfile, build
   commands and licenses, and no credentials or local browser profiles.
5. Prepare concise English release notes using RELEASE-TEMPLATE.md. Refuse any
   already-published tag/version. Do not reuse upstream tags as Zynubo versions.
6. With explicit authorization, push main and create a new annotated vX.Y.Z tag.
   Publish a GitHub release using the official GitHub CLI/API with the two ZIPs,
   source ZIP, Zynubo.user.js and SHA256SUMS. Use a notes file, not shell-interpolated
   multiline text. Never force-push or replace existing artifacts.
7. Verify the release URL, tag commit and asset names; download the assets into a
   fresh directory and compare SHA256SUMS to the locally reviewed packages.
8. Report the URL and actual verification. A GitHub release does not imply store
   signing, approval or availability.

CI only validates and uploads temporary Actions artifacts. It never creates tags,
releases or store submissions. No upload workflow is enabled for this initial setup.

## Store preparation

Chromium ZIP: upload its exact contents to Chrome Web Store or Edge Add-ons after
separate authorization. Record the assigned IDs and preserve them for updates.
Brave accepts compatible Chromium installations; no independent Brave store
publication is configured. Before the first listing, obtain actual YouTube
playback evidence and review required store screenshots and privacy disclosures.
The canonical Z logo generates packaged icons; create store-specific marketing
screenshots from the actual tested product, not the old upstream screenshots.

Firefox ZIP: validate with web-ext lint. Supply the source ZIP with Node 24,
`npm ci && npm run build` instructions for reviewers. The stable ID is
`zynubo@rafelolv.github.io`; use that identity for subsequent signing submissions.
Mozilla signing is necessary for persistent mainstream installs. An uploaded
package can be pending/rejected; verify review status and public listing separately.
No signed XPI exists until Mozilla returns one. The current unsigned ZIP is
suitable for temporary development and as submission input, not store availability.

Any future automation must use official APIs/CLI, least-privilege permissions,
explicit release triggers and CI secrets only. It must refuse an existing version,
verify exact artifacts before credential access and verify submission outcomes.
Do not copy another project's AMO authorization: none is granted for Zynubo yet.
