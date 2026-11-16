import argparse
import gzip
from hashlib import sha256
import json
from pathlib import Path
import shutil
from zipfile import ZIP_DEFLATED, ZipFile
from page import FRAME_FILES, ROUTES, render_page


parser = argparse.ArgumentParser()
parser.add_argument("--profile", choices=ROUTES, default="wp2-stock")
parser.add_argument("--model-selector", action="store_true", help="Link both staged emulator pages")
parser.add_argument("--runtime", type=Path, required=True)
parser.add_argument("--output", type=Path, required=True)
parser.add_argument("--stock", type=Path, help="Staged browser stock image and watch frames")
parser.add_argument("--presets", type=Path, help="Prepared browser firmware presets")
args = parser.parse_args()
if args.profile == "wp3-stock" and not args.stock:
    parser.error("Watch 3 Pro requires its staged stock fixtures")
if args.stock:
    manifest = args.stock / "fixtures" / "manifest.json"
    metadata = json.loads(manifest.read_text(encoding="utf-8")) if manifest.is_file() else {}
    staged_profile = metadata.get("profile", "wp2-stock")
    if args.profile != staged_profile:
        parser.error(f"Stock fixtures are for {staged_profile}, expected {args.profile}")

web = Path(__file__).resolve().parent
target = args.output / "emulator" / ROUTES[args.profile]
scripts = ("watch.js", "style.css", "face.mjs", "catalog.mjs", "firmware-worker.js", "speaker.mjs", "fixtures.mjs")
root = web.parents[1]
tools = (
    ("src", ("cmf_watch_utils/emu/image.py", "cmf_watch_utils/emu/profiles.py")),
    ("tooling/src", ("fwkit/aota.py", "fwkit/sdfs.py")),
)
runtime_files = (
    ("qemu-system-arm", "qemu-system-arm.js"),
    ("qemu-system-arm.wasm", "qemu-system-arm.wasm"),
    ("qemu-system-arm.worker.js", "qemu-system-arm.worker.js"),
)
digest = sha256()
stock_files = []
preset_files = []
if args.presets:
    preset_files = [args.presets / "display-demo.bin"]
    if args.profile == "wp2-stock":
        bad_apple = [args.presets / name for name in ("bad-apple-app.bin", "bad-apple-sdfs.bin")]
        if any(path.exists() for path in bad_apple):
            preset_files.extend(bad_apple)
if args.stock:
    stock_files = [args.stock / "fixtures" / name for name in (
        "app.bin", "compat.bin", "nand-defaults.bin", "nand-id.bin", "nor.bin", "wfc-index.txt",
    )]
    if args.profile == "wp2-stock" or (args.stock / "frames").is_dir():
        stock_files += [args.stock / "frames" / name for name in FRAME_FILES[args.profile]]
    audio = args.stock / "fixtures" / "stock-audio.bin"
    if audio.is_file():
        stock_files.append(audio)
for path in (
    *(web / name for name in scripts),
    *(args.runtime / name for name, _ in runtime_files),
    *(root / base / name for base, files in tools for name in files),
    *stock_files,
    *preset_files,
):
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
asset_path = f"assets/{digest.hexdigest()[:16]}"
assets = target / asset_path
runtime = assets / "runtime"
runtime.mkdir(parents=True, exist_ok=True)
for name in scripts:
    shutil.copyfile(web / name, assets / name)
for name in ("isolation-worker.js", "favicon.svg"):
    shutil.copyfile(web / name, target / name)
if args.profile == "wp2-stock":
    shutil.copyfile(web / "og-watch-emulator.png", target / "og-watch-emulator.png")
body = ["data-hosted"]
if args.stock:
    body.append("data-stock-ready")
    if audio.is_file():
        body.append("data-stock-audio")
if preset_files:
    body.append("data-demo-ready")
if len(preset_files) == 3:
    body.append("data-bad-apple-ready")
html = render_page(args.profile, body, model_selector=args.model_selector)
for name in ("watch.js", "style.css"):
    html = html.replace(f'"./{name}"', f'"./{asset_path}/{name}"', 1)
(target / "index.html").write_text(html, encoding="utf-8")
for source, name in runtime_files:
    shutil.copyfile(args.runtime / source, runtime / name)
if preset_files:
    (assets / "presets").mkdir(exist_ok=True)
    for source in preset_files:
        shutil.copyfile(source, assets / "presets" / source.name)
for source in stock_files:
    destination = assets / source.relative_to(args.stock)
    destination.parent.mkdir(parents=True, exist_ok=True)
    if source.name == "nand-defaults.bin":
        with source.open("rb") as data, destination.with_suffix(".bin.gz").open("wb") as compressed:
            with gzip.GzipFile(fileobj=compressed, mode="wb", compresslevel=6, mtime=0) as output:
                shutil.copyfileobj(data, output)
    else:
        shutil.copyfile(source, destination)

with ZipFile(assets / "firmware-tools.zip", "w", compression=ZIP_DEFLATED) as archive:
    for package in ("cmf_watch_utils", "cmf_watch_utils/emu", "fwkit"):
        archive.writestr(f"{package}/__init__.py", "")
    for base, files in tools:
        for name in files:
            archive.write(root / base / name, name)
