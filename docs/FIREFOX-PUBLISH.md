# Firefox publication

## Current scope

Treco's Release workflow publishes validated GitHub assets on explicitly
authorized new version tags. After publication succeeds, it calls
`.github/workflows/publish-firefox.yml` to submit the exact Firefox ZIP and matching
reviewer source to the existing AMO listing. The maintainer authorized this
release-linked Firefox automation on 2026-10-18, after requesting the pattern used
by Wipecord and AdBonk. Ordinary main pushes and pull requests never submit.
Submission, signing, review, approval and public availability remain separate.

## One-time setup

1. Configure **AMO_JWT_ISSUER** and **AMO_JWT_SECRET** as Treco repository Actions
   secrets using your Mozilla developer API credentials. Never put values in code,
   commands, issue comments or release artifacts. The workflow does not transfer
   another repository's secrets or use the GitHub token as an AMO credential.
2. Complete the initial Treco listing and privacy declarations in the Mozilla
   Developer Hub, preserving **zynubo@rafelolv.github.io**. This workflow updates an
   existing listing; it does not invent store metadata or create a listing. Supply
   the exact validated Firefox ZIP and matching source for the initial submission.
   A public API 404 alone does not prove that a private/pending listing is absent;
   the submission job performs an authenticated identity check.
3. Review data declarations against the package and consent-gated community APIs.
   Run the documented live playback checks before first store submission. Lint and
   synthetic browser tests cannot establish that store declarations are accurate.

Once configured, an explicitly authorized GitHub release automatically attempts
its Firefox update. GitHub downloads remain unchanged and unsigned; the workflow
does not attach or replace release files with a signed package.

## Workflow and retries

The read-only preparation job checks out the immutable tag, runs `npm run package`
and pinned Firefox lint, repeats packaging, and downloads the published release.
It rejects drafts/prereleases, invalid tags, mismatched versions/identity, archives
over 200 MB, checksum failures and differences from the reproducible tagged build.
Both release archives are copied byte-for-byte into an immutable Actions artifact.

Only the dependent submission job receives Mozilla secrets. It rechecks payload
hashes and sizes before reading them, uses the official API, checks all visible
listed/unlisted and pending/rejected versions, and refuses an existing or
non-increasing version. Numeric prior versions are compared component by component;
unfamiliar prerelease formats require manual review. English store notes use only the tagged **Changes** section, following
Wipecord's separation of change summaries. They retain AdBonk's paragraph-aware 3,000-character shortening, including the full release link. Full
GitHub notes are preserved. Source is submitted as multipart; translated notes use
a separate JSON update, as required by AMO.

If an AMO step fails, inspect its stage, HTTP status and bounded error-field summary.
Raw API errors and credentials are withheld. After a possibly successful mutation,
the client makes one read-only version lookup, never an automatic POST/PATCH retry.
Use **Actions → Publish Firefox → Run workflow**, branch **main**, the existing
release tag, and mode **inspect** (the default) before considering **submit**.
Inspect also verifies the immutable release before accessing AMO. A submission
retry is appropriate only after diagnosing that no version was created. The
workflow serializes AMO jobs and never overwrites existing versions.

If the version already exists but notes failed, repair only its metadata in
Developer Hub after inspecting the package/source and version status. Current
main automation may verify an older immutable tagged release without changing its
package. The workflow deliberately has no automatic metadata-repair mode. Package
changes require a new version; never move tags or replace release assets. Job
summaries report submission and the returned AMO file status without claiming
signing, approval or public availability.

## Publication rules

Apply these rules to every Firefox release, first submission and retry. Before
changing tooling, permissions, privacy declarations or packaging, recheck the
linked official sources and record what was verified. Do not infer unverified
limits for other listing fields from a limit on version notes.

### Notes and package limits

- Keep AMO version notes within **3,000 characters per locale**, including any
  appended release link. This is the maintainer-specified submission bound; check
  the current field validation before implementing or changing store tooling.
- Keep store notes separate from the full GitHub release notes. Preserve any
  existing tested English shortening behavior when maintaining store automation.
  Treco now applies the tested English formatter in build/firefox/publish.mjs.
