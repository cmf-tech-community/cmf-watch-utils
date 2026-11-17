import argparse
import hashlib
import json
from pathlib import Path
import shutil
import socket
import subprocess
import time

from cmf_watch_utils.emu.profiles import PROFILES
from cmf_watch_utils.emu.preview import watch_face_preview
from cmf_watch_utils.emu.prepare import STOCK_SHA256, stock_faces, write_texture_index
from cmf_watch_utils.emu.vm import child, executable, runtime_env
from page import FRAME_FILES, OG_IMAGES, ROUTES, render_page


def initialize_watch3_storage(args, model, nor, nand, nand_id, target):
    work = args.output / "storage-initialization"
    work.mkdir()
    empty = work / "empty-provisioning-table.bin"
    empty.write_bytes(bytes(512))
    env = runtime_env(args, model, MODEL=model.name, NOR=nor, NAND=nand, NAND_ID=nand_id,
                      NAND_EXPORT=target, NAND_PROGRAM=args.provisioner, NAND_STAGING=empty,
                      UNPLUGGED=1)
    with socket.socket() as local:
        local.bind(("127.0.0.1", 0))
        address = f"127.0.0.1:{local.getsockname()[1]}"
    uart = work / "uart.log"
    argv = [executable(args.qemu, env), "-M", model.machine, "-bios", str(args.rom),
            "-display", "none", "-monitor", "none", "-serial", f"file:{uart}", "-serial", "null",
            "-serial", "null", "-icount", "shift=3,align=off", "-S", "-gdb", f"tcp:{address}", "-no-reboot"]
    gdb = [executable(args.gdb, env), "-batch", "-nx", "-ex", "set architecture arm",
           "-ex", "set remotetimeout 5", "-ex", f"target remote {address}",
           "-ex", "break *0x100ef472", "-ex", "continue",
           "-ex", "set $pc = 0x20000000", "-ex", "continue"]
    with child(argv, env, work / "qemu.log") as process, (work / "gdb.log").open("wb") as log:
        time.sleep(1)
        if process.poll() is not None:
            raise RuntimeError(f"QEMU could not start. See {work}\n"
                               + (work / "qemu.log").read_text(errors="replace")[-1500:])
        subprocess.run(gdb, env=env, stdout=log, stderr=log, timeout=120)
        status = process.wait(timeout=15)
    captured = target.stat().st_size if target.is_file() else 0
    recovered = uart.is_file() and "MSG_REBOOT, recover:1" in uart.read_text(errors="replace")
    if status != 0 or captured != model.nand_bytes or not recovered:
        diagnostics = "\n".join((work / name).read_text(errors="replace")[-1500:]
                                for name in ("qemu.log", "gdb.log"))
        raise RuntimeError(f"Watch 3 Pro storage initialization failed (QEMU exit {status}, "
                           f"NAND {captured} bytes, recovery reboot {recovered}). See {work}\n{diagnostics}")


parser = argparse.ArgumentParser()
parser.add_argument("--profile", choices=ROUTES, default="wp2-stock")
parser.add_argument("--fixtures", type=Path, required=True)
parser.add_argument("--rom", type=Path, required=True)
parser.add_argument("--output", type=Path, required=True)
parser.add_argument("--qemu", type=Path, help="Native QEMU for Watch 3 Pro storage preparation")
parser.add_argument("--gdb", help="Arm-capable GDB for Watch 3 Pro storage preparation")
parser.add_argument("--provisioner", type=Path, help="The native runtime's provision-nand.bin")
parser.add_argument("--runtime-dir", type=Path, help="Directory containing native runtime libraries")
texture_source = parser.add_mutually_exclusive_group()
texture_source.add_argument("--wfc-dir", type=Path)
texture_source.add_argument("--stock-image", type=Path, help="Generate the texture index from the published stock image")
parser.add_argument("--frames-dir", type=Path, help="Directory with the selected model's front renders")
args = parser.parse_args()
profile = PROFILES[args.profile]
if args.profile == "wp3-stock" and (args.stock_image or args.wfc_dir):
    parser.error("The Watch 3 Pro texture index comes from its prepared fixtures")
if args.profile == "wp3-stock" and not (args.qemu and args.gdb and args.provisioner):
    parser.error("Watch 3 Pro browser staging requires --qemu, --gdb and --provisioner")
nor, nand, nand_id = profile.fixtures(args.fixtures)
stock_nor = bytearray(nor.read_bytes())
stock_app = profile.stock_app(stock_nor)
rom = bytearray(args.rom.read_bytes())
if len(rom) != 65536:
    raise ValueError("Expected a 64 KiB compatibility ROM")
if args.profile == "wp3-stock":
    profile.model.app.stage(stock_nor, watch_face_preview(stock_app, rom))
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
for name in ("watch.js", "style.css", "face.mjs", "catalog.mjs", "speaker.mjs", "fixtures.mjs", "persistence.mjs", "storage-controls.mjs", "preload.mjs", "app-picker.mjs", "app-storage.mjs", "favicon.svg"):
    shutil.copyfile(web / name, args.output / name)
shutil.copyfile(web / OG_IMAGES[args.profile], args.output / OG_IMAGES[args.profile])
(args.output / "index.html").write_text(render_page(args.profile), encoding="utf-8")
fixtures = args.output / "fixtures"
fixtures.mkdir()
shutil.copyfile(nand_id, fixtures / "nand-id.bin")
if args.profile == "wp3-stock":
    initialize_watch3_storage(args, profile.model, nor, nand, nand_id, fixtures / "nand-defaults.bin")
else:
    shutil.copyfile(nand, fixtures / "nand-defaults.bin")
(fixtures / "nor.bin").write_bytes(stock_nor)
(fixtures / "compat.bin").write_bytes(rom)
(fixtures / "app.bin").write_bytes(stock_app)
files = ["nor.bin", "nand-defaults.bin", "nand-id.bin", "compat.bin", "app.bin"]
stock_audio = args.fixtures / "stock-audio.bin"
if stock_audio.is_file():
    shutil.copyfile(stock_audio, fixtures / stock_audio.name)
    files.append(stock_audio.name)
texture_index = args.fixtures / "wfc-index.txt"
if args.wfc_dir or args.stock_image:
    if args.stock_image:
        from fwkit import Image

        stock = args.stock_image.read_bytes()
        if hashlib.sha256(stock).hexdigest() != STOCK_SHA256:
            parser.error("--stock-image needs the published Watch Pro 2 1.0.0.73 image")
        faces = stock_faces(Image(stock), profile.model.name).values()
    else:
        faces = (path.read_bytes() for path in args.wfc_dir.glob("*_local*.wfc"))
    write_texture_index(faces, fixtures / "wfc-index.txt")
    files.append("wfc-index.txt")
elif texture_index.is_file():
    shutil.copyfile(texture_index, fixtures / "wfc-index.txt")
    files.append("wfc-index.txt")
(fixtures / "manifest.json").write_text(json.dumps({"profile": args.profile, "files": files}), encoding="utf-8")
print(args.output.resolve())
