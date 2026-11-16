import asyncio
from pathlib import Path
import secrets
import socket
from tempfile import TemporaryDirectory

from ..cmf_watch import Watch
from .hci import virtual_gatt
from .image import require
from .vm import Qmp


async def provision(port, name):
    async with virtual_gatt(port, name) as client:
        watch = Watch(verbose=False)
        watch.client = client
        await watch.attach()
        await asyncio.sleep(0.6)
        secret = secrets.token_hex(16)
        reply = await watch.at(f"AT SETSECRET {secret}", timeout=4)
        actual = await watch.at("AT GETSECRET", timeout=4)
        require(b"SETSECRET,OK" in reply and secret.encode() in actual,
                "Virtual stock firmware did not retain the synthetic secret")


def restore_wp3_runtime_patches(nor, app_offset):
    patches = (
        (0xdaf04, "dff800f0c17e0000", "00b50a4a0a4bffb0"),
        (0x1ae290, "d0ff0f40", "b8bff92f"),
        (0xdcc28, "d4ff0f40", "a34d0638"),
        (0x220efc, "817d0000", "71ce0d10"),
    )
    for relative, patched, stock in patches:
        offset = app_offset + relative
        injected = bytes.fromhex(patched)
        if nor[offset:offset + len(injected)] == injected:
            nor[offset:offset + len(injected)] = bytes.fromhex(stock)


def pair_fixture(args, profile):
    require(not args.output.exists(), f"Output already exists: {args.output}")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    model = profile.model
    with TemporaryDirectory(dir=args.output.parent) as temporary:
        capture = Path(temporary) / "nor.bin"
        with socket.create_connection(("127.0.0.1", args.qmp_port), timeout=10) as conn:
            with conn.makefile("rwb", buffering=0) as stream:
                qmp = Qmp(stream)
                asyncio.run(provision(args.hci_port, args.name))
                qmp.request("stop")
                qmp.request("pmemsave", val=0x11000000, size=model.nor_bytes, filename=str(capture))
                qmp.quit()
        require(capture.is_file() and capture.stat().st_size == model.nor_bytes,
                "QEMU did not export a complete virtual NOR")
        nor = bytearray(capture.read_bytes())
        if model.name == "wp3":
            restore_wp3_runtime_patches(nor, model.app.offset)
        profile.stock_app(nor)
        capture.write_bytes(nor)
        require(not args.output.exists(), f"Output already exists: {args.output}")
        capture.rename(args.output)
    return {"profile": profile.name, "nor": str(args.output), "pairing": "synthetic"}
