# Standalone browser extensions

Zynubo extensions run without Tampermonkey or another userscript manager. They
share the userscript's engine and Control Center. Keep only one Zynubo method
enabled in each browser profile.

Download the published release (1.3.2):

- [Chrome, Brave and Edge ZIP](https://github.com/rafelolv/Zynubo/releases/download/v1.3.2/Zynubo-chromium-v1.3.2.zip)
- [Firefox temporary ZIP](https://github.com/rafelolv/Zynubo/releases/download/v1.3.2/Zynubo-firefox-v1.3.2.zip)
- [Checksums](https://github.com/rafelolv/Zynubo/releases/download/v1.3.2/SHA256SUMS)

No build commands are needed to install these downloads. Extract the ZIP and
follow the browser instructions below. These are unsigned local packages; no
signed XPI or browser-store listing is available yet.

## Build the packages yourself (optional)

With Node.js 24, npm and Python 3 installed, run from a checkout of this repository:

```sh
npm ci
npm run package
```

This generates files for the version in `package.json` (`VERSION` below):

| File | Purpose |
| --- | --- |
| `dist/Zynubo-chromium-vVERSION.zip` | Local Chrome, Brave or Edge extension. |
| `dist/Zynubo-firefox-vVERSION.zip` | Temporary Firefox extension or input for a future signing submission. |
| `dist/Zynubo-source-vVERSION.zip` | Editable source for reviewers and contributors. |
| `dist/SHA256SUMS` | Checksums of the generated download files. |

The build also produces ready-to-load `dist/chromium/` and `dist/firefox/` folders.
Official packaged downloads are listed on [GitHub Releases](https://github.com/rafelolv/Zynubo/releases).
No release ZIP is presented as a store-signed package.

## Chrome, Brave and Edge

1. Extract the Chromium ZIP into a folder you will keep, or use `dist/chromium/` directly.
2. Open `chrome://extensions`, `brave://extensions` or `edge://extensions`.
3. Enable **Developer mode**, choose **Load unpacked**, and select that folder.
4. Reload YouTube and open Zynubo from the toolbar.

The package is unsigned and intended for local installation; it is not a signed
CRX or a browser-store listing. The declared Chromium minimum is 121. See
[validation](VALIDATION.md) for the versions actually tested.

## Firefox

1. Extract the Firefox ZIP, or use `dist/firefox/` directly.
2. Open `about:debugging#/runtime/this-firefox` and choose **Load Temporary Add-on**.
3. Select `manifest.json` inside that folder.
4. Reload YouTube and open Zynubo from the toolbar.

Firefox 140+ is required. A temporary installation disappears when Firefox
closes. An unsigned ZIP does not provide a normal persistent installation;
that requires Mozilla signing. Public store review and availability are
separate steps, and neither has been completed for Zynubo.

## Use and update

Click the toolbar icon and choose **Open settings**. If no engine responds,
open or reload a supported YouTube page. The popup reports startup state, not
proof of ad blocking.

To update a local Chromium extension, replace files in the same folder, reload
the extension and reload YouTube. For Firefox, load the updated temporary package
again. GitHub downloads do not update local installations automatically.

The page switch and temporary pause do not disable the extension's browser
network rules. Disable the extension itself to stop those rules.

See the [user guide](USER-GUIDE.md) for settings, optional services and troubleshooting.
Publisher and contributor instructions are in [RELEASING.md](RELEASING.md).
