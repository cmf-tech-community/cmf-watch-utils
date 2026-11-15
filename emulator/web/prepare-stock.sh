#!/usr/bin/env bash
set -euo pipefail

work="$PWD/browser-stock"
watch3_stock=${1:-}
if [[ -n "$watch3_stock" ]]; then
    watch3_stock=$(realpath -- "$watch3_stock")
fi
release=https://github.com/cmf-tech-community/cmf-watch-utils/releases/download/emulator-v0.1.0-preview.6
frames=https://platform-watch-test.s3.ap-northeast-1.amazonaws.com/device_sku
mkdir -p "$work/runtime" "$work/frames"
cd "$work"
curl -fLsS --retry 3 "$release/cmf-emulator-linux-x64.tar.gz" -o qemu.tar.gz
curl -fLsS --retry 3 "$release/cmf-emulator-wp2-rom.tar.gz" -o rom.tar.gz
sha256sum -c <<'SUMS'
3a7dc72e642aafbd535bd6d08e3a679638089f2755b78e77fc96988186d3495f  qemu.tar.gz
79f5bbe255911ea5338e01adc243f34bc8232f2d5eef399d933182c7b2fea16d  rom.tar.gz
SUMS
tar -xf qemu.tar.gz -C runtime --strip-components 1
tar -xf rom.tar.gz -C runtime --strip-components 1
curl -fLsS --retry 3 https://media.githubusercontent.com/media/cmf-tech-community/cmf-watch-utils/main/dumps/binaries/firmware/JX402_V1.0.0.73.bin -o stock.bin
curl -fLsS --retry 3 https://raw.githubusercontent.com/lvgl/lv_port_actions_technology/26f51e584940d5b141cd1d09d2629d69b595f579/action_technology_sdk/zephyr/tools/prebuilt/leopard/common/bin/nand_id_all.bin -o nand-id.bin
curl -fLsS --retry 3 "$frames/1735641575331_1731313327985_cmf-watch-pro-2-dark-grey.png" -o frames/dark-grey.png
curl -fLsS --retry 3 "$frames/1731313406463_cmf-watch-pro-2-light-grey.png" -o frames/light-grey.png
curl -fLsS --retry 3 "$frames/1731313449697_cmf-watch-pro-2-blue.png" -o frames/blue.png
curl -fLsS --retry 3 "$frames/1731313435491_cmf-watch-pro-2-orange.png" -o frames/orange.png
sha256sum -c <<'SUMS'
1788708300a31d59b08e44e792f86101688086849196a401f569b4aea01f4a2a  frames/dark-grey.png
b09698c1f139d00d47f1d92c052bd492d67c9459e402b5f9f0b303b43a61c08a  frames/light-grey.png
8b6f462d7f3f21ea84837efb95658accb7e38509e941b2c09dbeef07b9856a4c  frames/blue.png
d192de8ca5f20e34cdc4d5f2945e4fffd37143b062ba3ead7f165118696d9931  frames/orange.png
SUMS
cd ..
python3 emulator/build.py --component rom --work-dir "$work/rom-build" --output-dir "$work/rom-output"
rom="$work/rom-build/cmf-emulator-wp2-rom-rom/compat.bin"
uv run --locked cmf-watch-utils emu prepare-fixtures \
    --fixtures "$work/fixtures" --stock "$work/stock.bin" --nand-id "$work/nand-id.bin" \
    --qemu "$work/runtime/qemu-system-arm" --rom "$work/runtime/compat.bin" \
    --provisioner "$work/runtime" --gdb gdb-multiarch
decoder=https://raw.githubusercontent.com/tirodz/CMF-Ringtone-Tool/6e867e18f7984df694a2a0e75a08c78c5c06603c/act_emu
mkdir -p "$work/decoder"
for file in act_decode.py linked.json; do
    curl -fLsS --retry 3 "$decoder/$file" -o "$work/decoder/$file"
done
(cd "$work/decoder" && sha256sum -c <<'SUMS'
19d70503398070df8757cd9a88ef81cd6d198c2dcb976255c1a4f4b04ac1aae8  act_decode.py
1d11e80ce787bb59ccd71656f560c2f50034f95cdc4b47dd9cc63480775755e3  linked.json
SUMS
)
uv run --locked --with unicorn==2.1.4 python emulator/prepare-stock-audio.py \
    --stock "$work/stock.bin" --decoder "$work/decoder" \
    --output "$work/fixtures/stock-audio.bin"
uv run --locked python emulator/web/stage.py \
    --fixtures "$work/fixtures" --rom "$rom" --stock-image "$work/stock.bin" \
    --frames-dir "$work/frames" --output "$work/staged"

if [[ -n "$watch3_stock" ]]; then
    uv run --locked cmf-watch-utils emu prepare-fixtures --profile wp3-stock \
        --fixtures "$work/wp3-fixtures" --stock "$watch3_stock" --provisioning-stock "$work/stock.bin" \
        --nand-id "$work/nand-id.bin" --qemu "$work/runtime/qemu-system-arm" \
        --rom "$work/runtime/compat.bin" --provisioner "$work/runtime" --gdb gdb-multiarch
    uv run --locked --with unicorn==2.1.4 python emulator/prepare-stock-audio.py \
        --stock "$watch3_stock" --decoder "$work/decoder" \
        --output "$work/wp3-fixtures/stock-audio.bin"
    uv run --locked python emulator/web/stage.py --profile wp3-stock \
        --fixtures "$work/wp3-fixtures" --rom "$rom" --output "$work/wp3-staged"
fi
