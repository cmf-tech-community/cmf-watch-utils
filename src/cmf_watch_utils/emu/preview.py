import struct

from fwkit.aota import sum32


def watch_face_preview(app, rom):
    preview = bytearray(app)
    launcher_entry = 0x45154
    setup_stub = 0x7f80
    autosleep_timeout = 0x155b4a
    # Mark local setup complete with the stock state 0x59 setter, call the
    # original state 0x58 getter, then continue the launcher.
    setup_code = bytes.fromhex(
        "10b5 0120 03b4 6846 034b 9847 02b0 5820 024b 9847 024a 1047"
    ) + struct.pack("<3I", 0x100dba49, 0x101c6ec3, 0x1004515d)
    setup_end = setup_stub + len(setup_code)
    if rom[setup_stub:setup_end] != bytes(len(setup_code)):
        raise ValueError("Watch 3 Pro preview setup stub needs unused compatibility ROM space")
    for offset, expected, replacement in (
        (launcher_entry, bytes.fromhex("10b5 5820 81f1b3fe"),
         struct.pack("<2I", 0xf000f8df, setup_stub | 1)),
        (autosleep_timeout, bytes.fromhex("02fb00f4"), bytes.fromhex("6ff00004")),
    ):
        if app[offset:offset + len(expected)] != expected:
            raise ValueError(f"Unexpected Watch 3 Pro preview instruction at {offset:#x}")
        preview[offset:offset + len(expected)] = replacement
    size = struct.unpack_from("<I", preview, 24)[0]
    struct.pack_into("<I", preview, 28, 0xffffffff - sum32(preview[512:512 + size]))
    struct.pack_into("<I", preview, 32, 0)
    struct.pack_into("<I", preview, 32, 0xffffffff - sum32(preview[:512]))
    rom[setup_stub:setup_end] = setup_code
    return preview
