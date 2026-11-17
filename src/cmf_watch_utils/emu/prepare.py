import hashlib
from pathlib import Path
import shutil
import socket
import struct
import subprocess
import tempfile
import time
import xml.etree.ElementTree as ET

from fwkit import aota, lz4, sdfs, wfdl
from fwkit.image import Image

from .image import require
from .profiles import PROFILES
from .vm import child, executable, runtime_env

STOCK_SHA256 = "30903fc8ce6db4f8860bb554366635db3d2bcbb2d43827b3b50fbbac22b59353"
WP3_STOCK_SHA256 = "cf381188eb5fe26a14047a03697e68b58785bdcd01c4baf8703d4624650c6352"
NAND_ID_SHA256 = "ed98cb6473039a637cb86ebd6261d4e270f261e1ec214f5d7c2e1954721b1e9d"
STAGING = 0x20010000
PARTITIONS = (
    ("fw0_boot", 1, 1, 0, 0x0, 0x1000),
    ("fw0_para", 6, 2, 0, 0x1000, 0x1000),
    ("fw1_boot", 1, 1, 1, 0x2000, 0x1000),
    ("fw1_para", 6, 2, 1, 0x3000, 0x1000),
    ("fw0_rec", 3, 3, 0, 0x4000, 0x20000),
    ("fw0_sys", 2, 4, 0, 0x24000, 0x34b000),
    ("reserved", 4, 248, 15, 0x36f000, 0x64000),
    ("fw0_sdfs", 4, 5, 0, 0x3d3000, 0x10000),
    ("nvram_fa", 4, 6, 15, 0x3e3000, 0x1000),
    ("nvram_fa", 4, 7, 15, 0x3e4000, 0x2000),
    ("nvram_us", 4, 8, 15, 0x3e6000, 0x2000),
    ("logbuf", 4, 251, 0, 0x3e8000, 0x4000),
    ("dstorage", 4, 249, 32, 0x480000, 0x200000),
    ("coredump", 4, 253, 0, 0x3ec000, 0x14000),
    ("res_a", 4, 10, 32, 0x1280000, 0xa00000),
    ("font", 4, 12, 32, 0x680000, 0xc00000),
    ("res_b", 4, 11, 32, 0x1c80000, 0x800000),
    ("res_e", 4, 14, 32, 0x2480000, 0x4000000),
    ("sdfs_k", 4, 20, 32, 0x380000, 0x100000),
    ("fw0_temp", 5, 254, 32, 0x0, 0x380000),
    ("runtimel", 4, 250, 32, 0x6480000, 0x200000),
    ("udisk", 4, 40, 32, 0x6680000, 0xa00000),
)
RESOURCES = {"sdfs_k": "sdfs_k.bin", "font": "fonts.bin", "res_a": "res.bin",
             "res_e": "res_e.bin", "res_b": None}
WP3_SLOTS = {"res_a": (0x1280000, 0x1000000), "res_b": (0x2280000, 0x200000),
             "res_e": (0x2480000, 0x3000000)}
WP3_PARTITIONS = tuple((name, kind, fid, flags, *WP3_SLOTS.get(name, (offset, size)))
                       for name, kind, fid, flags, offset, size in PARTITIONS) + (
                           ("res_d", 4, 13, 32, 0x5480000, 0x300000),)
WP3_RESOURCES = dict(RESOURCES, res_b="res_b.bin", res_d="res_d.bin")


def partition_table(partitions=PARTITIONS):
    header = struct.pack("<4sBBHHH4x", b"ACPT", 1, 1, 744, len(partitions), 24)
    entries = b"".join(struct.pack("<8sBBBBIII", name.encode("ascii"), kind, file_id, flags,
                                   0, offset, size, offset)
                       for name, kind, file_id, flags, offset, size in partitions)
    table = (header + entries).ljust(740, b"\0")
    return table + struct.pack("<I", aota.crc32(table))


def build_nor(stock, profile):
    inner = stock.decompressed("TEMP.bin")
    _, entries = aota.parse(inner)
    files = {entry.name: entry.stored(inner) for entry in entries}
    version = ET.fromstring(stock.xml).find("firmware_version")
    data = struct.pack("<IIII64s32s12x", 0x52455646, int(version.findtext("version_code"), 0),
                       int(version.findtext("version_res"), 0), 0,
                       version.findtext("version_name").encode("ascii"),
                       version.findtext("board_name").encode("ascii"))
    layout = WP3_PARTITIONS if profile.model.name == "wp3" else PARTITIONS
    params = partition_table(layout) + data + struct.pack("<I", aota.crc32(data))
    model = profile.model
    nor = bytearray(b"\xff" * model.nor_bytes)
    model.app.stage(nor, files["app.bin"])
    model.sdfs.stage(nor, files["sdfs.bin"])
    for offset in (0x1000, 0x3000):
        nor[offset:offset + len(params)] = params
    profile.stock_app(nor)
    return nor, files["app.bin"]


