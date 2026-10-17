# Firefox publication

## Current scope

Treco currently publishes unsigned Firefox ZIPs through the GitHub Release
workflow. There is no AMO upload/signing workflow, store-note shortener or Mozilla
credential integration in this repository. GitHub publication does not authorize
an AMO submission. Temporary installation, submission, signing, review, approval
and public availability are separate states.

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
  Treco currently has no such implementation; do not claim it is already enforced.
- A future English shortener must reserve space for its appended link and check
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
| AMO notes within 3,000 characters per locale | Manual requirement; no store-note formatter exists here. |
| 200 MB archive cap | Manual pre-submission requirement; no dedicated size guard exists here. |
| Version greater than prior AMO submissions | Manual authenticated check; no AMO-history integration exists here. |
| Accurate privacy declarations and source-upload reassessment | Maintainer review against official policy and the exact package. |
| Ambiguous submission diagnosis and metadata-only retry | Manual procedure; no AMO submission/retry workflow exists here. |

Official documentation was checked on 2026-10-16 for the archive cap, lint,
source submission, data-policy requirements and version API behavior. The
3,000-character note bound comes from the maintainer's instructions; the reviewed
API documentation did not specify that numeric limit. Recheck field validators
before adding submission automation. This document does not enable publishing.
