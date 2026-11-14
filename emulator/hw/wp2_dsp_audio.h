enum {
    WP2_DSP_SHARE = 0x2ff18000,
    WP2_DSP_SHARE_SIZE = 0x8000,
    WP2_DSP_MCU_MAIL = 0x2800,
    WP2_DSP_GUEST_MAIL = 0x2810,
    WP2_DSP_INFO = 0x2820,
    WP2_DSP_BUSY = 0x10000,
    WP2_DSP_ACK = 0x1000000,
    WP2_DSP_DONE = 0x2000000,
    WP2_DSP_REPLY = 0x4000000,
    WP2_DSP_FAIL = 0x8000000,
    WP2_DSP_CLIPS = 11,
    WP2_DSP_RING_MAX = 16384,
};

static bool wp2_dsp_shared_range(uint32_t offset, uint32_t bytes)
{
    return offset < WP2_DSP_SHARE_SIZE && bytes <= WP2_DSP_SHARE_SIZE - offset;
}

static uint32_t wp2_dsp_cpu_offset(uint32_t address)
{
    return address - WP2_DSP_SHARE;
}

static uint32_t wp2_dsp_word_offset(uint32_t address)
{
    if (address < 0x40100000 || address >= 0x40104000) {
        return UINT32_MAX;
    }
    return (address - 0x40100000) * 2;
}

typedef struct Wp2DspClip {
    const uint8_t *encoded;
    const uint8_t *pcm;
    uint32_t bytes, samples;
} Wp2DspClip;

typedef struct Wp2DspAudio {
    QEMUTimer *timer;
    const uint8_t *pcm;
    uint32_t command, input, offset, samples, played, session;
    uint32_t fence;
    uint32_t bytes;
    unsigned candidates;
    unsigned phase;
    bool decoder, output, stream_end, stream_done;
} Wp2DspAudio;

typedef struct Wp2DspRing {
    uint8_t *desc;
    uint8_t *data;
    uint32_t head, length, capacity, offset;
} Wp2DspRing;

static bool wp2_dsp_ring(uint8_t *shared, uint32_t offset, Wp2DspRing *ring)
{
    if (!wp2_dsp_shared_range(offset, 32)) {
        return false;
    }
    uint8_t *desc = shared + offset;
    uint32_t capacity = ldl_le_p(desc + 8);
    uint32_t data = wp2_dsp_cpu_offset(ldl_le_p(desc + 16));
    if (!capacity || capacity > WP2_DSP_RING_MAX ||
        !wp2_dsp_shared_range(data, capacity)) {
        return false;
    }
    uint32_t head = ldl_le_p(desc);
    uint32_t length = ldl_le_p(desc + 4) - head;
    uint32_t head_offset = ldl_le_p(desc + 24);
    if (length > capacity || head_offset >= capacity) {
        return false;
    }
    *ring = (Wp2DspRing){desc, shared + data, head, length, capacity, head_offset};
    return true;
}

static void wp2_dsp_ring_copy(const Wp2DspRing *ring, uint8_t *dest,
                              uint32_t length)
{
    uint32_t first = MIN(ring->capacity - ring->offset, length);
    memcpy(dest, ring->data + ring->offset, first);
    memcpy(dest + first, ring->data, length - first);
}

static void wp2_dsp_ring_read(Wp2DspRing *ring, uint32_t bytes)
{
    ring->head += bytes;
    ring->length -= bytes;
    ring->offset = (ring->offset + bytes) % ring->capacity;
    stl_le_p(ring->desc + 24, ring->offset);
    stl_le_p(ring->desc, ring->head);
}

static bool wp2_dsp_load_clips(const char *path, Wp2DspClip *clips,
                              char **storage)
{
    g_autofree char *data = NULL;
    size_t size;
    if (!g_file_get_contents(path, &data, &size, NULL) || size < 12 ||
        size > 2 * 1024 * 1024 || memcmp(data, "WP2ACT\x01\0", 8) ||
        ldl_le_p(data + 8) != WP2_DSP_CLIPS) {
        return false;
    }
    const uint8_t *p = (uint8_t *)data + 12;
    size -= 12;
    for (unsigned i = 0; i < WP2_DSP_CLIPS; i++) {
        if (size < 8) {
            return false;
        }
        uint32_t encoded = ldl_le_p(p);
        uint32_t samples = ldl_le_p(p + 4);
        if (!encoded || !samples || encoded > size - 8 ||
            samples > (size - 8 - encoded) / 2) {
            return false;
        }
        clips[i] = (Wp2DspClip){p + 8, p + 8 + encoded, encoded, samples};
        p += 8 + encoded + samples * 2;
        size -= 8 + encoded + samples * 2;
    }
    if (size) {
        return false;
    }
    *storage = g_steal_pointer(&data);
    return true;
}
