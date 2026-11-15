import hashlib
import json
import struct
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

from fwkit import lz4, sdfs, wfdl

PAGE = 2048
RAW_PAGE = 2112
PAGES_PER_BLOCK = 64
FACE_PARTITIONS = {
    "wp2": (0x34, 96, "local273.wfc", "local277.wfc"),
    "wp3": (0x2a4, 24, "local274.wfc", "local822.wfc"),
}
MAX_FACE = 3021359
FMC = "https://fmc.freethinkel.dev/api"
FMC_SORTS = {"newest": "-created,id", "downloads": "-downloads,-created,id",
             "flashes": "-flashes,-created,id"}
FMC_HEADERS = {"User-Agent": "cmf-watch-utils (+https://cmf.arnv.dev/)"}
FMC_FILTERS = {
    "wp2": 'published=true && (device="watch_pro_2" || device="")',
    "wp3": 'published=true && device="watch_3_pro"',
}


def catalog(search="", sort="newest", model="wp2"):
    entries = {}
    page = 1
    while True:
        query = urlencode({
            "page": page, "perPage": 100, "sort": FMC_SORTS[sort], "expand": "owner",
            "filter": FMC_FILTERS[model],
            "fields": "id,collectionId,name,preview,bin,downloads,flashes,expand.owner.name",
        })
        request = Request(f"{FMC}/collections/watchfaces/records?{query}", headers=FMC_HEADERS)
        with urlopen(request, timeout=12) as response:
            result = json.load(response)
        for face in result["items"]:
            if not face.get("name") or not face.get("bin"):
                continue
            author = face.get("expand", {}).get("owner", {}).get("name", "")
            if all(word in f'{face["name"]} {author}'.lower() for word in search.lower().split()):
                entries[face["id"]] = {**face, "author": author or "FMC creator"}
        if page >= result["totalPages"]:
            return list(entries.values())
        page += 1


def download_face(face_id, model="wp2"):
    face = next((face for face in catalog(model=model) if face["id"] == face_id), None)
    if face is None:
        raise ValueError("No published face for the selected watch matches that FMC ID")
    path = "/".join(quote(face[key], safe="") for key in ("collectionId", "id", "bin"))
    with urlopen(Request(f"{FMC}/files/{path}", headers=FMC_HEADERS), timeout=15) as response:
        return response.read(MAX_FACE + 1)


def face_pages(nand, first_block, block_count):
    if len(nand) != RAW_PAGE * 65536:
        raise ValueError("Expected the prepared NAND image.")
    blocks = {}
    for offset in range(0, len(nand), RAW_PAGE * PAGES_PER_BLOCK):
        tag = nand[offset + PAGE:offset + PAGE + 8]
        logical = int.from_bytes(tag[6:8], "little")
        if tag[:6] not in (b"\xff\xff\x00\xff\0\0", b"\xff\xff\x01\xff\0\0"):
            continue
        if first_block <= logical < first_block + block_count:
            if logical in blocks:
                raise ValueError("Ambiguous watch-face partition in virtual NAND.")
            blocks[logical] = offset
    for logical in range(first_block, first_block + block_count):
        if logical not in blocks:
            break
        base = blocks[logical]
        for page in range(PAGES_PER_BLOCK):
            offset = base + page * RAW_PAGE
            if page and nand[offset + PAGE:offset + PAGE + 8] != struct.pack(
                "<4sHH", b"\xff\xff\x00\x55", page, logical
            ):
                return
            yield offset


def prepare_face(nand, face, model="wp2"):
    if not 0 < len(face) <= MAX_FACE:
        raise ValueError("Choose a watch face up to 3,021,359 bytes.")
    parsed = wfdl.parse(face)
    start = 39 + struct.unpack_from("<H", face, 37)[0]
    end = len(face) - 36
    header_crc, = struct.unpack_from("<I", face)
    resource_end, resource_size, resource_crc = struct.unpack_from("<III", face, 24)
    if (resource_end != end or resource_size != end - start or
            wfdl.raw_crc32(face[4:start]) != header_crc or wfdl.raw_crc32(face[start:end]) != resource_crc):
        raise ValueError("Watch-face checksums or section lengths are invalid.")
    textures = set()
    for resource in parsed.resources:
        if not resource.w or not resource.h:
            raise ValueError("A watch-face texture has zero width or height.")
        if resource.cf == 5:
            pixels = lz4.decompress(resource.data, resource.raw_size)
            if len(pixels) != resource.raw_size:
                raise ValueError("Invalid packed watch-face texture.")
            textures.add(f"{resource.w}:{resource.h}:{hashlib.sha256(pixels).hexdigest()}")

    first_block, block_count, primary, spare = FACE_PARTITIONS[model]
    pages = list(face_pages(nand, first_block, block_count))
    original = b"".join(nand[offset:offset + PAGE] for offset in pages)
    if original[:8] != sdfs.MAGIC or len(original) < PAGE:
        raise ValueError("Missing stock watch-face partition.")
    count, size = struct.unpack_from("<II", original, 12)
    if not 0 < count <= 64 or size > len(original):
        raise ValueError("Invalid stock watch-face partition.")
    original = original[:size]
    entries = sdfs.parse(original)
    if any(entry.off + entry.size > size or not sdfs.verify(original, entry) for entry in entries):
        raise ValueError("Stock watch-face partition failed its resource checks.")
    files = sdfs.unpack(original)
    if primary not in files:
        raise ValueError("The default watch face is missing.")
    default_face = files[primary]
    files[primary] = face
    packed = sdfs.pack(list(files.items()))
    if len(packed) > len(pages) * PAGE and spare in files:
        files[spare] = default_face
        packed = sdfs.pack(list(files.items()))
    if len(packed) > len(pages) * PAGE:
        raise ValueError("This face exceeds the space in the prepared NAND fixture.")
    index = "".join(f"{texture}\n" for texture in sorted(textures)).encode("ascii")
    return pages, packed, index


def face_patch(nand, face):
    pages, packed, index = prepare_face(nand, face)
    patch = bytearray(struct.pack("<I", len(index)) + index)
    for page, offset in enumerate(pages):
        start = page * PAGE
        if start >= len(packed):
            break
        data = packed[start:start + PAGE]
        if data != nand[offset:offset + len(data)]:
            patch.extend(struct.pack("<II", offset, len(data)))
            patch.extend(data)
    return patch
