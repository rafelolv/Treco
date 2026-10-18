# Treco user guide

For the simplest setup, follow [Install](../README.md#install). The userscript
works through Tampermonkey or Violentmonkey; standalone extensions use the same
interface without a manager. Choose one installation method per browser profile.

## Manual installation

If the install link opens plain text:

1. Open the [complete Treco userscript](https://raw.githubusercontent.com/rafelolv/Treco/main/Treco.user.js) and copy its contents.
2. Open your userscript manager's dashboard and create a new script.
3. Replace the example code with the complete copied file, including the metadata at the top, and save.
4. Keep Treco enabled and reload YouTube.

Live and replay chat are excluded from the page engine. The Treco button stays
in the main page header; chat messages use their own native page APIs.

## Open settings

Click the **T icon** in the top-right YouTube header to open Treco. The button stays in the main page header; it does not float over videos or appear inside live chat. If the header is unavailable, use Alt+Shift+Z or the menu below. The button opens the same Control Center in both installations.

- **Userscript alternative:** open the manager menu and choose **Treco: Open Control Center**.
- **Extension:** click Treco in the browser toolbar, then **Open settings**.

Press **Alt+Shift+Z** to open or close settings. The shortcut stays inactive in
text fields and comment editors. The page button's dot shows whether the engine
is enabled, paused or needs attention; hover for the status text. This status
does not certify successful ad blocking.

Click the **star** beside a setting to add its switch to **Favorites** in Overview.
Click it again to remove it. Favorites do not change the setting's state and are
saved locally in the current installation; they are not included in settings
export or cross-device sync.

Overview has direct links to **Ad blocking**, **Video tools** and **Page layout**.
Expand **Pause on this tab** for temporary pause options, or **Activity & rule
status** for counters and rule-source details. Settings sections open directly;
there is no additional section toggle to expand.

Choose a section from the sidebar. On narrow windows, scroll the section list
horizontally. **Find a setting** searches across sections. Press Escape to clear
a nonempty search; press it again to close the panel. Changes save automatically.
Closing and reopening starts at Overview. **Activity & rule status** expands counters and rule-source details.

The popup reports whether the page engine responded, whether it is enabled or
paused, and whether initialization needs attention. That response is not proof
of successful ad blocking. Other websites and unresponsive tabs show an
unavailable state. The Control Center includes engine health and recovery options.

## Optional community features

SponsorBlock, DeArrow and Return YouTube Dislike require individual consent.
When enabled, they contact external services with video-related identifiers.
Read [privacy](PRIVACY.md) before enabling them. DeArrow is userscript-only.

Extensions request optional access for the other community APIs. Grant access
through the extension context menu if needed; browser cross-origin policies can
still affect responses. Never enable a service merely to dismiss a warning.

## Pause

The main switch and **Temporary pause** affect the page engine. The extension's
packaged browser network rules remain active while the extension is enabled,
including when a userscript owns the current page. Disable the extension in your
browser's extension settings to stop those network rules too.

If the userscript and extension are enabled together, only the first Treco page
engine starts. This guard does not coordinate other blockers or older upstream
installations. Keep one Treco method enabled and disable competing YouTube
blockers when investigating a problem.

## Updates

Treco is the new name of Zynubo. Update the existing entry in your manager when
possible; do not leave both entries enabled. Existing update URLs remain available.
A separate new manager entry has separate storage, so export settings before moving
to a different installation and import them afterward. Treco accepts old Zynubo
exports. The Firefox add-on identity and extension storage keys are unchanged.

- **Userscript:** use your manager's update checker. The install/update URL follows the generated script on this repository's `main` branch.
- **Local Chromium extension:** replace the files in the same extracted folder with a new package, reload the extension from the browser's extensions page, then reload YouTube. Keeping the same folder helps preserve the unpacked installation identity.
- **Temporary Firefox extension:** build or extract the new package and load its manifest again from `about:debugging#/runtime/this-firefox`. Temporary installations disappear when the browser closes.

GitHub does not automatically update locally loaded extensions. No store listing
or signed XPI is currently available. Future store installations will update
through their store after the relevant signing/review process.

For an old upstream installation, saved settings do not automatically transfer to
a different script or extension identity. Use the Control Center's settings
export/import tools. Treco accepts the original project's settings format.

## Playback speed

Click the **1×** button next to YouTube's player settings to open a speed slider.
Drag it or use the arrow keys to apply a speed immediately. **Reset to 1×** returns
to normal speed. Click outside, press Escape or choose **Close** to dismiss it.
The button shows the actual speed and also works in fullscreen. It appears on
recorded videos with a desktop player control bar, outside ads and live streams.
It does not float over live chat. Other layouts still have the panel control.

To remove the player button, enable **Video tools → Hide player speed button**.
This preference is saved; turn it off to show the button again. Hiding it does
not change the current speed or remove the panel control.

You can also open **Video tools → Playback speed**, choose a value from **0.25× to 10×** in
steps of 0.25, then click **Apply speed** or press Enter. **Reset to 1×** returns
the current video to normal speed. Editing the number alone does not apply it.

The control does not start playback or save a speed for later videos. YouTube's
own speed controls remain available. Ads and live streams are excluded; resume
Treco before using this control if the page engine is paused.

Above 4×, some browsers may silence audio. See the browser's
[playback-rate behavior](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/playbackRate).
The control reports a rejected speed and lets you try a lower value.

## Settings and imports

Advanced options use plain-language names. Expand **Technical details** to see the
underlying mechanism; search also recognizes these technical names.

JSON imports show a change preview before confirmation and offer **Undo import**
for the latest JSON import in the current session. Editing the pasted data cancels
the preview; the preview expires after 30 seconds. Plain-text channel replacement,
list migration, counter resets and restoring defaults require a second deliberate
click within 10 seconds. Escape cancels confirmation; for these timed actions,
moving focus away also cancels it. Settings exports are explicit backups and can
contain your lists; keep them private.

## Troubleshooting

1. Confirm Treco is enabled and permitted to run on YouTube.
2. Reload the page after installation, updating or changing browser permissions.
3. On Chromium, check your manager's **Allow User Scripts** setting if available.
4. Disable other Treco installations, older upstream scripts and competing YouTube blockers, then reload.
5. Open the Control Center and check engine health. Try **Refresh Rules** if the rule source needs attention. Current cached or built-in rules remain available when refresh fails.
6. For a temporary break, use **Temporary pause**. See the browser-network limitation above if using an extension.

YouTube account experiments, server-stitched ads, late script startup and browser
policies can reduce effectiveness. A successful fixture test or a positive popup
response cannot establish that live playback is working.

Overview and Diagnostics show relevant recovery buttons when rules cannot update
or page filters cannot start. The extension popup also explains when the page is
running a different version and needs a reload.

In Diagnostics, use **Review the report**, **Copy Diagnostics** or **Download
report**. The text report is limited to 16,384 characters and omits video/channel IDs, list
contents, custom source URLs and raw errors. Review it before sharing. If clipboard
access is blocked, download the report instead.

If you still need help, [open an issue](https://github.com/rafelolv/Treco/issues/new?template=bug_report.yml).
Include browser and Treco versions, installation method, the YouTube surface
(main site, Music, TV or Kids) and steps to reproduce. Redact diagnostics; never
post cookies, authorization tokens or private URLs. Actual tested browsers and
known validation limits are recorded in [VALIDATION.md](VALIDATION.md).
