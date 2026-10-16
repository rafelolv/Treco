# Base assessment — 2026-10-16

Selected upstream main `9e53f042c24f2687e5ee1dd122f181feae843cd2`, latest commit 2026-09-26, upstream package 0.8.2. The original repository
had 129 commits. The only public fork returned by the GitHub forks API was
`pesach/YoutubeAdblock`; a fetched graph comparison showed 39 commits behind and
zero ahead. No exclusive fork fix was available to cherry-pick. The source remains
active enough to be the lowest-divergence baseline; this is not a claim of proven
live reliability. No entire fork was merged.

Reviewed LICENSE, README, RESEARCH, ROADMAP, package metadata, build/signing and
verification tools, manifests, core initialization, GM shim, bridge, background
broker, network rule source and test harnesses before making changes. Upstream
research and roadmap are historical input under `docs/upstream/`, not Zynubo
requirements. Known open topics include settings sync reconciliation, live SSAI
behavior and late injection; this setup does not claim to fix all inherited bugs.

MIT permits modification and redistribution while requiring its copyright and
permission notices. Keep LICENSE and package it in every extension and source
archive; the generated userscript includes the notice too. Branding and support
links are changed, while copyright and technical provenance remain. The separate
combined filter list names GPL-licensed uAssets/EasyList sources; its original
bytes and source comments are retained with a GPL-3.0 license copy. Optional API
attribution and consent stay intact. See THIRD_PARTY_NOTICES.md.

Zynubo was initially prepared by merging upstream history with the target
repository. On 2026-10-16 the maintainer explicitly requested replacing that
published ancestry with an independent root commit, without creating a backup.
The current main history therefore starts from the maintained Zynubo snapshot;
it does not include upstream commits. This changes commit ancestry, not the
origin or authorship of inherited code. Required notices and provenance remain.

Public versions start at 1.0.0; internal filter revision, key ID, storage keys
and event protocols are not reset to that public version. The repository-local
commit identity is Rafael <82127878+rafelolv@users.noreply.github.com>.

Sources: https://github.com/SysAdminDoc/YoutubeAdblock,
https://github.com/pesach/YoutubeAdblock,
https://api.github.com/repos/SysAdminDoc/YoutubeAdblock/forks,
https://opensource.org/license/mit,
https://github.com/uBlockOrigin/uAssets/blob/master/LICENSE,
https://easylist.to/pages/licence.html.
