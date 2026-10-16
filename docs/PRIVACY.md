# Privacy

Zynubo has no telemetry. Settings and counters are stored locally; extension
settings use the inherited browser storage sync allowlist when browser sync is
available. Page-local mirrors are visible to YouTube scripts and are not secret
storage. Do not put credentials into settings.

Signed filters and signature data are requested from raw.githubusercontent.com
and a jsDelivr mirror for this repository. Those hosts receive normal request
metadata (including IP address). No downloaded resource executes as code.
Optional SponsorBlock, DeArrow and Return YouTube Dislike requests are disabled
until per-service consent. Their requests can disclose video IDs or hash buckets;
SponsorBlock view reports may be sent after skipping. DeArrow thumbnails can
contact dearrow-thumb.ajay.app in the userscript. Extension DeArrow is unavailable.
The extension requests optional origins for the other two APIs, and uses native
fetch, so CORS can still limit responses even after granting host access.

The status bridge returns only version, distribution and initialization flags.
It exposes no browsing history or settings. Do not post unredacted URLs, tokens,
cookies or private account data in issues. External services have their own terms.
