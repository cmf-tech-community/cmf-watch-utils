from pathlib import Path
import json
import shutil
import tempfile

from reference_exports import build_exports


def main():
    source = Path(__file__).resolve().parent
    destination = source.parents[1] / 'site/public/storage-explorer/watch-pro-2'
    payload = json.loads((source / 'data.json').read_text(encoding='utf-8'))
    with tempfile.TemporaryDirectory(prefix='fmc-storage-') as temporary:
        staging = Path(temporary)
        shutil.copytree(source / 'assets', staging / 'assets')
        for filename in ('editor-theme.css', 'poster-exports.js'):
            shutil.copyfile(source / filename, staging / filename)
        result = build_exports(payload, (source / 'template.html').read_text(encoding='utf-8'), staging)
        destination.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(staging / 'index.html', destination / 'index.html')
        shutil.copytree(staging / 'downloads', destination / 'downloads', dirs_exist_ok=True)
    print(json.dumps(result))


if __name__ == '__main__':
    main()