def empty_app_volume():
    volume = bytearray(b"\xff" * (10 * 1024 * 1024))
    volume[:512 * 512] = bytes(512 * 512)
    volume[:11] = b"\xeb\xfe\x90MSDOS5.0"
    struct.pack_into("<HBHBHHBHHHII", volume, 11,
                     512, 4, 1, 1, 512, 20480, 0xf8, 479, 63, 255, 0, 0)
    volume[36:62] = b"\x80\x00\x29\x00\x00\x21\x48NO NAME    FAT     "
    volume[510:512] = b"\x55\xaa"
    volume[512:516] = b"\xf8\xff\xff\xff"
    return volume


def stage_resources(stock, profile, target):
    wp3 = profile.model.name == "wp3"
    partitions = WP3_PARTITIONS if wp3 else PARTITIONS
    resources = WP3_RESOURCES if wp3 else RESOURCES
    layout = {name: (offset, size) for name, _, _, _, offset, size in partitions}
    header = bytearray(512)
    struct.pack_into("<I", header, 508, 0 if wp3 else 1 if profile.name == "wp2-onboarding" else 3)
    with target.open("wb") as staging:
        staging.write(header)
        for index, (name, filename) in enumerate(resources.items()):
            payload = stock.decompressed(filename) if filename else struct.pack("<8sIII44x", b"sdfs.bin", 0, 0, 64)
            padded = payload.ljust((len(payload) + 2047) & ~2047, b"\xff")
            offset, size = layout[name]
            require(payload.startswith(b"sdfs.bin") and len(padded) <= size, f"Invalid SDFS for {name}")
            struct.pack_into("<III", header, 12 * index, offset, len(padded), STAGING + staging.tell())
            staging.write(padded)
        if not wp3:
            payload = empty_app_volume()
            struct.pack_into("<III", header, 12 * len(resources), layout["udisk"][0], len(payload), STAGING + staging.tell())
            staging.write(payload)
        staging.seek(0)
        staging.write(header)


def write_texture_index(faces, target):
    textures = set()
    for face in faces:
        for entry in wfdl.parse(face).resources:
            if entry.cf == 5:
                pixels = lz4.decompress(entry.data, entry.raw_size)
                require(len(pixels) == entry.w * entry.h * 3, "Invalid packed WFC texture size")
                textures.add(f"{entry.w}:{entry.h}:{hashlib.sha256(pixels).hexdigest()}")
    require(textures, "No packed WFC textures found")
    target.write_text("\n".join(sorted(textures)) + "\n", encoding="ascii", newline="\n")


def stock_faces(stock, model):
    partition = "res_d.bin" if model == "wp3" else "fonts.bin"
    return {name: data for name, data in sdfs.unpack(stock.decompressed(partition)).items()
            if name.endswith(".wfc")}


def provision_nand(args, profile, work, env, qemu, debugger, elf, pending):
    for attempt in (1, 2):
        with socket.socket() as listener:
            listener.bind(("127.0.0.1", 0))
            address = f"127.0.0.1:{listener.getsockname()[1]}"
        command = [qemu, "-M", profile.model.machine, "-bios", str(args.rom),
                   "-kernel", str(work / "app.bin"), "-display", "none", "-monitor", "none",
                   "-serial", f"file:{work / f'uart-{attempt}.log'}",
                   "-icount", "shift=3,align=off",
                   "-S", "-gdb", f"tcp:{address}", "-no-reboot"]
        gdb_log = work / f"gdb-{attempt}.log"
        with child(command, env, work / f"qemu-{attempt}.log") as process, gdb_log.open("wb") as log:
            time.sleep(1)
            require(process.poll() is None, f"QEMU could not start. See {work / f'qemu-{attempt}.log'}")
            subprocess.run([debugger, "-batch", str(elf), "-ex", "set remotetimeout 5",
                            "-ex", f"target remote {address}", "-ex", "break *0x100fa6f8",
                            "-ex", "continue", "-ex", "set $pc = provision", "-ex", "continue"],
                           stdout=log, stderr=log, cwd=work, env=env, timeout=180)
            if pending.is_file():
                require(process.wait(timeout=15) == 0 and pending.stat().st_size == profile.model.nand_bytes,
                        f"QEMU produced an incomplete NAND image. See {work}")
                return
        if "The program is not being run" not in gdb_log.read_text(errors="replace"):
            break
    raise RuntimeError(f"NAND provisioning did not produce the expected image. See {work}")


