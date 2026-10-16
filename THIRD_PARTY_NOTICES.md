# Third-party notices

Treco (previously named Zynubo) is an independent continuation maintained by rafelolv. It derives from
[SysAdminDoc/YoutubeAdblock](https://github.com/SysAdminDoc/YoutubeAdblock),
commit `9e53f04`, copyright (c) 2025 Matthew Parker, under the MIT license in
LICENSE. Inherited code is not claimed as original work by rafelolv.
The original MIT notice and source provenance are preserved; Treco maintains
an independent Git history. Treco integration,
packaging, branding and documentation changes date from 2026-10-16.

The separate `youtube-adblock-filters.txt` data identifies uBlock Origin/uAssets
and EasyList sources and retains their source URLs and comments. uAssets uses
GPL-3.0; EasyList offers GPL-3.0 or CC BY-SA 3.0. Distribute this combined data
under GPL-3.0, with the license in `licenses/GPL-3.0.txt`, retaining its preferred
editable text source. Do not describe those filter lists as MIT-licensed.
The text, its signed manifests and signatures remain byte-for-byte inherited.
Extension ZIPs contain the core's built-in fallback and packaged DNR rules,
not a copy of that external combined list. Source archives include the list,
its notices and license. This is a provenance record, not a claim that every
individual upstream rule has been independently traced.

Optional community integrations keep their in-panel notices:
- SponsorBlock and DeArrow data: CC BY-NC-SA 4.0; see https://sponsor.ajay.app/ and https://dearrow.ajay.app/.
- Return YouTube Dislike: see https://returnyoutubedislike.com/ for its API and project terms.

No community data is prebundled. Service-specific consent remains required.
Development dependencies retain their own licenses in the npm distribution;
none are bundled into the runtime extension or userscript.
