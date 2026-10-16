import fs from 'node:fs/promises';
const read = name => fs.readFile(name, 'utf8');
export async function compileStyles(surface) {
    const theme = JSON.parse(await read('src/ui/theme.json'));
    const declarations = values => Object.entries(values).map(([key,value]) => `--z-${key}: ${value};`).join('\n');
    const base = declarations({...theme.common, ...theme.dark});
    const light = declarations(theme.light);
    if (surface === 'popup') {
        return `:root { ${base} }\n@media (prefers-color-scheme: light) { :root { ${light} } }\n` + await read('src/extension/popup.css');
    }
    const logo = `url("data:image/svg+xml,${encodeURIComponent((await read('images/icon.svg')).trim())}")`;
    return `.ytab-panel, .ytab-toast-region, .ytab-launcher, .ytab-player-speed-popup { ${base} --z-logo: ${logo}; }\n` +
        `html:not([dark]) .ytab-panel, html:not([dark]) .ytab-toast-region, html:not([dark]) .ytab-launcher { ${light} }\n` + await read('src/ui/panel.css');
}
export async function compileCore(source, version) {
    if (source.split('__PANEL_CSS__').length !== 2) throw Error('Expected one canonical panel stylesheet anchor');
    const stylesheet = JSON.stringify(await compileStyles('panel'));
    return source.replaceAll('__VERSION__', version).replace('__PANEL_CSS__', () => stylesheet);
}
