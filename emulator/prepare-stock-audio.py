import argparse
from hashlib import sha256
from pathlib import Path
import struct
import sys

from cmf_watch_utils.emu.prepare import STOCK_SHA256
from fwkit import Image, sdfs


def stock_audio(stock, decode, deobfuscate):
    if sha256(stock).hexdigest() != STOCK_SHA256:
        raise ValueError("Expected the published JX402 Watch Pro 2 1.0.0.73 image")
    files = sdfs.unpack(Image(stock).decompressed("sdfs_k.bin"))
    tones = [(name, data) for name, data in files.items() if name.endswith(".act")]
    if len(tones) != 11:
        raise ValueError("Expected eleven stock ACT clips")
    bank = bytearray(b"WP2ACT\x01\0" + struct.pack("<I", len(tones)))
    for name, data in tones:
        result = decode(deobfuscate(data))
        if not result or not result[0] or len(result[0]) % 2:
            raise ValueError(f"Could not decode {name}")
        pcm, _ = result
        bank += struct.pack("<II", len(data), len(pcm) // 2) + data + pcm
    if sha256(bank).hexdigest() != "8995b8cb552059bcf548491b03696aeed026321f32401e9395f202cde7854742":
        raise ValueError("Stock audio does not match the verified 16 kHz mono samples")
    return bank


def main():
    parser = argparse.ArgumentParser(description="Prepare Watch Pro 2 stock sounds for QEMU")
    parser.add_argument("--stock", type=Path, required=True)
    parser.add_argument("--decoder", type=Path, required=True, help="CMF Ringtone Tool act_emu directory")
    parser.add_argument("--output", type=Path, required=True, help="Path to stock-audio.bin in the fixtures folder")
    args = parser.parse_args()
    sys.path.insert(0, str(args.decoder.resolve()))
    from act_decode import decode, deobfuscate

    args.output.write_bytes(stock_audio(args.stock.read_bytes(), decode, deobfuscate))


if __name__ == "__main__":
    main()