def prepare(args, profile):
    stock_bytes = args.stock.read_bytes()
    wp3 = profile.model.name == "wp3"
    require(hashlib.sha256(stock_bytes).hexdigest() == (WP3_STOCK_SHA256 if wp3 else STOCK_SHA256),
            f"Expected the verified {profile.model.title} {profile.stock_version} stock package")
    provisioning_image = getattr(args, "provisioning_stock", None)
    require(not wp3 or provisioning_image is not None,
            "Watch 3 Pro preparation requires --provisioning-stock with Watch Pro 2 stock 1.0.0.73 for the virtual NAND writer")
    provisioning_stock = provisioning_image.read_bytes() if wp3 else stock_bytes
    require(hashlib.sha256(provisioning_stock).hexdigest() == STOCK_SHA256,
            "Expected Watch Pro 2 stock 1.0.0.73 as the virtual NAND writer")
    nand_id = args.nand_id.read_bytes()
    require(hashlib.sha256(nand_id).hexdigest() == NAND_ID_SHA256,
            "Expected the pinned Actions SDK nand_id_all.bin")
    elf = args.provisioner / "provision-nand.elf"
    program = args.provisioner / "provision-nand.bin"
    require(elf.is_file() and program.is_file(), "Use a ROM bundle with provision-nand.elf and provision-nand.bin")
    require(args.rom.is_file(), f"Compatibility ROM not found: {args.rom}")
    runtime = runtime_env(args, profile.model)
    qemu = executable(args.qemu, runtime)
    debugger = executable(args.gdb, runtime)
    args.fixtures.mkdir(parents=True, exist_ok=True)
    target = args.fixtures / profile.nand_filename
    require(not target.exists(), f"Fixture already exists: {target}")
    require(shutil.disk_usage(args.fixtures).free >= profile.model.nand_bytes + 86 * 1024**2,
            "Fixture preparation needs about 220 MiB of free space on the output drive")
    work = Path(tempfile.mkdtemp(prefix=f"prepare-{profile.name}-", dir=args.fixtures))
    stock = Image(stock_bytes)
    nor, app = build_nor(stock, profile)
    (work / "nor.bin").write_bytes(nor)
    (work / "nand-id.bin").write_bytes(nand_id)
    provisioning_nor = work / "nor.bin"
    if wp3:
        legacy_nor, app = build_nor(Image(provisioning_stock), PROFILES["wp2-stock"])
        provisioning_nor = work / "provisioning-nor.bin"
        provisioning_nor.write_bytes(legacy_nor)
    write_texture_index(stock_faces(stock, profile.model.name).values(), work / "wfc-index.txt")
    (work / "app.bin").write_bytes(app)
    outputs = {"nor.bin": nor, "nand-id.bin": nand_id,
               "wfc-index.txt": (work / "wfc-index.txt").read_bytes()}
    for name, data in outputs.items():
        existing = args.fixtures / name
        if existing.exists():
            require(existing.read_bytes() == data, f"Existing fixture differs: {existing}")
    staging = work / "resources.bin"
    pending = work / "nand.pending"
    env = runtime_env(args, profile.model, NOR=provisioning_nor, NAND_EXPORT=pending,
                      NAND_PROGRAM=program, NAND_STAGING=staging)
    try:
        stage_resources(stock, profile, staging)
        provision_nand(args, profile, work, env, qemu, debugger, elf, pending)
    except BaseException:
        pending.unlink(missing_ok=True)
        raise
    finally:
        staging.unlink(missing_ok=True)
        (work / "app.bin").unlink(missing_ok=True)
        if wp3:
            provisioning_nor.unlink(missing_ok=True)
    for name in outputs:
        destination = args.fixtures / name
        if destination.exists():
            (work / name).unlink()
        else:
            (work / name).replace(destination)
    pending.replace(target)
    return {"profile": profile.name, "fixtures": str(args.fixtures), "nand": str(target), "logs": str(work)}
