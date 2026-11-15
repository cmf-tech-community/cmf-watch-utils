import argparse
import hashlib
import json
from pathlib import Path
import shutil
import struct

from cmf_watch_utils.emu.profiles import PROFILES
from fwkit.aota import sum32
from page import FRAME_FILES, ROUTES, render_page


def watch_face_preview(app):
    launcher_check = 0x45158
    if app[launcher_check:launcher_check + 4] != bytes.fromhex("81f1b3fe"):
        raise ValueError("Unexpected Watch 3 Pro launcher code")
    preview = bytearray(app)
    preview[launcher_check:launcher_check + 4] = bytes.fromhex("012000bf")
    size = struct.unpack_from("<I", preview, 24)[0]
    struct.pack_into("<I", preview, 28, 0xffffffff - sum32(preview[512:512 + size]))
    struct.pack_into("<I", preview, 32, 0)
    struct.pack_into("<I", preview, 32, 0xffffffff - sum32(preview[:512]))
    return preview


parser = argparse.ArgumentParser()
parser.add_argument("--profile", choices=ROUTES, default="wp2-stock")
parser.add_argument("--fixtures", type=Path, required=True)
parser.add_argument("--rom", type=Path, required=True)
parser.add_argument("--output", type=Path, required=True)
texture_source = parser.add_mutually_exclusive_group()
texture_source.add_argument("--wfc-dir", type=Path)
texture_source.add_argument("--stock-image", type=Path, help="Generate the texture index from the published stock image")
parser.add_argument("--frames-dir", type=Path, help="Directory with the selected model's front renders")
args = parser.parse_args()
profile = PROFILES[args.profile]
if args.profile == "wp3-stock" and (args.stock_image or args.wfc_dir):
    parser.error("The Watch 3 Pro texture index comes from its prepared fixtures")
nor, nand, nand_id = profile.fixtures(args.fixtures)
stock_nor = bytearray(nor.read_bytes())
stock_app = profile.stock_app(stock_nor)
if args.profile == "wp3-stock":
    profile.model.app.stage(stock_nor, watch_face_preview(stock_app))
rom = args.rom.read_bytes()
if len(rom) != 65536:
    raise ValueError("Expected a 64 KiB compatibility ROM")
frame_names = FRAME_FILES[args.profile]
if args.frames_dir and any(not (args.frames_dir / name).is_file() for name in frame_names):
    parser.error("--frames-dir needs " + ", ".join(frame_names))
args.output.mkdir(parents=True, exist_ok=False)
if args.frames_dir:
    frames = args.output / "frames"
    frames.mkdir()
    for name in frame_names:
        shutil.copyfile(args.frames_dir / name, frames / name)
web = Path(__file__).resolve().parent
for name in ("watch.js", "style.css", "face.mjs", "catalog.mjs", "speaker.mjs", "favicon.svg"):
    shutil.copyfile(web / name, args.output / name)
(args.output / "index.html").write_text(render_page(args.profile), encoding="utf-8")
fixtures = args.output / "fixtures"
fixtures.mkdir()
for path, name in ((nand, "nand-defaults.bin"), (nand_id, "nand-id.bin")):
    shutil.copyfile(path, fixtures / name)
(fixtures / "nor.bin").write_bytes(stock_nor)
(fixtures / "compat.bin").write_bytes(rom)
(fixtures / "app.bin").write_bytes(stock_app)
files = ["nor.bin", "nand-defaults.bin", "nand-id.bin", "compat.bin", "app.bin"]
stock_audio = args.fixtures / "stock-audio.bin"
if stock_audio.is_file():
    shutil.copyfile(stock_audio, fixtures / stock_audio.name)
    files.append(stock_audio.name)
if args.profile == "wp3-stock":
    shutil.copyfile(args.fixtures / "wfc-index.txt", fixtures / "wfc-index.txt")
    files.append("wfc-index.txt")
elif args.wfc_dir or args.stock_image:
    from fwkit import lz4, wfdl
    if args.stock_image:
        from cmf_watch_utils.emu.prepare import STOCK_SHA256
        from fwkit import Image, sdfs

        stock = args.stock_image.read_bytes()
        if hashlib.sha256(stock).hexdigest() != STOCK_SHA256:
            parser.error("--stock-image needs the published Watch Pro 2 1.0.0.73 image")
        fonts = sdfs.unpack(Image(stock).decompressed("fonts.bin"))
        faces = (data for name, data in fonts.items() if name.endswith(".wfc"))
    else:
        faces = (path.read_bytes() for path in args.wfc_dir.glob("*_local*.wfc"))

    textures = set()
    for face in faces:
        for entry in wfdl.parse(face).resources:
            if entry.cf == 5:
                pixels = lz4.decompress(entry.data, entry.raw_size)
                if len(pixels) != entry.w * entry.h * 3:
                    raise ValueError(f"Invalid WFC texture in {face}")
                textures.add(f"{entry.w}:{entry.h}:{hashlib.sha256(pixels).hexdigest()}")
    if not textures:
        raise ValueError("No packed WFC textures found")
    (fixtures / "wfc-index.txt").write_text("\n".join(sorted(textures)) + "\n", encoding="ascii", newline="\n")
    files.append("wfc-index.txt")
(fixtures / "manifest.json").write_text(json.dumps({"profile": args.profile, "files": files}), encoding="utf-8")
print(args.output.resolve())
