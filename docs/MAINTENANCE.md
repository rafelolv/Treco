# Maintenance

Read AGENTS.md first. Work on main. Edit only canonical source and src/ui/ styles; regenerate and
commit Treco.user.js, the identical Zynubo.user.js update alias and icon.png alongside changes. Never edit dist/.
Use `npm ci` from the committed lockfile. Node 24.21.0 (.nvmrc) and Python 3 form the reference
build; pin dependency changes in the lockfile and review them separately.

Run `npm run test:stability` for the short essential-surface gate after building.
It exercises both generated engines against synthetic video, comments, live/replay
chat and navigation, including native chat API identity. Use an installed
Playwright Chromium or set YTAB_BROWSER_PATH. CI runs it before the UI matrix.
This gate does not replace live YouTube confirmation or prove successful blocking.

Run `npm run check`, `npm run lint:firefox`, then browser integration checks after
core/adapter/popup changes. Run npm run test:browser:upstream for UI changes,
including search, section visibility, focus, both themes and narrow layouts. `npm run package` regenerates and verifies all outputs.
Repeat packaging and compare SHA256SUMS when changing build logic. ZIP entries
have fixed times, order and permissions. Reproducibility is measured within the
same pinned toolchain; zlib/Sharp/platform upgrades require a fresh comparison.

Every published engine, metadata, icon, popup or packaging change advances the
single three-part package.json version and regenerates all three formats.
Documentation-only changes need no version bump. Do not reset inherited counters,
filter revisions, key IDs or storage protocols to the public version. Preserve
the add-on ID `zynubo@rafelolv.github.io`; record Chromium store IDs on first
publication. Never generate replacement signing identities as routine maintenance.

Review upstream changes with `git fetch upstream` and inspect individual commits.
Do not blindly merge forks or upstream experiments. Record bug evidence, behavior
change, targeted tests and manual checks. Keep new experiments out of stable
source unless explicitly accepted. The upstream roadmap is not an implementation
queue for this project.

To change filter data, first plan signing-key rotation. The imported key is only
public and cannot sign your changes. Keep signing material outside the repository
and use CI secrets for any future authorized signing workflow. Preserve domain
separation, artifact roles, monotonic revisions, expiry and rollback protection.
The signer in tools/ is inherited tooling, not an authorized publishing pipeline.

Ordinary CI validates pull requests and main pushes; it never publishes.
The separate Release workflow publishes validated GitHub assets on authorized
new version tags; it never submits to stores. GitHub releases and
store submissions require separate explicit authorization. See RELEASING.md.

Development dependency audit (2026-10-16): web-ext 10.8.0 is the current official
version checked for this setup. npm audit still reports three high-severity
entries through its optional Android adbkit/node-forge chain; no patched
node-forge version was available in the registry (latest 1.4.0). Do not downgrade
to obsolete web-ext merely to silence audit. Runtime packages contain none of
these dependencies. Recheck before future dependency updates and store tooling use.

## Distribution audits

`npm run check` verifies installer/update/support links, manifest icon paths,
PNG sizes and synchronized local versions. Contrast checks cover shared text,
focus and primary-button colors in both themes.

`npm run verify:published` performs a read-only network audit of the release linked
by README. It verifies its five assets, downloaded checksums, package versions,
shared engines, public icon and reviewer source without executing downloaded code.
The Audit published downloads workflow runs weekly or manually with read-only
permissions. No tokens or publishing permissions are needed.

The README download buttons name one existing GitHub release; the userscript URL
follows main and can be newer. The audit derives the published version from these
links rather than adding another public version source. Update both ZIP links
together when preparing an authorized release and verify them after publication.
