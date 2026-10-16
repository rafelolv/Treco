"""Create deterministic unsigned ZIPs and a reviewer source archive."""
from pathlib import Path
import hashlib
import json
import subprocess
import zipfile

root = Path(__file__).resolve().parent.parent
version = json.loads((root / 'package.json').read_text())['version']
def archive(name, files):
    target = root / 'dist' / name
    with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as output:
        for file, relative in sorted(files, key=lambda pair: pair[1]):
            info = zipfile.ZipInfo(relative, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            output.writestr(info, file.read_bytes(), compresslevel=9)
    with zipfile.ZipFile(target) as check:
        assert check.testzip() is None, f'Corrupt ZIP: {name}'
    return target
artifacts = []
for browser in ['chromium', 'firefox']:
    base = root / 'dist' / browser
    artifacts.append(archive(f'Zynubo-{browser}-v{version}.zip', [(f, f.relative_to(base).as_posix()) for f in base.rglob('*') if f.is_file()]))
# Include tracked files and newly added source files. Exclude build outputs and local files.
files = subprocess.check_output(['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], cwd=root).decode().split('\0')
source_dirs = ('src/', 'build/', 'docs/', 'tools/', 'tests/', 'images/', 'licenses/', '.github/')
source_roots = {'AGENTS.md', 'README.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md', 'CHANGELOG.md',
                'CONTRIBUTING.md', 'package.json', 'package-lock.json', 'Zynubo.user.js', 'icon.png',
                '.gitignore', '.gitattributes', '.nvmrc'}
def allowed(name):
    return (name in source_roots or name.startswith(source_dirs) or
            name.startswith(('youtube-adblock-filters.', 'webpack-ad-signatures.'))) and not name.endswith(('.pem', '.key'))
artifacts.append(archive(f'Zynubo-source-v{version}.zip', [(root / f, f) for f in set(files) if f and allowed(f) and (root / f).is_file()]))
for browser in ['chromium', 'firefox']:
    with zipfile.ZipFile(root / 'dist' / f'Zynubo-{browser}-v{version}.zip') as check:
        assert json.loads(check.read('manifest.json'))['version'] == version
        assert check.read('main.js') == (root / 'dist' / browser / 'main.js').read_bytes()
        assert check.read('LICENSE') == (root / 'LICENSE').read_bytes()
        assert not any(name.startswith(('node_modules/', '.git/')) or name.endswith(('.pem', '.key')) for name in check.namelist())
script = root / 'dist' / 'Zynubo.user.js'
script.write_bytes((root / 'Zynubo.user.js').read_bytes())
artifacts.append(script)
(root / 'dist' / 'SHA256SUMS').write_text(''.join(f'{hashlib.sha256(f.read_bytes()).hexdigest()}  {f.name}\n' for f in sorted(artifacts)))
print('\n'.join(str(f.relative_to(root)) for f in artifacts))
