# Changelog

## 1.4.0 — Unreleased

- Restrict structural filtering to reviewed ad fields and preserve generic page, player and comment data, including cached rules.
- Rewrite only ad property names, preserving matching words in comment text.
- Leave live and replay chat documents, continuations and frame APIs outside the page engine.
- Stop extension blocking of mixed-purpose telemetry endpoints.
- Add a short stability check for synthetic video playback, readable comments, chat updates and navigation.

Validation and limitations are recorded in docs/VALIDATION.md.

## 1.3.2 — 2026-10-16

- Preserve YouTube framework entity updates so comment text is not discarded alongside ad data.
- Reject broad framework-removal rules from cached filters and property traps.

Validation and limitations are recorded in docs/VALIDATION.md.

## 1.3.1 — Unreleased

- Keep the Zynubo button exclusively in the main page header; remove the floating fallback that could overlap live chat.
- Exclude live chat, replay chat and embedded frames from page-button placement.

Validation and limitations are recorded in docs/VALIDATION.md.

## 1.3.0 — Unreleased

- Open or close the Control Center with Alt+Shift+Z outside text fields.
- Show the page engine's enabled, paused or attention state on the Zynubo button.
- Star settings to keep their switches together in Overview without changing their enabled state.

Validation and limitations are recorded in docs/VALIDATION.md.

## 1.2.0 — Unreleased

- Open the Control Center from a visible Zynubo button in the YouTube header, with a bottom-right fallback on other page layouts.
- Restore the page button after YouTube navigation or delayed header rendering.

Validation and limitations are recorded in docs/VALIDATION.md.

## 1.1.1 — Unreleased

- Preserve native YouTube dialogs and their controls so cosmetic filters cannot leave an invisible modal blocking the page.
- Keep the Control Center hidden during startup and restore page interaction when rebuilding a detached panel.

Validation and limitations are recorded in docs/VALIDATION.md.

## 1.1.0 — 2026-10-16

- Redesign the Control Center with a graphite-and-paper palette, a red Z mark and quieter typography.
- Show one settings section at a time and keep matching sections visible during search.
- Replace nested setting cards with aligned rows and move technical counters into More counters.
- Match the extension popup and icons to the shared visual identity.
- Fix narrow layouts and keep keyboard focus on visible controls when navigating or rebuilding settings.

Validation and limitations:
- See docs/VALIDATION.md for browser versions, automated results and fixture captures.
- Real YouTube playback and store availability require separate validation.

## 1.0.0 — Unreleased

- Establish Zynubo as an independent continuation with documented upstream provenance and preserved license notices.
- Generate the userscript and independent Chromium and Firefox extensions from one engine.
- Add a toolbar popup with queried engine status and access to the Control Center.
- Prevent a second Zynubo page engine when both distribution formats are installed.
- Add synchronized versions, reproducible unsigned packages, CI and maintenance instructions.

Validation and limitations are recorded in docs/VALIDATION.md. Upstream release
history is preserved unchanged in docs/upstream/CHANGELOG.md.
