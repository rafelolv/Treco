"""Verify the exact release payload before publication or after downloading it."""
import hashlib
import json
from pathlib import Path
import sys
import zipfile

root = Path(__file__).resolve().parent.parent
version = json.loads((root / 'package.json').read_text())['version']
base = Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'dist'
expected = {f'Treco-{browser}-v{version}.zip' for browser in ['chromium', 'firefox', 'source']} | {'Treco.user.js'}
lines = (base / 'SHA256SUMS').read_text().splitlines()
checksums = {}
for line in lines:
    digest, name = line.split('  ', 1)
    assert len(digest) == 64 and all(c in '0123456789abcdef' for c in digest)
    assert name in expected and name not in checksums, f'Unexpected or duplicate checksum: {name}'
    checksums[name] = digest
assert set(checksums) == expected
for name, digest in checksums.items():
    assert hashlib.sha256((base / name).read_bytes()).hexdigest() == digest, name
assert (base / 'Treco.user.js').read_bytes() == (root / 'Treco.user.js').read_bytes()
for browser in ['chromium', 'firefox']:
    with zipfile.ZipFile(base / f'Treco-{browser}-v{version}.zip') as archive:
        assert archive.testzip() is None
        assert json.loads(archive.read('manifest.json'))['version'] == version
        assert archive.read('main.js') == (root / 'dist' / browser / 'main.js').read_bytes()
        assert archive.read('LICENSE') == (root / 'LICENSE').read_bytes()
        info = json.loads(archive.read('build-info.json'))
        assert info['coreSha256'] == checksums['Treco.user.js']
        assert info['version'] == version
with zipfile.ZipFile(base / f'Treco-source-v{version}.zip') as archive:
    assert archive.testzip() is None
    assert archive.read('Zynubo.user.js')==archive.read('Treco.user.js')
    required = ['src/core.user.js', 'src/ui/panel.css', 'src/ui/theme.json',
                'build/build.mjs', 'build/compile-ui.mjs', 'package-lock.json', 'LICENSE',
                'THIRD_PARTY_NOTICES.md', 'licenses/GPL-3.0.txt', f'docs/releases/v{version}.md']
    for name in required:
        assert archive.read(name) == (root / name).read_bytes(), name
    for name in archive.namelist():
        assert not name.startswith(('.git/', '.aws/', '.codex/', 'node_modules/', 'dist/'))
        assert not name.endswith(('.pem', '.key', '.env')), name
print(f'Exact Treco {version} release payload verified.')
