"""Offline preparation tests; never contact GitHub or AMO."""
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location('prepare', Path(__file__).resolve().parents[1] / 'build/firefox/prepare.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class PreparationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='treco-amo-')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.published = self.root / 'published'
        self.published.mkdir()
        (self.root / 'dist').mkdir()
        self.output = self.root / 'payload'
        self.tag = 'v1.2.3'
        self.required = ['package-lock.json', 'src/core.user.js', 'src/ui/panel.css', 'images/icon.svg',
                         'build/build.mjs', 'build/compile-ui.mjs', 'docs/RELEASING.md', 'LICENSE', f'docs/releases/{self.tag}.md']
        (self.root / 'package.json').write_text(json.dumps({'version': '1.2.3'}))
        for name in self.required:
            file = self.root / name
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_text(f'# Treco {self.tag}\n\n## Changes\n\n- A change.\n' if name.endswith('.md') else name)
        manifest = {'version': '1.2.3', 'browser_specific_settings': {'gecko': {'id': module.GUID}}}
        for kind in ['chromium', 'firefox', 'source']:
            with zipfile.ZipFile(self.root / f'dist/Treco-{kind}-{self.tag}.zip', 'w') as z:
                if kind == 'source':
                    for name in self.required:
                        z.write(self.root / name, name)
                else:
                    z.writestr('manifest.json', json.dumps(manifest))
        (self.root / 'dist/Treco.user.js').write_text('generated script')
        for file in (self.root / 'dist').iterdir():
            (self.published / file.name).write_bytes(file.read_bytes())
        self.release = {'tagName': self.tag, 'isDraft': False, 'isPrerelease': False}
        self.save()

    def save(self):
        (self.published / 'release.json').write_text(json.dumps(self.release))
        (self.published / 'SHA256SUMS').write_text(''.join(
            f'{hashlib.sha256(f.read_bytes()).hexdigest()}  {f.name}\n'
            for f in sorted((self.root / 'dist').iterdir())))

    def prepare(self):
        module.prepare(self.root, self.tag, self.published, self.output)

    def test_exact_pair(self):
        self.prepare()
        for kind in ['firefox', 'source']:
            name = f'Treco-{kind}-{self.tag}.zip'
            self.assertEqual((self.output / name).read_bytes(), (self.published / name).read_bytes())

    def test_unstable_or_wrong_tag(self):
        for change in [{'isDraft': True}, {'isPrerelease': True}, {'tagName': 'v9.0.0'}]:
            with self.subTest(change=change):
                self.release.update(change)
                self.save()
                with self.assertRaises(ValueError):
                    self.prepare()

    def test_download_tamper(self):
        (self.published / 'Treco.user.js').write_text('changed')
        with self.assertRaises(ValueError):
            self.prepare()

    def test_rebuild_mismatch_even_with_valid_checksums(self):
        file = self.published / 'Treco.user.js'
        file.write_text('changed')
        sums = (self.published / 'SHA256SUMS').read_text()
        old = hashlib.sha256((self.root / 'dist/Treco.user.js').read_bytes()).hexdigest()
        (self.published / 'SHA256SUMS').write_text(sums.replace(old, hashlib.sha256(file.read_bytes()).hexdigest()))
        with self.assertRaises(ValueError):
            self.prepare()

    def test_source_mismatch(self):
        (self.root / 'src/core.user.js').write_text('changed')
        with self.assertRaises(ValueError):
            self.prepare()

    def test_cap(self):
        original = module.LIMIT
        try:
            module.LIMIT = 5
            with self.assertRaises(ValueError):
                self.prepare()
        finally:
            module.LIMIT = original

    def test_unsafe_and_duplicate_checksum_names(self):
        for name in ['../../secret', 'Treco.user.js']:
            with self.subTest(name=name):
                self.save()
                with (self.published / 'SHA256SUMS').open('a') as sums:
                    sums.write('0' * 64 + '  ' + name + '\n')
                with self.assertRaises(ValueError):
                    self.prepare()


if __name__ == '__main__':
    unittest.main()
