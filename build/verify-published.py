"""Read-only audit of the release linked by README; never executes downloaded code."""
import base64
import hashlib
import io
import json
from pathlib import Path
import re
import urllib.request
import zipfile

root = Path(__file__).resolve().parent.parent
config = json.loads((root / 'build/distribution.json').read_text())
assert config['repository'] == 'rafelolv/Zynubo'
repository = config['repository']
readme = (root / 'README.md').read_text()
links = set(re.findall(r'releases/download/v(\d+\.\d+\.\d+)/(Zynubo|Treco)-(?:chromium|firefox)-v\d+\.\d+\.\d+\.zip', readme))
assert len(links) == 1, 'README must link one release and brand'
version, brand = links.pop()
versions = {version}
assert len(versions) == 1, 'README must link one published release'
version = versions.pop()
project = f'https://github.com/{repository}'
headers = {'User-Agent': 'Treco-distribution-audit', 'Accept': 'application/vnd.github+json'}

def fetch(url, limit=20 * 1024 * 1024):
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=30) as response:
        payload = response.read(limit + 1)
        assert len(payload) <= limit, 'Downloaded artifact exceeds audit limit'
        return payload

release = json.loads(fetch(f'https://api.github.com/repos/{repository}/releases/tags/v{version}', 256 * 1024))
assert release['tag_name'] == f'v{version}' and not release['draft'] and not release['prerelease']
# GitHub preserves old project links after a rename; only these owner-controlled
# product names are accepted, and every asset must use the resolved release path.
canonical_projects = {'https://github.com/rafelolv/Zynubo', 'https://github.com/rafelolv/Treco'}
canonical_project = release['html_url'].removesuffix(f'/releases/tag/v{version}')
assert canonical_project in canonical_projects
assert release['html_url'] == f'{canonical_project}/releases/tag/v{version}'
expected = {f'{brand}-{browser}-v{version}.zip' for browser in ['chromium','firefox','source']} | {f'{brand}.user.js','SHA256SUMS'}
assets = {asset['name']: asset for asset in release['assets']}
assert set(assets) == expected, 'Unexpected published release assets'
for browser in ['chromium','firefox']:
    name = f'{brand}-{browser}-v{version}.zip'
    assert f'{project}/releases/download/v{version}/{name}' in readme, 'README download URL is stale'
files = {}
for name, asset in assets.items():
    url = asset['browser_download_url']
    assert url == f'{canonical_project}/releases/download/v{version}/{name}'
    files[name] = fetch(url)
    assert len(files[name]) == asset['size']
checksums = dict((name, digest) for digest, name in (line.split('  ',1) for line in files['SHA256SUMS'].decode().splitlines()))
assert set(checksums) == expected - {'SHA256SUMS'}
for name,digest in checksums.items():
    assert hashlib.sha256(files[name]).hexdigest() == digest, name
script_name=f'{brand}.user.js'
script = files[script_name].decode()
assert re.search(rf'^// @version\s+{re.escape(version)}\s*$', script, re.M)
for field, suffix in [('downloadURL',script_name),('updateURL',script_name)]:
    assert re.search(rf'^// @{field}\s+https://raw\.githubusercontent\.com/{repository}/main/{re.escape(suffix)}\s*$', script,re.M)
icon = fetch(f'https://raw.githubusercontent.com/{repository}/main/icon.png', 256 * 1024)
assert icon[:8]==b'\x89PNG\r\n\x1a\n' and int.from_bytes(icon[16:20],'big')==128 and int.from_bytes(icon[20:24],'big')==128
package_icons=[]
engines=[]
for browser in ['chromium','firefox']:
    with zipfile.ZipFile(io.BytesIO(files[f'{brand}-{browser}-v{version}.zip'])) as archive:
        assert archive.testzip() is None
        manifest=json.loads(archive.read('manifest.json'))
        assert manifest['version']==version and manifest['homepage_url']==project
        info=json.loads(archive.read('build-info.json'))
        assert info['version']==version and info['coreSha256']==checksums[script_name]
        engine=archive.read('main.js');engines.append(engine)
        assert hashlib.sha256(engine).hexdigest()==info['mainSha256']
        for size in [16,32,48,128]:
            path=manifest['icons'][str(size)];png=archive.read(path)
            assert png[:8]==b'\x89PNG\r\n\x1a\n'
            assert int.from_bytes(png[16:20],'big')==size and int.from_bytes(png[20:24],'big')==size
        package_icons.append(archive.read('icons/icon128.png'))
assert engines[0]==engines[1]
with zipfile.ZipFile(io.BytesIO(files[f'{brand}-source-v{version}.zip'])) as source:
    assert source.testzip() is None
    assert source.read(script_name)==files[script_name]
    assert json.loads(source.read('package.json'))['version']==version
    assert package_icons[0]==package_icons[1]==source.read('icon.png')
    icon_field=re.search(r'^// @icon\s+(\S+)',script,re.M).group(1)
    if brand=='Treco':
        assert icon_field.startswith('data:image/png;base64,')
        assert base64.b64decode(icon_field.split(',',1)[1],validate=True)==package_icons[0]
    else:
        assert icon_field==f'https://raw.githubusercontent.com/{repository}/main/icon.png'
print(f'Published v{version}: README links, five assets, checksums, userscript metadata, both engines, icons and reviewer source verified.')
