"""Prepare an immutable, reproducible GitHub release for the credentialed AMO job."""
import hashlib
import json
from pathlib import Path
import re
import shutil
import sys
import zipfile

LIMIT = 200 * 1024 * 1024
GUID = 'zynubo@rafelolv.github.io'


def prepare(root, tag, published, output):
    component = r'(?:0|[1-9][0-9]{0,8})'
    if not re.fullmatch('v' + component + r'\.' + component + r'\.' + component, tag):
        raise ValueError('Expected a stable three-part version tag')
    version = tag[1:]
    if json.loads((root / 'package.json').read_text())['version'] != version:
        raise ValueError('Tag and package version differ')
    release = json.loads((published / 'release.json').read_text())
    if release.get('tagName') != tag or release.get('isDraft') is not False or release.get('isPrerelease') is not False:
        raise ValueError('A published stable GitHub release is required')
    names = {f'Treco-{kind}-{tag}.zip' for kind in ['chromium', 'firefox', 'source']} | {'Treco.user.js'}
    sums = {}
    for line in (published / 'SHA256SUMS').read_text().splitlines():
        match = re.fullmatch(r'([a-f0-9]{64})  (.+)', line)
        if not match or match[2] not in names or match[2] in sums:
            raise ValueError('Invalid release checksums')
        sums[match[2]] = match[1]
    if set(sums) != names:
        raise ValueError('Incomplete release checksums')
    for name, digest in sums.items():
        file = published / name
        if hashlib.sha256(file.read_bytes()).hexdigest() != digest:
            raise ValueError('Downloaded checksum mismatch')
        if file.read_bytes() != (root / 'dist' / name).read_bytes():
            raise ValueError('Downloaded release differs from the reproducible tagged build')
    addon = f'Treco-firefox-{tag}.zip'
    source = f'Treco-source-{tag}.zip'
    for name in [addon, source]:
        if not 0 < (published / name).stat().st_size <= LIMIT:
            raise ValueError('AMO archives must be nonempty and at most 200 MB')
    with zipfile.ZipFile(published / addon) as archive:
        manifest = json.loads(archive.read('manifest.json'))
        if manifest.get('version') != version or manifest.get('browser_specific_settings', {}).get('gecko', {}).get('id') != GUID:
            raise ValueError('Firefox identity/version mismatch')
        if archive.testzip() is not None:
            raise ValueError('Corrupt Firefox archive')
    with zipfile.ZipFile(published / source) as archive:
        for name in ['package-lock.json', 'src/core.user.js', 'src/ui/panel.css', 'images/icon.svg',
                     'build/build.mjs', 'build/compile-ui.mjs', 'docs/RELEASING.md', 'LICENSE', f'docs/releases/{tag}.md']:
            if archive.read(name) != (root / name).read_bytes():
                raise ValueError('Reviewer source differs from the tag')
        if archive.testzip() is not None:
            raise ValueError('Corrupt source archive')
    notes = (root / f'docs/releases/{tag}.md').read_text().strip()
    if not notes.startswith(f'# Treco {tag}\n'):
        raise ValueError('Matching tagged release notes are required')
    output.mkdir(parents=True, exist_ok=False)
    for name in [addon, source]:
        shutil.copyfile(published / name, output / name)
    (output / 'payload.json').write_text(json.dumps({
        'version': version, 'guid': GUID, 'notes': notes,
        'addonSha256': sums[addon], 'sourceSha256': sums[source],
    }) + '\n')


if __name__ == '__main__':
    try:
        prepare(Path.cwd(), sys.argv[1], Path(sys.argv[2]), Path(sys.argv[3]))
        print('Exact Firefox package and reviewer source verified before credential access.')
    except (ValueError, KeyError, OSError, IndexError, zipfile.BadZipFile):
        sys.exit('Firefox preparation failed: check tag, stable release, checksums, archive size and reproducible source.')