- The English shortener must reserve space for its appended link and check
  the final text. Test boundary values and long notes; keep the link complete.
  Do not silently invent truncation behavior for other locales.
- Check Mozilla's **200 MB archive cap**, valid Firefox manifest versions and a
  version increasing beyond prior AMO submissions. Do not equate local three-part
  semver agreement with a check against AMO's actual version history.
- Compare the exact Firefox ZIP and reviewer-source checksums with the validated
  tagged release before accessing submission credentials. Reject an existing
  version unless performing a diagnosed metadata-only update of that version.

The 200 MB cap is documented in Mozilla's
[submission guide](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/).
The [version manifest reference](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/version)
and [AMO version API](https://mozilla.github.io/addons-server/topics/api/addons.html#version-create)
cover version formatting and submission fields. Recheck actual API validation
rather than extrapolating numeric limits to other metadata.

### Validation, identity and reviewability

- Run the repository-pinned `npm run lint:firefox` for changed extension packages.
  Resolve errors and review warnings. The current command uses
  `--warnings-as-errors`; do not bypass it merely to submit.
- Preserve `zynubo@rafelolv.github.io`, minimal justified permissions, bundled
  reviewable code, source provenance and accurate data declarations. Reassess
  declaration/consent requirements when requests, permissions or data flows change.
  Passing lint does not establish that declarations accurately describe behavior.
- Include the matching reviewer-source archive and reproducible build instructions.
  Treco generates its engine and embeds UI assets; absence of minification alone
  does not remove the need to assess source submission. Reassess uploads whenever
  build transformations change.

Official references:
[web-ext lint](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/),
[add-on policies](https://extensionworkshop.com/documentation/publish/add-on-policies/),
[source submission](https://extensionworkshop.com/documentation/publish/source-code-submission/),
[data consent and declarations](https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/).

### Responses, retries and reporting

1. Diagnose the actual API status and response before retrying. Keep credentials
   and raw sensitive responses out of commands, logs, files and release artifacts.
2. If a request times out or has an ambiguous result, inspect the add-on's version
   history and submission/review status first. Confirm whether the version was
   created; never blindly repeat a create/upload request.
3. Metadata-only submission fixes may run from `main` against an unchanged tagged
   package. Verify its checksums and identify the existing version before editing
   its metadata. Package changes require a new version and a newly validated
   package/source pair.
4. Never move published tags or replace packages. Use least-privilege credentials
   only in a separately authorized submission job, after read-only validation.
5. Report the state actually returned: submitted, awaiting review, approved,
   signed or publicly available. A successful upload is not proof of approval.

Use the official
[version list/detail and edit APIs](https://mozilla.github.io/addons-server/topics/api/addons.html#versions-list)
when diagnosing outcomes. API behavior can change; inspect the current
[API overview](https://mozilla.github.io/addons-server/topics/api/overview.html)
and responses before choosing a retry path.

## Existing guards and manual checks

| Check | Current enforcement |
| --- | --- |
| Pinned lint, including warnings | Automated in validation and GitHub release workflows. |
| Package versions, Firefox ID and expected permissions | Automated local build/package verification. |
| Reviewer source, shared engine, artifact checksums | Automated release verification and post-publication download checks. |
| AMO notes within 3,000 characters per locale | Automated English formatter and boundary/Unicode tests; additional locales must receive the same bound. |
| 200 MB archive cap | Automated for both submitted archives before secrets and again in the submission client. |
| Version greater than prior AMO submissions | Authenticated paginated history scan, including pending/rejected/unlisted versions; unfamiliar formats stop for manual review. |
| Accurate privacy declarations and source-upload reassessment | Maintainer review against official policy and the exact package. |
| Ambiguous submission diagnosis and metadata-only retry | One read-only diagnosis after failed mutations; explicit inspect/submit workflow. Existing-version metadata repair remains manual. |

Official documentation was rechecked on 2026-10-18 for the archive cap, lint,
source submission, data-policy requirements and version API behavior. The
3,000-character note bound comes from the maintainer's instructions; the reviewed
API documentation did not specify that numeric limit. The formatter enforces the maintainer's bound without inventing other field limits.
Automation is enabled only for the authorized triggers and requires the setup above.
